import { useState, useEffect } from "react"

interface TalkingAvatarProps {
  /**
   * Controlled by parent: whether the avatar is "animating" (speaking)
   */
  isSpeaking: boolean
}

const TalkingAvatar = ({ isSpeaking }: TalkingAvatarProps) => {
  const [currentImg, setCurrentImg] = useState<"img1" | "img2">("img1")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isSpeaking) {
      // "Loop both img 1 sec" -> slightly fast toggle typically looks better for talking, 
      // but interpreting strictly as alternating. 
      // Let's do 250ms for a snappy "talking" animation, or 500ms for slower.
      // User said "1 sec", usually implies period. Let's try 500ms per frame (1s cycle).
      interval = setInterval(() => {
        setCurrentImg((prev) => (prev === "img1" ? "img2" : "img1"))
      }, 100)
    } else {
      // Reset to closed mouth/default when stopped
      setCurrentImg("img1")
    }

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 xl:w-48 xl:h-48 transition-all">
      {/* 
        We use absolute positioning to ensure smooth transitions if we wanted fading,
        but for a "fake gif" hard cut, simple src swap works too.
        Preloading both ensures no flickering.
      */}
      <img
        src="/img1.png"
        alt="AI Avatar Static"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-75 ${
          currentImg === "img1" ? "opacity-100" : "opacity-0"
        }`}
      />
      <img
        src="/img2.png"
        alt="AI Avatar Speaking"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-75 ${
          currentImg === "img2" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}

export default TalkingAvatar
