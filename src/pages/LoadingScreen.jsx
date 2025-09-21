import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'

export default function LoadingScreen() {
  const navigate = useNavigate()
  const barRef = useRef(null)
  const indicatorRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Starting up...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // Animate progress to 100 in stages with playful messages
    tl.to({}, { duration: 1.6 })
      .to({}, { duration: 2.4, onUpdate: () => updateProgress(20) })
      .call(() => setMessage('Downloading your smile…🥰'))
      .to({}, { duration: 3.2, onUpdate: () => updateProgress(40) })
      .call(() => setMessage('Installing butterflies in my stomach…🦋'))
      .to({}, { duration: 4.0, onUpdate: () => updateProgress(60) })
      .call(() => setMessage('Running compatibility test (spoiler: 100%)…'))
      .to({}, { duration: 4.8, onUpdate: () => updateProgress(80) })
      .call(() => setMessage('Almost there… butterflies are getting nervous'))
      .to({}, { duration: 5.6, onUpdate: () => updateProgress(100) })
      .call(() => {
        setMessage('Ready to confess: I like you 💌')
        celebrate()
        setDone(true)
      })

    function updateProgress(target) {
      // Smoothly animate the width of the bar to target
      setProgress((prev) => {
        const next = Math.min(target, 100)
        gsap.to(barRef.current, {
          width: next + '%',
          duration: 0.3,
          ease: 'power3.out',
        })
        // Move the loading indicator to the bar's leading edge
        const clamped = Math.max(0, Math.min(next, 100))
        if (indicatorRef.current) {
          gsap.to(indicatorRef.current, {
            left: clamped + '%',
            duration: 0.3,
            ease: 'power3.out',
          })
        }
        return next
      })
    }

    function celebrate() {
      // Glow pulse
      gsap.fromTo(
        '#barWrap',
        { boxShadow: '0 0 0px rgba(255, 77, 166, 0.0)' },
        { boxShadow: '0 0 32px rgba(255, 77, 166, 0.8)', duration: 0.6, yoyo: true, repeat: 1 }
      )

      // Simple falling hearts/confetti
      const container = document.getElementById('celebration')
      const count = 24
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div')
        el.textContent = Math.random() < 0.5 ? '💖' : '💘'
        el.style.position = 'absolute'
        el.style.left = Math.random() * 100 + 'vw'
        el.style.top = '-40px'
        el.style.fontSize = 16 + Math.random() * 20 + 'px'
        el.style.filter = 'drop-shadow(0 0 8px rgba(255,77,166,0.6))'
        container.appendChild(el)
        gsap.to(el, {
          y: window.innerHeight + 80,
          rotation: gsap.utils.random(-90, 90),
          duration: gsap.utils.random(2.5, 4.5),
          ease: 'power1.in',
          onComplete: () => el.remove(),
        })
      }
    }

    return () => tl.kill()
  }, [])

  return (
    <main className="relative min-h-screen w-full grid place-items-center font-semibold">
      <div id="celebration" className="pointer-events-none absolute inset-0 overflow-hidden" />
      <div className="w-full max-w-xl px-6 text-center">
        <h2 className="text-xl font-bold text-gray-300 mb-6">{message}</h2>

        <div id="barWrap" className="relative w-full h-4 rounded-full bg-gray-800 shadow-neon overflow-visible">
          <div
            ref={barRef}
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-500 to-rose-500"
            style={{ width: progress + '%' }}
          />
          {/* Moving loading indicator on top of the progress bar */}
          <img
            ref={indicatorRef}
            src="/loading.gif"
            alt="loading"
            className="pointer-events-none absolute z-20"
            style={{
              top: '0%',
              left: '0%',
              width: '48px',
              height: '48px',
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 0 8px rgba(255,77,166,0.7))',
            }}
          />
        </div>

        <div className="mt-3 text-xs text-gray-400">{progress}%</div>

        {done && (
          <div className="mt-10">
            <h3 className="text-3xl font-bold mb-4 neon-text">Process Complete 💖</h3>
            <button
              onClick={() => navigate('/coupons')}
              className="px-5 py-3 rounded-md bg-pink-500 text-white font-medium shadow-neon hover:opacity-90 transition"
            >
              Click to Unlock the Surprise
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
