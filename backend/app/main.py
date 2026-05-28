"""FastAPI application entry point."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db
from app.routers import admin, analytics, auth, chat, notes, planner, quizzes, recommendations

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title="AI Virtual Teaching Assistant API",
    description="Backend for the AI-powered learning platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "env": settings.env}


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(planner.router)
app.include_router(quizzes.router)
app.include_router(notes.router)
app.include_router(analytics.router)
app.include_router(recommendations.router)
app.include_router(admin.router)
