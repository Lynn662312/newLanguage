import { useNavigate } from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="w-full bg-white border-b border-gray-100 py-4 px-6 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
         <button 
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          title="View Past Sessions"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">History</span>
        </button>

        <button 
          onClick={() => navigate("/faq")}
          className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          title="Frequently Asked Questions"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">FAQ</span>
        </button>

        <button 
          onClick={() => navigate("/about")}
          className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          title="Why do you need us?"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">About</span>
        </button>
      </div>

      {/* Center: Logo */}
      <div 
        onClick={() => navigate("/")}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      >
        <h1 className="font-extrabold text-2xl tracking-tighter text-gray-900">
          newLanguage
        </h1>
      </div>

      {/* Right: Login */}
      <button className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">Log In</span>
      </button>
    </header>
  )
}

export default Header
