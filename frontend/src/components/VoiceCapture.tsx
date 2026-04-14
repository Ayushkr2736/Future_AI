"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { sendVoiceTranscript } from "@/lib/api";

// ── Types for Web Speech API ────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

interface Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}

declare const window: Window;

interface VoiceCaptureProps {
  onTranscription?: (text: string) => void;
  disabled?: boolean;
  sessionId?: string;
}

export default function VoiceCapture({
  onTranscription,
  disabled = false,
  sessionId,
}: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 1. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Web Speech API (webkitSpeechRecognition) not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentResult = "";
      for (let i = 0; i < event.results.length; i++) {
        currentResult += event.results[i][0].transcript;
      }
      setTranscript(currentResult);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setError(`Voice error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 2. Start/Stop Handlers
  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsRecording(false);

    // If we have a transcript, pass it to parent to be sent to /chat
    if (transcript.trim()) {
      onTranscription?.(transcript);
    }
  }, [transcript, onTranscription]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleRecording}
        disabled={disabled || isProcessing || !!error && error.includes("not supported")}
        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isRecording
            ? "bg-danger text-white shadow-lg shadow-danger/25"
            : "glass text-muted-foreground hover:text-foreground"
        } ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isRecording ? "Stop voice input" : "Start voice input"}
        id="voice-capture-button"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <>
            <MicOff className="w-5 h-5 relative z-10" />
            <span className="absolute inset-0 rounded-xl bg-danger animate-pulse-ring opacity-30" />
          </>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {isRecording && (
        <div className="flex flex-col items-center gap-1 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-xs text-danger font-mono font-medium">LISTENING</span>
          </div>
          {transcript && (
            <p className="text-[10px] text-muted-foreground italic text-center max-w-[200px] line-clamp-1">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] text-danger/80 text-center max-w-[140px] animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
