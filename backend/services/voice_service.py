"""Voice service — handles audio transcription.

This is a placeholder service. Replace `transcribe` with your
speech-to-text pipeline (e.g., Whisper, Google STT, Azure STT).
"""


from services.gemini_service import GeminiService
from utils.helpers import utc_now_iso

class VoiceService:
    """Stateless service for voice transcription and processing."""

    def __init__(self, db=None):
        self.gemini = GeminiService()
        self.db = db

    async def transcribe(self, audio_bytes: bytes, content_type: str) -> dict:
        """Transcribe raw audio bytes into text."""
        # This is where you would call an STT provider like Whisper or Google Cloud Speech.
        # For now, it's still a placeholder unless a specific STT engine is requested.
        raise NotImplementedError(
            "Voice transcription is not yet implemented. Use /voice/transcript for text evaluation."
        )

    async def process_transcript(self, transcript: str, session_id: str = None) -> dict:
        """Process a text transcript for psychological analysis (like chat)."""
        scores = await self.gemini.analyze_traits(transcript)
        
        # Persistence if session_id provided
        if self.db and session_id:
            await self.db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$push": {"scores": scores},
                    "$set": {"updated_at": utc_now_iso()}
                },
                upsert=True
            )
            
        return {
            "scores": scores,
            "timestamp": utc_now_iso()
        }
