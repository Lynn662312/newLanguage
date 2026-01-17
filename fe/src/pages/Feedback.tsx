import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PrimaryButton from "../components/PrimaryButton"
import { getLastSession } from "../data/mockSession"
import type { SessionResult, FeedbackPoint } from "../data/mockSession"

const Feedback = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionResult | null>(null)
  const [selectedItem, setSelectedItem] = useState<FeedbackPoint | null>(null)

  useEffect(() => {
    const data = getLastSession()
    if (data) {
      setSession(data)
    }
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen bg-mintBg flex items-center justify-center">
        <p className="text-mintText">Loading feedback...</p>
      </div>
    )
  }

  // Calculate overall score (simple average)
  const overallScore = Math.round(
    (session.scores.clarity + session.scores.grammar + session.scores.vocabulary) / 3
  )

  return (
    <div className="min-h-screen bg-transparent p-4 flex flex-col items-center pt-6 gap-6 pb-12 relative">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-2 animate-[fadeIn_0.5s_ease-out]">
        <div>
           <h1 className="text-2xl font-bold text-mintText">Session Review</h1>
           <p className="text-xs text-mintText/60 font-medium">{session.topic || "Freestyle"} • {new Date(session.date).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
            <div className="text-3xl font-bold text-mintDark">{overallScore}</div>
            <div className="text-[10px] uppercase font-bold text-mintText/50 tracking-wider">Score</div>
        </div>
      </div>

      {/* Score Grid & Transcript Summary */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Scores */}
          <div className="md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-2 h-full">
             <div className="bg-white/60 p-3 rounded-xl text-center border border-white flex flex-col justify-center">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Clarity</div>
                <div className="text-xl font-bold text-mintText">{session.scores.clarity}%</div>
             </div>
             <div className="bg-white/60 p-3 rounded-xl text-center border border-white flex flex-col justify-center">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Grammar</div>
                <div className="text-xl font-bold text-mintText">{session.scores.grammar}%</div>
             </div>
             <div className="bg-white/60 p-3 rounded-xl text-center border border-white flex flex-col justify-center">
                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Vocab</div>
                <div className="text-xl font-bold text-mintText">{session.scores.vocabulary}%</div>
             </div>
          </div>

          {/* Transcript Preview */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col gap-3 h-full">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
              Transcript
              {session.inputType === 'voice' ? (
                 <span className="text-[10px] bg-mintBg text-mintDark px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Voice</span>
              ) : (
                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Text</span>
              )}
            </h2>
            <div className="bg-gray-50 rounded-lg p-5 flex-1 overflow-y-auto text-gray-700 leading-relaxed border border-gray-100 italic">
              "{session.transcript}"
            </div>
          </div>
      </div>

      {/* FEEDBACK GRID (The requested "Card" View) */}
      <div className="w-full max-w-4xl flex flex-col gap-4 mt-4">
        <h2 className="text-mintDark text-sm font-bold uppercase tracking-wider pl-1">Detailed Analysis</h2>
        
        {session.feedback.length === 0 ? (
             <div className="bg-white p-12 rounded-xl text-center text-gray-400">
               No corrections needed. You spoke perfectly! 🎉
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {session.feedback.map((item, index) => (
                    <div 
                        key={index}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-mint/30 flex flex-col h-full animate-[fadeInUp_0.5s_ease-out_forwards]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Header: Icon + Type */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                ${item.type === 'grammar' ? 'bg-red-50 text-red-500' : ''}
                                ${item.type === 'vocabulary' ? 'bg-blue-50 text-blue-500' : ''}
                                ${item.type === 'tone' ? 'bg-purple-50 text-purple-500' : ''}
                            `}>
                                {/* Icons based on type */}
                                {item.type === 'grammar' && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                )}
                                {item.type === 'vocabulary' && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                )}
                                {item.type === 'tone' && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                            </div>
                            <div className="p-1 rounded-full hover:bg-gray-50 text-gray-300">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </div>
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-gray-900 capitalize text-lg mb-1">{item.type} Check</h3>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                             Original: <span className="italic text-gray-700">"{item.original}"</span>
                        </p>

                        {/* Footer Button */}
                        <button className="w-full py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wider group-hover:bg-mintBg group-hover:text-mintDark transition-colors">
                            Fix Issue
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="mt-8 mb-4">
          <PrimaryButton onClick={() => navigate("/practice")}>
            Start New Session
          </PrimaryButton>
      </div>

      <p className="text-xs text-mintText/40 text-center pb-2 font-medium">
        Audio deleted. Experience saved locally.
      </p>

      {/* FEEDBACK MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-mintBg p-6 border-b border-mint/10 flex justify-between items-start">
                    <div>
                        <span className={`
                            text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide mb-2 inline-block
                            ${selectedItem.type === 'grammar' ? 'bg-red-50 text-red-600' : ''}
                            ${selectedItem.type === 'vocabulary' ? 'bg-blue-50 text-blue-600' : ''}
                            ${selectedItem.type === 'tone' ? 'bg-purple-50 text-purple-600' : ''}
                        `}>
                            {selectedItem.type} Issue
                        </span>
                        <h3 className="text-gray-400 font-medium text-sm">Original Phrase:</h3>
                        <p className="text-lg text-gray-600 line-through decoration-red-300">"{selectedItem.original}"</p>
                    </div>
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-mintDark font-bold text-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Better Way:
                         </div>
                         <p className="text-gray-900 text-2xl font-medium leading-relaxed">
                            "{selectedItem.improved}"
                         </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-mint">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Why?</h4>
                        <p className="text-gray-700 leading-relaxed">
                            {selectedItem.explanation}
                        </p>
                    </div>

                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="w-full py-3 bg-mintDark text-white rounded-xl font-bold shadow-lg shadow-mint/30 hover:bg-mintText transition-all"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default Feedback
