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
        <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mintDark" />
                <span className="text-xs text-gray-500 font-medium">AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mintDark" />
                <span className="text-xs text-gray-500 font-medium">Safe Space</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mintDark" />
                <span className="text-xs text-gray-500 font-medium">No storage</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-mintDark" />
                <span className="text-xs text-gray-500 font-medium">Free forever</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
