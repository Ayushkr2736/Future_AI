"""POST /voice — Voice transcription endpoint."""

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from models.voice import VoiceResponse
from models.analysis import TextAnalysisRequest, TextAnalysisResponse
from services.voice_service import VoiceService

from utils.mongodb import get_db
router = APIRouter(tags=["Voice"])

db = get_db()
_service = VoiceService(db=db)


@router.post(
    "/voice",
    response_model=VoiceResponse,
    summary="Transcribe audio input",
    description="Upload an audio file (e.g., WebM from browser MediaRecorder) and receive a text transcription.",
    status_code=status.HTTP_200_OK,
)
async def voice(audio: UploadFile = File(..., description="Audio file to transcribe")):
    # Validate file type
    allowed_types = {
        "audio/webm",
        "audio/wav",
        "audio/mpeg",
        "audio/ogg",
        "audio/mp4",
    }
    if audio.content_type and audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio type: {audio.content_type}. Allowed: {', '.join(allowed_types)}",
        )

    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty.",
            )

        result = await _service.transcribe(
            audio_bytes=audio_bytes,
            content_type=audio.content_type or "audio/webm",
        )
        return result
    except NotImplementedError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice processing failed: {str(e)}",
        )
@router.post(
    "/voice/transcript",
    response_model=TextAnalysisResponse,
    summary="Process voice transcript",
    description="Receive a text transcript (e.g., from browser Web Speech API) and process it for psychological traits.",
    status_code=status.HTTP_200_OK,
)
async def process_transcript(request: TextAnalysisRequest):
    try:
        return await _service.process_transcript(
            transcript=request.text, 
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcript processing failed: {str(e)}",
        )
