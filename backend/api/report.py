"""POST /report — Session report generation endpoint."""

from fastapi import APIRouter, HTTPException, status
from models.report import ReportRequest, ReportResponse
from services.report_service import ReportService
from services.gemini_service import GeminiService
from utils.mongodb import get_db

router = APIRouter(tags=["Report"])

# Initialize services
gemini = GeminiService()
db = get_db()
_service = ReportService(gemini_service=gemini, db=db)


@router.post(
    "/report",
    response_model=ReportResponse,
    summary="Generate session report",
    description="Generate a detailed report for a completed analysis session, optionally including the full chat transcript.",
    status_code=status.HTTP_200_OK,
)
async def report(request: ReportRequest):
    try:
        result = await _service.generate_report(
            session_id=request.session_id,
            include_transcript=request.include_transcript,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}",
        )
