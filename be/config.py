"""Configuration settings for the application."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Storage
BASE_DIR = Path(__file__).parent
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(exist_ok=True)
NOTES_FILE = STORAGE_DIR / "notes.json"
AUDIO_DIR = BASE_DIR / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
PROJECT_ROOT = BASE_DIR.parent

env_path = BASE_DIR / '.env'
print(f"[Config] Loading environment from: {env_path}")
print(f"[Config] .env exists: {env_path.exists()}")
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    print(f"[Config] WARNING: .env file not found at {env_path}")
    print(f"[Config] Please create .env file in the be/ directory")

# API Keys
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Debug output
print(f"[Config] ELEVENLABS_API_KEY loaded: {'Yes' if ELEVENLABS_API_KEY else 'No'}")
print(f"[Config] ELEVENLABS_API_KEY length: {len(ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else 0}")
print(f"[Config] OPENAI_API_KEY loaded: {'Yes' if OPENAI_API_KEY else 'No'}")

# ElevenLabs Configuration
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")  
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
print(f"[Config] ELEVENLABS_VOICE_ID: {ELEVENLABS_VOICE_ID}")

# OpenAI Configuration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
OPENAI_BASE_URL = "https://api.openai.com/v1"


