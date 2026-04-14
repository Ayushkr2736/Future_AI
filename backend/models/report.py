"""Pydantic models for the /report endpoint."""

from pydantic import BaseModel, Field


class SessionSummary(BaseModel):
    """Summary of a single analysis session."""

    session_id: str
    date: str = Field(..., description="Session date (ISO 8601)")
    duration: str = Field(..., description="Human-readable duration, e.g. '12m 34s'")
    confidence: float = Field(..., ge=0.0, le=100.0)
    motivation: float = Field(..., ge=0.0, le=100.0)
    risk_level: str
    success_probability: float = Field(..., ge=0.0, le=100.0)
    summary: str = Field(..., description="AI-generated session summary text")


class ReportRequest(BaseModel):
    """Request payload for generating a session report."""

    session_id: str = Field(..., description="Which session to generate a report for")
    include_transcript: bool = Field(
        default=False, description="Whether to include the full chat transcript"
    )


class ReportResponse(BaseModel):
    """Generated report for a session."""

    session: SessionSummary
    transcript: list[dict] | None = Field(
        default=None, description="Chat transcript if requested"
    )
    recommendations: list[str] = Field(
        default_factory=list, description="List of improvement recommendations"
    )
