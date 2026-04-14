"""Pydantic models for the /analyze endpoint."""

from pydantic import BaseModel, Field
from typing import Literal


class AnalysisScores(BaseModel):
    """Psychological traits analysis scores."""

    confidence: float = Field(..., ge=0.0, le=100.0)
    motivation: float = Field(..., ge=0.0, le=100.0)
    clarity: float = Field(..., ge=0.0, le=100.0)
    emotional_stability: float = Field(..., ge=0.0, le=100.0)



class AnalyzeRequest(BaseModel):
    """Request body for combined analysis."""

    session_id: str = Field(..., description="Session identifier to analyze")
    text: str | None = Field(default=None, description="Latest chat text for analysis")
    include_face: bool = Field(
        default=True, description="Whether to factor in face analysis"
    )
    include_voice: bool = Field(
        default=True, description="Whether to factor in voice analysis"
    )


class AnalyzeResponse(BaseModel):
    """Combined analysis endpoint response."""

    session_id: str
    scores: AnalysisScores
    timestamp: str = Field(..., description="ISO 8601 timestamp of analysis")


class TextAnalysisRequest(BaseModel):
    """Request body for text-only psychological analysis."""

    text: str = Field(..., description="Input text to analyze for psychological traits")
    session_id: str | None = Field(default=None, description="Optional session ID for persistence")


class TextAnalysisResponse(BaseModel):
    """Response body for text-only psychological analysis."""

    scores: AnalysisScores
    timestamp: str = Field(..., description="ISO 8601 timestamp of analysis")
