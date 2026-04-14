"""Analysis service — combines multi-modal signals into composite scores.

This is a placeholder service. Replace `run_analysis` with your
aggregation logic that fuses text, voice, and face signals.
"""

from utils.helpers import utc_now_iso
from services.gemini_service import GeminiService
from utils.mongodb import get_db
from models.database import SessionDB, ScoreDB

class AnalysisService:
    """Stateless service for multi-modal analysis."""

    def __init__(self, db=None):
        self.gemini = GeminiService()
        self.db = db if db is not None else get_db()

    async def run_analysis(
        self,
        session_id: str,
        text: str | None = None,
        include_face: bool = True,
        include_voice: bool = True,
    ) -> dict:
        """Run combined analysis and store results in MongoDB."""
        scores = {
            "confidence": 0.5,
            "motivation": 0.5,
            "clarity": 0.5,
            "emotional_stability": 0.5
        }
        
        if text:
            scores = await self.gemini.analyze_traits(text)

        # Store in MongoDB
        if self.db is not None:
            await self.db.sessions.update_one(
                {"session_id": session_id},
                {"$push": {"scores": scores}, "$set": {"updated_at": utc_now_iso()}},
                upsert=True
            )

        return {
            "session_id": session_id,
            "scores": scores,
            "timestamp": utc_now_iso()
        }

    async def run_text_analysis(self, text: str) -> dict:
        """Run psychological traits analysis on text using Gemini.

        Args:
            text: The user input text to analyze.

        Returns:
            Dictionary with psychological trait scores.
        """
        scores = await self.gemini.analyze_traits(text)

        return {
            "scores": scores,
            "timestamp": utc_now_iso()
        }
