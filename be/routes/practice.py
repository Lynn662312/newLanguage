"""Routes for practice submission."""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from datetime import datetime
import shutil
import os
from models import PracticeSubmission, PracticeResponse, NotebookEntry
from services.analyze_service import analyze_text, transcribe_audio
from storage import add_entry, generate_entry_id
from config import AUDIO_DIR

router = APIRouter(prefix="/api/practice", tags=["practice"])


@router.post("/submit", response_model=PracticeResponse)
async def submit_practice(submission: PracticeSubmission):
    """
    Accept user text, analyze it with GPT, and save as a notebook entry.
    """
    if not submission.text or not submission.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Analyze the text using GPT
        analysis = await analyze_text(submission.text)
        
        # Create notebook entry
        entry = NotebookEntry(
            id=generate_entry_id(),
            timestamp=datetime.now(),
            original_text=submission.text,
            improved_text=analysis["improved_text"],
            errors=analysis["errors"],
            difficult_words=analysis["difficult_words"],
            topic=submission.topic
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
    topic: str = Form("General")
):
    """
    Accept audio blob, transcribe with Whisper, analyze, and return.
    """
    print(f"Received audio upload: {file.filename}, Content-Type: {file.content_type}")
    
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
        
        analysis = await analyze_text(transcript)
        
        entry = NotebookEntry(
            id=generate_entry_id(),
            timestamp=datetime.now(),
            original_text=transcript,
            improved_text=analysis["improved_text"],
            errors=analysis["errors"],
            difficult_words=analysis["difficult_words"],
            topic=topic
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
