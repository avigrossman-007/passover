import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room, Task, Note, ImageAttachment } from '../types'
import ImagesPanel from './ImagesPanel'

// ─── shared props type ────────────────────────────────────────────────────────
export interface RoomCardCallbacks {
  onStartTask: (roomId: string, taskId: string) => void
  onToggleTask: (roomId: string, taskId: string) => void
  onAddTask: (roomId: string, text: string) => void
  onDeleteTask: (roomId: string, taskId: string) => void
  onDeleteRoom: (roomId: string) => void
  onRenameRoom: (roomId: string, name: string) => void
  onRenameTask: (roomId: string, taskId: string, text: string) => void
  onAddTaskNote: (roomId: string, taskId: string, text: string) => void
  onEditTaskNote: (roomId: string, taskId: string, noteId: string, text: string) => void
  onDeleteTaskNote: (roomId: string, taskId: string, noteId: string) => void
  onAddTaskImages: (roomId: string, taskId: string, imgs: ImageAttachment[]) => void
  onDeleteTaskImage: (roomId: string, taskId: string, imageId: string) => void
  onAddRoomNote: (roomId: string, text: string) => void
  onEditRoomNote: (roomId: string, noteId: string, text: string) => void
  onDeleteRoomNote: (roomId: string, noteId: string) => void
  onAddRoomImages: (roomId: string, imgs: ImageAttachment[]) => void
  onDeleteRoomImage: (roomId: string, imageId: string) => void
  onPlayPop: () => void
  onPlayDing: () => void
  onPlayWhoosh: () => void
  onPlayThud: () => void
  activeTasks: { roomId: string; taskId: string; startedAt: number }[]
}

interface RoomCardProps extends RoomCardCallbacks {
  room: Room
  isActiveRoom: boolean
  activeTaskIds: string[]
}

// ─── helpers ──────────────────────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

// ─── live timer ───────────────────────────────────────────────────────────────
function LiveTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500)
    return () => clearInterval(id)
  }, [startedAt])
  return <span className="font-mono tabular-nums text-xs text-purple-300">⏱ {formatTime(elapsed)}</span>
}

// ─── inline note editor ───────────────────────────────────────────────────────
function InlineNotes({ notes, accentColor, onAdd, onEdit, onDelete }: {
  notes: Note[]; accentColor: string
  onAdd: (t: string) => void; onEdit: (id: string, t: string) => void; onDelete: (id: string) => void
}) {
  const [newText, setNewText] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  return (
    <div className="space-y-1.5 mt-1" onClick={e => e.stopPropagation()}>
      {notes.map(n => (
        <div key={n.id} className="group/note flex items-start gap-2 rounded-lg px-2 py-1.5 bg-white/[0.03] border border-white/5">
          {editId === n.id ? (
            <div className="flex-1 flex gap-2">
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onEdit(n.id, editText); setEditId(null) }
                  if (e.key === 'Escape') setEditId(null)
                }}
                className="flex-1 bg-transparent border-b border-white/30 focus:outline-none text-sm text-gray-200"
                autoFocus
              />
              <button onClick={() => { onEdit(n.id, editText); setEditId(null) }} className="text-xs text-purple-400 hover:text-purple-300">✓</button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm text-gray-300 leading-snug whitespace-pre-wrap break-words">{n.text}</span>
              <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 flex-shrink-0">
                <button onClick={() => { setEditId(n.id); setEditText(n.text) }} className="text-xs text-gray-600 hover:text-gray-300 p-0.5">✏️</button>
                <button onClick={() => onDelete(n.id)} className="text-xs text-gray-600 hover:text-red-400 p-0.5">🗑️</button>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="flex gap-1.5">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newText.trim()) { onAdd(newText.trim()); setNewText('') } }}
          placeholder="+ הוסף הערה..."
          className="flex-1 text-xs p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 transition-all"
          style={{ borderColor: newText ? `${accentColor}40` : undefined }}
        />
        {newText.trim() && (
          <button onClick={() => { onAdd(newText.trim()); setNewText('') }}
            className="px-2 rounded-lg bg-white/10 text-gray-300 text-xs hover:bg-white/20 transition-all">+</button>
        )}
      </div>
    </div>
  )
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task; index: number; roomId: string; roomColor: string; isActive: boolean
  activeStartedAt?: number
  onStart: () => void; onToggle: () => void; onDelete: () => void; onRename: (t: string) => void
  onAddNote: (t: string) => void; onEditNote: (id: string, t: string) => void; onDeleteNote: (id: string) => void
  onAddImages: (imgs: ImageAttachment[]) => void; onDeleteImage: (id: string) => void
}

function TaskRow({ task, index, roomColor, isActive, activeStartedAt, onStart, onToggle, onDelete, onRename,
  onAddNote, onEditNote, onDeleteNote, onAddImages, onDeleteImage }: TaskRowProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const taskNotes: Note[] = task.notes ?? []
  const taskImages: ImageAttachment[] = task.images ?? []

  const handleNameSave = () => {
    if (nameDraft.trim() && nameDraft.trim() !== task.text) onRename(nameDraft.trim())
    else setNameDraft(task.text)
    setEditingName(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: task.completed ? 0.5 : 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-xl transition-all ${isActive
        ? 'bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
        : 'bg-white/5 hover:bg-white/8 border border-transparent hover:border-white/10'}`}
      onClick={e => e.stopPropagation()}
    >
      {/* ── main row ── */}
      <div className="group flex items-center gap-2.5 px-3 pt-3 pb-1.5">
        {/* Checkbox */}
        <button onClick={onToggle}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.completed ? 'bg-emerald-500/30 border-emerald-500/50' : 'border-gray-600 hover:border-gray-400'}`}>
          {task.completed && (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M4 10L8 14L16 6" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check"/>
            </svg>
          )}
        </button>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input ref={inputRef} value={nameDraft} onChange={e => setNameDraft(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') { setNameDraft(task.text); setEditingName(false) } }}
              className="w-full text-base font-medium bg-transparent border-b border-purple-400 focus:outline-none text-gray-200"
              autoFocus />
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`text-base font-medium leading-snug ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                {task.text}
              </span>
              {/* ✏️ always visible (small) */}
              <button
                onClick={() => { setNameDraft(task.text); setEditingName(true); setTimeout(() => inputRef.current?.select(), 50) }}
                className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors text-sm leading-none"
                title="ערוך שם"
              >✏️</button>
            </div>
          )}
          {/* live timer when active */}
          {isActive && activeStartedAt && <LiveTimer startedAt={activeStartedAt} />}
          {/* completed duration */}
          {task.completed && task.completedIn != null && (
            <span className="text-xs text-gray-600 font-mono">✓ {formatTime(task.completedIn)}</span>
          )}
        </div>

        {/* Start / active badge */}
        {!task.completed && !isActive && (
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={onStart}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white/70 border border-white/20 bg-white/8 hover:bg-white/15 transition-all flex-shrink-0"
            style={{ boxShadow: `0 0 8px ${roomColor}30` }}>
            ▶ התחל
          </motion.button>
        )}
        {isActive && (
          <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
            ⏱ פעיל
          </motion.span>
        )}

        {/* Delete */}
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all flex-shrink-0">
          🗑️
        </button>
      </div>

      {/* ── image thumbnails (always visible if exist) ── */}
      {taskImages.length > 0 && (
        <div className="px-3 pb-1.5 flex gap-1.5 flex-wrap">
          {taskImages.map(img => (
            <div key={img.id} className="relative group/thumb w-14 h-14 rounded-lg overflow-hidden border border-white/10 cursor-pointer flex-shrink-0">
              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
              <button onClick={() => onDeleteImage(img.id)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-red-400 text-xs transition-all">
                🗑️
              </button>
            </div>
          ))}
          <ImagesPanel images={[]} accentColor={roomColor} onAdd={onAddImages} onDelete={onDeleteImage} addOnly />
        </div>
      )}

      {/* ── notes inline (always visible if exist) ── */}
      {taskNotes.length > 0 && (
        <div className="px-3 pb-2">
          <InlineNotes notes={taskNotes} accentColor={roomColor} onAdd={onAddNote} onEdit={onEditNote} onDelete={onDeleteNote} />
        </div>
      )}

      {/* ── add note / image when none exist ── */}
      {taskNotes.length === 0 && taskImages.length === 0 && (
        <div className="px-3 pb-2.5 flex gap-2">
          <InlineNotes notes={[]} accentColor={roomColor} onAdd={onAddNote} onEdit={onEditNote} onDelete={onDeleteNote} />
          <div className="flex-shrink-0">
            <ImagesPanel images={[]} accentColor={roomColor} onAdd={onAddImages} onDelete={onDeleteImage} addOnly />
          </div>
        </div>
      )}
      {/* add images when only notes exist (no images yet) */}
      {taskNotes.length > 0 && taskImages.length === 0 && (
        <div className="px-3 pb-2.5">
          <div className="flex-shrink-0 inline-block">
            <ImagesPanel images={[]} accentColor={roomColor} onAdd={onAddImages} onDelete={onDeleteImage} addOnly />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── RoomCard ─────────────────────────────────────────────────────────────────
export default function RoomCard({
  room, isActiveRoom, activeTaskIds, activeTasks,
  onStartTask, onToggleTask, onAddTask, onDeleteTask, onDeleteRoom,
  onRenameRoom, onRenameTask,
  onAddTaskNote, onEditTaskNote, onDeleteTaskNote,
  onAddTaskImages, onDeleteTaskImage,
  onAddRoomNote, onEditRoomNote, onDeleteRoomNote,
  onAddRoomImages, onDeleteRoomImage,
  onPlayPop, onPlayDing, onPlayWhoosh, onPlayThud,
}: RoomCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [editingRoomName, setEditingRoomName] = useState(false)
  const [roomNameDraft, setRoomNameDraft] = useState(room.name)
  const roomNameRef = useRef<HTMLInputElement>(null)

  const totalTasks = room.tasks.length
  const completedTasks = room.tasks.filter(t => t.completed).length
  const activeCount = activeTaskIds.length
  const progress = totalTasks === 0 ? 0 : completedTasks / totalTasks
  const isDone = totalTasks > 0 && completedTasks === totalTasks

  const incompleteTasks = room.tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order)
  const doneTasks = room.tasks.filter(t => t.completed).sort((a, b) => a.order - b.order)

  const handleAddTask = () => {
    if (!newTask.trim()) return
    onPlayWhoosh(); onAddTask(room.id, newTask.trim()); setNewTask('')
  }

  const handleRoomNameSave = () => {
    if (roomNameDraft.trim() && roomNameDraft.trim() !== room.name) onRenameRoom(room.id, roomNameDraft.trim())
    else setRoomNameDraft(room.name)
    setEditingRoomName(false)
  }

  const roomNotes = room.notes ?? []
  const roomImages = room.images ?? []

  return (
    <motion.div layout whileHover={expanded ? undefined : { scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-3xl overflow-hidden cursor-pointer border ${
        isActiveRoom ? 'border-2 animate-neon-border'
          : isDone ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
          : 'border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'}`}
      style={{ background: `linear-gradient(145deg, ${room.colorFrom}22, ${room.colorTo}22)`, color: room.textColor }}
    >
      {/* Header */}
      <motion.div layout="position" className="p-6 md:p-8 relative"
        onClick={() => { onPlayPop(); setExpanded(!expanded) }}>
        <div className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ background: `linear-gradient(90deg, ${room.colorFrom}, ${room.colorTo})` }} />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.span className="text-4xl md:text-5xl flex-shrink-0"
              style={{ filter: `drop-shadow(0 0 12px ${room.colorFrom}80)` }}
              animate={isDone ? { rotate: [0,15,-15,0] } : {}}
              transition={{ repeat: isDone ? Infinity : 0, duration: 1.5 }}>
              {room.emoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              {editingRoomName ? (
                <input ref={roomNameRef} value={roomNameDraft} onChange={e => setRoomNameDraft(e.target.value)}
                  onBlur={handleRoomNameSave}
                  onKeyDown={e => { if (e.key === 'Enter') handleRoomNameSave(); if (e.key === 'Escape') { setRoomNameDraft(room.name); setEditingRoomName(false) } e.stopPropagation() }}
                  onClick={e => e.stopPropagation()}
                  className="text-2xl md:text-3xl font-black bg-transparent border-b-2 border-white/30 focus:border-purple-400 focus:outline-none w-full"
                  style={{ color: room.colorTo }} autoFocus />
              ) : (
                <div className="flex items-center gap-2 group/rname">
                  <h2 className="text-2xl md:text-3xl font-black truncate" style={{ color: room.colorTo }}>{room.name}</h2>
                  <button onClick={e => { e.stopPropagation(); setRoomNameDraft(room.name); setEditingRoomName(true); setTimeout(() => roomNameRef.current?.select(), 50) }}
                    className="opacity-0 group-hover/rname:opacity-100 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all text-sm flex-shrink-0">✏️</button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-sm text-gray-400">{completedTasks}/{totalTasks} משימות</p>
                {activeCount > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <motion.div animate={{ scale: [1,1.4,1], opacity: [1,0.5,1] }} transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_4px_#f87171]" />
                    <span className="text-xs font-bold text-purple-300">{activeCount} פעיל{activeCount > 1 ? 'ים' : ''}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isDone && <motion.div className="animate-pop-in px-3 py-1.5 rounded-full text-sm font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">✨ סיימנו!</motion.div>}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-xl text-gray-500">▼</motion.span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${room.colorFrom}, ${room.colorTo})`, boxShadow: `0 0 10px ${room.colorFrom}60` }}
            initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        </div>
      </motion.div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-2">
              {/* Room notes & images */}
              <div className="mb-3 space-y-2" onClick={e => e.stopPropagation()}>
                <InlineNotes notes={roomNotes} accentColor={room.colorFrom}
                  onAdd={t => onAddRoomNote(room.id, t)}
                  onEdit={(nid, t) => onEditRoomNote(room.id, nid, t)}
                  onDelete={nid => onDeleteRoomNote(room.id, nid)} />
                <ImagesPanel images={roomImages} accentColor={room.colorFrom}
                  onAdd={imgs => onAddRoomImages(room.id, imgs)}
                  onDelete={iid => onDeleteRoomImage(room.id, iid)} />
              </div>

              {[...incompleteTasks, ...doneTasks].map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} roomId={room.id} roomColor={room.colorFrom}
                  isActive={activeTaskIds.includes(task.id)}
                  activeStartedAt={activeTasks.find(at => at.roomId === room.id && at.taskId === task.id)?.startedAt}
                  onStart={() => onStartTask(room.id, task.id)}
                  onToggle={() => { onPlayDing(); onToggleTask(room.id, task.id) }}
                  onDelete={() => { onPlayThud(); onDeleteTask(room.id, task.id) }}
                  onRename={t => onRenameTask(room.id, task.id, t)}
                  onAddNote={t => onAddTaskNote(room.id, task.id, t)}
                  onEditNote={(nid, t) => onEditTaskNote(room.id, task.id, nid, t)}
                  onDeleteNote={nid => onDeleteTaskNote(room.id, task.id, nid)}
                  onAddImages={imgs => onAddTaskImages(room.id, task.id, imgs)}
                  onDeleteImage={iid => onDeleteTaskImage(room.id, task.id, iid)}
                />
              ))}

              <div className="flex gap-2 mt-3">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="משימה חדשה..."
                  className="flex-1 text-lg p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  onClick={e => e.stopPropagation()} />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
                  onClick={e => { e.stopPropagation(); handleAddTask() }}
                  className="px-4 py-3 rounded-xl text-lg font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-all">+</motion.button>
              </div>
              <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(239,68,68,0.15)' }}
                onClick={e => { e.stopPropagation(); onPlayThud(); onDeleteRoom(room.id) }}
                className="w-full mt-2 p-2 rounded-xl text-sm text-red-400/60 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all">
                מחק חדר
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
