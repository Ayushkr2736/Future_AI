"""Pydantic models for the /predict endpoint."""

from pydantic import BaseModel, Field
from typing import Literal


class PredictRequest(BaseModel):
    """Request for success probability prediction."""

    session_id: str = Field(..., description="Session to predict outcome for")
    confidence: float = Field(
        ..., ge=0.0, le=100.0, description="Current confidence score"
    )
    motivation: float = Field(
        ..., ge=0.0, le=100.0, description="Current motivation score"
    )
    clarity: float = Field(
        0.0, ge=0.0, le=100.0, description="Current clarity score"
    )
    emotional_stability: float = Field(
        0.0, ge=0.0, le=100.0, description="Current emotional stability score"
    )


class PredictResponse(BaseModel):
    """Prediction result."""

    session_id: str
    success_probability: float = Field(
        ..., ge=0.0, le=100.0, description="Predicted success probability (%)"
    )
    risk_level: str = Field(..., description="Predicted risk classification")
    recommendation: str = Field(
        ..., description="Actionable recommendation based on prediction"
    )
