"""Face analysis service — handles facial emotion detection and session updates."""

from datetime import datetime
from utils.helpers import utc_now_iso

class FaceService:
    """Stateless service for facial analysis and persistence."""

    def __init__(self, db=None):
        self.db = db

    async def analyze_frame(
        self, image_bytes: bytes, content_type: str, emotion_data: any = None, session_id: str = None
    ) -> dict:
        """Analyze a single face frame for emotions with a simplified output and persistence."""
        
        # Default if nothing provided: { "emotion": "neutral" }
        if not emotion_data:
            emotion_data = {"neutral": 1.0}
        
        # If string label passed
        if isinstance(emotion_data, str):
            label = emotion_data
            emotion_data = {e: 0.0 for e in ["neutral", "happy", "sad", "angry", "surprised", "fearful"]}
            emotion_data[label if label in emotion_data else "neutral"] = 1.0
        
        # Calculate Emotional Stability Score
        neg_val = emotion_data.get("sad", 0) + emotion_data.get("angry", 0) + emotion_data.get("fearful", 0)
        emotional_stability = max(0, min(100, (1 - neg_val) * 100))

        # Find dominant emotion
        dominant_emotion = max(emotion_data, key=emotion_data.get)

        analysis_result = {
            "emotion": dominant_emotion,
            "emotions": emotion_data,
            "confidence": round((1 - neg_val) * 100, 1),
            "motivation": round(emotion_data.get("happy", 0) * 100 + 50, 1),
            "emotional_stability": round(emotional_stability, 1),
        }

        # Update Session in MongoDB if session_id provided
        if self.db and session_id:
            await self.db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$push": {"face_scores": analysis_result},
                    "$set": {"updated_at": utc_now_iso()}
                },
                upsert=True
            )

        return analysis_result
