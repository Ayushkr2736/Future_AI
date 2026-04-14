"""POST /chat — Conversational AI endpoint."""

from fastapi import APIRouter, HTTPException, status
from models.chat import ChatRequest, ChatResponse
from services.chat_service import ChatService
from services.gemini_service import GeminiService
from services.analysis_service import AnalysisService
from services.prediction_service import PredictionService
from utils.mongodb import get_db

router = APIRouter(tags=["Chat"])

# Initialize services
gemini = GeminiService()
db = get_db()
analysis = AnalysisService(db=db)
predict = PredictionService()
_service = ChatService(
    gemini_service=gemini, 
    analysis_service=analysis, 
    prediction_service=predict,
    db=db
)


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a chat message",
    description="Submit a user message and receive an AI assistant response with optional analysis scores and success prediction.",
    status_code=status.HTTP_200_OK,
)
async def chat(request: ChatRequest):
    try:
        result = await _service.process_message(
            message=request.message,
            session_id=request.session_id,
            emotions=request.emotions,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}",
        )
