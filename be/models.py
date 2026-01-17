"""Pydantic models for request and response schemas."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class IntentRequest(BaseModel):
    """Request model for intent recognition."""
    text: Optional[str] = None
    audio_file: Optional[str] = None  # Base64 encoded audio or file path
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
    topic: Optional[str] = "General"
    practice_language: str = "en"
    native_language: str = "en"



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
    practice_language: str
    native_language: str


class PracticeResponse(BaseModel):
    """Response model for practice submission."""
    success: bool
    entry: NotebookEntry
    message: str


class NotebookListResponse(BaseModel):
    """Response model for listing all notebooks."""
    notes: List[NotebookEntry]
    count: int


# # User Authentication Models
# class User(BaseModel):
#     """User model."""
#     id: str
#     email: str
#     username: str
#     native_language: str  # e.g., "zh", "en", "es"
#     practice_language: str  # e.g., "en", "es", "fr"
#     created_at: datetime


# class UserRegister(BaseModel):
#     """User registration request."""
#     email: EmailStr
#     username: str
#     password: str
#     native_language: str
#     practice_language: str


# class UserLogin(BaseModel):
#     """User login request."""
#     email: EmailStr
#     password: str


# class UserResponse(BaseModel):
#     """User response model."""
#     id: str
#     email: str
#     username: str
#     native_language: str
#     practice_language: str
#     created_at: datetime


# class LoginResponse(BaseModel):
#     """Login response model."""
#     access_token: str
#     token_type: str = "bearer"
#     user: UserResponse


# Audio Transcription Models
class AudioTranscribeRequest(BaseModel):
    """Request model for audio transcription."""
    # user_id: str
    language: Optional[str] = None  # Practice language for STT


class AudioTranscribeResponse(BaseModel):
    """Response model for audio transcription."""
    text: str
    language: str
