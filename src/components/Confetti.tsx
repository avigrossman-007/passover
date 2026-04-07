import { useEffect, useRef } from 'react'
import { createParticles, updateParticles, drawParticles } from '../lib/confetti'

interface ConfettiProps {
  active: boolean
  fadeOut?: boolean
}

export default function Confetti({ active, fadeOut = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef(createParticles(0, 0))
  const animFrameRef = useRef<number>(0)
  const fadeOutRef = useRef(fadeOut)
  fadeOutRef.current = fadeOut

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    particlesRef.current = createParticles(300, canvas.width)

    const ctx = canvas.getContext('2d')!
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = updateParticles(particlesRef.current, fadeOutRef.current)
      drawParticles(ctx, particlesRef.current)
      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}
