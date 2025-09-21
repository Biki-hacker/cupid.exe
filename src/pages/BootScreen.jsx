import { useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'

export default function BootScreen() {
  const navigate = useNavigate()

  const logs = useMemo(() => [
    '> Loading emotions.dll... OK',
    '> Checking heartbeat.sys... Stable ❤️',
    '> Initializing love protocols... Engaged 💌',
    '> Boot complete.'
  ], [])

  useEffect(() => {
    // Reveal logs one by one with a typing-like effect
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.boot-log',
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 2.4, stagger: 2.1, ease: 'power3.out', force3D: true }
      )
    })

    const to = setTimeout(() => navigate('/loading'), 12000)
    return () => {
      ctx.revert()
      clearTimeout(to)
    }
  }, [navigate])

  return (
    <main className="min-h-screen w-full bg-black text-gray-100 grid place-items-center">
      <div className="w-full max-w-3xl px-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight neon-text">
          <span className="text-pink-400">Initializing... Heart.exe 💖</span>
          <span className="animate-blink">_</span>
        </h1>
        <div className="mt-6 text-sm md:text-base text-gray-300/90 space-y-2">
          {logs.map((line, idx) => (
            <div key={idx} className="boot-log">{line}</div>
          ))}
        </div>
      </div>
    </main>
  )
}
