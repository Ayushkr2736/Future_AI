"use client";

import { useState, useCallback, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import FaceCapture from "@/components/FaceCapture";
import ReportPanel from "@/components/ReportPanel";
import { EmotionScores } from "@/types";
import { RefreshCcw } from "lucide-react";

export default function SessionPage() {
  const [scores, setScores] = useState<any>({
    confidence: null,
    motivation: null,
    clarity: null,
    emotional_stability: null,
    riskLevel: null,
    successProbability: null,
  });
  const [voiceText, setVoiceText] = useState<string>("");
  const [voiceConsumed, setVoiceConsumed] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentEmotions, setCurrentEmotions] = useState<EmotionScores | undefined>(undefined);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const id = `sess_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(id);
    console.log("Session initialized:", id);
  }, []);

  const handleAnalysisUpdate = useCallback(
    (analysis: any) => {
      setScores((prev: any) => ({
        ...prev,
        confidence: analysis.confidence ?? prev.confidence,
        motivation: analysis.motivation ?? prev.motivation,
        clarity: analysis.clarity ?? prev.clarity,
        emotional_stability: analysis.emotional_stability ?? prev.emotional_stability,
        riskLevel: analysis.riskLevel ?? prev.riskLevel,
        successProbability: analysis.successProbability ?? prev.successProbability,
      }));
    },
    []
  );

  const handleVoiceTranscription = useCallback((text: string) => {
    setVoiceText(text);
    setVoiceConsumed(false);
  }, []);

  const handleVoiceConsumed = useCallback(() => {
    setVoiceConsumed(true);
  }, []);

  const handleFaceFrame = useCallback((blob: Blob, emotions?: EmotionScores) => {
    if (emotions) {
      setCurrentEmotions(emotions);
    }
  }, []);

  const handleResetChat = useCallback(() => {
    const newId = `sess_${Math.random().toString(36).substring(2, 9)}`;
    console.log("Global Reset Triggered. New session:", newId);
    setMessages([]);
    setScores({
      confidence: null,
      motivation: null,
      clarity: null,
      emotional_stability: null,
      riskLevel: null,
      successProbability: null,
    });
    setVoiceText("");
    setSessionId(newId);
  }, []);

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Floating Global Reset Button */}
      <button
        onClick={handleResetChat}
        className="fixed top-4 right-4 z-[100] bg-accent text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold border border-white/20 whitespace-nowrap"
        title="New Session"
        id="global-reset-btn"
      >
        <RefreshCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        <span className="hidden sm:inline">New Session</span>
      </button>

      {/* Main Chat Area — fills all width on mobile, flex-1 on lg+ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatInterface
          onAnalysisUpdate={handleAnalysisUpdate}
          externalInput={voiceConsumed ? undefined : voiceText}
          onExternalInputConsumed={handleVoiceConsumed}
          sessionId={sessionId}
          emotions={currentEmotions}
          onResetChat={handleResetChat}
          messages={messages}
          setMessages={setMessages}
          onVoiceTranscription={handleVoiceTranscription}
        />
      </div>

      {/* Right Panel — hidden on mobile/tablet, shown on lg+ */}
      <aside className="hidden lg:flex lg:flex-col w-[300px] xl:w-[320px] flex-shrink-0 border-l border-surface-border bg-surface/50 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Report Panel */}
          <ReportPanel scores={scores} />

          {/* Divider */}
          <div className="h-px bg-surface-border" />

          {/* Face Capture */}
          <FaceCapture onFrame={handleFaceFrame} />
        </div>
      </aside>
    </div>
  );
}

