"""FastAPI application main file."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .routes import intent, practice, notes
from .config import AUDIO_DIR

app = FastAPI(
    title="Oral Practice API",
    description="Backend API for oral practice application",
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
app.include_router(intent.router)
app.include_router(practice.router)
app.include_router(notes.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Oral Practice",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/test")
async def test():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
