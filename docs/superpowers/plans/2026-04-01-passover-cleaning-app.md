# Passover Cleaning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gamified Passover cleaning tracker with React + Tailwind, optimized for TV display, with room themes, timers, sounds, and celebration animations.

**Architecture:** Single-page React app with two views (Home Board grid and Task View per room) managed via state. All data in localStorage. Sound effects synthesized via Web Audio API. Animations via Framer Motion + CSS keyframes. Canvas-based confetti system for celebrations.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS 3, Framer Motion, Web Audio API

---

## File Structure

```
passover/
├── index.html                      # HTML entry point with RTL lang
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind config with custom animations
├── postcss.config.js               # PostCSS for Tailwind
├── tsconfig.json                   # TypeScript config
├── src/
│   ├── main.tsx                    # React root mount
│   ├── App.tsx                     # View router (home vs task view)
│   ├── index.css                   # Tailwind imports + custom keyframes
│   ├── types.ts                    # Room, Task, AppState interfaces
│   ├── data/
│   │   └── defaultRooms.ts         # Pre-loaded rooms with Hebrew tasks
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # localStorage-backed state hook
│   │   ├── useSound.ts             # Web Audio API sound effects
│   │   └── useTimer.ts             # Countdown timer logic
│   ├── lib/
│   │   └── confetti.ts             # Canvas confetti particle system
│   └── components/
│       ├── HomeBoard.tsx            # Room grid + header + overall progress
│       ├── RoomCard.tsx             # Single room card with gradient + progress
│       ├── AddRoomModal.tsx         # Modal: name, emoji picker, color picker
│       ├── TaskView.tsx             # Full-screen room view with timer + tasks
│       ├── TaskItem.tsx             # Single task row with animated checkbox
│       ├── Timer.tsx                # Circular countdown timer display
│       ├── Confetti.tsx             # Canvas confetti renderer component
│       └── CelebrationOverlay.tsx   # Victory overlay with confetti + text
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Initialize project with Vite**

```bash
cd /Users/omrigrossman/Personal-Projects/passover
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript when prompted. If the directory is non-empty, confirm overwrite.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind via Vite plugin**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 4: Set up index.css with Tailwind + custom animations**

Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-cream: #FFF7ED;
  --color-cream-dark: #FED7AA;
  --font-family-serif: Georgia, 'Times New Roman', serif;
}

/* Floating sparkle animation */
@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-100vh) scale(0); opacity: 0; }
}

/* Marching ants for add-room card */
@keyframes marching-ants {
  to { stroke-dashoffset: -20; }
}

/* Pulse for timer last 10 seconds */
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* Gradient shift background */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-float-up {
  animation: float-up linear infinite;
}

.animate-marching-ants {
  animation: marching-ants 0.5s linear infinite;
}

.animate-pulse-scale {
  animation: pulse-scale 0.8s ease-in-out infinite;
}

.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

/* Checkmark draw animation */
@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

.animate-draw-check {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check 0.3s ease-out forwards;
}

/* Strikethrough sweep */
@keyframes strike-sweep {
  from { width: 0; }
  to { width: 100%; }
}

.animate-strike::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  background: currentColor;
  animation: strike-sweep 0.3s ease-out forwards;
}
```

- [ ] **Step 5: Set up index.html with RTL support**

Replace `index.html`:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ניקיון פסח ✨</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Set up App.tsx with placeholder**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-right">
      <h1 className="text-4xl font-bold text-center pt-12 font-serif">
        ניקיון פסח ✨
      </h1>
    </div>
  )
}
```

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Delete boilerplate files**

```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 8: Verify it runs**

```bash
npm run dev
```

Expected: Browser shows "ניקיון פסח ✨" centered on a cream background. No errors in console.

- [ ] **Step 9: Commit**

```bash
git init
echo "node_modules\ndist\n.superpowers" > .gitignore
git add .
git commit -m "feat: scaffold React + Vite + Tailwind project"
```

---

### Task 2: Types and Default Data

**Files:**
- Create: `src/types.ts`, `src/data/defaultRooms.ts`

- [ ] **Step 1: Create type definitions**

Create `src/types.ts`:

```typescript
export interface Task {
  id: string
  text: string
  completed: boolean
  order: number
}

export interface Room {
  id: string
  name: string
  emoji: string
  colorFrom: string
  colorTo: string
  textColor: string
  tasks: Task[]
  order: number
}

export interface TimerState {
  roomId: string | null
  duration: number
  remaining: number
  running: boolean
}

export interface AppState {
  rooms: Room[]
  activeTimer: TimerState
}
```

- [ ] **Step 2: Create default rooms data**

Create `src/data/defaultRooms.ts`:

```typescript
import { Room } from '../types'

let taskId = 0
const tid = () => `default-task-${++taskId}`
const mkTask = (text: string, order: number) => ({
  id: tid(), text, completed: false, order,
})

export const defaultRooms: Room[] = [
  {
    id: 'kitchen',
    name: 'מטבח',
    emoji: '🍳',
    colorFrom: '#FEF3C7',
    colorTo: '#FDE68A',
    textColor: '#78350F',
    order: 0,
    tasks: [
      mkTask('ניקוי ארונות', 0),
      mkTask('ניקוי תנור', 1),
      mkTask('ניקוי מקרר', 2),
      mkTask('שטיפת משטחים', 3),
      mkTask('ניקוי כיור', 4),
    ],
  },
  {
    id: 'living-room',
    name: 'סלון',
    emoji: '🛋️',
    colorFrom: '#FEE2E2',
    colorTo: '#FECACA',
    textColor: '#7F1D1D',
    order: 1,
    tasks: [
      mkTask('שאיבת אבק ספות', 0),
      mkTask('ניקוי מדפים', 1),
      mkTask('שטיפת רצפה', 2),
      mkTask('בדיקת פינות', 3),
    ],
  },
  {
    id: 'bedroom',
    name: 'חדר שינה',
    emoji: '🛏️',
    colorFrom: '#EDE9FE',
    colorTo: '#DDD6FE',
    textColor: '#4C1D95',
    order: 2,
    tasks: [
      mkTask('בדיקת מגירות', 0),
      mkTask('ניקוי ארון', 1),
      mkTask('שאיבת אבק', 2),
      mkTask('ניקוי מתחת למיטה', 3),
    ],
  },
  {
    id: 'bathroom',
    name: 'חדר אמבטיה',
    emoji: '🚿',
    colorFrom: '#CCFBF1',
    colorTo: '#99F6E4',
    textColor: '#134E4A',
    order: 3,
    tasks: [
      mkTask('ניקוי אריחים', 0),
      mkTask('ניקוי מראה', 1),
      mkTask('ניקוי אסלה', 2),
      mkTask('ניקוי כיור', 3),
    ],
  },
  {
    id: 'dining-room',
    name: 'פינת אוכל',
    emoji: '🍽️',
    colorFrom: '#FEF9C3',
    colorTo: '#FDE047',
    textColor: '#713F12',
    order: 4,
    tasks: [
      mkTask('ניקוי שולחן', 0),
      mkTask('ניקוי כיסאות', 1),
      mkTask('שטיפת רצפה', 2),
    ],
  },
]

export const presetEmojis = ['🍳', '🛋️', '🛏️', '🚿', '🍽️', '🧹', '📦', '🪴', '🚗', '👶', '📚', '🎮']

export const presetColors: { from: string; to: string; text: string }[] = [
  { from: '#FEF3C7', to: '#FDE68A', text: '#78350F' },
  { from: '#FEE2E2', to: '#FECACA', text: '#7F1D1D' },
  { from: '#EDE9FE', to: '#DDD6FE', text: '#4C1D95' },
  { from: '#CCFBF1', to: '#99F6E4', text: '#134E4A' },
  { from: '#FEF9C3', to: '#FDE047', text: '#713F12' },
  { from: '#DBEAFE', to: '#BFDBFE', text: '#1E3A8A' },
  { from: '#FCE7F3', to: '#FBCFE8', text: '#831843' },
  { from: '#D1FAE5', to: '#A7F3D0', text: '#064E3B' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/data/defaultRooms.ts
git commit -m "feat: add type definitions and default room data"
```

---

### Task 3: Hooks (localStorage, Sound, Timer)

**Files:**
- Create: `src/hooks/useLocalStorage.ts`, `src/hooks/useSound.ts`, `src/hooks/useTimer.ts`

- [ ] **Step 1: Create useLocalStorage hook**

Create `src/hooks/useLocalStorage.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value
      window.localStorage.setItem(key, JSON.stringify(nextValue))
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
```

- [ ] **Step 2: Create useSound hook**

Create `src/hooks/useSound.ts`:

```typescript
import { useCallback, useRef } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const pop = useCallback(() => {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  }, [getCtx])

  const ding = useCallback(() => {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }, [getCtx])

  const whoosh = useCallback(() => {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * 0.2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1000, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2)
    filter.Q.value = 2
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(ctx.currentTime)
  }, [getCtx])

  const fanfare = useCallback(() => {
    const ctx = getCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = freq
      const startTime = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })
  }, [getCtx])

  const thud = useCallback(() => {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 200
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  }, [getCtx])

  return { pop, ding, whoosh, fanfare, thud }
}
```

- [ ] **Step 3: Create useTimer hook**

Create `src/hooks/useTimer.ts`:

```typescript
import { useState, useRef, useCallback, useEffect } from 'react'

interface TimerControls {
  remaining: number
  duration: number
  running: boolean
  isFinished: boolean
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer(onComplete: () => void): TimerControls {
  const [remaining, setRemaining] = useState(0)
  const [duration, setDuration] = useState(0)
  const [running, setRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((seconds: number) => {
    clearTimer()
    setDuration(seconds)
    setRemaining(seconds)
    setRunning(true)
    setIsFinished(false)
  }, [clearTimer])

  const pause = useCallback(() => {
    clearTimer()
    setRunning(false)
  }, [clearTimer])

  const resume = useCallback(() => {
    setRunning(true)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setRemaining(0)
    setDuration(0)
    setRunning(false)
    setIsFinished(false)
  }, [clearTimer])

  useEffect(() => {
    if (!running || remaining <= 0) return

    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearTimer()
          setRunning(false)
          setIsFinished(true)
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [running, remaining > 0, clearTimer])

  return { remaining, duration, running, isFinished, start, pause, resume, reset }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useLocalStorage, useSound, and useTimer hooks"
```

---

### Task 4: Confetti Particle System

**Files:**
- Create: `src/lib/confetti.ts`, `src/components/Confetti.tsx`

- [ ] **Step 1: Create confetti engine**

Create `src/lib/confetti.ts`:

```typescript
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
      vy: p.vy + 0.15,          // gravity
      vx: p.vx * 0.99,          // air resistance
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
```

- [ ] **Step 2: Create Confetti React component**

Create `src/components/Confetti.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { createParticles, updateParticles, drawParticles } from '../lib/confetti'

interface ConfettiProps {
  active: boolean
  fadeOut?: boolean
}

export default function Confetti({ active, fadeOut = false }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef(createParticles(0, 0))
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    particlesRef.current = createParticles(250, canvas.width)

    const ctx = canvas.getContext('2d')!
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = updateParticles(particlesRef.current, fadeOut)
      drawParticles(ctx, particlesRef.current)
      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [active, fadeOut])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/confetti.ts src/components/Confetti.tsx
git commit -m "feat: add canvas confetti particle system"
```

---

### Task 5: RoomCard Component

**Files:**
- Create: `src/components/RoomCard.tsx`

- [ ] **Step 1: Create RoomCard**

Create `src/components/RoomCard.tsx`:

```tsx
import { motion } from 'framer-motion'
import { Room } from '../types'

interface RoomCardProps {
  room: Room
  onClick: () => void
  onPlayPop: () => void
}

export default function RoomCard({ room, onClick, onPlayPop }: RoomCardProps) {
  const totalTasks = room.tasks.length
  const completedTasks = room.tasks.filter(t => t.completed).length
  const progress = totalTasks === 0 ? 0 : completedTasks / totalTasks
  const isDone = totalTasks > 0 && completedTasks === totalTasks

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => { onPlayPop(); onClick() }}
      className="relative w-full rounded-3xl p-8 text-right shadow-lg cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})`,
        color: room.textColor,
      }}
    >
      {isDone && (
        <div className="absolute top-4 left-4 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold">
          ✨ !סיימנו
        </div>
      )}

      <div className="text-6xl mb-4">{room.emoji}</div>

      <div>
        <h2 className="text-3xl font-bold font-serif mb-2">{room.name}</h2>
        <p className="text-lg opacity-80 mb-3">
          {completedTasks}/{totalTasks} משימות
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-white/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white/70"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RoomCard.tsx
git commit -m "feat: add RoomCard component with gradient theme and progress bar"
```

---

### Task 6: AddRoomModal Component

**Files:**
- Create: `src/components/AddRoomModal.tsx`

- [ ] **Step 1: Create AddRoomModal**

Create `src/components/AddRoomModal.tsx`:

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { presetEmojis, presetColors } from '../data/defaultRooms'

interface AddRoomModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => void
}

export default function AddRoomModal({ open, onClose, onAdd }: AddRoomModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🧹')
  const [colorIdx, setColorIdx] = useState(0)

  const handleSubmit = () => {
    if (!name.trim()) return
    const c = presetColors[colorIdx]
    onAdd(name.trim(), emoji, c.from, c.to, c.text)
    setName('')
    setEmoji('🧹')
    setColorIdx(0)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6">הוספת חדר חדש</h2>

            {/* Name input */}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם החדר..."
              className="w-full text-xl p-4 rounded-2xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none mb-6 text-right"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            {/* Emoji picker */}
            <p className="text-lg font-semibold text-gray-600 mb-3">בחר אימוג׳י</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {presetEmojis.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    emoji === e
                      ? 'bg-amber-100 scale-110 ring-2 ring-amber-400'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <p className="text-lg font-semibold text-gray-600 mb-3">בחר צבע</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {presetColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColorIdx(i)}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    colorIdx === i ? 'scale-110 ring-2 ring-gray-400 ring-offset-2' : ''
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                />
              ))}
            </div>

            {/* Preview + buttons */}
            <div
              className="rounded-2xl p-6 mb-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${presetColors[colorIdx].from}, ${presetColors[colorIdx].to})`,
                color: presetColors[colorIdx].text,
              }}
            >
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-xl font-bold font-serif">{name || 'שם החדר'}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xl font-bold py-4 rounded-2xl transition-colors"
              >
                הוסף ✨
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 text-xl text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                ביטול
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AddRoomModal.tsx
git commit -m "feat: add AddRoomModal with emoji and color pickers"
```

---

### Task 7: HomeBoard Component

**Files:**
- Create: `src/components/HomeBoard.tsx`

- [ ] **Step 1: Create HomeBoard**

Create `src/components/HomeBoard.tsx`:

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Room } from '../types'
import RoomCard from './RoomCard'
import AddRoomModal from './AddRoomModal'

interface HomeBoardProps {
  rooms: Room[]
  onSelectRoom: (roomId: string) => void
  onAddRoom: (name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => void
  onPlayPop: () => void
}

export default function HomeBoard({ rooms, onSelectRoom, onAddRoom, onPlayPop }: HomeBoardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const totalTasks = rooms.reduce((sum, r) => sum + r.tasks.length, 0)
  const completedTasks = rooms.reduce((sum, r) => sum + r.tasks.filter(t => t.completed).length, 0)
  const overallProgress = totalTasks === 0 ? 0 : completedTasks / totalTasks

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Floating sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber-300/40 animate-float-up pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${6 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 5}s`,
            bottom: '-10px',
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold font-serif text-center text-amber-900 mb-4"
        >
          ניקיון פסח ✨
        </motion.h1>

        {/* Overall progress */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex justify-between text-lg text-amber-800 mb-2">
            <span>{completedTasks}/{totalTasks} משימות הושלמו</span>
            <span>{Math.round(overallProgress * 100)}%</span>
          </div>
          <div className="w-full h-4 rounded-full bg-amber-200/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-500"
              animate={{ width: `${overallProgress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Room grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms
            .sort((a, b) => a.order - b.order)
            .map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <RoomCard
                  room={room}
                  onClick={() => onSelectRoom(room.id)}
                  onPlayPop={onPlayPop}
                />
              </motion.div>
            ))}

          {/* Add Room card */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onPlayPop(); setModalOpen(true) }}
            className="w-full rounded-3xl min-h-[220px] flex flex-col items-center justify-center border-4 border-dashed border-amber-300/60 text-amber-400 hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer bg-white/30"
          >
            <span className="text-6xl mb-3">+</span>
            <span className="text-xl font-semibold">הוסף חדר</span>
          </motion.button>
        </div>
      </div>

      <AddRoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={onAddRoom}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HomeBoard.tsx
git commit -m "feat: add HomeBoard with room grid, overall progress, and sparkles"
```

---

### Task 8: TaskItem Component

**Files:**
- Create: `src/components/TaskItem.tsx`

- [ ] **Step 1: Create TaskItem**

Create `src/components/TaskItem.tsx`:

```tsx
import { motion } from 'framer-motion'
import { Task } from '../types'

interface TaskItemProps {
  task: Task
  textColor: string
  onToggle: () => void
  onDelete: () => void
  onPlayDing: () => void
  onPlayThud: () => void
}

export default function TaskItem({ task, textColor, onToggle, onDelete, onPlayDing, onPlayThud }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: task.completed ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group flex items-center gap-4 p-5 rounded-2xl bg-white/40 backdrop-blur-sm mb-3 cursor-pointer"
      onClick={() => { if (!task.completed) onPlayDing(); onToggle() }}
    >
      {/* Custom checkbox */}
      <div
        className={`w-8 h-8 rounded-lg border-3 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
          task.completed
            ? 'bg-white/70 border-white/70'
            : 'border-white/50'
        }`}
        style={{ borderColor: task.completed ? undefined : textColor + '40' }}
      >
        {task.completed && (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10L8 14L16 6"
              stroke={textColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-check"
            />
          </svg>
        )}
      </div>

      {/* Task text */}
      <span
        className={`text-xl font-medium flex-1 relative ${task.completed ? 'animate-strike' : ''}`}
        style={{ color: textColor }}
      >
        {task.text}
      </span>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onPlayThud(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 text-2xl p-2 rounded-xl hover:bg-white/30 transition-all"
        style={{ color: textColor + '80' }}
      >
        🗑️
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskItem.tsx
git commit -m "feat: add TaskItem with animated checkbox and delete"
```

---

### Task 9: Timer Component

**Files:**
- Create: `src/components/Timer.tsx`

- [ ] **Step 1: Create Timer**

Create `src/components/Timer.tsx`:

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimerProps {
  remaining: number
  duration: number
  running: boolean
  textColor: string
  onStart: (seconds: number) => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onPlayPop: () => void
}

const PRESETS = [
  { label: '5', seconds: 5 * 60 },
  { label: '10', seconds: 10 * 60 },
  { label: '15', seconds: 15 * 60 },
  { label: '20', seconds: 20 * 60 },
  { label: '30', seconds: 30 * 60 },
]

export default function Timer({
  remaining, duration, running, textColor,
  onStart, onPause, onResume, onReset, onPlayPop,
}: TimerProps) {
  const [customMin, setCustomMin] = useState('')
  const isUrgent = remaining > 0 && remaining <= 10
  const progress = duration > 0 ? remaining / duration : 0

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // SVG circle params
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const isIdle = duration === 0 && !running

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular timer display */}
      <div className={`relative ${isUrgent ? 'animate-pulse-scale' : ''}`}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke={textColor + '20'}
            strokeWidth="8"
          />
          {/* Progress circle */}
          {duration > 0 && (
            <circle
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={isUrgent ? '#EF4444' : textColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          )}
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: isUrgent ? '#EF4444' : textColor }}
        >
          <span className="text-5xl font-bold tabular-nums font-mono">
            {duration > 0 ? display : '--:--'}
          </span>
        </div>
      </div>

      {/* Preset buttons (show when idle) */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {PRESETS.map(p => (
              <button
                key={p.seconds}
                onClick={() => { onPlayPop(); onStart(p.seconds) }}
                className="px-5 py-3 rounded-2xl text-lg font-bold bg-white/30 hover:bg-white/50 transition-colors"
                style={{ color: textColor }}
              >
                {p.label} דק׳
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customMin}
                onChange={e => setCustomMin(e.target.value)}
                placeholder="דק׳"
                className="w-20 px-3 py-3 rounded-2xl text-lg text-center bg-white/30 placeholder:text-current/40 focus:outline-none focus:bg-white/50"
                style={{ color: textColor }}
                min="1"
                onKeyDown={e => {
                  if (e.key === 'Enter' && customMin) {
                    onPlayPop()
                    onStart(parseInt(customMin) * 60)
                    setCustomMin('')
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause/Reset controls */}
      {duration > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          {remaining > 0 && (
            <button
              onClick={() => { onPlayPop(); running ? onPause() : onResume() }}
              className="px-6 py-3 rounded-2xl text-lg font-bold bg-white/30 hover:bg-white/50 transition-colors"
              style={{ color: textColor }}
            >
              {running ? '⏸ השהה' : '▶ המשך'}
            </button>
          )}
          <button
            onClick={() => { onPlayPop(); onReset() }}
            className="px-6 py-3 rounded-2xl text-lg font-bold bg-white/20 hover:bg-white/40 transition-colors"
            style={{ color: textColor }}
          >
            ↺ איפוס
          </button>
        </motion.div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat: add Timer component with circular progress and presets"
```

---

### Task 10: CelebrationOverlay Component

**Files:**
- Create: `src/components/CelebrationOverlay.tsx`

- [ ] **Step 1: Create CelebrationOverlay**

Create `src/components/CelebrationOverlay.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from './Confetti'

interface CelebrationOverlayProps {
  active: boolean
  onDismiss: () => void
}

export default function CelebrationOverlay({ active, onDismiss }: CelebrationOverlayProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!active) { setFadeOut(false); return }

    const fadeTimer = setTimeout(() => setFadeOut(true), 3000)
    const dismissTimer = setTimeout(onDismiss, 4500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [active, onDismiss])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <Confetti active={active} fadeOut={fadeOut} />

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="text-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-8xl md:text-9xl font-bold font-serif text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            >
              !נצחון 🎉
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl text-white/80 mt-4 drop-shadow-lg"
            >
              כל הכבוד! המשיכו כך ✨
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CelebrationOverlay.tsx
git commit -m "feat: add CelebrationOverlay with confetti and victory text"
```

---

### Task 11: TaskView Component

**Files:**
- Create: `src/components/TaskView.tsx`

- [ ] **Step 1: Create TaskView**

Create `src/components/TaskView.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Room } from '../types'
import TaskItem from './TaskItem'
import Timer from './Timer'
import CelebrationOverlay from './CelebrationOverlay'
import { useTimer } from '../hooks/useTimer'
import { useSound } from '../hooks/useSound'

interface TaskViewProps {
  room: Room
  onBack: () => void
  onToggleTask: (taskId: string) => void
  onAddTask: (text: string) => void
  onDeleteTask: (taskId: string) => void
}

export default function TaskView({ room, onBack, onToggleTask, onAddTask, onDeleteTask }: TaskViewProps) {
  const [newTask, setNewTask] = useState('')
  const [celebrating, setCelebrating] = useState(false)
  const { pop, ding, whoosh, fanfare, thud } = useSound()

  const handleTimerComplete = useCallback(() => {
    fanfare()
    setCelebrating(true)
  }, [fanfare])

  const timer = useTimer(handleTimerComplete)

  const incompleteTasks = room.tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order)
  const completedTasks = room.tasks.filter(t => t.completed).sort((a, b) => a.order - b.order)
  const allDone = room.tasks.length > 0 && incompleteTasks.length === 0

  const handleAddTask = () => {
    if (!newTask.trim()) return
    whoosh()
    onAddTask(newTask.trim())
    setNewTask('')
  }

  return (
    <div
      className="min-h-screen relative animate-gradient-shift"
      style={{
        background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo}, ${room.colorFrom})`,
      }}
    >
      <CelebrationOverlay
        active={celebrating}
        onDismiss={() => setCelebrating(false)}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { pop(); onBack() }}
            className="text-3xl p-3 rounded-2xl bg-white/20 hover:bg-white/40 transition-colors"
            style={{ color: room.textColor }}
          >
            →
          </motion.button>
          <div className="text-center flex-1">
            <div className="text-5xl mb-1">{room.emoji}</div>
            <h1 className="text-4xl font-bold font-serif" style={{ color: room.textColor }}>
              {room.name}
            </h1>
          </div>
          <div className="w-14" /> {/* Spacer for centering */}
        </div>

        {/* Timer */}
        <div className="mb-8">
          <Timer
            remaining={timer.remaining}
            duration={timer.duration}
            running={timer.running}
            textColor={room.textColor}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onPlayPop={pop}
          />
        </div>

        {/* Task list */}
        <div className="mb-24">
          <AnimatePresence mode="popLayout">
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                textColor={room.textColor}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onPlayDing={ding}
                onPlayThud={thud}
              />
            ))}
          </AnimatePresence>

          {/* Completed tasks */}
          <AnimatePresence mode="popLayout">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                textColor={room.textColor}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onPlayDing={ding}
                onPlayThud={thud}
              />
            ))}
          </AnimatePresence>

          {/* Empty / all done state */}
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
              style={{ color: room.textColor }}
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-3xl font-bold font-serif">!הכל נקי</p>
            </motion.div>
          )}

          {room.tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              style={{ color: room.textColor + '80' }}
            >
              <p className="text-2xl">הוסיפו משימות למטה 👇</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add task bar — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/20 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="הוסף משימה..."
            className="flex-1 text-xl p-4 rounded-2xl bg-white/50 placeholder:text-gray-400 focus:outline-none focus:bg-white/70 transition-colors"
            style={{ color: room.textColor }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddTask}
            className="px-6 py-4 rounded-2xl text-xl font-bold bg-white/50 hover:bg-white/70 transition-colors"
            style={{ color: room.textColor }}
          >
            הוסף ✨
          </motion.button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskView.tsx
git commit -m "feat: add TaskView with timer, task list, and add-task input"
```

---

### Task 12: Wire Up App.tsx with State Management

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx with full app wiring**

Replace `src/App.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Room } from './types'
import { defaultRooms } from './data/defaultRooms'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSound } from './hooks/useSound'
import HomeBoard from './components/HomeBoard'
import TaskView from './components/TaskView'

export default function App() {
  const [rooms, setRooms] = useLocalStorage<Room[]>('passover-rooms', defaultRooms)
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const { pop } = useSound()

  const activeRoom = activeRoomId ? rooms.find(r => r.id === activeRoomId) ?? null : null

  const handleAddRoom = useCallback((name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => {
    setRooms(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        emoji,
        colorFrom,
        colorTo,
        textColor,
        tasks: [],
        order: prev.length,
      },
    ])
  }, [setRooms])

  const handleToggleTask = useCallback((taskId: string) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === activeRoomId
          ? {
              ...room,
              tasks: room.tasks.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : room
      )
    )
  }, [activeRoomId, setRooms])

  const handleAddTask = useCallback((text: string) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === activeRoomId
          ? {
              ...room,
              tasks: [
                ...room.tasks,
                {
                  id: crypto.randomUUID(),
                  text,
                  completed: false,
                  order: room.tasks.length,
                },
              ],
            }
          : room
      )
    )
  }, [activeRoomId, setRooms])

  const handleDeleteTask = useCallback((taskId: string) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === activeRoomId
          ? { ...room, tasks: room.tasks.filter(t => t.id !== taskId) }
          : room
      )
    )
  }, [activeRoomId, setRooms])

  return (
    <AnimatePresence mode="wait">
      {activeRoom ? (
        <motion.div
          key="task-view"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.25 }}
        >
          <TaskView
            room={activeRoom}
            onBack={() => setActiveRoomId(null)}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        </motion.div>
      ) : (
        <motion.div
          key="home-board"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <HomeBoard
            rooms={rooms}
            onSelectRoom={setActiveRoomId}
            onAddRoom={handleAddRoom}
            onPlayPop={pop}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Verify the full app runs**

```bash
npm run dev
```

Expected: App shows the home board with 5 room cards. Clicking a room transitions to the task view. Timer works. Adding/checking tasks works. Sounds play on interaction.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App with state management and view routing"
```

---

### Task 13: Final Polish and Verify

- [ ] **Step 1: Run the dev server and test all interactions**

```bash
npm run dev
```

Test checklist:
- Home board shows 5 rooms with progress bars
- Clicking a room plays pop sound and transitions to task view
- Timer presets work (5, 10, 15, 20, 30 min)
- Timer countdown works with circular progress
- Timer last 10 seconds pulse animation
- Timer completion triggers confetti + fanfare + "!נצחון"
- Celebration auto-dismisses after 4 seconds
- Checking off a task plays ding sound
- Adding a task plays whoosh sound and slides in
- Deleting a task plays thud sound
- Completed tasks move to bottom with strikethrough
- All tasks done shows "!הכל נקי"
- Add room modal works with emoji/color picker
- Back button returns to home board
- Floating sparkles visible on home board
- Hebrew RTL text displays correctly

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: No TypeScript errors, successful build in `dist/`.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Passover cleaning app - complete with sounds, animations, and celebrations"
```
