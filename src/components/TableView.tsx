import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room, Task, Note, ImageAttachment } from '../types'
import { formatTime } from './RoomCard'
import { presetColors, presetEmojis } from '../data/defaultRooms'

interface TableViewProps {
  rooms: Room[]
  tabs: { id: string; label: string }[]
  activeTabId: string
  activeTasks: { roomId: string; taskId: string; startedAt: number }[]
  onToggleTask: (roomId: string, taskId: string) => void
  onRenameTask: (roomId: string, taskId: string, text: string) => void
  onDeleteTask: (roomId: string, taskId: string) => void
  onAddTask: (roomId: string, text: string) => void
  onRenameRoom: (roomId: string, name: string) => void
  onDeleteRoom: (roomId: string) => void
  onAddRoom: (name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => void
  onStartTask: (roomId: string, taskId: string) => void
  onAddTaskNote: (roomId: string, taskId: string, text: string) => void
  onEditTaskNote: (roomId: string, taskId: string, noteId: string, text: string) => void
  onDeleteTaskNote: (roomId: string, taskId: string, noteId: string) => void
  onAddTaskImages: (roomId: string, taskId: string, imgs: ImageAttachment[]) => void
  onDeleteTaskImage: (roomId: string, taskId: string, imageId: string) => void
}

// ── live clock ────────────────────────────────────────────────────────────────
function LiveClock({ startedAt }: { startedAt: number }) {
  const [t, setT] = useState(Math.floor((Date.now() - startedAt) / 1000))
  useEffect(() => {
    const id = setInterval(() => setT(Math.floor((Date.now() - startedAt) / 1000)), 500)
    return () => clearInterval(id)
  }, [startedAt])
  return <span className="font-mono text-xs text-purple-300 tabular-nums">{formatTime(t)}</span>
}

// ── inline editable text ──────────────────────────────────────────────────────
function EditableText({
  value, onSave, className = '', strikethrough = false,
}: { value: string; onSave: (v: string) => void; className?: string; strikethrough?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const save = () => {
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim())
    else setDraft(value)
    setEditing(false)
  }

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  if (editing) return (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      className={`bg-white/10 border border-purple-400/60 rounded-lg px-2 py-1 focus:outline-none text-gray-200 w-full min-w-[120px] ${className}`}
      dir="rtl"
    />
  )

  return (
    <div className="flex items-center gap-1.5 group/et min-w-0">
      <span className={`${strikethrough ? 'line-through text-gray-500' : ''} ${className} truncate flex-1 min-w-0`}>{value}</span>
      {/* pencil — always visible on mobile, hover on desktop */}
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className="flex-shrink-0 text-gray-600 hover:text-orange-400 transition-colors text-sm md:opacity-0 md:group-hover/et:opacity-100"
        title="ערוך שם"
      >✏️</button>
    </div>
  )
}

// ── task detail drawer (mobile-friendly full edit) ────────────────────────────
function TaskDrawer({
  task, roomColor, isActive, activeStartedAt,
  onClose, onRename, onToggle, onDelete, onStart,
  onAddNote, onEditNote, onDeleteNote,
  onAddImages, onDeleteImage,
}: {
  task: Task; roomId?: string; roomColor: string; isActive: boolean; activeStartedAt?: number
  onClose: () => void
  onRename: (t: string) => void; onToggle: () => void; onDelete: () => void; onStart: () => void
  onAddNote: (t: string) => void; onEditNote: (id: string, t: string) => void; onDeleteNote: (id: string) => void
  onAddImages: (imgs: ImageAttachment[]) => void; onDeleteImage: (id: string) => void
}) {
  const [newNote, setNewNote] = useState('')
  const [editNoteId, setEditNoteId] = useState<string | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [lightbox, setLightbox] = useState<ImageAttachment | null>(null)

  const taskNotes: Note[] = task.notes ?? []
  const taskImages: ImageAttachment[] = task.images ?? []

  const processFiles = async (files: FileList | null) => {
    if (!files) return
    const results: ImageAttachment[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 2 * 1024 * 1024) continue
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
      })
      results.push({ id: crypto.randomUUID(), name: file.name, dataUrl, createdAt: Date.now() })
    }
    if (results.length) onAddImages(results)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1A1A2E] border border-white/10 rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ borderTop: `3px solid ${roomColor}` }}
      >
        {/* drag handle (mobile) */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 md:hidden" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <EditableText value={task.text} onSave={onRename} className="text-xl font-bold" strikethrough={task.completed} />
              {isActive && activeStartedAt && (
                <div className="mt-1"><LiveClock startedAt={activeStartedAt} /></div>
              )}
              {task.completed && task.completedIn != null && (
                <p className="text-xs text-gray-600 mt-1">✓ הושלם ב-{formatTime(task.completedIn)}</p>
              )}
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all">✕</button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* Only show Complete button if task is NOT completed */}
            {!task.completed && (
              <>
                {!isActive && (
                  <button onClick={() => { onStart(); onClose() }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-sm font-medium border border-white/10 transition-all"
                    style={{ boxShadow: `0 0 10px ${roomColor}20` }}>
                    ▶ התחל טיימר
                  </button>
                )}
                <button onClick={() => { onToggle(); onClose() }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium border border-emerald-500/30 transition-all">
                  ✓ סמן כהושלם
                </button>
              </>
            )}
            {/* Reopen — only if completed */}
            {task.completed && (
              <button onClick={() => { onToggle(); onClose() }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-400 text-sm font-medium border border-white/10 transition-all">
                ↩ פתח מחדש
              </button>
            )}
            <button onClick={() => { onDelete(); onClose() }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm border border-red-500/20 transition-all ml-auto">
              🗑️ מחק
            </button>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">📝 הערות</h3>
            <div className="space-y-2">
              {taskNotes.map(n => (
                <div key={n.id} className="group/n flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                  {editNoteId === n.id ? (
                    <div className="flex-1 flex gap-2">
                      <input value={editNoteText} onChange={e => setEditNoteText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { onEditNote(n.id, editNoteText); setEditNoteId(null) } if (e.key === 'Escape') setEditNoteId(null) }}
                        className="flex-1 bg-white/10 border border-purple-400/40 rounded-lg px-2 py-1 text-sm text-gray-200 focus:outline-none" autoFocus />
                      <button onClick={() => { onEditNote(n.id, editNoteText); setEditNoteId(null) }}
                        className="text-xs text-purple-400 hover:text-purple-300 px-2">✓</button>
                    </div>
                  ) : (
                    <>
                      <p className="flex-1 text-sm text-gray-300 whitespace-pre-wrap break-words">{n.text}</p>
                      <div className="flex gap-1 opacity-0 group-hover/n:opacity-100 flex-shrink-0">
                        <button onClick={() => { setEditNoteId(n.id); setEditNoteText(n.text) }}
                          className="p-1 hover:bg-white/10 rounded text-gray-600 hover:text-gray-300 text-xs">✏️</button>
                        <button onClick={() => onDeleteNote(n.id)}
                          className="p-1 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-400 text-xs">🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newNote} onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newNote.trim()) { onAddNote(newNote.trim()); setNewNote('') } }}
                  placeholder="הוסף הערה..."
                  className="flex-1 text-sm p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 transition-all"
                  dir="rtl" />
                <button onClick={() => { if (newNote.trim()) { onAddNote(newNote.trim()); setNewNote('') } }}
                  disabled={!newNote.trim()}
                  className="px-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition-all">+</button>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">🖼️ תמונות</h3>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => processFiles(e.target.files)} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => processFiles(e.target.files)} />
            {taskImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {taskImages.map(img => (
                  <div key={img.id} className="relative group/img aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer"
                    onClick={() => setLightbox(img)}>
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <button onClick={e => { e.stopPropagation(); onDeleteImage(img.id) }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-red-400 text-sm transition-all">🗑️</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-all">
                📁 בחר תמונות
              </button>
              <button onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm transition-all">
                📷 צלם
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <img src={lightbox.dataUrl} alt={lightbox.name} className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white text-lg">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── main TableView ─────────────────────────────────────────────────────────────
export default function TableView({
  rooms, activeTasks,
  onToggleTask, onRenameTask, onDeleteTask, onAddTask,
  onRenameRoom, onDeleteRoom, onAddRoom, onStartTask,
  onAddTaskNote, onEditTaskNote, onDeleteTaskNote,
  onAddTaskImages, onDeleteTaskImage,
}: TableViewProps) {
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set())
  const [addingTaskInRoom, setAddingTaskInRoom] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [addingRoom, setAddingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomEmoji, setNewRoomEmoji] = useState('🧹')
  const [newRoomColorIdx, setNewRoomColorIdx] = useState(0)
  const [drawerTask, setDrawerTask] = useState<{ task: Task; room: Room } | null>(null)
  const newTaskRef = useRef<HTMLInputElement>(null)

  const toggleRoom = (id: string) => setCollapsedRooms(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleAddTask = (roomId: string) => {
    if (!newTaskText.trim()) return
    onAddTask(roomId, newTaskText.trim())
    setNewTaskText(''); setAddingTaskInRoom(null)
  }

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return
    const c = presetColors[newRoomColorIdx]
    onAddRoom(newRoomName.trim(), newRoomEmoji, c.from, c.to, c.text)
    setNewRoomName(''); setAddingRoom(false)
  }

  const getStatus = (task: Task, roomId: string) => {
    if (task.completed) return 'done'
    if (activeTasks.some(at => at.roomId === roomId && at.taskId === task.id)) return 'active'
    return 'pending'
  }

  const StatusBadge = ({ task, roomId }: { task: Task; roomId: string }) => {
    const s = getStatus(task, roomId)
    if (s === 'done') return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">✓ הושלם</span>
    if (s === 'active') return <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap animate-pulse">⏱ פעיל</span>
    return <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-500 border border-white/10 whitespace-nowrap">ממתין</span>
  }

  const TimerCell = ({ task, roomId }: { task: Task; roomId: string }) => {
    const entry = activeTasks.find(at => at.roomId === roomId && at.taskId === task.id)
    if (entry) return <LiveClock startedAt={entry.startedAt} />
    if (task.completed && task.completedIn != null) return <span className="font-mono text-xs text-gray-500">{formatTime(task.completedIn)}</span>
    return <span className="text-gray-700 text-xs">—</span>
  }

  // ── MOBILE card layout ────────────────────────────────────────────────────────
  const MobileTaskCard = ({ task, room }: { task: Task; room: Room }) => {
    const status = getStatus(task, room.id)
    const entry = activeTasks.find(at => at.roomId === room.id && at.taskId === task.id)
    return (
      <div className={`p-3 rounded-xl border transition-all ${task.completed ? 'opacity-50 border-white/5 bg-white/[0.02]' : 'border-white/10 bg-white/[0.04]'}`}>
        <div className="flex items-start gap-2">
          {/* checkbox */}
          <button
            onClick={() => !task.completed && onToggleTask(room.id, task.id)}
            disabled={task.completed}
            className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              task.completed ? 'bg-emerald-500/30 border-emerald-500/50' : 'border-gray-600 hover:border-gray-400'}`}>
            {task.completed && <span className="text-emerald-400 text-xs">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <EditableText value={task.text} onSave={v => onRenameTask(room.id, task.id, v)}
              className={`text-sm font-medium ${task.completed ? 'text-gray-500' : 'text-gray-200'}`}
              strikethrough={task.completed} />
            {entry && <LiveClock startedAt={entry.startedAt} />}
            {task.completed && task.completedIn != null && (
              <span className="text-xs text-gray-600">⏱ {formatTime(task.completedIn)}</span>
            )}
            {(task.notes ?? []).length > 0 && (
              <p className="text-xs text-gray-600 mt-0.5 truncate">📝 {(task.notes ?? [])[0].text}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <StatusBadge task={task} roomId={room.id} />
            <button onClick={() => setDrawerTask({ task, room })}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 text-xs border border-white/10 transition-all">
              ⋯
            </button>
          </div>
        </div>
        {/* action row */}
        {status !== 'done' && (
          <div className="flex gap-1.5 mt-2 mr-8">
            {status === 'pending' && (
              <button onClick={() => onStartTask(room.id, task.id)}
                className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-xs border border-white/10 transition-all hover:bg-white/10">
                ▶ התחל
              </button>
            )}
            <button onClick={() => onToggleTask(room.id, task.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
              ✓ סיים
            </button>
            <button onClick={() => onDeleteTask(room.id, task.id)}
              className="px-2 py-1 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 text-xs transition-all ml-auto">🗑️</button>
          </div>
        )}
        {status === 'done' && (
          <div className="flex gap-1.5 mt-2 mr-8">
            <button onClick={() => onToggleTask(room.id, task.id)}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 text-xs border border-white/10 transition-all hover:bg-white/10">
              ↩ פתח מחדש
            </button>
            <button onClick={() => onDeleteTask(room.id, task.id)}
              className="px-2 py-1 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 text-xs transition-all ml-auto">🗑️</button>
          </div>
        )}
      </div>
    )
  }

  // ── DESKTOP table row ─────────────────────────────────────────────────────────
  const DesktopTaskRow = ({ task, room, i }: { task: Task; room: Room; i: number }) => {
    const status = getStatus(task, room.id)
    return (
      <div
        className={`grid items-center border-b border-white/[0.03] last:border-0 transition-all ${task.completed ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}
        style={{ gridTemplateColumns: '2fr 3fr 1.3fr 1.3fr auto' }}>
        {/* indent col */}
        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="w-4 flex-shrink-0" />
          <div className="w-px h-5 flex-shrink-0" style={{ background: `${room.colorFrom}40` }} />
          <span className="text-xs text-gray-700">{i + 1}</span>
        </div>
        {/* task name */}
        <div className="px-4 py-2.5">
          <EditableText value={task.text} onSave={v => onRenameTask(room.id, task.id, v)}
            className="text-sm" strikethrough={task.completed} />
          {(task.notes ?? []).length > 0 && (
            <p className="text-xs text-gray-600 truncate mt-0.5">📝 {(task.notes ?? [])[0].text}{(task.notes ?? []).length > 1 ? ` +${(task.notes ?? []).length - 1}` : ''}</p>
          )}
          {(task.images ?? []).length > 0 && (
            <div className="flex gap-1 mt-1">
              {(task.images ?? []).slice(0, 3).map(img => (
                <img key={img.id} src={img.dataUrl} alt="" className="w-7 h-7 rounded object-cover border border-white/10" />
              ))}
            </div>
          )}
        </div>
        {/* status */}
        <div className="px-4 py-2.5"><StatusBadge task={task} roomId={room.id} /></div>
        {/* timer */}
        <div className="px-4 py-2.5"><TimerCell task={task} roomId={room.id} /></div>
        {/* actions */}
        <div className="px-3 py-2.5 flex items-center gap-1.5">
          {/* Start — only when pending */}
          {status === 'pending' && (
            <button onClick={() => onStartTask(room.id, task.id)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs border border-white/10 transition-all">
              ▶
            </button>
          )}
          {/* Complete — only when not done */}
          {status !== 'done' && (
            <button onClick={() => onToggleTask(room.id, task.id)}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20 transition-all">
              ✓
            </button>
          )}
          {/* Reopen — only when done */}
          {status === 'done' && (
            <button onClick={() => onToggleTask(room.id, task.id)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-600 text-xs border border-white/10 transition-all">
              ↩
            </button>
          )}
          {/* Detail drawer */}
          <button onClick={() => setDrawerTask({ task, room })}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 text-xs border border-white/10 transition-all"
            title="פרטים מלאים">⋯</button>
          <button onClick={() => onDeleteTask(room.id, task.id)}
            className="p-1 rounded-lg hover:bg-red-500/10 text-gray-700 hover:text-red-400 transition-all text-sm">🗑️</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* DESKTOP table (hidden on mobile) */}
      <div className="hidden md:block rounded-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="grid bg-white/[0.04] border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: '2fr 3fr 1.3fr 1.3fr auto' }}>
          {['חדר / משימה', 'שם', 'סטטוס', 'זמן', 'פעולות'].map(h => (
            <div key={h} className="px-4 py-3 text-right">{h}</div>
          ))}
        </div>

        {rooms.sort((a, b) => a.order - b.order).map(room => {
          const collapsed = collapsedRooms.has(room.id)
          const roomTasks = [...room.tasks.filter(t => !t.completed).sort((a,b) => a.order-b.order), ...room.tasks.filter(t => t.completed)]

          return (
            <div key={room.id} className="border-b border-white/5 last:border-0">
              {/* Room row */}
              <div className="grid items-center"
                style={{ gridTemplateColumns: '2fr 3fr 1.3fr 1.3fr auto', background: `linear-gradient(90deg, ${room.colorFrom}15, transparent)` }}>
                <div className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => toggleRoom(room.id)} className="text-gray-500 hover:text-gray-300 w-4 text-xs flex-shrink-0">
                    {collapsed ? '▶' : '▼'}
                  </button>
                  <span className="text-lg flex-shrink-0">{room.emoji}</span>
                  <EditableText value={room.name} onSave={v => onRenameRoom(room.id, v)} className="font-bold text-sm" />
                  <span className="text-xs text-gray-600 flex-shrink-0">({room.tasks.filter(t=>t.completed).length}/{room.tasks.length})</span>
                </div>
                <div className="px-4 py-3 col-span-3 text-xs text-gray-600">
                  {room.tasks.every(t => t.completed) && room.tasks.length > 0
                    ? <span className="text-emerald-400">✨ הכל הושלם!</span>
                    : `${room.tasks.filter(t => !t.completed).length} פתוחות`}
                </div>
                <div className="px-3 py-3 flex items-center gap-1.5">
                  <button onClick={() => { setAddingTaskInRoom(room.id); setNewTaskText(''); setTimeout(() => newTaskRef.current?.focus(), 50) }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 text-xs border border-white/10 whitespace-nowrap transition-all">
                    + משימה
                  </button>
                  <button onClick={() => onDeleteRoom(room.id)}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-gray-700 hover:text-red-400 transition-all">🗑️</button>
                </div>
              </div>

              {/* Task rows */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    {roomTasks.map((task, i) => <DesktopTaskRow key={task.id} task={task} room={room} i={i} />)}

                    {/* Add task */}
                    {addingTaskInRoom === room.id ? (
                      <div className="px-4 py-2 flex gap-2 bg-white/[0.02]">
                        <div className="w-8 flex-shrink-0" />
                        <input ref={newTaskRef} value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(room.id); if (e.key === 'Escape') setAddingTaskInRoom(null) }}
                          placeholder="שם המשימה החדשה..."
                          className="flex-1 text-sm p-2 rounded-lg bg-white/10 border border-purple-500/30 text-gray-200 placeholder:text-gray-600 focus:outline-none" dir="rtl" />
                        <button onClick={() => handleAddTask(room.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm hover:bg-purple-500/30 transition-all">הוסף</button>
                        <button onClick={() => setAddingTaskInRoom(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-all">ביטול</button>
                      </div>
                    ) : (
                      <div className="px-10 py-2">
                        <button onClick={() => { setAddingTaskInRoom(room.id); setNewTaskText(''); setTimeout(() => newTaskRef.current?.focus(), 50) }}
                          className="text-xs text-gray-600 hover:text-purple-400 transition-colors">+ הוסף משימה</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Add room */}
        {addingRoom ? (
          <div className="p-4 bg-white/[0.03] border-t border-white/10 space-y-3">
            <div className="flex gap-3 flex-wrap items-center">
              <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddRoom(); if (e.key === 'Escape') setAddingRoom(false) }}
                placeholder="שם החדר..." dir="rtl" autoFocus
                className="flex-1 min-w-[140px] text-sm p-2.5 rounded-xl bg-white/10 border border-purple-500/30 text-gray-200 placeholder:text-gray-600 focus:outline-none" />
              <div className="flex gap-1.5 flex-wrap">
                {presetEmojis.slice(0,8).map(e => (
                  <button key={e} onClick={() => setNewRoomEmoji(e)}
                    className={`text-xl p-1.5 rounded-lg transition-all ${newRoomEmoji===e?'bg-purple-500/20 ring-1 ring-purple-500/50':'hover:bg-white/10'}`}>{e}</button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {presetColors.slice(0,5).map((c,i) => (
                  <button key={i} onClick={() => setNewRoomColorIdx(i)}
                    className={`w-7 h-7 rounded-lg transition-all ${newRoomColorIdx===i?'ring-2 ring-white/40 scale-110':''}`}
                    style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddRoom} className="px-4 py-2 rounded-xl bg-gradient-to-l from-purple-600 to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-all">הוסף חדר</button>
              <button onClick={() => setAddingRoom(false)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-all">ביטול</button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-white/5">
            <button onClick={() => setAddingRoom(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors">
              <span className="text-lg">+</span> הוסף חדר חדש
            </button>
          </div>
        )}
      </div>

      {/* MOBILE card layout (visible only on mobile) */}
      <div className="md:hidden space-y-4">
        {rooms.sort((a,b) => a.order - b.order).map(room => {
          const collapsed = collapsedRooms.has(room.id)
          const roomTasks = [...room.tasks.filter(t => !t.completed), ...room.tasks.filter(t => t.completed)]
          return (
            <div key={room.id} className="rounded-2xl overflow-hidden border border-white/10"
              style={{ background: `linear-gradient(145deg, ${room.colorFrom}15, transparent)` }}>
              {/* Room header */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-right" onClick={() => toggleRoom(room.id)}>
                <span className="text-2xl">{room.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: room.colorTo }}>{room.name}</p>
                  <p className="text-xs text-gray-500">{room.tasks.filter(t=>t.completed).length}/{room.tasks.length} הושלמו</p>
                </div>
                <span className="text-gray-500 text-sm">{collapsed ? '▶' : '▼'}</span>
              </button>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-3 pb-3 space-y-2">
                      {roomTasks.map(task => <MobileTaskCard key={task.id} task={task} room={room} />)}
                      {addingTaskInRoom === room.id ? (
                        <div className="flex gap-2">
                          <input ref={newTaskRef} value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTask(room.id); if (e.key === 'Escape') setAddingTaskInRoom(null) }}
                            placeholder="שם המשימה..." dir="rtl"
                            className="flex-1 text-sm p-2.5 rounded-xl bg-white/10 border border-purple-500/30 text-gray-200 placeholder:text-gray-600 focus:outline-none" />
                          <button onClick={() => handleAddTask(room.id)}
                            className="px-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm">הוסף</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAddingTaskInRoom(room.id); setTimeout(() => newTaskRef.current?.focus(), 50) }}
                          className="w-full text-center text-sm text-gray-600 hover:text-purple-400 py-2 transition-colors">+ הוסף משימה</button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
        <button onClick={() => setAddingRoom(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-gray-500 hover:text-purple-400 hover:border-purple-500/30 text-sm transition-all">
          + הוסף חדר
        </button>
      </div>

      {/* Task detail drawer */}
      <AnimatePresence>
        {drawerTask && (
          <TaskDrawer
            task={drawerTask.task}
            roomId={drawerTask.room.id}
            roomColor={drawerTask.room.colorFrom}
            isActive={activeTasks.some(at => at.roomId === drawerTask.room.id && at.taskId === drawerTask.task.id)}
            activeStartedAt={activeTasks.find(at => at.roomId === drawerTask.room.id && at.taskId === drawerTask.task.id)?.startedAt}
            onClose={() => setDrawerTask(null)}
            onRename={t => onRenameTask(drawerTask.room.id, drawerTask.task.id, t)}
            onToggle={() => onToggleTask(drawerTask.room.id, drawerTask.task.id)}
            onDelete={() => onDeleteTask(drawerTask.room.id, drawerTask.task.id)}
            onStart={() => onStartTask(drawerTask.room.id, drawerTask.task.id)}
            onAddNote={t => onAddTaskNote(drawerTask.room.id, drawerTask.task.id, t)}
            onEditNote={(id, t) => onEditTaskNote(drawerTask.room.id, drawerTask.task.id, id, t)}
            onDeleteNote={id => onDeleteTaskNote(drawerTask.room.id, drawerTask.task.id, id)}
            onAddImages={imgs => onAddTaskImages(drawerTask.room.id, drawerTask.task.id, imgs)}
            onDeleteImage={id => onDeleteTaskImage(drawerTask.room.id, drawerTask.task.id, id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
