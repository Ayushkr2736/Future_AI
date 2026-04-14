// ── Chat Types ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// ── Analysis Types ──────────────────────────────────────────────────────────

export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  fearful: number;
}

export interface AnalysisScores {
  confidence: number;
  motivation: number;
  clarity: number;
  emotional_stability: number;
}

export interface TextAnalysisResponse {
  scores: AnalysisScores;
  timestamp: string;
}

// ── Session Types ───────────────────────────────────────────────────────────

export interface Session {
  id: string;
  date: string;
  duration: string;
  scores: AnalysisScores;
  successProbability: number;
  summary: string;
  riskLevel: "low" | "medium" | "high";
}

// ── API Response Types ──────────────────────────────────────────────────────

export interface ChatResponse {
  message: ChatMessage;
  scores?: AnalysisScores;
  prediction?: {
    success_probability: number;
    risk: string;
  };
}

export interface VoiceTranscription {
  text: string;
  scores?: AnalysisScores;
}

export interface FaceAnalysisResult {
  emotion: string;
  emotions: EmotionScores;
  confidence: number;
  motivation: number;
  emotional_stability: number;
}

export interface DashboardData {
  sessions: Session[];
  successHistory: { date: string; probability: number }[];
}
