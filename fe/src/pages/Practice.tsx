import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { saveSession } from "../data/mockSession"
import type { ChatMessage, SessionResult, FeedbackPoint } from "../data/mockSession"
import { generateCombinedResponse } from "../services/ai"

const TOPICS = [
  "Ordering Coffee ☕️",
  "Job Interview 💼",
  "Travel Directions 🗺️",
  "Casual Chat 👋"
]

// Add Web Speech API Type Definitions
interface Window {
  SpeechRecognition: any
  webkitSpeechRecognition: any
}

const Practice = () => {
  const navigate = useNavigate()
  
  // Load initial state from localStorage if available
  const getSavedSession = () => {
    try {
      const saved = localStorage.getItem("active_practice_session")
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      console.error("Failed to load session", e)
      return null
    }
  }

  const savedSession = getSavedSession()

  // "setup" = choosing topic, "chat" = active conversation
  const [phase, setPhase] = useState<"setup" | "chat">(savedSession?.phase || "setup")
  const [mode, setMode] = useState<"voice" | "text">(savedSession?.mode || "voice")
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking">("idle")
  
  const [textInput, setTextInput] = useState("")
  const [selectedTopic, setSelectedTopic] = useState(savedSession?.topic || "")
  const [conversation, setConversation] = useState<ChatMessage[]>(savedSession?.conversation || [])
  const [suggestion, setSuggestion] = useState<{ text: string, visible: boolean } | null>(null)
  
  // Store real accumulated feedback
  const [sessionFeedback, setSessionFeedback] = useState<FeedbackPoint[]>(savedSession?.sessionFeedback || [])

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Speech Recognition & Media Recorder Refs
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const transcriptRef = useRef("")

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false // Stop after one sentence/phrase
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle Audio Playback
  const toggleAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      // Stop
      audioRef.current?.pause()
      setPlayingAudioId(null)
    } else {
      // Start new
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      setPlayingAudioId(id)
      audio.play()
      audio.onended = () => setPlayingAudioId(null)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  // Persist session to localStorage
  useEffect(() => {
    if (phase === "chat") {
      localStorage.setItem("active_practice_session", JSON.stringify({
        phase,
        mode,
        topic: selectedTopic,
        conversation,
        sessionFeedback
      }))
    }
  }, [phase, mode, selectedTopic, conversation, sessionFeedback])

  const startSession = (topic: string) => {
    setSelectedTopic(topic)
    setPhase("chat")
    // Initial AI message
    setTimeout(() => {
      addMessage("ai", `Hi! Let's talk about ${topic}. How are you?`)
    }, 500)
  }

  const addMessage = (sender: "user" | "ai", text: string, audioUrl?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      audioUrl,
      timestamp: new Date().toISOString()
    }
    setConversation(prev => [...prev, newMessage])
  }

  // Helper to process User Input (Text or Voice Transcribed)
  const processUserInput = async (text: string, audioUrl?: string) => {
    const userMsgId = Date.now().toString()
    
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text,
      audioUrl,
      timestamp: new Date().toISOString()
    }
    
    // Update state functionally to ensure we have the latest
    setConversation(prev => [...prev, userMsg])
    
    // Status to speaking (waiting for AI)
    setStatus("speaking")

    // 2. Construct Context
    // We use the functional state updater's result concept, or just access 'conversation' + new msg
    // Since 'conversation' in closure might be stale, we trust the slice(-10) logic but append current txt
    const historyContext = conversation.slice(-10).map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
    })) as { role: "user" | "assistant", content: string }[]
    
    historyContext.push({ role: "user", content: text })

    // 3. One Single AI Call
    const aiResult = await generateCombinedResponse(text, selectedTopic, historyContext)

    if (aiResult) {
        let feedbackItem: FeedbackPoint | undefined

        // A) Process Feedback
        if (aiResult.improvements && aiResult.improvements.length > 0) {
            const bestTip = aiResult.improvements[0]
            setSuggestion({
                text: `Tip: ${bestTip.suggestion} (${bestTip.issue})`,
                visible: true
            })
            setTimeout(() => setSuggestion(null), 8000)

            // Create formatted feedback item
            feedbackItem = {
                type: bestTip.type as any,
                original: text, 
                improved: bestTip.suggestion,
                explanation: bestTip.issue
            }

            // Store global session feedback
            setSessionFeedback(prev => [...prev, feedbackItem!])
            
            // LINK FEEDBACK TO USER MESSAGE
            // We update the conversation to attach this feedback to the message we just sent
            setConversation(prev => prev.map(msg => 
                msg.id === userMsgId ? { ...msg, feedback: feedbackItem } : msg
            ))
        }

        // B) Add AI Reply
        if (aiResult.reply) {
            addMessage("ai", aiResult.reply)
        } else {
             addMessage("ai", "I heard you, but I didn't know what to say!")
        }

    } else {
        addMessage("ai", "Sorry, I lost my connection. Please try again.")
    }

    setStatus("idle")
  }

  const handleMicClick = async () => {
    if (!recognitionRef.current) {
        alert("Your browser does not support Speech Recognition. Try Chrome or Safari.")
        return
    }

    if (status === "idle") {
      try {
          // 1. Get Microphone Stream for Audio Recording
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          
          // 2. Setup MediaRecorder
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorderRef.current = mediaRecorder
          audioChunksRef.current = []
          
          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data)
              }
          }

          mediaRecorder.onstop = () => {
              // Create Audio Blob
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }) // Use audio/webm for browser compatibility
              const audioUrl = URL.createObjectURL(audioBlob)
              
              // Stop all tracks to release mic
              stream.getTracks().forEach(track => track.stop())
              
              // If we have a transcript, process it now
              if (transcriptRef.current.trim()) {
                  setStatus("processing")
                  processUserInput(transcriptRef.current, audioUrl)
              } else {
                  setStatus("idle")
              }
          }

          // 3. Setup Speech Recognition
          transcriptRef.current = "" // Reset transcript
          
          recognitionRef.current.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript
              console.log("Recognized:", transcript)
              transcriptRef.current = transcript
              // We DON'T call processUserInput here manually anymore. 
              // We wait for MediaRecorder.onstop to fire to ensure we have the audio.
          }

          recognitionRef.current.onerror = (event: any) => {
              console.error("Speech Error", event.error)
              // If error, likely no transcript or partial. 
              // We'll let onend handle the stop logic.
          }

          recognitionRef.current.onend = () => {
              // Speech ended (silence or stop).
              // Ensure MediaRecorder also stops if it's running
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                  mediaRecorderRef.current.stop()
              }
              // Reset recording flag
              isRecordingRef.current = false
          }

          // 4. Start Both
          setStatus("recording")
          isRecordingRef.current = true
          mediaRecorder.start()
          recognitionRef.current.start()

      } catch (err) {
          console.error("Microphone Access Error:", err)
          alert("Could not access microphone. Please allow permissions.")
          setStatus("idle")
      }

    } else if (status === "recording") {
      // User tapped Stop manually.
      // 1. Stop Speech (triggers onend)
      recognitionRef.current.stop()
      // 2. Stop Recorder (will be triggered by speech.onend, but we can double tap safely)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop()
      }
    }
  }

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!textInput.trim()) return

    const txt = textInput
    setTextInput("") // clear input immediately
    processUserInput(txt)
  }

  const endSession = () => {
    // Save Real Session Data
    const newSession: SessionResult = {
        id: "session_" + Date.now(),
        date: new Date().toISOString(),
        inputType: mode,
        topic: selectedTopic,
        transcript: conversation.map(m => `${m.sender}: ${m.text}`).join("\n"),
        conversation: conversation,
        scores: {
            clarity: 80, // detailed scoring would require more AI logic
            grammar: Math.max(100 - (sessionFeedback.length * 10), 50), // simple calc based on feedback count
            vocabulary: 75
        },
        feedback: sessionFeedback
    }

    saveSession(newSession)
    
    // Clear the active session persistence
    localStorage.removeItem("active_practice_session")
    
    navigate("/feedback")
  }

  // --- SETUP PHASE ---
  if (phase === "setup") {
    // Pride Colors Configuration
    const TOPIC_STYLES = [
        "border-red-200 bg-red-50 hover:bg-red-100/80 text-red-700",       // 1. Red
        "border-orange-200 bg-orange-50 hover:bg-orange-100/80 text-orange-700", // 2. Orange
        "border-yellow-300 bg-yellow-50 hover:bg-yellow-100/80 text-yellow-700", // 3. Yellow
        "border-green-200 bg-green-50 hover:bg-green-100/80 text-green-700"     // 4. Green
    ]

    return (
      <div className="min-h-[80vh] w-full bg-transparent flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Pick a Topic</h1>
            <p className="text-gray-500">What do you want to practice today?</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             {TOPICS.map((topic, index) => {
               const style = TOPIC_STYLES[index % TOPIC_STYLES.length]
               return (
                 <button
                   key={topic}
                   onClick={() => startSession(topic)}
                   className={`p-4 rounded-xl border-2 text-left transition-all group flex items-center justify-between shadow-sm hover:scale-[1.02] ${style}`}
                 >
                   <span className="font-bold">{topic}</span>
                   <span className="opacity-60">→</span>
                 </button>
               )
             })}
             <button
                 onClick={() => startSession("Freestyle")}
                 className="p-4 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 text-center text-purple-600 font-medium transition-all"
             >
                 Just Chat (Freestyle) 
             </button>
          </div>
        </div>
      </div>
    )
  }

  // --- CHAT PHASE ---
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl my-4 overflow-hidden border border-white/50">
      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10 sticky top-0">
        <div>
          <h2 className="font-bold text-gray-800">{selectedTopic}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">AI Online</span>
          </div>
        </div>
        <button 
          onClick={endSession}
          className="text-xs font-bold text-red-400 hover:text-red-500 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-[slideUp_0.3s_ease-out]`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.sender === 'user' 
                ? 'bg-mintDark text-white rounded-br-none shadow-lg shadow-mint/20' 
                : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
            }`}>
              {msg.audioUrl && (
                 <div className="flex items-center gap-3 mb-2 bg-black/10 rounded-lg p-2 pr-4 min-w-[140px]">
                    <button 
                        type="button"
                        onClick={() => toggleAudio(msg.id, msg.audioUrl!)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-mintDark shadow-sm hover:scale-105 transition-transform shrink-0"
                    >
                        {playingAudioId === msg.id ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                        <div className="h-1 bg-white/30 rounded-full w-full overflow-hidden">
                             {playingAudioId === msg.id && (
                                 <div className="h-full bg-white/80 animate-[progress_3s_linear_infinite]" />
                             )}
                        </div>
                        <span className="text-[10px] font-mono opacity-80 flex justify-between">
                            <span>{playingAudioId === msg.id ? "Playing..." : "Voice Msg"}</span>
                            <span>0:03</span>
                        </span>
                    </div>
                 </div>
              )}
              <p className="leading-relaxed">{msg.text}</p>
              
              {/* Show Feedback Note if linked */}
              {msg.feedback && (
                  <div className="mt-2 text-xs bg-white/10 p-2 rounded-lg border border-white/20">
                      <span className="font-bold text-yellow-300">Tip:</span> {msg.feedback.improved}
                  </div>
              )}
              
            </div>
          </div>
        ))}
        {status === "speaking" && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-gray-100 text-gray-400 rounded-2xl p-3 px-4 rounded-bl-none">
               AI is typing...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Real-time Suggestion Popup */}
        {suggestion && suggestion.visible && (
            <div className="fixed bottom-24 right-4 z-50 max-w-[250px] animate-[slideUp_0.3s_ease-out]">
                <div className="bg-white border-l-4 border-mintDark shadow-lg rounded-r-lg p-4 relative">
                    <button 
                        onClick={() => setSuggestion(null)}
                        className="absolute top-1 right-1 text-gray-300 hover:text-gray-500"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-start gap-3">
                        <div className="bg-mintBg p-1.5 rounded-full mt-0.5">
                            <svg className="w-4 h-4 text-mintDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Instant Tip</p>
                            <p className="text-sm text-gray-800 leading-snug font-medium">
                                {suggestion.text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100 pb-8">
        {/* Toggle Mode */}
        <div className="flex justify-center mb-4">
           <div className="flex bg-gray-100 rounded-full p-1">
             <button onClick={() => setMode("voice")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'voice' ? 'bg-white shadow-sm text-mintDark' : 'text-gray-400'}`}>Voice</button>
             <button onClick={() => setMode("text")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'text' ? 'bg-white shadow-sm text-mintDark' : 'text-gray-400'}`}>Text</button>
           </div>
        </div>

        {mode === "voice" ? (
          <div className="flex justify-center items-center h-20">
             <button
              onClick={handleMicClick}
              disabled={status === "processing" || status === "speaking"}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
                ${status === "recording" ? "bg-red-500 scale-110 shadow-lg shadow-red-500/30" : "bg-mintDark shadow-lg shadow-mint/30 hover:scale-105"}
                ${(status === "processing" || status === "speaking") ? "bg-gray-200 cursor-not-allowed opacity-50" : ""}
              `}
            >
              {status === "recording" ? (
                 <div className="w-6 h-6 bg-white rounded-md animate-pulse" />
              ) : (
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
              )}
            </button>
            <p className="absolute bottom-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
               {status === "recording" ? "Tap to stop" : "Tap to speak"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input 
               type="text" 
               value={textInput}
               onChange={e => setTextInput(e.target.value)}
               placeholder="Type a message..."
               className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-all"
               autoFocus
            />
            <button 
              type="submit" 
              disabled={!textInput.trim() || status === "speaking"}
              className="w-12 h-12 bg-mintDark rounded-full flex items-center justify-center text-white shadow-md hover:bg-mintText disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
               <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
               </svg>
            </button>
          </form>
        )}
      </div>
      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default Practice
