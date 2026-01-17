"""Routes for intent recognition and confirmation."""
from fastapi import APIRouter, HTTPException
from ..models import IntentRequest, IntentResponse, IntentConfirmRequest, IntentConfirmResponse
from be.services.tts_service import text_to_speech

router = APIRouter(prefix="/api/intent", tags=["intent"])


@router.post("/recognize", response_model=IntentResponse)
async def recognize_intent(request: IntentRequest):
    """
    Receive recognized text from frontend.
    Returns the text back with optional ElevenLabs TTS audio.
    """
    audio_url = None
    
    if request.generate_audio:
        # Generate TTS audio saying "You said: [text]"
        tts_text = f"You said: {request.text}"
        audio_url = await text_to_speech(tts_text)
    
    return IntentResponse(
        text=request.text,
        audio_url=audio_url
    )


@router.post("/confirm", response_model=IntentConfirmResponse)
async def confirm_intent(request: IntentConfirmRequest):
    """
    Confirm topic intent.
    """
    status = "confirmed" if request.confirmed else "cancelled"
    
    return IntentConfirmResponse(
        message=f"Intent {status}",
        topic=request.topic,
        confirmed=request.confirmed
    )
