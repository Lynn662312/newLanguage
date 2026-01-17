import { useNavigate } from "react-router-dom"
import PrimaryButton from "../components/PrimaryButton"

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-transparent relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-mint/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-mintDark/10 rounded-full blur-[80px]" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 space-y-8 relative z-10 animate-[fadeIn_0.8s_ease-out]">
        <div className="text-center space-y-4">
          <div className="inline-block px-3 py-1 bg-mintBg border border-mint/30 rounded-full text-mintDark text-xs font-bold tracking-wider uppercase mb-2">
            Beta Access
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Speak freely. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mintDark to-mint">
              No judgement.
            </span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Practice a new language without the anxiety of being perfect. 
            <span className="block mt-2 text-sm text-gray-400 font-medium">
              No history. Audio auto-deleted.
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="group">
            <PrimaryButton onClick={() => navigate("/practice")} className="shadow-lg shadow-mint/30 group-hover:shadow-xl transition-all">
              Start Practice Session
            </PrimaryButton>
            <p className="text-center text-xs text-gray-400 mt-2 group-hover:text-mintDark transition-colors">
              Microphone or Text • Instant Feedback
            </p>
          </div>
        </div>

        {/* Mini Feature List */}
        <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-y-4 gap-x-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mintBg flex items-center justify-center text-mintDark">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 leading-none">AI Analysis</span>
                    <span className="text-[10px] text-gray-400">Smart corrections</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mintBg flex items-center justify-center text-mintDark">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 leading-none">Safe Space</span>
                    <span className="text-[10px] text-gray-400">Judgement-free</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mintBg flex items-center justify-center text-mintDark">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 leading-none">Private</span>
                    <span className="text-[10px] text-gray-400">No data stored</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mintBg flex items-center justify-center text-mintDark">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 leading-none">Free Forever</span>
                    <span className="text-[10px] text-gray-400">Open source</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
