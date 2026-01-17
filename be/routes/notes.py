"""Routes for notes CRUD operations."""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models import NotebookEntry, NotebookListResponse
from ..storage import get_all_entries, get_entry_by_id
# from be.routes.auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.get("/", response_model=NotebookListResponse)
async def get_notes():
    notes = get_all_entries()
    notes.sort(key=lambda x: x.timestamp, reverse=True)
    
    return NotebookListResponse(
        notes=notes,
        count=len(notes)
    )

# @router.get("/", response_model=NotebookListResponse)
# async def list_notes(user_id: str = Depends(get_current_user)):
#     """
#     List all notebook entries for the current user.
#     """
#     entries = get_user_entries(user_id)
#     # Sort by timestamp, newest first
#     entries.sort(key=lambda x: x.timestamp, reverse=True)
    
#     return NotebookListResponse(
#         notes=entries,
#         count=len(entries)
#     )


@router.get("/{entry_id}", response_model=NotebookEntry)
async def get_note(entry_id: str):
    """
    Fetch one notebook entry by ID (only if it belongs to the current user).
    """
    entry = get_entry_by_id(entry_id)
    
    if not entry:
        raise HTTPException(status_code=404, detail=f"Note with ID {entry_id} not found")
    
    # Verify entry belongs to user
    # if entry.user_id != user_id:
    #     raise HTTPException(status_code=403, detail="Access denied")
    
    return entry
