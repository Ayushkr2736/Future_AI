"""POST /analyze — Combined multi-modal analysis endpoint."""

from fastapi import APIRouter, HTTPException, status
from models.analysis import (
    AnalyzeRequest, 
    AnalyzeResponse,
    TextAnalysisRequest,
    TextAnalysisResponse
)
from services.analysis_service import AnalysisService

router = APIRouter(tags=["Analysis"])

_service = AnalysisService()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Run combined analysis",
    description="Fuse text, voice, and face signals for a session into composite confidence, motivation, and risk scores.",
    status_code=status.HTTP_200_OK,
)
async def analyze(request: AnalyzeRequest):
    try:
        result = await _service.run_analysis(
            session_id=request.session_id,
            text=request.text,
            include_face=request.include_face,
            include_voice=request.include_voice,
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
            detail=f"Analysis failed: {str(e)}",
        )


@router.post(
    "/analyze/text",
    response_model=TextAnalysisResponse,
    summary="Analyze text psychological traits",
    description="Use Gemini AI to analyze psychological traits (confidence, motivation, clarity, emotional stability) from text.",
    status_code=status.HTTP_200_OK,
)
async def analyze_text(request: TextAnalysisRequest):
    try:
         return await _service.run_text_analysis(text=request.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text analysis failed: {str(e)}",
        )
