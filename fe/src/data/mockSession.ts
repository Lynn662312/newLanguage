export interface FeedbackPoint {
    type: "grammar" | "vocabulary" | "tone"
    original: string
    improved: string
    explanation: string
}

export interface SessionScores {
    clarity: number
    grammar: number
    vocabulary: number
}

// Conversation stored for the session
export interface ChatMessage {
    id: string
    sender: "user" | "ai"
    text: string
    audioUrl?: string
    timestamp: string
}

export interface SessionResult {
    id: string
    date: string
    inputType: "voice" | "text" // Predominant or initial mode
    topic?: string
    transcript: string // Full transcript or summary
    conversation: ChatMessage[] // Full history
    scores: SessionScores
    feedback: FeedbackPoint[]
}

// Mock Data
export const MOCK_SESSION_VOICE: SessionResult = {
    id: "session_123",
    date: new Date().toISOString(),
    inputType: "voice",
    topic: "Travel",
    transcript: "Full conversation summary...",
    conversation: [
        { id: "1", sender: "ai", text: "Hello! Where would you like to travel today?", timestamp: new Date().toISOString() },
        { id: "2", sender: "user", text: "I want to go to the station for buy ticket to London. Is valid for today?", audioUrl: "mock.mp3", timestamp: new Date().toISOString() },
        { id: "3", sender: "ai", text: "I see. You can buy a ticket at the counter. When do you want to leave?", timestamp: new Date().toISOString() }
    ],
    scores: {
        clarity: 85,
        grammar: 60,
        vocabulary: 50
    },
    feedback: [
        {
            type: "vocabulary",
            original: "want to",
            improved: "would like to",
            explanation: "Use 'would like' for politeness in service interactions."
        },
        {
            type: "grammar",
            original: "for buy",
            improved: "to buy",
            explanation: "'To buy' creates purpose; 'for buy' is incorrect grammar."
        }
    ]
}

export const MOCK_SESSION_TEXT: SessionResult = {
    id: "session_124",
    date: new Date().toISOString(),
    inputType: "text",
    topic: "Ordering Food",
    transcript: "Chat summary...",
    conversation: [
        { id: "1", sender: "ai", text: "Hi there! What can I get for you?", timestamp: new Date().toISOString() },
        { id: "2", sender: "user", text: "Can I have a water?", timestamp: new Date().toISOString() },
        { id: "3", sender: "ai", text: "Sure, sparkling or still?", timestamp: new Date().toISOString() }
    ],
    scores: {
        clarity: 100,
        grammar: 90,
        vocabulary: 70
    },
    feedback: [
        {
            type: "tone",
            original: "Can I have",
            improved: "May I have",
            explanation: "'May I' is more formal and polite for ordering."
        }
    ]
}

export const saveSession = (data: SessionResult) => {
    // Save as last session for immediate feedback view
    localStorage.setItem("last_session", JSON.stringify(data))

    // Also append to history
    const history = getAllSessions()
    // Avoid duplicates if saving same session multiple times (simple check by ID)
    if (!history.find(s => s.id === data.id)) {
        const newHistory = [data, ...history]
        localStorage.setItem("all_sessions", JSON.stringify(newHistory))
    }
}

export const getLastSession = (): SessionResult | null => {
    const data = localStorage.getItem("last_session")
    return data ? JSON.parse(data) : null
}

export const getAllSessions = (): SessionResult[] => {
    const data = localStorage.getItem("all_sessions")
    return data ? JSON.parse(data) : []
}
