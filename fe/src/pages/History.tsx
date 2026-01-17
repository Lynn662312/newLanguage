import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllSessions } from "../data/mockSession"
import type { SessionResult } from "../data/mockSession"

const History = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionResult[]>([])

  useEffect(() => {
    setSessions(getAllSessions())
  }, [])

  return (
    <div className="min-h-screen bg-transparent p-4 flex flex-col items-center pt-8 pb-12">
      <div className="w-full max-w-4xl space-y-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Header */}
        <div>
           <h1 className="text-3xl font-bold text-mintText">Your Progress</h1>
           <p className="text-gray-500">All your past practice sessions and feedback.</p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-2xl border border-white">
            <p className="text-gray-400 text-lg">No sessions yet.</p>
            <button 
                onClick={() => navigate("/practice")} 
                className="mt-4 text-mintDark font-bold hover:underline"
            >
                Start your first practice!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => {
               const score = Math.round((session.scores.clarity + session.scores.grammar + session.scores.vocabulary) / 3) 
               return (
                <div 
                    key={session.id}
                    onClick={() => {
                        // Load this session into "last_session" so Feedback page sees it
                        localStorage.setItem("last_session", JSON.stringify(session))
                        navigate("/feedback")
                    }}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer border border-transparent hover:border-mint/30 flex justify-between items-center group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-xl
                            ${session.inputType === 'voice' ? 'bg-mintBg text-mintDark' : 'bg-blue-50 text-blue-500'}
                        `}>
                            {session.inputType === 'voice' ? '🎙️' : '💬'}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-mintDark transition-colors">
                                {session.topic || "Freestyle Chat"}
                            </h3>
                            <p className="text-gray-400 text-xs">
                                {new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-mintDark transition-colors">{score}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Score</div>
                    </div>
                </div>
               )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
