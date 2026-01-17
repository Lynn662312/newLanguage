import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { saveSession, MOCK_SESSION_VOICE, MOCK_SESSION_TEXT } from "../data/mockSession"
import type { ChatMessage } from "../data/mockSession"

const TOPICS = [
  "Ordering Coffee ☕️",
  "Job Interview 💼",
  "Travel Directions 🗺️",
  "Casual Chat 👋"
]

const Practice = () => {
  const navigate = useNavigate()
  // "setup" = choosing topic, "chat" = active conversation
  const [phase, setPhase] = useState<"setup" | "chat">("setup")
  const [mode, setMode] = useState<"voice" | "text">("voice")
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking">("idle")
  
  const [textInput, setTextInput] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [conversation, setConversation] = useState<ChatMessage[]>([])
  const [suggestion, setSuggestion] = useState<{ text: string, visible: boolean } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

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

  const handleMicClick = () => {
    if (status === "idle") {
      setStatus("recording")
    } else if (status === "recording") {
      setStatus("processing")
      // Simulate processing
      setTimeout(() => {
        // User Message
        addMessage("user", "Microphone simulation text (I want to go to London)", "mock.mp3")
        setStatus("idle")
        
        // Simulating Real-time Tip
        setSuggestion({
            text: "Tip: Try saying 'I would like to go' for more politeness.",
            visible: true
        })
        // Auto-hide suggestion after 5s
        setTimeout(() => setSuggestion(null), 5000)
        
        // AI Reply simulation
        setStatus("speaking")
        setTimeout(() => {
          addMessage("ai", "That sounds exciting! London is great. When are you planning to go?")
          setStatus("idle")
        }, 1500)
        
      }, 1500)
    }
  }

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!textInput.trim()) return

    const txt = textInput
    setTextInput("") // clear input immediately
    addMessage("user", txt)

    // Simulating Real-time Tip for Text
    if (txt.toLowerCase().includes("want")) {
         setSuggestion({
            text: "Better: 'I would like' is more formal than 'I want'.",
            visible: true
        })
        setTimeout(() => setSuggestion(null), 5000)
    }
    
    // AI Reply simulation
    setStatus("speaking")
    setTimeout(() => {
      addMessage("ai", "Interesting point! Tell me more about that.")
      setStatus("idle")
    }, 1500)
  }

  const endSession = () => {
    // Save correct mock based on dominant mode/random
    const mockToSave = mode === 'voice' ? MOCK_SESSION_VOICE : MOCK_SESSION_TEXT
    saveSession({
      ...mockToSave,
      topic: selectedTopic,
      conversation: conversation // Save the actual chat
    })
    navigate("/feedback")
  }

  // --- SETUP PHASE ---
  if (phase === "setup") {
    return (
      <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center p-6 pt-12">
        <div className="w-full max-w-md space-y-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-mintText">Pick a Topic</h1>
            <p className="text-gray-500">What do you want to practice today?</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             {TOPICS.map(topic => (
               <button
                 key={topic}
                 onClick={() => startSession(topic)}
                 className="p-4 rounded-xl border-2 border-gray-100 hover:border-mint hover:bg-mintBg/20 text-left transition-all group flex items-center justify-between"
               >
                 <span className="font-medium text-gray-700 group-hover:text-mintText">{topic}</span>
                 <span className="text-gray-300 group-hover:text-mint">→</span>
               </button>
             ))}
             <button
                 onClick={() => startSession("Freestyle")}
                 className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-mint hover:bg-mintBg/10 text-center text-gray-500 hover:text-mintText font-medium transition-all"
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
    <div className="fixed inset-0 bg-transparent flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm border-b border-gray-100 flex items-center justify-between z-10">
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
                 <div className="flex items-center gap-2 mb-2 bg-black/10 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-mono opacity-80">Voice Msg</span>
                 </div>
              )}
              <p className="leading-relaxed">{msg.text}</p>
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
    </div>
  )
}

export default Practice
