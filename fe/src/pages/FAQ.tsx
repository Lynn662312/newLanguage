import { useState, useRef } from "react"
import { speakText } from "../services/ai"

const FAQS = [
  {
    id: 1,
    icon: "🤖",
    image: "/why1.png",
    question: "How it Works",
    answer: "You choose a topic, and our AI acts as your partner, correcting mistakes in real-time."
  },
  {
    id: 2,
    icon: "🔒",
    image: "/why2.png",
    question: "Privacy & Data",
    answer: "We only listen to generate feedback. Your session history is kept locally on your device."
  },
  {
    id: 3,
    icon: "🎯",
    image: "/why3.png",
    question: "Grammar Focus",
    answer: "The AI adapts to your level. You can ask for specific grammar drills in Free Chat mode."
  },
  {
    id: 4,
    icon: "🗣️",
    image: "/why4.png",
    question: "Realistic Voice",
    answer: "Powered by ElevenLabs, our AI speaks with a human-like voice to improve your listening."
  },
    {
    id: 5,
    icon: "🎙️",
    // Reuse why1 or just keep emoji if no image provided for 5
    image: "/why5.png", 
    question: "Microphone Needed?",
    answer: "Yes, for the best result. But you can also type if you prefer text-only practice."
  }
]

const FAQ = () => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = async (id: string, text: string) => {
    if (playingId === id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    setLoadingId(id)

    try {
      const url = await speakText(text)
      
      if (url) {
        const audio = new Audio(url)
        audioRef.current = audio
        setPlayingId(id)
        setLoadingId(null)
        
        audio.onended = () => setPlayingId(null)
        await audio.play()
      } else {
         setLoadingId(null)
      }
    } catch (e) {
      console.error("Playback error", e)
      setLoadingId(null)
      setPlayingId(null)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Info & <span className="text-mintDark">Guide</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-lg mx-auto">
          Click the icons to hear the answers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FAQS.map((faq) => (
          <div 
            key={faq.id} 
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
          >
            {/* ICON / Play Trigger */}
            <button 
                onClick={() => handlePlay(`q-${faq.id}`, faq.question + ". " + faq.answer)}
                className="w-32 h-32 mb-6 group-hover:scale-105 transition-transform relative"
            >
                {faq.image ? (
                   <img 
                     src={faq.image} 
                     alt={faq.question}
                     className={`w-full h-full object-contain transition-opacity ${playingId === `q-${faq.id}` ? 'opacity-50' : 'opacity-100'}`}
                   />
                ) : (
                   <span className={`text-6xl ${playingId === `q-${faq.id}` ? 'opacity-20' : 'opacity-100'}`}>{faq.icon}</span>
                )}
                
                {/* Overlay Play State */}
                {(playingId === `q-${faq.id}` || loadingId === `q-${faq.id}`) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {loadingId === `q-${faq.id}` ? (
                             <div className="w-10 h-10 border-4 border-mintDark border-t-transparent rounded-full animate-spin" />
                        ) : (
                             <div className="flex gap-1 items-end h-10 pb-2">
                                 <div className="w-1.5 bg-mintDark h-5 animate-[bounce_1s_infinite]" />
                                 <div className="w-1.5 bg-mintDark h-8 animate-[bounce_1.2s_infinite]" />
                                 <div className="w-1.5 bg-mintDark h-4 animate-[bounce_0.8s_infinite]" />
                             </div>
                        )}
                    </div>
                )}
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {faq.question}
            </h3>
            
            <p className="text-gray-500 leading-relaxed text-sm">
                {faq.answer}
            </p>

            <button
                onClick={() => handlePlay(`q-${faq.id}`, faq.answer)}
                className="mt-6 text-xs font-bold text-mintDark uppercase tracking-widest hover:bg-mintBg px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
                {playingId === `q-${faq.id}` ? 'Stop Audio' : 'Read Aloud'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ
