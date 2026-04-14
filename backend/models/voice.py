"""Pydantic models for the /voice endpoint."""

from pydantic import BaseModel, Field


class VoiceResponse(BaseModel):
    """Response after processing an audio file."""

    text: str = Field(..., description="Transcribed text from the audio input")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Transcription confidence score (0–1)"
    )
