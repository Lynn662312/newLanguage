import OpenAI from "openai"
import { AI_COACH_SYSTEM_PROMPT } from "../data/prompts"

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

let openai: OpenAI | null = null

if (API_KEY) {
    openai = new OpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
    })
} else {
    console.warn("Missing VITE_OPENAI_API_KEY. AI features will not work.")
}

export const transcribeAudioClient = async (audioBlob: Blob): Promise<string | null> => {
    if (!openai) return null
    try {
        // Convert Blob to File (Whisper needs a filename)
        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" })
        const response = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
        })
        return response.text
    } catch (error) {
        console.error("Client-side Transcription Error:", error)
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

export const generateFeedback = async (transcript: string, topic?: string): Promise<AIFeedbackResponse | null> => {
    if (!openai) {
        console.error("OpenAI API not initialized")
        return null
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using a fast, cost-effective model
            messages: [
                { role: "system", content: AI_COACH_SYSTEM_PROMPT },
                { role: "user", content: `Topic: ${topic || "General Conversation"}\nTranscript: "${transcript}"` }
            ],
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0].message.content
        if (!content) return null

        return JSON.parse(content) as AIFeedbackResponse

    } catch (error) {
        console.error("AI Generation Error:", error)
        return null
    }
}

export const generateReply = async (history: { role: "user" | "assistant", content: string }[]): Promise<string | null> => {
    if (!openai) return null

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful, friendly conversation partner for a language learner. Keep responses short (1-2 sentences), simple, and engaging. Ask a follow-up question to keep the chat going." },
                ...history
            ]
        })

        return completion.choices[0].message.content
    } catch (error) {
        console.error("AI Reply Error:", error)
        return null
    }
}
// Combined Interface
export interface AICombinedResponse extends AIFeedbackResponse {
    reply: string
}

export const generateCombinedResponse = async (
    transcript: string,
    topic: string,
    history: { role: "user" | "assistant", content: string }[]
): Promise<AICombinedResponse | null> => {
    if (!openai) return null

    try {
        // We inject the history into the prompt or simply append it.
        // To keep it simple and effective with strict JSON, we'll verify the system prompt includes instruction for "reply".

        // Let's modify the system prompt dynamically or assume the user wants us to extend the existing prompt.
        // We'll append the "reply" instruction to the existing prompt string for this call.
        const COMBINED_PROMPT = AI_COACH_SYSTEM_PROMPT.replace(
            `  "encouragement": "One short, kind sentence to motivate the user"\n}`,
            `  "encouragement": "One short, kind sentence to motivate the user",\n  "reply": "A helpful, friendly conversational response (1-2 sentences) to the user's message. Ask a follow-up question."\n}`
        )

        const messages: any[] = [
            { role: "system", content: COMBINED_PROMPT },
            // Add previous context so the "reply" makes sense
            ...history,
            // The current active message to analyze
            { role: "user", content: `Topic: ${topic || "General Conversation"}\nTranscript/Message: "${transcript}"` }
        ]

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0].message.content
        if (!content) return null

        return JSON.parse(content) as AICombinedResponse

    } catch (error) {
        console.error("AI Combined Error:", error)
        return null
    }
}
