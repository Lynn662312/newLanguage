"""OpenAI GPT service for text analysis and improvement."""
import json
import httpx
from pathlib import Path
from typing import List, Dict, Any
from ..config import OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL
from ..models import ErrorItem, DifficultWord


async def analyze_text(
    text: str, 
    practice_language: str = "en",
    native_language: str = "en"
) -> Dict[str, Any]:
    """
    Analyze user text using GPT to produce:
    - improved version
    - list of errors
    - list of difficult words
    - beginner-friendly explanations in native language
    
    Args:
        text: Text to analyze
        practice_language: Language being practiced (e.g., "en", "es")
        native_language: User's native language for explanations (e.g., "zh", "en")
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not set")
    
    # Language names mapping
    lang_names = {
        "en": "English", "es": "Spanish", "fr": "French", "de": "German",
        "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "pt": "Portuguese",
        "it": "Italian", "ru": "Russian", "ar": "Arabic"
    }
    
    practice_lang_name = lang_names.get(practice_language, practice_language)
    native_lang_name = lang_names.get(native_language, native_language)
    
    prompt = f"""You are a helpful language coach for {practice_lang_name} learners. 
Analyze the following text written by a beginner {practice_lang_name} learner (native language: {native_lang_name}) and provide:

1. An improved/corrected version of the text in {practice_lang_name} (keep the same meaning and style)
2. A list of errors with explanations in {native_lang_name} (only if there are errors)
3. A list of difficult words with simple definitions in {native_lang_name} and examples in {practice_lang_name}
4. Keep all explanations short, simple, and beginner-friendly in {native_lang_name}

User's text in {practice_lang_name}:
"{text}"

Please respond in the following JSON format:
{{
    "improved_text": "the corrected version in {practice_lang_name}",
    "errors": [
        {{
            "original": "original phrase/word",
            "corrected": "corrected phrase/word",
            "explanation": "simple explanation in {native_lang_name}"
        }}
    ],
    "difficult_words": [
        {{
            "word": "word in {practice_lang_name}",
            "definition": "simple definition in {native_lang_name}",
            "example": "example sentence in {practice_lang_name}"
        }}
    ]
}}

If there are no errors, return an empty errors array. Focus on words that might be challenging for beginners. All explanations and definitions should be in {native_lang_name}."""

    url = f"{OPENAI_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": OPENAI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": f"You are a helpful {practice_lang_name} language teacher. Always respond with valid JSON only. Explanations should be in {native_lang_name}."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON from the response
            # Remove markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(content)
            
            # Convert to model objects
            errors = [
                ErrorItem(**error) for error in analysis.get("errors", [])
            ]
            difficult_words = [
                DifficultWord(**word) for word in analysis.get("difficult_words", [])
            ]
            
            return {
                "improved_text": analysis.get("improved_text", text),
                "errors": errors,
                "difficult_words": difficult_words
            }
            
    except httpx.HTTPStatusError as e:
        # Log full error for debugging (server-side only)
        print(f"OpenAI API error: {e.response.status_code} - {e.response.text[:200]}")
        # Return generic error message (don't expose API details)
        raise Exception("Failed to analyze text. Please try again.")
    except json.JSONDecodeError as e:
        # Log parsing error (server-side only)
        print(f"Error parsing OpenAI response: {e}")
        print(f"Response content: {content[:500] if 'content' in locals() else 'N/A'}")
        raise Exception("Failed to parse analysis response. Please try again.")
    except Exception as e:
        # Log error details (server-side only)
        error_msg = str(e)
        print(f"Error analyzing text: {error_msg}")
        # Return generic error (don't expose internal details)
        if "OPENAI_API_KEY" in error_msg or "API" in error_msg.upper():
            raise Exception("Service configuration error. Please contact support.")
        raise Exception("Failed to analyze text. Please try again.")

async def transcribe_audio(file_path: Path) -> str:
    """
    Transcribe audio file using OpenAI Whisper API.
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not set")

    url = f"{OPENAI_BASE_URL}/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    # Debug log
    print(f"Sending audio to OpenAI Whisper: {file_path}")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(file_path, "rb") as f:
                files = {"file": (file_path.name, f, "audio/webm")}
                data = {"model": "whisper-1"}
                
                response = await client.post(url, files=files, data=data, headers=headers)
                
                # Debug log response
                print(f"Whisper Status: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Whisper Error Body: {response.text}")
                
                response.raise_for_status()
                
                result = response.json()
                transcript = result.get("text", "")
                print(f"Whisper Transcript: {transcript}")
                
                return transcript
                
    except Exception as e:
        print(f"Transcription failed: {str(e)}")
        raise Exception(f"Failed to transcribe audio: {str(e)}")
