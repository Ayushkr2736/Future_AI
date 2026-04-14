"""POST /predict — Success probability prediction endpoint."""

from fastapi import APIRouter, HTTPException, status
from models.prediction import PredictRequest, PredictResponse
from services.prediction_service import PredictionService

router = APIRouter(tags=["Prediction"])

_service = PredictionService()


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Predict success probability",
    description="Given current analysis scores, predict the probability of a successful outcome and provide a recommendation.",
    status_code=status.HTTP_200_OK,
)
async def predict(request: PredictRequest):
    try:
        result = await _service.predict(
            session_id=request.session_id,
            confidence=request.confidence,
            motivation=request.motivation,
            clarity=request.clarity,
            emotional_stability=request.emotional_stability,
        )
        return result
    except NotImplementedError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )
