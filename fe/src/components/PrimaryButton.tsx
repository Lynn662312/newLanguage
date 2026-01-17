import React from "react"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  variant = "primary", 
  className = "", 
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
  
  const variants = {
    primary: "bg-mintDark text-white hover:bg-mintText shadow-md shadow-mint/20",
    secondary: "bg-white text-mintText hover:bg-mintBg border border-mint",
    outline: "border-2 border-mintDark text-mintDark hover:bg-mintBg"
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
