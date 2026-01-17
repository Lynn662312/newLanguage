"""FastAPI application main file."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from be.routes import scenario

from .routes import intent, practice, notes
from .config import AUDIO_DIR

app = FastAPI(
    title="speak and learn",
    description="oral practice application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio
app.mount("/static/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

# Include routers
# app.include_router(auth.router)  #no user identity
app.include_router(intent.router)
app.include_router(practice.router)
app.include_router(notes.router)
app.include_router(scenario.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to the Speak and Learn API!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/practice/prompt")
async def get_practice_prompt():
    """
    Get the practice prompt question after login.
    """
    return {
        "question": "What do you want to practice for today?",
        "message": "Please select a topic or speak your answer"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
