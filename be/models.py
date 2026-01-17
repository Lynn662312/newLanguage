"""Pydantic models for request and response schemas."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class IntentRequest(BaseModel):
    """Request model for intent recognition."""
    text: str
    generate_audio: bool = False


class IntentResponse(BaseModel):
    """Response model for intent recognition."""
    text: str
    audio_url: Optional[str] = None


class IntentConfirmRequest(BaseModel):
    """Request model for intent confirmation."""
    topic: str
    confirmed: bool = True


class IntentConfirmResponse(BaseModel):
    """Response model for intent confirmation."""
    message: str
    topic: str
    confirmed: bool


class PracticeSubmission(BaseModel):
    """Request model for practice submission."""
    text: str
    topic: Optional[str] = None


class ErrorItem(BaseModel):
    """Model for a single error in the text."""
    original: str
    corrected: str
    explanation: str


class DifficultWord(BaseModel):
    """Model for a difficult word with explanation."""
    word: str
    definition: str
    example: str


class NotebookEntry(BaseModel):
    """Model for a notebook entry."""
    id: str
    timestamp: datetime
    original_text: str
    improved_text: str
    errors: List[ErrorItem]
    difficult_words: List[DifficultWord]
    topic: Optional[str] = None


class PracticeResponse(BaseModel):
    """Response model for practice submission."""
    success: bool
    entry: NotebookEntry
    message: str


class NotebookListResponse(BaseModel):
    """Response model for listing all notebooks."""
    notes: List[NotebookEntry]
    count: int
