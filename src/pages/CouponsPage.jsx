import { useEffect } from 'react'
import { gsap } from 'gsap'

import { useMemo, useRef, useState } from 'react'

const COUPON_TEXTS = [
  '🍿 “Movie Night With Me”',
  '☕ “Coffee Date, My Treat”',
  '🎮 “One Gaming Session Together”',
  '💌 “A Hug Redeemable Anytime”',
]

function useShuffledCoupons() {
  return useMemo(() => {
    const arr = [...COUPON_TEXTS]
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, 4)
  }, [])
}

function ScratchCanvas({ onComplete, disabled }) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      // Reset transform to avoid cumulative scaling on repeated resizes
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      // Fill with silver/gray scratch surface
      ctx.globalCompositeOperation = 'source-over'
      const grd = ctx.createLinearGradient(0, 0, clientWidth, clientHeight)
      grd.addColorStop(0, '#bfc3c7')
      grd.addColorStop(1, '#838a90')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, clientWidth, clientHeight)
      // Add subtle pattern
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      for (let y = 0; y < clientHeight; y += 6) {
        ctx.fillRect(0, y, clientWidth, 2)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const pointerDown = (e) => {
      if (disabled || completedRef.current) return
      isDrawingRef.current = true
      draw(e)
    }
    const pointerUp = () => {
      isDrawingRef.current = false
      checkProgress()
    }
    const pointerMove = (e) => {
      if (!isDrawingRef.current || disabled || completedRef.current) return
      draw(e)
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const point = 'touches' in e ? e.touches[0] : e
      const x = (point.clientX - rect.left)
      const y = (point.clientY - rect.top)
      return { x, y }
    }

    const draw = (e) => {
      const { x, y } = getPos(e)
      const ctx = canvas.getContext('2d')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.fill()
    }

    const checkProgress = () => {
      // Sample pixels to estimate cleared percentage
      const w = canvas.width
      const h = canvas.height
      // guard for zero sizes
      if (!w || !h) return
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      let cleared = 0
      const stride = 8 * (window.devicePixelRatio || 1) // sample step
      for (let y = 0; y < h; y += stride) {
        for (let x = 0; x < w; x += stride) {
          const idx = (y * w + x) * 4 + 3 // alpha channel
          if (data[idx] < 64) cleared++
        }
      }
      const total = Math.ceil((h / stride)) * Math.ceil((w / stride))
      const ratio = cleared / total
      if (ratio >= 0.5 && !completedRef.current) {
        completedRef.current = true
        // Reveal fully
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,1)'
        ctx.fillRect(0, 0, w, h)
        onComplete?.()
      }
    }

    // Mouse
    canvas.addEventListener('mousedown', pointerDown)
    window.addEventListener('mouseup', pointerUp)
    canvas.addEventListener('mousemove', pointerMove)
    // Touch
    canvas.addEventListener('touchstart', pointerDown, { passive: true })
    window.addEventListener('touchend', pointerUp)
    canvas.addEventListener('touchmove', pointerMove, { passive: true })

    return () => {
      canvas.removeEventListener('mousedown', pointerDown)
      window.removeEventListener('mouseup', pointerUp)
      canvas.removeEventListener('mousemove', pointerMove)
      canvas.removeEventListener('touchstart', pointerDown)
      window.removeEventListener('touchend', pointerUp)
      canvas.removeEventListener('touchmove', pointerMove)
    }
  }, [disabled, onComplete])

  return (
    <div className="absolute inset-0">
      {/* Shine layer over scratch surface */}
      <div className="absolute inset-0 pointer-events-none shine-bg animate-shine opacity-20" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}

function CouponCard({ index, selected, locked, revealed, labelTop, hiddenText, onSelect, onRevealed }) {
  useEffect(() => {
    const q = `.coupon-${index}`
    gsap.fromTo(q, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: index * 0.08 })
  }, [index])

  useEffect(() => {
    if (selected) {
      gsap.to(`.coupon-${index} .card-border`, { boxShadow: '0 0 14px rgba(255,77,166,0.9), 0 0 28px rgba(155,93,229,0.6)', duration: 0.3 })
    }
  }, [selected, index])

  return (
    <button
      type="button"
      onClick={() => !selected && !locked && onSelect?.(index)}
      className={`coupon-${index} group relative rounded-xl p-0.5 bg-gradient-to-br from-gray-700/60 via-gray-800 to-gray-900 shadow-neon transition-all duration-300 ${locked ? 'opacity-0 scale-95 blur-[2px] pointer-events-none' : ''} ${selected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
      aria-hidden={locked}
    >
      <div className="card-border relative rounded-[0.65rem] bg-black/90 border border-gray-800 overflow-hidden">
        {/* Title and header */}
        <div className="p-5">
          <div className="text-sm text-gray-400">Cupid.exe</div>
          <div className="mt-1 text-2xl font-semibold text-gray-100">Mystery Coupon</div>
          <div className="mt-2 text-gray-400">{labelTop}</div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-pink-400 font-medium">{selected ? (revealed ? 'Revealed!' : 'Scratch to reveal') : 'Click to choose'}</span>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
        </div>

        {/* Hidden prize */}
        <div className="px-5 pb-6">
          <div className={`relative h-28 rounded-lg border border-gray-800 flex items-center justify-center overflow-hidden`}> 
            {/* Underlying content: always render so scratch can reveal */}
            <div className={`z-0 text-center transition-all duration-300 ${revealed ? 'scale-105' : 'scale-100'}`}>
              <div className="text-xl font-semibold text-gray-100">{hiddenText}</div>
              {revealed && (
                <div className="mt-2 text-pink-400">Congrats! You unlocked your love coupon 💖</div>
              )}
            </div>

            {/* Static shiny overlay for all unselected cards (non-interactive) */}
            {!selected && !revealed && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 shine-bg animate-shine opacity-20 pointer-events-none" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #bfc3c7, #838a90)' }} />
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 6px)' }} />
              </div>
            )}

            {/* Scratch surface only if selected and not revealed */}
            {selected && !revealed && (
              <ScratchCanvas disabled={false} onComplete={onRevealed} />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function CouponsPage() {
  const coupons = useShuffledCoupons()
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [revealedIndex, setRevealedIndex] = useState(null)

  return (
    <main className="min-h-screen w-full py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-semibold neon-text text-center">Pick your destiny coupon 🎲</h1>
        <p className="mt-2 text-center text-zinc-400">Four identical shiny mystery cards await</p>

        <div className={`mt-10 grid gap-6 ${selectedIndex === null ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 place-items-center'}`}>
          {[0, 1, 2, 3].map((i) => {
            const locked = selectedIndex !== null && selectedIndex !== i
            // Hide locked cards from layout entirely after selection
            if (locked) {
              return (
                <div key={i} className="hidden" aria-hidden />
              )
            }
            return (
              <CouponCard
                key={i}
                index={i}
                selected={selectedIndex === i}
                locked={locked}
                revealed={revealedIndex === i}
                hiddenText={coupons[i]}
                labelTop="Pick your destiny coupon 🎲"
                onSelect={(idx) => setSelectedIndex(idx)}
                onRevealed={() => setRevealedIndex(i)}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

