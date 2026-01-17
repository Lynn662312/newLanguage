"""Routes for notes CRUD operations."""
from fastapi import APIRouter, HTTPException
from typing import List
from models import NotebookEntry, NotebookListResponse
from storage import get_all_entries, get_entry_by_id

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/", response_model=NotebookListResponse)
async def list_notes():
    """
    List all notebook entries.
    """
    entries = get_all_entries()
    # Sort by timestamp, newest first
    entries.sort(key=lambda x: x.timestamp, reverse=True)
    
    return NotebookListResponse(
        notes=entries,
        count=len(entries)
    )


@router.get("/{entry_id}", response_model=NotebookEntry)
async def get_note(entry_id: str):
    """
    Fetch one notebook entry by ID.
    """
    entry = get_entry_by_id(entry_id)
    
    if not entry:
        raise HTTPException(status_code=404, detail=f"Note with ID {entry_id} not found")
    
    return entry
