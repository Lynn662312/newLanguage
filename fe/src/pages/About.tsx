import { useState, useRef } from "react"
import { speakText } from "../services/ai"

const About = () => {
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
      <div className="w-full max-w-6xl mx-auto p-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 py-16">
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter">
            Why <span className="text-mintDark">newLanguage</span>?
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between textbook learning and real-world fluency. 
            We provide the judgment-free environment you need to speak with confidence.
          </p>
        </div>
  
        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          
          {/* Card 1 */}
          <button 
            onClick={() => handlePlay('feedback', "Instant Feedback. Stop guessing if you're right. Get immediate, AI-powered corrections on grammar, vocabulary, and pronunciation as you speak.")}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group text-left relative overflow-hidden w-full"
          >
            <div className={`w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'feedback' ? 'animate-pulse' : ''}`}>
              {loadingId === 'feedback' ? (
                 <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'feedback' ? '🔊' : '🚀'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Feedback</h3>
            <p className="text-gray-500 leading-relaxed">
              Stop guessing if you're right. Get immediate, AI-powered corrections on grammar, vocabulary, and pronunciation as you speak.
            </p>
          </button>
  
          {/* Card 2 */}
          <button 
             onClick={() => handlePlay('confidence', "Confidence First. Anxiety is the biggest barrier to fluency. Practice with a patient AI partner that never judges, available 24/7.")}
             className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden text-left w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint to-mintDark" />
            <div className={`w-16 h-16 bg-mintBg rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'confidence' ? 'animate-pulse' : ''}`}>
              {loadingId === 'confidence' ? (
                 <div className="w-6 h-6 border-2 border-mintDark border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'confidence' ? '🔊' : '💪'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confidence First</h3>
            <p className="text-gray-500 leading-relaxed">
              Anxiety is the biggest barrier to fluency. Practice with a patient AI partner that never judges, available 24/7.
            </p>
          </button>
  
          {/* Card 3 */}
          <button 
            onClick={() => handlePlay('scenarios', 'Real Scenarios. Ditch the generic "cat is on the table" phrases. Roleplay actual situations like Job Interviews, ordering coffee, or travel.')}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full relative"
          >
            <div className={`w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'scenarios' ? 'animate-pulse' : ''}`}>
               {loadingId === 'scenarios' ? (
                 <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'scenarios' ? '🔊' : '🧠'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Real Scenarios</h3>
            <p className="text-gray-500 leading-relaxed">
              Ditch the generic "cat is on the table" phrases. Roleplay actual situations like Job Interviews, ordering coffee, or travel.
            </p>
          </button>
  
        </div>
  
        {/* Story / Mission Section */}
        <div className="bg-white rounded-[2.5rem] p-12 shadow-lg border border-gray-100 mt-8 flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Our Mission</h2>
              <div className="h-1 w-20 bg-mintDark rounded-full" />
              <p className="text-lg text-gray-600 leading-relaxed">
                  We believe that language is best learned through <span className="font-bold text-gray-900">doing</span>. 
                  Most learners study for years but freeze when it's time to speak. 
                  <br/><br/>
                  <span className="text-mintDark font-bold">newLanguage</span> was built to solve the "Silent Period" — giving you a safe sandbox to crash, burn, and learn before you face the real world.
              </p>
           </div>
           
           {/* Visual Element */}
           <div className="flex-1 flex justify-center">
              <div className="relative w-64 h-64">
                  <div className="absolute inset-0 bg-gradient-to-tr from-mint to-blue-200 rounded-full opacity-20 blur-2xl animate-pulse" />
                  <div className="relative bg-white border-2 border-dashed border-gray-200 w-full h-full rounded-full flex items-center justify-center">
                      <span className="text-8xl">🌍</span>
                  </div>
                  {/* Orbiting Elements */}
                  <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg animate-[bounce_3s_infinite]">
                      🇪🇸
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg animate-[bounce_4s_infinite]">
                      🇫🇷
                  </div>
                  <div className="absolute top-1/2 -right-12 bg-white p-4 rounded-xl shadow-lg animate-[bounce_2.5s_infinite]">
                      🇯🇵
                  </div>
              </div>
           </div>
        </div>
  
        {/* CTA */}
        <div className="text-center py-20 pb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Ready to break the silence?</h3>
            <a href="/practice" className="inline-block bg-mintDark text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-mint/30 hover:scale-105 hover:bg-mintText transition-all">
                Start Practicing Now
            </a>
        </div>
  
      </div>
    )
  }
  
  export default About
  
