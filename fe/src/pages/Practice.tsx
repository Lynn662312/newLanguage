import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { saveSession } from "../data/mockSession"
import type { ChatMessage, SessionResult, FeedbackPoint } from "../data/mockSession"
import { generateCombinedResponse, transcribeAudioClient, speakText } from "../services/ai"
import TalkingAvatar from "../components/TalkingAvatar"

// ... existing imports ...

// ... inside the component ...


const TOPICS = [
  "Ordering Coffee ☕️",
  "Job Interview 💼",
  "Travel Directions 🗺️",
  "Casual Chat 👋"
]

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Hindi",
  "Dutch",
  "Greek",
  "Turkish",
  "Polish",
  "Swedish",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "Filipino (Tagalog)"
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

  // "language-setup" = choosing langs, "setup" = choosing topic, "chat" = active conversation
  const [phase, setPhase] = useState<"setup" | "language-setup" | "chat">(savedSession?.phase || "language-setup")
  const [mode, setMode] = useState<"voice" | "text">(savedSession?.mode || "voice")
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking" | "initializing">("idle")
  
  const [textInput, setTextInput] = useState("")
  const [selectedTopic, setSelectedTopic] = useState(savedSession?.topic || "")
  const [nativeLanguage, setNativeLanguage] = useState(savedSession?.nativeLanguage || "")
  const [secondLanguage, setSecondLanguage] = useState(savedSession?.secondLanguage || "")
  const [conversation, setConversation] = useState<ChatMessage[]>(savedSession?.conversation || [])

  // Speech for phase changes
  useEffect(() => {
     let prompt = "";
     if (phase === 'language-setup') {
         prompt = "Welcome. Please select your native and practice languages.";
     } else if (phase === 'setup') {
         prompt = "Great. Now, what topic would you like to discuss today?";
     }

     if (prompt) {
         speakText(prompt).then(url => {
             if (url) {
                 const audio = new Audio(url);
                 if (audioRef.current) {
                     audioRef.current.pause(); 
                     window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
                 }
                 audioRef.current = audio;
                 
                 audio.onended = () => {
                     window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
                 }

                 window.dispatchEvent(new CustomEvent('newLanguage-tts-start'))
                 audio.play().catch(e => {
                     console.error("Auto-play blocked", e)
                     window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
                 });
             }
         });
     }
  }, [phase]);

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
  const accumulatedTranscriptRef = useRef("")

  // Audio Analysis Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true // Changed to true for longer recording
      recognitionRef.current.interimResults = true // Enable interim results for smoother updates
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
      window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
    } else {
      // Start new
      if (audioRef.current) {
        audioRef.current.pause()
        window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
      }
      const audio = new Audio(url)
      audioRef.current = audio
      setPlayingAudioId(id)

      audio.onended = () => {
          setPlayingAudioId(null)
          window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
      }
      
      window.dispatchEvent(new CustomEvent('newLanguage-tts-start'))
      audio.play()
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

  const confirmLanguageSelection = () => {
    if (!nativeLanguage || !secondLanguage) {
        alert("Please select both languages to continue.")
        return
    }
    setPhase("setup")
  }

  const startSession = (topic: string) => {
    setSelectedTopic(topic)
    setPhase("chat")
    
    // Initial AI message
    setTimeout(async () => {
      const text = `Hi! Let's talk about ${topic}. How are you?`
      const audioUrl = await speakText(text)
      const msgId = addMessage("ai", text, audioUrl || undefined)
      if (audioUrl) {
          console.log("Auto-playing welcome message:", audioUrl)
          toggleAudio(msgId, audioUrl)
      }
    }, 500)
  }

  const addMessage = (sender: "user" | "ai", text: string, audioUrl?: string): string => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      audioUrl,
      timestamp: new Date().toISOString()
    }
    setConversation(prev => [...prev, newMessage])
    return newMessage.id
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
    const aiResult = await generateCombinedResponse(
        text, 
        selectedTopic, 
        historyContext,
        nativeLanguage,
        secondLanguage
    )

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
            const aiMsgId = addMessage("ai", aiResult.reply, aiResult.audioUrl || undefined)
            if (aiResult.audioUrl) {
                toggleAudio(aiMsgId, aiResult.audioUrl)
            }
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

    if (status === "initializing") return

    if (status === "idle") {
      setStatus("initializing")
      try {
          // 1. Get Microphone Stream for Audio Recording
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          
          // --- Audio Analysis Setup ---
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          }
          const ctx = audioContextRef.current
          if (ctx.state === 'suspended') {
              await ctx.resume()
          }
          
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 256
          const source = ctx.createMediaStreamSource(stream)
          source.connect(analyser)
          
          analyserRef.current = analyser
          sourceRef.current = source
          
          const updateVolume = () => {
              if (!isRecordingRef.current) return
              const dataArray = new Uint8Array(analyser.frequencyBinCount)
              analyser.getByteFrequencyData(dataArray)
              
              const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length
              // Normalize (0-255) -> 0.0 to ~1.0 + boost
              const normalized = Math.min(average / 50, 0.6) // More sensitive visual
              setAudioLevel(normalized)
              
              animationFrameRef.current = requestAnimationFrame(updateVolume)
          }
          // ----------------------------
          
          // 2. Setup MediaRecorder
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorderRef.current = mediaRecorder
          audioChunksRef.current = []
          
          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data)
              }
          }

          mediaRecorder.onstop = async () => {
              // Create Audio Blob
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
              const audioUrl = URL.createObjectURL(audioBlob)
              
              console.log("Recorded Blob Size:", audioBlob.size, "Type:", audioBlob.type)

              // Check for silence/empty recording (Threshold lowered to allow short words)
              // "more sensitive to listen" - lowered from 1000 to 100
              if (audioBlob.size < 100) {
                  console.warn("Audio file is too small (Silence detected). Size:", audioBlob.size)
                  addMessage("ai", "I didn't hear anything! Try holding the button longer.")
                  setStatus("idle")
                  return
              }
              
              // Stop all tracks to release mic
              stream.getTracks().forEach(track => track.stop())
              
              // Cleanup Audio Analysis
              if (animationFrameRef.current) {
                  cancelAnimationFrame(animationFrameRef.current)
                  animationFrameRef.current = null
              }
              if (sourceRef.current) {
                  sourceRef.current.disconnect()
                  sourceRef.current = null
              }
              setAudioLevel(0)
              
              setStatus("processing")

              try {
                  console.log("Sending audio to OpenAI (Client-side)...")
                  
                  // 1. Transcribe (Client-Side)
                  const transcript = await transcribeAudioClient(audioBlob)
                  console.log("Whisper Transcript:", transcript)

                  // 2. Process whatever OpenAI returns
                  if (transcript && transcript.trim()) {
                       await processUserInput(transcript, audioUrl) 
                  } else {
                       console.warn("Empty transcript from OpenAI")
                       setStatus("idle")
                  }
                  
              } catch (error) {
                  console.error("Voice Processing Error:", error)
                  addMessage("ai", "Sorry, I couldn't process your audio. Please try again.")
                  setStatus("idle")
              }
              // Note: processUserInput sets status to "idle" or "speaking" when done
          }

          // ... unrecognized/onend listeners ... 

          // 4. Start Both
          // Important: Start recorder first, then speech recognition
          // Pass 200ms timeslice to ensure 'ondataavailable' fires frequently
          mediaRecorder.start(200)
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error("Start error:", e)
          }
          
          setStatus("recording")
          isRecordingRef.current = true
          
          // Start Visualizer Loop
          updateVolume()
          isRecordingRef.current = true

      } catch (err) {
          console.error("Microphone Access Error:", err)
          alert("Could not access microphone. Please allow permissions.")
          setStatus("idle")
      }

    } else if (status === "recording") {
      // User tapped Stop manually.
      isRecordingRef.current = false
      
      // Cleanup Audio Analysis
      if (animationFrameRef.current) {
         cancelAnimationFrame(animationFrameRef.current)
         animationFrameRef.current = null
      }
      if (sourceRef.current) {
         sourceRef.current.disconnect()
         sourceRef.current = null
      }
      setAudioLevel(0)
      // 1. Stop Speech
      recognitionRef.current.stop()
      // 2. Stop Recorder explicitly if needed (though speech.onend covers it, explict is safer)
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

  // --- LANGUAGE SETUP PHASE ---
  if (phase === "language-setup") {
    return (
      <div className="min-h-[80vh] w-full bg-transparent flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-[scaleIn_0.3s_ease-out]">
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Language Preferences</h2>
                <p className="text-gray-500 mt-2">Choose the languages you are most comfortable using.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <LanguageSelector 
                    label="Native Language"
                    value={nativeLanguage}
                    onChange={setNativeLanguage}
                    options={LANGUAGES}
                    placeholder="Select native language"
                />

                <LanguageSelector 
                    label="Second Language"
                    value={secondLanguage}
                    onChange={setSecondLanguage}
                    options={LANGUAGES}
                    placeholder="Select second language"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                    onClick={() => setPhase("setup")}
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={confirmLanguageSelection}
                    disabled={!nativeLanguage || !secondLanguage}
                    className="px-8 py-3 bg-mintDark text-white rounded-xl font-bold shadow-lg shadow-mint/30 hover:bg-mintText hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    Yes, Start Practice
                </button>
            </div>

        </div>
      </div>
    )
  }

  // --- CHAT PHASE ---
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 my-4 px-4 h-[calc(100vh-100px)]">
      
      {/* LEFT COLUMN: Main Chat (Grid Col Span 2) */}
      <div className="lg:col-span-2 flex flex-col bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50 h-full">
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
              <div className={`max-w-[85%] rounded-2xl p-4 ${
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
                disabled={status === "processing" || status === "speaking" || status === "initializing"}
                style={{
                    transform: status === "recording" ? `scale(${1 + audioLevel})` : 'scale(1)',
                }}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all duration-75 ease-out
                  ${status === "recording" ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-mintDark shadow-lg shadow-mint/30 hover:scale-105"}
                  ${(status === "processing" || status === "speaking" || status === "initializing") ? "bg-gray-200 cursor-not-allowed opacity-50" : ""}
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
                 {status === "recording" ? "Tap to stop" : status === "initializing" ? "Starting..." : "Tap to speak"}
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

      {/* RIGHT COLUMN: Live Analysis (Grid Col Span 1) */}
      <div className="hidden lg:flex flex-col h-full space-y-4">
         {/* AI Avatar */}
         <div className="flex justify-center items-center py-6 bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 min-h-[200px]">
             <TalkingAvatar 
                isSpeaking={playingAudioId !== null && conversation.find(m => m.id === playingAudioId)?.sender === 'ai'} 
             />
         </div>

         <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl flex-1 flex flex-col overflow-hidden border border-white/50">
           <div className="bg-mintBg/50 p-4 border-b border-mint/10">
              <h3 className="font-bold text-mintDark flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 Live Analysis
              </h3>
              <p className="text-xs text-gray-500 mt-1">Real-time feedback on your speech.</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sessionFeedback.length === 0 ? (
                 <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
                       <span className="text-2xl">👀</span>
                    </div>
                    <p className="text-sm">Start talking to get feedback!</p>
                 </div>
              ) : (
                 [...sessionFeedback].reverse().map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-[slideUp_0.3s_ease-out]">
                       <div className="flex items-start justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                             item.type === 'grammar' ? 'bg-red-50 text-red-500' :
                             item.type === 'vocabulary' ? 'bg-blue-50 text-blue-500' :
                             'bg-orange-50 text-orange-500'
                          }`}>
                            {item.type}
                          </span>
                       </div>
                       <p className="text-gray-400 text-xs mb-1 line-through">{item.original}</p>
                       <p className="text-gray-800 text-sm font-medium mb-2">{item.improved}</p>
                       <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-bold">Why:</span> {item.explanation}
                          </p>
                       </div>
                    </div>
                 ))
              )}
           </div>
         </div>
      </div>

      {/* Floating Analysis Panel (Initially Hidden on Mobile) */}
      <div id="mobile-analysis-panel" className="hidden lg:hidden fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-gray-800">Live Analysis</h3>
                 <button 
                    onClick={() => document.getElementById('mobile-analysis-panel')?.classList.add('hidden')}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500"
                 >
                    ✕
                 </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                 {/* AI Avatar */}
                 <div className="flex justify-center items-center py-6 mb-4 bg-white shadow-sm rounded-2xl border border-gray-100 min-h-[180px]">
                     <TalkingAvatar 
                        isSpeaking={playingAudioId !== null && conversation.find(m => m.id === playingAudioId)?.sender === 'ai'} 
                     />
                 </div>
                 
                 {/* Feedback List */}
                 <div className="space-y-3">
                   {sessionFeedback.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">
                         <p className="text-sm">Start talking to get feedback!</p>
                      </div>
                   ) : (
                      [...sessionFeedback].reverse().map((item, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-2">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  item.type === 'grammar' ? 'bg-red-50 text-red-500' :
                                  item.type === 'vocabulary' ? 'bg-blue-50 text-blue-500' :
                                  'bg-orange-50 text-orange-500'
                               }`}>
                                 {item.type}
                               </span>
                            </div>
                            <p className="text-gray-400 text-xs mb-1 line-through">{item.original}</p>
                            <p className="text-gray-800 text-sm font-medium mb-2">{item.improved}</p>
                            <div className="bg-gray-50 p-2 rounded-lg">
                               <p className="text-xs text-gray-600 leading-relaxed">
                                 <span className="font-bold">Why:</span> {item.explanation}
                               </p>
                            </div>
                         </div>
                      ))
                   )}
                 </div>
             </div>
          </div>
      </div>
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

// Custom Language Selector Component
const LanguageSelector = ({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder 
}: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    options: string[], 
    placeholder: string 
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredOptions = options.filter(opt => 
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-gray-700 ml-1">{label}</label>
            
            {/* Trigger (Looks like Text Field) */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full p-4 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all
                    ${isOpen ? 'border-mint ring-1 ring-mint bg-white' : 'border-gray-200 hover:border-gray-300'}
                `}
            >
                <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown Menu (Dark Glassmorphism) */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-[slideDown_0.2s_ease-out]">
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white">
                        
                        {/* Search Bar */}
                        <div className="p-3 border-b border-white/10">
                            <input 
                                type="text"
                                placeholder="Search language..."
                                className="w-full bg-slate-700/50 text-white placeholder-gray-400 text-sm px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-mint outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <div 
                                        key={option}
                                        onClick={() => {
                                            onChange(option)
                                            setIsOpen(false)
                                            setSearchTerm("")
                                        }}
                                        className={`
                                            px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors
                                            ${value === option ? 'bg-mint/20 text-mint' : 'hover:bg-white/10 text-gray-200'}
                                        `}
                                    >
                                        <span>{option}</span>
                                        {value === option && (
                                            <svg className="w-4 h-4 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                    No languages found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
