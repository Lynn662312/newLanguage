"""OpenAI GPT service for text analysis and improvement."""
import json
import httpx
from typing import List, Dict, Any
from config import OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL
from models import ErrorItem, DifficultWord


async def analyze_text(text: str, language: str = "en") -> Dict[str, Any]:
    """
    Analyze user text using GPT to produce:
    - improved version
    - list of errors
    - list of difficult words
    - beginner-friendly explanations
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not set")
    
    prompt = f"""You are a helpful language coach for {language} learners. Analyze the following text written by a beginner {language} learner and provide:

1. An improved/corrected version of the text (keep the same meaning and style)
2. A list of errors with explanations (only if there are errors)
3. A list of difficult words with simple definitions and examples
4. Keep all explanations short, simple, and beginner-friendly

User's text:
"{text}"

Please respond in the following JSON format:
{{
    "improved_text": "the corrected version",
    "errors": [
        {{
            "original": "original phrase/word",
            "corrected": "corrected phrase/word",
            "explanation": "simple explanation"
        }}
    ],
    "difficult_words": [
        {{
            "word": "word",
            "definition": "simple definition",
            "example": "example sentence"
        }}
    ]
}}

If there are no errors, return an empty errors array. Focus on words that might be challenging for beginners."""

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
                "content": "You are a helpful English teacher. Always respond with valid JSON only."
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
