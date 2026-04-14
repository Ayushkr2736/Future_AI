"""Pydantic models for the /chat endpoint."""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """A single message in the conversation."""

    id: str = Field(..., description="Unique message identifier")
    role: Literal["user", "assistant", "system"] = Field(
        ..., description="Who sent the message"
    )
    content: str = Field(..., description="Message text content")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="When the message was created"
    )


class ChatRequest(BaseModel):
    """Incoming chat request from the frontend."""

    message: str = Field(
        ..., min_length=1, max_length=4096, description="User's message text"
    )
    session_id: str | None = Field(
        default=None, description="Optional session ID for conversation continuity"
    )
    emotions: dict | None = Field(
        default=None, description="Optional face emotion data from webcam"
    )


class ChatResponse(BaseModel):
    """Chat endpoint response."""

    message: ChatMessage
    scores: dict | None = Field(
        default=None,
        description="Optional real-time analysis scores returned alongside the reply",
    )
    prediction: dict | None = Field(
        default=None,
        description="Optional success prediction based on updated session scores",
    )
