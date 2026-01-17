"""Language support validation for ElevenLabs and other services."""

# Supported languages for ElevenLabs TTS
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish (Español)",
    "fr": "French (Français)",
    "de": "German (Deutsch)",
    "it": "Italian (Italiano)",
    "pt": "Portuguese (Português)",
    "pl": "Polish (Polski)",
    "tr": "Turkish (Türkçe)",
    "ru": "Russian (Русский)",
    "nl": "Dutch (Nederlands)",
    "sv": "Swedish (Svenska)",
    "ar": "Arabic (العربية)",
    "hi": "Hindi (हिन्दी)",
    "ko": "Korean (한국어)",
    "ja": "Japanese (日本語)",
    "zh": "Chinese (中文)",
    "id": "Indonesian (Bahasa Indonesia)",
    "fil": "Filipino",
    "uk": "Ukrainian (Українська)",
    "el": "Greek (Ελληνικά)",
    "cs": "Czech (Čeština)",
    "fi": "Finnish (Suomi)",
    "ro": "Romanian (Română)",
    "da": "Danish (Dansk)",
    "bg": "Bulgarian (Български)",
    "ms": "Malay (Bahasa Melayu)",
    "sk": "Slovak (Slovenčina)",
    "hr": "Croatian (Hrvatski)",
    "ta": "Tamil (தமிழ்)"
}


def is_language_supported(language_code: str) -> bool:
    """Check if a language is supported by ElevenLabs."""
    return language_code.lower() in SUPPORTED_LANGUAGES


def get_language_name(language_code: str) -> str:
    """Get the display name for a language code."""
    return SUPPORTED_LANGUAGES.get(language_code.lower(), "Unknown")


def get_all_supported_languages() -> dict:
    """Get all supported languages."""
    return SUPPORTED_LANGUAGES