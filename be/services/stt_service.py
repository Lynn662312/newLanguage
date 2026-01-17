"""ElevenLabs Speech-to-Text service."""
import httpx
from pathlib import Path
from typing import Optional
import uuid

from ..config import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_BASE_URL,
    AUDIO_DIR
)


async def speech_to_text(audio_data: bytes, language: Optional[str] = None) -> Optional[str]:
    """
    Convert speech to text using ElevenLabs Scribe v2 STT API.
    
    Args:
        audio_data: Audio file bytes
        language: Language code (e.g., 'en', 'es', 'fr') - optional, API will auto-detect
    
    Returns:
        Transcribed text or None if error
    """
    if not ELEVENLABS_API_KEY:
        print("Warning: ELEVENLABS_API_KEY not set")
        return None
    
    # ElevenLabs Scribe v2 STT endpoint
    url = f"{ELEVENLABS_BASE_URL}/speech-to-text"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    # # Save audio temporarily
    # temp_filename = f"{uuid.uuid4()}.webm"
    # temp_path = AUDIO_DIR / temp_filename
    
    # try:
    #     # Save audio file
    #     with open(temp_path, "wb") as f:
    #         f.write(audio_data)
        
    #     # Prepare multipart form data
    #     with open(temp_path, "rb") as f:
    #         files = {
    #             "audio": (temp_filename, f, "audio/webm")
    #         }
            
    #         data = {
    #             "model_id": "scribe_v2"  # ElevenLabs Scribe v2 model
    #         }
            
    #         # Add language hint if provided
    #         if language:
    #             data["language_code"] = language
            
    #         async with httpx.AsyncClient(timeout=60.0) as client:
    #             response = await client.post(url, files=files, data=data, headers=headers)
    #             response.raise_for_status()
                
    #             result = response.json()
    #             transcript = result.get("text", "")
                
    #             # Clean up temp file
    #             if temp_path.exists():
    #                 temp_path.unlink()
                
    #             return transcript
                
    # except httpx.HTTPStatusError as e:
    #     # Log error (server-side only)
    #     error_preview = e.response.text[:200] if e.response.text else "No error details"
    #     print(f"ElevenLabs STT API error: {e.response.status_code} - {error_preview}")
        
    #     # Clean up temp file
    #     if temp_path.exists():
    #         temp_path.unlink()
        
    #     return None
    # except Exception as e:
    #     # Log error (server-side only)
    #     print(f"Error in STT: {str(e)}")
        
    #     # Clean up temp file
    #     if temp_path.exists():
    #         temp_path.unlink()
        
    #     return None
    try:
        print(f"Sending {len(audio_data)} bytes to ElevenLabs STT...")
        
        # Prepare multipart form data
        files = {
            "audio": ("recording.webm", audio_data, "audio/webm")
        }
        
        data = {
            "model_id": "eleven_multilingual_v2"
        }
        
        # Use longer timeout for audio processing
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url, 
                files=files,
                data=data,
                headers=headers
            )
            response.raise_for_status()
            
            result = response.json()
            transcript = result.get("text", "")
            
            print(f"✅ Transcription successful: {transcript[:100]}...")
            return transcript
                
    except httpx.TimeoutException:
        print("❌ STT Error: Request timed out")
        return None
    except httpx.HTTPStatusError as e:
        error_preview = e.response.text[:300] if e.response.text else "No error details"
        print(f"❌ ElevenLabs STT API error: {e.response.status_code}")
        print(f"Error details: {error_preview}")
        return None
    except Exception as e:
        print(f"❌ Error in STT: {str(e)}")
        return None

# async def transcribe_audio_file(file_path: Path, language: Optional[str] = None) -> Optional[str]:
#     """
#     Transcribe audio file using ElevenLabs STT.
    
#     Args:
#         file_path: Path to audio file
#         language: Language code (optional)
    
#     Returns:
#         Transcribed text or None if error
#     """
#     try:
#         with open(file_path, "rb") as f:
#             audio_data = f.read()
#         return await speech_to_text(audio_data, language)
#     except Exception as e:
#         print(f"Error reading audio file: {str(e)}")
#         return None
