import { useState, useRef, useEffect } from "react"
import { speakText } from "../services/ai"

export const useTTS = () => {
    const [playingId, setPlayingId] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            setPlayingId(null)
        }
    }

    const play = async (id: string, text: string) => {
        // If clicking the same item that's playing, stop it
        if (playingId === id) {
            stop()
            return
        }

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause()
        }

        setLoadingId(id)

        try {
            const url = await speakText(text)

            if (url) {
                const audio = new Audio(url)
                audioRef.current = audio
                setPlayingId(id)
                setLoadingId(null)

                audio.onended = () => {
                    setPlayingId(null)
                    window.dispatchEvent(new CustomEvent('newLanguage-tts-end'))
                }

                window.dispatchEvent(new CustomEvent('newLanguage-tts-start'))
                await audio.play()
            } else {
                setLoadingId(null)
            }
        } catch (e) {
            console.error("Playback error", e)
            setLoadingId(null)
            setPlayingId(null)
        }
    }

    return { playingId, loadingId, play, stop }
}
