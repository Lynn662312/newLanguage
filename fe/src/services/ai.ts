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
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            console.error("Missing VITE_OPENAI_API_KEY");
            return null;
        }

        const formData = new FormData()
        formData.append("file", audioBlob, "recording.webm")
        formData.append("model", "whisper-1")

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            body: formData
        })

        if (!response.ok) {
            console.error("OpenAI Transcribe Error:", response.statusText)
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
    nativeLanguage: string = "English",
    secondLanguage: string = "English"
): Promise<AICombinedResponse | null> => {
    try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) return null;

        // 1. Construct Prompt for Analysis AND Reply
        const systemPrompt = `You are a helpful language coach. The user is practicing '${secondLanguage}'. 
        
CRITICAL LANGUAGE RULES - FOLLOW STRICTLY:
1. The user's input is in '${secondLanguage}' (the language they are learning)
2. Your reply MUST ALWAYS be in '${secondLanguage}' - NEVER EVER use '${nativeLanguage}' in the "reply" field
3. Error explanations in "explanation" field should be in '${nativeLanguage}'
4. Even if previous messages contain '${nativeLanguage}', you MUST reply in '${secondLanguage}'
5. Do NOT follow the language pattern from conversation history - ALWAYS use '${secondLanguage}' for replies

Example (if secondLanguage=English, nativeLanguage=Bahasa Melayu):
- User says in English: "I go to market yesterday"
- You reply in English: "That sounds nice! What did you buy at the market?"
- Explanation in Bahasa Melayu: "Gunakan 'went' bukan 'go' untuk past tense"

Tasks:
1. Provide an improved version of what the user said (in '${secondLanguage}')
2. List grammar/vocabulary errors with explanations in '${nativeLanguage}'
3. Reply conversationally in '${secondLanguage}' as if chatting about '${topic}'
        Respond in this JSON format:
        {
            "improved_text": "Corrected version in ${secondLanguage}",
            "errors": [{ "original": "str", "corrected": "str in ${secondLanguage}", "explanation": "str in ${nativeLanguage}" }],
            "reply": "Conversational response in ${secondLanguage} ONLY"
        }；
        
    ABSOLUTE REQUIREMENT: The "reply" field MUST be in '${secondLanguage}'. If you use '${nativeLanguage}' in the reply, you have FAILED.`
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: transcript }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // or gpt-3.5-turbo
                messages: messages,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error("OpenAI Chat Error:", response.statusText);
            return null;
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // 2. Generate Audio for Reply
        let audioUrl = null;
        if (content.reply) {
            audioUrl = await speakText(content.reply);
        }

        return {
            summary: "Conversation",
            what_user_said: transcript,
            improvements: (content.errors || []).map((e: any) => ({
                type: "grammar",
                issue: e.explanation,
                suggestion: e.corrected
            })),
            better_example: content.improved_text,
            encouragement: "Good job!",
            reply: content.reply,
            audioUrl: audioUrl
        }

    } catch (error) {
        console.error("generateCombinedResponse Exception:", error)
        return null
    }
}

export interface ScenarioResponse {
    scenario_text: string
    task_instructions: string
    practice_language: string
    audio_url?: string | null
}

export const generateScenario = async (
    userInput: string,
    practiceLanguage: string = "English",
    nativeLanguage: string = "English"
): Promise<ScenarioResponse | null> => {
    try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) return null;

        const systemPrompt = `Generate a practice scenario for a language learner.
        Target Language: ${practiceLanguage}
        Instruction Language: ${nativeLanguage}
        User Topic: ${userInput}
        
        Respond in JSON:
        {
            "scenario_text": "Description of situation in ${practiceLanguage}",
            "task_instructions": "What to do in ${nativeLanguage}"
        }`

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "system", content: systemPrompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // Generate Audio
        const audioUrl = await speakText(content.scenario_text);

        return {
            scenario_text: content.scenario_text,
            task_instructions: content.task_instructions,
            practice_language: practiceLanguage,
            audio_url: audioUrl
        }
    } catch (error) {
        console.error("generateScenario Exception:", error)
        return null
    }
}
