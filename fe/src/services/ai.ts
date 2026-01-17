import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// We no longer use VITE_OPENAI_API_KEY or ELEVENLABS_KEY here directly.
// All calls go to the backend.

export const speakText = async (text: string): Promise<string | null> => {
    try {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        if (!apiKey) {
            console.error("Missing VITE_ELEVENLABS_API_KEY");
            return null;
        }

        const client = new ElevenLabsClient({ apiKey });
        const audioStream = await client.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
            text,
            modelId: "eleven_multilingual_v2",
            outputFormat: "mp3_44100_128",
        });

        // Convert the stream to a Blob
        const chunks: BlobPart[] = [];
        // @ts-ignore: The SDK returns a readable stream that is async iterable in Node/modern browsers
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }

        const blob = new Blob(chunks, { type: "audio/mpeg" });
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("speakText Exception:", error)
        return null
    }
}

export const transcribeAudioClient = async (audioBlob: Blob): Promise<string | null> => {
    try {
        const formData = new FormData()
        formData.append("file", audioBlob, "recording.webm")

        const response = await fetch("/api/practice/transcribe", {
            method: "POST",
            body: formData
        })

        if (!response.ok) {
            console.error("Backend Transcribe Error:", response.statusText)
            return null
        }

        const data = await response.json()
        return data.text
    } catch (error) {
        console.error("transcribeAudioClient Exception:", error)
        return null
    }
}

export interface AIFeedbackResponse {
    summary: string
    what_user_said: string
    improvements: {
        type: "grammar" | "vocabulary" | "pronunciation" | "fluency"
        issue: string
        suggestion: string
    }[]
    better_example: string
    encouragement: string
}

// Combined Interface
export interface AICombinedResponse extends AIFeedbackResponse {
    reply: string
    audioUrl?: string | null
}

export const generateCombinedResponse = async (
    transcript: string,
    topic: string,
    history: { role: "user" | "assistant", content: string }[],
    nativeLanguage?: string,
    secondLanguage?: string
): Promise<AICombinedResponse | null> => {
    try {
        // Backend expects ChatRequest: 
        // { message, history, topic, native_language, practice_language }

        const payload = {
            message: transcript,
            history: history, // Pydantic expects {role, content}, which matches our history type
            topic: topic,
            native_language: nativeLanguage || "English",
            practice_language: secondLanguage || "English"
        }

        const response = await fetch("/api/practice/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            console.error("Backend Chat Error:", response.statusText)
            return null
        }

        const data = await response.json()

        // Backend returns: { reply, audio_url, feedback: { summary, improvements... } }
        const feedback = data.feedback || {}

        return {
            summary: feedback.summary || "Conversation",
            what_user_said: feedback.what_user_said || transcript,
            improvements: feedback.improvements || [],
            better_example: feedback.better_example || "",
            encouragement: feedback.encouragement || "",
            reply: data.reply,
            audioUrl: data.audio_url
        }

    } catch (error) {
        console.error("generateCombinedResponse Exception:", error)
        return null
    }
}
