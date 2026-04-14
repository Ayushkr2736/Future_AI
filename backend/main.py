"""Oracle AI Backend — FastAPI Application Entry Point.

Run with:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import (
    chat_router,
    voice_router,
    face_router,
    analyze_router,
    predict_router,
    report_router,
    dashboard_router,
)

# ── App Configuration ────────────────────────────────────────────────────────

app = FastAPI(
    title="Oracle AI API",
    description=(
        "Backend API for the Oracle AI Interview Intelligence Platform. "
        "Provides endpoints for chat, voice transcription, face analysis, "
        "multi-modal scoring, success prediction, and session reports."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ──────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ────────────────────────────────────────────────────────

app.include_router(chat_router)
app.include_router(voice_router)
app.include_router(face_router)
app.include_router(analyze_router)
app.include_router(predict_router)
app.include_router(report_router)
app.include_router(dashboard_router)


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get(
    "/",
    tags=["Health"],
    summary="Health check",
    description="Returns a simple status to verify the API is running.",
)
async def health_check():
    return {
        "status": "ok",
        "service": "Oracle AI API",
        "version": "0.1.0",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="API health check",
    description="Returns API status and available endpoints.",
)
async def api_health():
    return {
        "status": "ok",
        "endpoints": [
            "POST /chat",
            "POST /voice",
            "POST /face-analysis",
            "POST /analyze",
            "POST /predict",
            "POST /report",
        ],
    }
