"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";
import { sendChatMessage } from "@/lib/api";
import VoiceCapture from "@/components/VoiceCapture";

interface ChatInterfaceProps {
  onAnalysisUpdate?: (analysis: {
    confidence: number | null;
    motivation: number | null;
    riskLevel: string | null;
    successProbability: number | null;
  }) => void;
  externalInput?: string;
  onExternalInputConsumed?: () => void;
  sessionId?: string;
  emotions?: any;
  onResetChat?: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onVoiceTranscription?: (text: string) => void;
}

export default function ChatInterface({
  onAnalysisUpdate,
  externalInput,
  onExternalInputConsumed,
  sessionId,
  emotions,
  onResetChat,
  messages,
  setMessages,
  onVoiceTranscription,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle external input from voice capture
  useEffect(() => {
    if (externalInput) {
      setInput(externalInput);
      onExternalInputConsumed?.();
    }
  }, [externalInput, onExternalInputConsumed]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(trimmed, sessionId, emotions);
      setMessages((prev) => [...prev, response.message]);
      if (response.scores || response.prediction) {
        onAnalysisUpdate?.({
          ...(response.scores || {}),
          riskLevel: response.prediction?.risk ?? null,
          successProbability: response.prediction?.success_probability ?? null,
        } as any);
      }
    } catch {
      setError("Backend not connected. Connect your API to enable responses.");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onAnalysisUpdate, sessionId, emotions, setMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex flex-col h-full bg-surface/10 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden rounded-r-3xl relative">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(109,93,246,0.5)]" />
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80">
            Psychological Data Stream
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-10">
            <div className="w-20 h-20 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 shadow-inner group overflow-hidden relative">
               <div className="absolute inset-0 bg-accent/5 animate-pulse" />
               <Sparkles className="w-10 h-10 text-accent relative z-10" />
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-white/90">
              The Oracle is Listening
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mx-auto font-medium">
              Start your journey into the subconscious.
              <br /> Every word revealed is a data point saved.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex gap-4 animate-slide-up ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <Bot className="w-5 h-5 text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-3xl px-6 py-4 text-[13px] leading-[1.6] shadow-xl ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md font-medium"
                  : "bg-white/[0.03] text-foreground border border-white/5 rounded-bl-md backdrop-blur-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl rounded-bl-md px-6 py-4">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mb-4 px-5 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-[11px] font-bold uppercase tracking-wider animate-shake">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 pb-6 pt-3 bg-gradient-to-t from-surface/50 to-transparent">
        <div className="relative group w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-purple-500/50 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
          <div className="relative glass rounded-3xl border border-white/10 overflow-hidden flex items-end w-full">
            {/* Voice mic — inside the input box, left side */}
            <div className="flex-shrink-0 pl-3 pb-3">
              <VoiceCapture
                onTranscription={onVoiceTranscription}
                sessionId={sessionId}
                disabled={isLoading}
              />
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Speak to your subconscious..."
              rows={2}
              disabled={isLoading}
              className="flex-1 bg-transparent text-foreground text-[14px] placeholder:text-muted-foreground/50 resize-none px-3 py-4 focus:outline-none disabled:opacity-50 max-h-40 leading-relaxed font-medium min-h-[56px]"
              id="chat-input"
            />

            {/* Send button — right side */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 mr-3 mb-3 w-10 h-10 rounded-2xl bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:hover:bg-accent flex items-center justify-center transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0"
              id="chat-send-button"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
