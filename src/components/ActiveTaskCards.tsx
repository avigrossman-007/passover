import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room, ActiveTask } from '../types'

interface ActiveTaskCardsProps {
  activeTasks: ActiveTask[]
  rooms: Room[]
  onStop: (roomId: string, taskId: string) => void
  onPlayPop: () => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 200)
    return () => clearInterval(interval)
  }, [startedAt])

  return <span>{formatTime(elapsed)}</span>
}

export default function ActiveTaskCards({ activeTasks, rooms, onStop, onPlayPop }: ActiveTaskCardsProps) {
  if (activeTasks.length === 0) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"
        />
        <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
          עובדים עכשיו
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {activeTasks.map(at => {
            const room = rooms.find(r => r.id === at.roomId)
            const task = room?.tasks.find(t => t.id === at.taskId)
            if (!room || !task) return null

            return (
              <motion.div
                key={`${at.roomId}-${at.taskId}`}
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-2xl p-5 border border-white/10 relative overflow-hidden animate-pulse-glow"
                style={{
                  background: `linear-gradient(145deg, ${room.colorFrom}20, ${room.colorTo}15)`,
                }}
              >
                {/* Neon top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, ${room.colorFrom}, ${room.colorTo})`,
                    boxShadow: `0 0 10px ${room.colorFrom}60`,
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <motion.span
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-3xl flex-shrink-0"
                      style={{ filter: `drop-shadow(0 0 8px ${room.colorFrom}60)` }}
                    >
                      {room.emoji}
                    </motion.span>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">{room.name}</div>
                      <div className="text-lg font-semibold text-gray-200 truncate">{task.text}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 mr-3">
                    <span
                      className="text-2xl font-bold font-mono tabular-nums animate-tick-pulse"
                      style={{ color: room.colorTo, textShadow: `0 0 15px ${room.colorFrom}50` }}
                    >
                      <ElapsedTime startedAt={at.startedAt} />
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(74, 222, 128, 0.4)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { onPlayPop(); onStop(at.roomId, at.taskId) }}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 transition-all"
                    >
                      סיימתי ✓
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
