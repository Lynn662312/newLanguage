"""Routes for practice submission."""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..models import PracticeSubmission, PracticeResponse, NotebookEntry
from be.services.analyze_service import analyze_text
from ..storage import add_entry, generate_entry_id

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
