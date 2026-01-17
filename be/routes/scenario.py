"""Routes for AI-generated practice scenarios."""
from fastapi import APIRouter, HTTPException
from ..models import ScenarioRequest, ScenarioResponse
from be.services.scenario_service import generate_scenario
from be.services.tts_service import text_to_speech
from be.services.language_service import is_language_supported

router = APIRouter(prefix="/api/scenario", tags=["scenario"])


@router.post("/generate", response_model=ScenarioResponse)
async def create_scenario(request: ScenarioRequest):
    """
    Generate a random practice scenario based on user input.
    Uses OpenAI to create scenario and ElevenLabs to speak it.
    """
    # Validate languages
    if not is_language_supported(request.practice_language):
        raise HTTPException(
            status_code=400,
            detail=f"Sorry, we currently don't support '{request.practice_language}' as a practice language."
        )
    
    if not is_language_supported(request.native_language):
        raise HTTPException(
            status_code=400,
            detail=f"Sorry, we currently don't support '{request.native_language}' as a native language."
        )
    
    # Generate scenario with OpenAI
    scenario_data = await generate_scenario(
        request.user_input,
        request.practice_language,
        request.native_language
    )
    
    if not scenario_data:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate scenario. Please try again."
        )
    
    audio_url = None
    if request.generate_audio:
        # Generate TTS for the scenario in the practice language
        audio_url = await text_to_speech(
            scenario_data["scenario_text"],
            language=request.practice_language
        )
    
    return ScenarioResponse(
        scenario_text=scenario_data["scenario_text"],
        task_instructions=scenario_data["task_instructions"],
        practice_language=scenario_data["practice_language"],
        audio_url=audio_url
    )