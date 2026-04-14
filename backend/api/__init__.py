from .chat import router as chat_router
from .voice import router as voice_router
from .face_analysis import router as face_router
from .analyze import router as analyze_router
from .predict import router as predict_router
from .report import router as report_router
from .dashboard import router as dashboard_router

__all__ = [
    "chat_router",
    "voice_router",
    "face_router",
    "analyze_router",
    "predict_router",
    "report_router",
    "dashboard_router",
]
