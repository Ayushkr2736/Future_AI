/**
 * API Client – Placeholder functions for backend integration.
 *
 * Each function defines the expected interface and returns a rejected promise
 * so that the UI can show a "not connected" state instead of fake data.
 */

import type {
  ChatResponse,
  VoiceTranscription,
  FaceAnalysisResult,
  DashboardData,
  TextAnalysisResponse,
  EmotionScores,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Chat ────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  message: string,
  session_id?: string,
  emotions?: any
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id, emotions }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

// ── Voice ───────────────────────────────────────────────────────────────────

export async function transcribeAudio(
  audioBlob: Blob
): Promise<VoiceTranscription> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  const res = await fetch(`${API_BASE}/voice`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Voice API error: ${res.status}`);
  return res.json();
}

export async function sendVoiceTranscript(
  text: string,
  sessionId?: string
): Promise<TextAnalysisResponse> {
  const res = await fetch(`${API_BASE}/voice/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Transcript API error: ${res.status}`);
  return res.json();
}

// ── Face Analysis ───────────────────────────────────────────────────────────

export async function analyzeFace(
  imageBlob: Blob,
  emotions?: EmotionScores,
  sessionId?: string
): Promise<FaceAnalysisResult> {
  const form = new FormData();
  form.append("image", imageBlob, "frame.jpg");
  if (emotions) {
    form.append("emotions_json", JSON.stringify(emotions));
  }
  const res = await fetch(`${API_BASE}/face-analysis`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Face API error: ${res.status}`);
  return res.json();
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);
  return res.json();
}

// ── Prediction ──────────────────────────────────────────────────────────────

export async function fetchPredict(
  sessionId: string,
  confidence: number,
  motivation: number,
  clarity: number,
  emotional_stability: number
): Promise<any> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      confidence,
      motivation,
      clarity,
      emotional_stability,
    }),
  });
  if (!res.ok) throw new Error(`Prediction API error: ${res.status}`);
  return res.json();
}
