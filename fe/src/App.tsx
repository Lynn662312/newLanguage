import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Practice from "./pages/Practice"
import Feedback from "./pages/Feedback"
import History from "./pages/History"
import FAQ from "./pages/FAQ"
import About from "./pages/About"
import Header from "./components/Header"
import Footer from "./components/Footer"
import TalkingAvatar from "./components/TalkingAvatar"

const App = () => {
  const [isGlobalSpeaking, setIsGlobalSpeaking] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsGlobalSpeaking(true)
    const handleEnd = () => setIsGlobalSpeaking(false)

    window.addEventListener('newLanguage-tts-start', handleStart)
    window.addEventListener('newLanguage-tts-end', handleEnd)

    return () => {
      window.removeEventListener('newLanguage-tts-start', handleStart)
      window.removeEventListener('newLanguage-tts-end', handleEnd)
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen pt-16 bg-transparent">
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/history" element={<History />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />

        {/* Global Floating Avatar - Only Shows When Speaking */}
        {isGlobalSpeaking && (
           <div className="fixed bottom-4 right-4 z-50 pointer-events-none animate-[slideUp_0.3s_ease-out]">
                <div className="filter drop-shadow-xl scale-50 origin-bottom-right">
                    <TalkingAvatar isSpeaking={true} />
                </div>
           </div>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
