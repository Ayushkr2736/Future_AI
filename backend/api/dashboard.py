from fastapi import APIRouter, HTTPException, status
from utils.mongodb import get_db
from models.database import SessionDB
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(tags=["Dashboard"])

@router.get(
    "/dashboard",
    summary="Get dashboard data",
    description="Fetch past evaluation sessions and historical success probability data.",
    status_code=status.HTTP_200_OK,
)
async def get_dashboard_data():
    db = get_db()
    try:
        # Fetch all sessions from MongoDB, sorted by creation date
        cursor = db.sessions.find().sort("created_at", -1)
        sessions_raw = await cursor.to_list(length=50)

        sessions = []
        success_history = []

        for s in sessions_raw:
            # Aggregate scores for Session display
            latest_scores = s.get("scores", [])[-1] if s.get("scores") else {
                "confidence": 0.5, "motivation": 0.5, "clarity": 0.5, "emotional_stability": 0.5
            }
            
            # Use prediction data if available
            prediction = s.get("last_prediction", {
                "success_probability": 0.0,
                "risk_level": "medium"
            })

            created_at = s.get("created_at")
            # Handle float or datetime
            if isinstance(created_at, float):
                date_str = datetime.fromtimestamp(created_at).strftime("%Y-%m-%d")
            elif isinstance(created_at, datetime):
                date_str = created_at.strftime("%Y-%m-%d")
            else:
                date_str = str(created_at)

            session_data = {
                "id": s.get("session_id", "unknown"),
                "date": date_str,
                "duration": "15m", # Mock duration for UI
                "scores": latest_scores,
                "successProbability": prediction.get("success_probability", 0.0),
                "summary": s.get("summary", "Session analyzed."),
                "riskLevel": prediction.get("risk_level", "medium")
            }
            sessions.append(session_data)

            # History point
            success_history.append({
                "date": date_str,
                "probability": prediction.get("success_probability", 0.0)
            })

        # Reverse history for chronological order in chart
        return {
            "sessions": sessions,
            "successHistory": success_history[::-1]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}",
        )
