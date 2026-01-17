import { useTTS } from "../hooks/useTTS"

const About = () => {
  const { playingId, loadingId, play } = useTTS()

  const handlePlay = (id: string, text: string) => {
    play(id, text)
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
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group text-left relative overflow-hidden w-full flex flex-col items-start">
            <div className={`w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'feedback' ? 'animate-pulse' : ''}`}>
              {loadingId === 'feedback' ? (
                 <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'feedback' ? '🔊' : '🚀'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Feedback</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Stop guessing if you're right. Get immediate, AI-powered corrections on grammar, vocabulary, and pronunciation as you speak.
            </p>
            <button
                onClick={() => handlePlay('feedback', "Instant Feedback. Stop guessing if you're right. Get immediate, AI-powered corrections on grammar, vocabulary, and pronunciation as you speak.")}
                className="mt-auto text-xs font-bold text-mintDark uppercase tracking-widest hover:bg-mintBg px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
                {playingId === 'feedback' ? 'Stop Audio' : 'Read Aloud'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          </div>
  
          {/* Card 2 */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden text-left w-full flex flex-col items-start">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint to-mintDark" />
            <div className={`w-16 h-16 bg-mintBg rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'confidence' ? 'animate-pulse' : ''}`}>
              {loadingId === 'confidence' ? (
                 <div className="w-6 h-6 border-2 border-mintDark border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'confidence' ? '🔊' : '💪'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confidence First</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Anxiety is the biggest barrier to fluency. Practice with a patient AI partner that never judges, available 24/7.
            </p>
            <button
                onClick={() => handlePlay('confidence', "Confidence First. Anxiety is the biggest barrier to fluency. Practice with a patient AI partner that never judges, available 24/7.")}
                className="mt-auto text-xs font-bold text-mintDark uppercase tracking-widest hover:bg-mintBg px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
                {playingId === 'confidence' ? 'Stop Audio' : 'Read Aloud'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          </div>
  
          {/* Card 3 */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group text-left w-full relative flex flex-col items-start">
            <div className={`w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform ${playingId === 'scenarios' ? 'animate-pulse' : ''}`}>
               {loadingId === 'scenarios' ? (
                 <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : playingId === 'scenarios' ? '🔊' : '🧠'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Real Scenarios</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Ditch the generic "cat is on the table" phrases. Roleplay actual situations like Job Interviews, ordering coffee, or travel.
            </p>
            <button
                onClick={() => handlePlay('scenarios', 'Real Scenarios. Ditch the generic "cat is on the table" phrases. Roleplay actual situations like Job Interviews, ordering coffee, or travel.')}
                className="mt-auto text-xs font-bold text-mintDark uppercase tracking-widest hover:bg-mintBg px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
                {playingId === 'scenarios' ? 'Stop Audio' : 'Read Aloud'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          </div>
  
        </div>
  
        {/* Story / Mission Section */}
        <div className="bg-white rounded-[2.5rem] p-12 shadow-lg border border-gray-100 mt-8 flex flex-col md:flex-row items-center gap-12 w-full text-left group hover:shadow-2xl transition-all duration-300">
           <div className="flex-1 space-y-6 relative">
              <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Our Mission</h2>
              </div>
              
              <div className="h-1 w-20 bg-mintDark rounded-full" />
              <p className="text-lg text-gray-600 leading-relaxed">
                  We believe that language is best learned through <span className="font-bold text-gray-900">doing</span>. 
                  Most learners study for years but freeze when it's time to speak. 
                  <br/><br/>
                  <span className="text-mintDark font-bold">newLanguage</span> was built to solve the "Silent Period" — giving you a safe sandbox to crash, burn, and learn before you face the real world.
              </p>
              
              <button
                  onClick={() => handlePlay('mission', "Our Mission. We believe that language is best learned through doing. Most learners study for years but freeze when it's time to speak. newLanguage was built to solve the Silent Period — giving you a safe sandbox to crash, burn, and learn before you face the real world.")}
                  className="mt-4 text-xs font-bold text-mintDark uppercase tracking-widest hover:bg-mintBg px-4 py-2 rounded-full transition-colors flex items-center gap-2"
              >
                  {playingId === 'mission' ? 'Stop Audio' : 'Read Aloud'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
              </button>
           </div>
           
           {/* Visual Element */}
           <div className="flex-1 flex justify-center">
              <div className="relative w-64 h-64">
                  <div className="absolute inset-0 bg-gradient-to-tr from-mint to-blue-200 rounded-full opacity-20 blur-2xl animate-pulse" />
                  <div className="relative bg-white border-2 border-dashed border-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                      <img src="/fly.png" alt="Travel" className="w-full h-full object-cover" />
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
  
