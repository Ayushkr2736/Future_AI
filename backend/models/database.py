from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class UserDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ScoreDB(BaseModel):
    confidence: float
    motivation: float
    clarity: float
    emotional_stability: float

class SessionDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    session_id: str
    scores: List[ScoreDB] = []
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
