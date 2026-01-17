"""Routes for practice submission."""
import os
import shutil
from fastapi import APIRouter, File, Form, HTTPException, Depends, UploadFile
from datetime import datetime

from be.config import AUDIO_DIR
from ..models import PracticeSubmission, PracticeResponse, NotebookEntry
from ..storage import add_entry, generate_entry_id
from be.services.analyze_service import analyze_text, transcribe_audio
# from be.routes.auth import get_current_user
from be.services.language_service import is_language_supported


router = APIRouter(prefix="/api/practice", tags=["practice"])


@router.post("/submit", response_model=PracticeResponse)
async def submit_practice(submission: PracticeSubmission):
    """
    Accept user text, analyze it with GPT using user's language preferences, and save as a notebook entry.
    """
    if not submission.text or not submission.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Get user for language preferences
    # user = get_user_by_id(user_id)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
     # Validate languages
    if not is_language_supported(submission.practice_language):
        raise HTTPException(
            status_code=400, 
            detail=f"Sorry, we currently don't support '{submission.practice_language}' as a practice language. Please choose from our supported languages."
        )
    
    if not is_language_supported(submission.native_language):
        raise HTTPException(
            status_code=400,
            detail=f"Sorry, we currently don't support '{submission.native_language}' as a native language. Please choose from our supported languages."
        )
    try:
        # Analyze the text using GPT with user's language preferences
        analysis = await analyze_text(
            submission.text,
            practice_language=submission.practice_language,
            native_language=submission.native_language
        )
        
        # Create notebook entry
        entry = NotebookEntry(
            id=generate_entry_id(),
            timestamp=datetime.now(),
            original_text=submission.text,
            improved_text=analysis["improved_text"],
            errors=analysis["errors"],
            difficult_words=analysis["difficult_words"],
            topic=submission.topic,
            practice_language=submission.practice_language,
            native_language=submission.native_language
        )
        
        # Save to storage
        add_entry(entry)
        
        return PracticeResponse(
            success=True,
            entry=entry,
            message="Practice submitted and analyzed successfully"
        )
        
    except ValueError as e:
        # Configuration errors (e.g., missing API key)
        error_msg = str(e)
        print(f"Configuration error: {error_msg}")
        raise HTTPException(status_code=500, detail="Service configuration error. Please contact support.")
    except Exception as e:
        # Log full error for debugging (server-side only)
        error_msg = str(e)
        print(f"Error processing practice: {error_msg}")
        # Return generic error (don't expose internal details)
        raise HTTPException(status_code=500, detail="Failed to process practice. Please try again.")


@router.post("/voice")
async def process_voice(
    file: UploadFile = File(...), 
    topic: str = Form("General"),
    practice_language: str = Form(...),
    native_language: str = Form(...)
):
    """
    Accept audio blob, transcribe with Whisper, analyze, and return.
    """
    print(f"Received audio upload: {file.filename}, Content-Type: {file.content_type}")
    print(f"Practice Language: {practice_language}, Native Language: {native_language}")
     # Validate languages
    if not is_language_supported(practice_language):
        raise HTTPException(
            status_code=400,
            detail=f"Sorry, we currently don't support '{practice_language}'. Please choose from our supported languages."
        )
    
    if not is_language_supported(native_language):
        raise HTTPException(
            status_code=400,
            detail=f"Sorry, we currently don't support '{native_language}'. Please choose from our supported languages."
        )
    # Validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name missing")
        
    # Save file temporarily
    # Ensure filename has extension (Whisper cares)
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".webm" # Default for browser recording
        
    temp_filename = f"upload_{int(datetime.now().timestamp())}{ext}"
    temp_path = AUDIO_DIR / temp_filename
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"Saved audio to {temp_path}, Size: {os.path.getsize(temp_path)} bytes")
        
        # Transcribe
        transcript = await transcribe_audio(temp_path)
        
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Could not transcribe audio (empty result)")
            
        print(f"Transcribed Text: {transcript}")
        
        # Reuse existing submission logic
        # We can construct the proper response manually to include transcript
        
        analysis = await analyze_text(
            transcript,
            practice_language=practice_language,
            native_language=native_language
            )
        
        entry = NotebookEntry(
            id=generate_entry_id(),
            timestamp=datetime.now(),
            original_text=transcript,
            improved_text=analysis["improved_text"],
            errors=analysis["errors"],
            difficult_words=analysis["difficult_words"],
            topic=topic,
            practice_language=practice_language,
            native_language=native_language
        )
        
        add_entry(entry)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "success": True,
            "transcript": transcript,
            "entry": entry,
            "message": "Voice processed successfully"
        }

    except Exception as e:
        print(f"Voice processing error: {str(e)}")
        # Try to clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """
    Return list of supported practice languages.
    """
    from be.services.analyze_service import get_all_supported_languages
    return {"languages": get_all_supported_languages(),
            "count": len(get_all_supported_languages())}