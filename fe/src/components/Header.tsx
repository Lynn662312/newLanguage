import { useNavigate } from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="w-full bg-white border-b border-gray-100 py-4 px-6 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
      {/* Left: Menu */}
      <button className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-gray-600 uppercase">Menu</span>
      </button>

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
