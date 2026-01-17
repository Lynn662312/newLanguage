"""Storage operations for notebook entries using JSON file."""
import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import uuid

from config import NOTES_FILE
from models import NotebookEntry


def load_notes() -> List[dict]:
    """Load all notes from JSON file."""
    if not NOTES_FILE.exists():
        return []
    
    try:
        with open(NOTES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_notes(notes: List[dict]) -> None:
    """Save notes to JSON file."""
    NOTES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(NOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(notes, f, ensure_ascii=False, indent=2, default=str)


def add_entry(entry: NotebookEntry) -> None:
    """Add a new notebook entry."""
    notes = load_notes()
    entry_dict = entry.model_dump()
    notes.append(entry_dict)
    save_notes(notes)


def get_all_entries() -> List[NotebookEntry]:
    """Get all notebook entries."""
    notes_data = load_notes()
    entries = []
    for note in notes_data:
        try:
            # Convert timestamp string back to datetime if needed
            if isinstance(note.get("timestamp"), str):
                note["timestamp"] = datetime.fromisoformat(note["timestamp"])
            entries.append(NotebookEntry(**note))
        except Exception as e:
            print(f"Error parsing entry: {e}")
            continue
    return entries


def get_entry_by_id(entry_id: str) -> Optional[NotebookEntry]:
    """Get a notebook entry by ID."""
    notes_data = load_notes()
    for note in notes_data:
        if note.get("id") == entry_id:
            try:
                if isinstance(note.get("timestamp"), str):
                    note["timestamp"] = datetime.fromisoformat(note["timestamp"])
                return NotebookEntry(**note)
            except Exception as e:
                print(f"Error parsing entry: {e}")
                return None
    return None


def generate_entry_id() -> str:
    """Generate a unique entry ID."""
    return str(uuid.uuid4())
