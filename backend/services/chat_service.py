import asyncio
from models.chat import ChatMessage, ChatResponse
from utils.helpers import generate_id, utc_now, utc_now_iso
from services.gemini_service import GeminiService
from services.analysis_service import AnalysisService
from services.prediction_service import PredictionService

class ChatService:
    """Stateless service for processing chat messages."""

    def __init__(self, gemini_service: GeminiService, analysis_service: AnalysisService, prediction_service: PredictionService, db):
        self.gemini = gemini_service
        self.analysis = analysis_service
        self.predict_service = prediction_service
        self.db = db

    async def process_message(
        self, message: str, session_id: str | None = None, emotions: dict | None = None
    ) -> ChatResponse:
        # 1. First, analyze the user's text traits (the core data)
        try:
            analysis = await self.gemini.analyze_traits(message)
        except Exception as e:
            print(f"Chat analysis failed: {e}")
            analysis = {
                "confidence": 50.0, "motivation": 50.0, "clarity": 50.0, "emotional_stability": 50.0
            }

        # 2. Modulate text scores with live emotional indicators (if present)
        if emotions:
            happy = emotions.get("happy", 0)
            sad = emotions.get("sad", 0)
            angry = emotions.get("angry", 0)
            fearful = emotions.get("fearful", 0)
            neutral = emotions.get("neutral", 1)
            
            # Fuse text analysis with visual/audio emotional data
            analysis["confidence"] += (happy * 15) - (fearful * 10) - (sad * 5)
            analysis["motivation"] += (happy * 15) - (sad * 15)
            analysis["emotional_stability"] += (neutral * 10) - (angry * 15) - (fearful * 15)
            
            # Ensure boundaries are maintained
            for k in analysis:
                analysis[k] = round(max(0.0, min(100.0, float(analysis[k]))), 1)

        # 3. Get the prediction based on the fused analysis
        prediction = await self.predict_service.predict(
            session_id=session_id or "anonymous",
            **analysis
        )

        # 3.5 Fetch conversation history from session if available
        history = []
        if session_id:
            try:
                session = await self.db.sessions.find_one({"session_id": session_id})
                if session and "messages" in session:
                    history = session.get("messages", [])[-10:] # last 10 messages for context window
            except Exception:
                pass
                
        # 4. Generate the bot reply, now with knowledge of the scores, prediction, and history!
        bot_reply = await self.gemini.generate_reply(
            message=message,
            scores=analysis,
            prediction=prediction,
            history=history
        )

        if session_id:
            # Append User message
            user_msg = {
                "id": generate_id(),
                "role": "user",
                "content": message,
                "timestamp": utc_now_iso()
            }
            # Append Bot message
            bot_msg = {
                "id": generate_id(),
                "role": "assistant",
                "content": bot_reply,
                "timestamp": utc_now_iso()
            }
            
            await self.db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$push": {
                        "messages": {"$each": [user_msg, bot_msg]},
                        "scores": analysis
                    },
                    "$set": {
                        "updated_at": utc_now_iso(),
                        "last_prediction": prediction
                    }
                },
                upsert=True
            )

        # 4. Build & Return the response
        response_msg = ChatMessage(
            id=generate_id(),
            role="assistant",
            content=bot_reply,
            timestamp=utc_now(),
        )

        # Only reveal the prediction to the UI/Dashboard AFTER 4 turns (2 user, 2 bot).
        # This aligns with the "Discovery Phase" request.
        turn_count = len(history) // 2 if history else 0
        final_prediction = prediction if turn_count >= 4 else None

        return ChatResponse(
            message=response_msg,
            scores=analysis,
            prediction=final_prediction
        )
