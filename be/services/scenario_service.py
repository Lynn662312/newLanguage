"""OpenAI service for generating practice scenarios."""
import httpx
from typing import Optional
from ..config import OPENAI_API_KEY, OPENAI_BASE_URL

async def generate_scenario(
    user_input: str,
    practice_language: str = "en",
    native_language: str = "en"
) -> Optional[dict]:
    """
    Generate a random practice scenario based on user input using OpenAI.
    
    Args:
        user_input: User's keyword or description (e.g., "ordering food")
        practice_language: Target language for practice
        native_language: User's native language for instructions
        
    Returns:
        dict with 'scenario_text' and 'instructions' or None if error
    """
    if not OPENAI_API_KEY:
        print("Warning: OPENAI_API_KEY not set")
        return None
    
    url = f"{OPENAI_BASE_URL}/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    # Create a prompt to generate scenario
    system_prompt = f"""You are a language learning assistant. Generate creative and realistic practice scenarios.
The scenario should be in {practice_language}.
Provide brief instructions in {native_language} explaining what the user should do.
Keep scenarios conversational and practical for language learners."""

    user_prompt = f"""Create a practice scenario about: {user_input}

Return your response in this exact format:
SCENARIO: [A realistic situation description in {practice_language}, 2-3 sentences]
TASK: [What the user should say or do, in {native_language}, 1 sentence]

Example for "ordering food at restaurant":
SCENARIO: You are at a restaurant in Paris. The waiter comes to your table and asks what you would like to order.
TASK: Order a meal and ask about recommendations.

Now generate a unique scenario for: {user_input}"""

    data = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.9,  # Higher temperature for more creative/random scenarios
        "max_tokens": 200
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse the response
            lines = content.strip().split("\n")
            scenario = ""
            task = ""
            
            for line in lines:
                if line.startswith("SCENARIO:"):
                    scenario = line.replace("SCENARIO:", "").strip()
                elif line.startswith("TASK:"):
                    task = line.replace("TASK:", "").strip()
            
            if not scenario:
                # Fallback: use entire response as scenario
                scenario = content.strip()
                task = f"Practice speaking about this topic in {practice_language}."
            
            return {
                "scenario_text": scenario,
                "task_instructions": task,
                "practice_language": practice_language
            }
            
    except httpx.HTTPStatusError as e:
        error_preview = e.response.text[:200] if e.response.text else "No error details"
        print(f"OpenAI API error: {e.response.status_code} - {error_preview}")
        return None
    except Exception as e:
        print(f"Error generating scenario: {str(e)}")
        return None