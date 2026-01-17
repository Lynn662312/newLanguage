"""Routes for intent recognition and confirmation."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from ..models import IntentRequest, IntentResponse, IntentConfirmRequest, IntentConfirmResponse, AudioTranscribeResponse
from be.services.tts_service import text_to_speech
from be.services.stt_service import speech_to_text
# from be.services.auth_service import verify_token
# from ..storage import get_user_by_id
# from be.routes.auth import get_current_user

router = APIRouter(prefix="/api/intent", tags=["intent"])


@router.post("/transcribe", response_model=AudioTranscribeResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form("en"),
):
    """
    Transcribe audio to text using ElevenLabs STT.
    """
    # Get user to determine practice language if not provided
    # user = get_user_by_id(user_id)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
    
    # Use practice language if language not provided
    target_language = language 
    
    # Read audio file
    audio_data = await audio.read()
    
    # Transcribe using ElevenLabs STT
    transcript = await speech_to_text(audio_data, target_language)
    
    if not transcript:
        raise HTTPException(status_code=500, detail="Failed to transcribe audio. Please try again.")
    
    return AudioTranscribeResponse(
        text=transcript,
        language=target_language
    )


@router.post("/recognize", response_model=IntentResponse)
async def recognize_intent(request: IntentRequest):
    """
    Receive recognized text from frontend (or transcribe from audio).
    Returns the text back with optional ElevenLabs TTS audio in practice language.
    """
    # Get user for language preferences
    # user = get_user_by_id(user_id)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
    
    # If audio provided, transcribe it first
    text = request.text
    if not text and request.audio_file:
        # Decode base64 audio if needed
        import base64
        try:
            audio_data = base64.b64decode(request.audio_file)
            text = await speech_to_text(audio_data, request.practice_language)
            if not text:
                raise HTTPException(status_code=500, detail="Failed to transcribe audio")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid audio data: {str(e)}")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text or audio required")
    
    audio_url = None
    if request.generate_audio:
        # Generate TTS audio in practice language saying "You said: [text]"
        # Translate the prompt to practice language or keep it simple
        tts_text = f"You said: {text}"
        audio_url = await text_to_speech(tts_text)
    
    return IntentResponse(
        text=text,
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
