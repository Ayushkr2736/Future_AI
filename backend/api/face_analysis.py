from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from typing import Optional
import json
from models.face import FaceAnalysisResponse
from services.face_service import FaceService
from utils.mongodb import get_db

router = APIRouter(tags=["Face Analysis"])

# Initialize service
db = get_db()
_service = FaceService(db=db)


@router.post(
    "/face-analysis",
    response_model=FaceAnalysisResponse,
    summary="Analyze a webcam frame",
    description="Upload a single image frame from the webcam and receive facial emotion analysis with derived scores.",
    status_code=status.HTTP_200_OK,
)
async def face_analysis(
    image: UploadFile = File(..., description="Image frame (JPEG/PNG) to analyze"),
    emotions_json: Optional[str] = Form(None, description="Optional pre-detected emotion probabilities from frontend"),
    session_id: Optional[str] = Form(None, description="Optional session ID for persistence"),
):
    # Validate image type
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if image.content_type and image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {image.content_type}. Allowed: {', '.join(allowed_types)}",
        )

    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image file is empty.",
            )

        emotion_data = None
        if emotions_json:
            try:
                emotion_data = json.loads(emotions_json)
            except json.JSONDecodeError:
                pass # Fallback to backend analysis if invalid JSON

        result = await _service.analyze_frame(
            image_bytes=image_bytes,
            content_type=image.content_type or "image/jpeg",
            emotion_data=emotion_data,
            session_id=session_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face analysis failed: {str(e)}",
        )
