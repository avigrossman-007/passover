interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  width: number
  height: number
  color: string
  shape: 'rect' | 'circle' | 'triangle'
  opacity: number
}

const COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA',
  '#F472B6', '#34D399', '#60A5FA', '#FBBF24',
  '#F87171', '#818CF8', '#FB923C', '#2DD4BF',
]

export function createParticles(count: number, canvasWidth: number): Particle[] {
  const particles: Particle[] = []
  const shapes: Particle['shape'][] = ['rect', 'circle', 'triangle']
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      width: Math.random() * 10 + 6,
      height: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      opacity: 1,
    })
  }
  return particles
}

export function updateParticles(particles: Particle[], fadeOut: boolean): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15,
      vx: p.vx * 0.99,
      rotation: p.rotation + p.rotationSpeed,
      opacity: fadeOut ? p.opacity * 0.97 : p.opacity,
    }))
    .filter(p => p.opacity > 0.01 && p.y < 2000)
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color

    if (p.shape === 'rect') {
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
    } else if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(0, -p.height / 2)
      ctx.lineTo(p.width / 2, p.height / 2)
      ctx.lineTo(-p.width / 2, p.height / 2)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  })
}
