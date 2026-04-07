import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room } from '../types'
import { formatTime } from './RoomCard'

interface TaskSummaryProps {
  rooms: Room[]
  activeTasks: { roomId: string; taskId: string; startedAt: number }[]
  onScrollToRoom: (roomId: string) => void
}

export default function TaskSummary({ rooms, activeTasks, onScrollToRoom }: TaskSummaryProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'done'>('all')

  const allTasks = rooms.flatMap(room =>
    room.tasks.map(task => {
      const activeEntry = activeTasks.find(at => at.roomId === room.id && at.taskId === task.id)
      return { room, task, isActive: !!activeEntry, startedAt: activeEntry?.startedAt }
    })
  )

  const filtered = allTasks.filter(({ task, isActive }) => {
    if (filter === 'pending') return !task.completed && !isActive
    if (filter === 'active') return isActive
    if (filter === 'done') return task.completed
    return true
  })

  const totalCount = allTasks.length
  const doneCount = allTasks.filter(x => x.task.completed).length
  const activeCount = allTasks.filter(x => x.isActive).length
  const pendingCount = totalCount - doneCount - activeCount

  return (
    <div className="mt-12">
      {/* Toggle header */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-lg font-bold text-gray-300">📋 ריכוז משימות</span>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-500">{totalCount} סה״כ</span>
            <span className="text-purple-400">⏱ {activeCount} פעיל</span>
            <span className="text-yellow-400">⏳ {pendingCount} ממתין</span>
            <span className="text-emerald-400">✓ {doneCount} הושלם</span>
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-gray-500 text-lg">▼</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden">
              {/* Filter tabs */}
              <div className="flex gap-1 p-3 bg-white/[0.02] border-b border-white/10">
                {([['all','הכל'],['pending','ממתין'],['active','פעיל'],['done','הושלם']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFilter(val)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === val
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]"
                style={{ gridTemplateColumns: '2fr 3fr 1.5fr 1.5fr' }}>
                {['חדר', 'משימה', 'סטטוס', 'זמן'].map(h => (
                  <div key={h} className="px-4 py-2.5 text-right">{h}</div>
                ))}
              </div>

              {/* Rows */}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm">אין משימות להצגה</div>
              )}
              {filtered.map(({ room, task, isActive, startedAt }) => (
                <div key={`${room.id}-${task.id}`}
                  className="grid items-center border-b border-white/[0.03] last:border-0 hover:bg-white/[0.03] transition-all cursor-pointer"
                  style={{ gridTemplateColumns: '2fr 3fr 1.5fr 1.5fr' }}
                  onClick={() => onScrollToRoom(room.id)}>
                  {/* Room */}
                  <div className="px-4 py-3 flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{room.emoji}</span>
                    <span className="text-sm font-medium truncate" style={{ color: room.colorTo }}>{room.name}</span>
                  </div>
                  {/* Task */}
                  <div className="px-4 py-3">
                    <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {task.text}
                    </span>
                    {(task.notes ?? []).length > 0 && (
                      <span className="ml-2 text-xs text-gray-600">📝{(task.notes ?? []).length}</span>
                    )}
                    {(task.images ?? []).length > 0 && (
                      <span className="ml-1 text-xs text-gray-600">🖼️{(task.images ?? []).length}</span>
                    )}
                  </div>
                  {/* Status */}
                  <div className="px-4 py-3">
                    {task.completed
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ הושלם</span>
                      : isActive
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">⏱ פעיל</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-500 border border-white/10">ממתין</span>}
                  </div>
                  {/* Time */}
                  <div className="px-4 py-3">
                    {isActive && startedAt
                      ? <LiveSummaryTimer startedAt={startedAt} />
                      : task.completed && task.completedIn != null
                        ? <span className="font-mono text-xs text-gray-500">{formatTime(task.completedIn)}</span>
                        : <span className="text-gray-700 text-xs">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useEffect, useState as useS } from 'react'
function LiveSummaryTimer({ startedAt }: { startedAt: number }) {
  const [t, setT] = useS(Math.floor((Date.now() - startedAt) / 1000))
  useEffect(() => { const id = setInterval(() => setT(Math.floor((Date.now() - startedAt) / 1000)), 500); return () => clearInterval(id) }, [startedAt])
  return <span className="font-mono text-xs text-purple-300 tabular-nums">{formatTime(t)}</span>
}
