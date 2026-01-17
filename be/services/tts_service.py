"""ElevenLabs text-to-speech service."""
import httpx
from pathlib import Path
from typing import Optional
import uuid
# import os

from ..config import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID,
    ELEVENLABS_BASE_URL,
    AUDIO_DIR
)


async def text_to_speech(text: str, language: Optional[str] = None) -> Optional[str]:
    """
    Convert text to speech using ElevenLabs API.
    Returns the URL path to the generated audio file.
    """
    if not ELEVENLABS_API_KEY:
        print("Warning: ELEVENLABS_API_KEY not set")
        return None
    
    # url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{ELEVENLABS_VOICE_ID}"
    url = f"{ELEVENLABS_BASE_URL}/text-to-speech/default/{ELEVENLABS_VOICE_ID}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",  # Supports multiple languages
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    # Add language hint if provided (for better pronunciation)
    if language:
        # ElevenLabs can detect language, but we can add it as metadata
        # The multilingual model will handle it automatically
        pass
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            # Generate a unique filename
            audio_filename = f"{uuid.uuid4()}.mp3"
            audio_path = AUDIO_DIR / audio_filename
            
            # Save the audio file
            with open(audio_path, "wb") as f:
                f.write(response.content)
            print(f"Audio generated successfully: {audio_filename}")
            # Return the URL path (relative to /static/audio)
            return f"/static/audio/{audio_filename}"
            
    except httpx.HTTPStatusError as e:
        # Log error details (server-side only, truncate response to avoid logging sensitive data)
        error_preview = e.response.text[:200] if e.response.text else "No error details"
        print(f"ElevenLabs API error: {e.response.status_code} - {error_preview}")
        return None
    except Exception as e:
        # Log error (server-side only)
        print(f"Error generating TTS: {str(e)}")
        return None
