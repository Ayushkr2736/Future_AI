"""Pydantic models for the /face-analysis endpoint."""

from pydantic import BaseModel, Field


class EmotionScores(BaseModel):
    """Detected emotion probabilities from a face frame."""

    neutral: float = Field(0.0, ge=0.0, le=1.0)
    happy: float = Field(0.0, ge=0.0, le=1.0)
    sad: float = Field(0.0, ge=0.0, le=1.0)
    angry: float = Field(0.0, ge=0.0, le=1.0)
    surprised: float = Field(0.0, ge=0.0, le=1.0)
    fearful: float = Field(0.0, ge=0.0, le=1.0)


class FaceAnalysisResponse(BaseModel):
    """Response from face frame analysis."""

    emotion: str = Field(..., description="The dominant emotion detected")
    emotions: EmotionScores = Field(
        ..., description="Per-emotion probability breakdown"
    )
    confidence: float = Field(
        ..., ge=0.0, le=100.0, description="Derived confidence score (0–100)"
    )
    motivation: float = Field(
        ..., ge=0.0, le=100.0, description="Derived motivation score (0–100)"
    )
    emotional_stability: float = Field(
        ..., ge=0.0, le=100.0, description="Derived emotional stability score (0–100)"
    )
