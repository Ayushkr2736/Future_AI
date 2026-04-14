"""Report service — generates session reports."""

class ReportService:
    """Stateless service for report generation."""

    def __init__(self, gemini_service, db):
        self.gemini = gemini_service
        self.db = db

    async def generate_report(
        self,
        session_id: str,
        include_transcript: bool = False,
    ) -> dict:
        """Generate a detailed report for a completed session."""
        
        # 1. Fetch Session Data
        session = await self.db.sessions.find_one({"session_id": session_id})
        if not session:
            raise ValueError(f"Session {session_id} not found.")

        # 2. Extract Transcript (if available)
        transcript = ""
        messages = session.get("messages", [])
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            transcript += f"{role.upper()}: {content}\n"

        # 3. Aggregate Latest Scores
        scores = session.get("scores", [])
        latest_scores = scores[-1] if scores else {
            "confidence": 0.5, "motivation": 0.5, "clarity": 0.5, "emotional_stability": 0.5
        }

        # 4. Generate Success Prediction (Mock or Service based)
        prediction = session.get("last_prediction", {
            "success_probability": 75.0,
            "risk_level": "low"
        })

        # 5. Call Gemini for Qualitative Analysis
        report = await self.gemini.generate_report(transcript, latest_scores, prediction)

        return {
            "session_id": session_id,
            "summary": report.get("summary", ""),
            "strengths": report.get("strengths", []),
            "weaknesses": report.get("weaknesses", []),
            "success_prediction": report.get("success_prediction", ""),
            "action_plan": report.get("action_plan", []),
            "scores": latest_scores,
            "transcript": transcript if include_transcript else None
        }
