import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room, Task, Note, ImageAttachment } from '../types'
import NotesPanel from './NotesPanel'
import ImagesPanel from './ImagesPanel'

interface RoomCardProps {
  room: Room
  isActiveRoom: boolean
  activeTaskIds: string[]
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
}

export default function RoomCard({
  room, isActiveRoom, activeTaskIds,
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
    onPlayWhoosh()
    onAddTask(room.id, newTask.trim())
    setNewTask('')
  }

  const handleRoomNameSave = () => {
    if (roomNameDraft.trim() && roomNameDraft.trim() !== room.name) {
      onRenameRoom(room.id, roomNameDraft.trim())
    } else {
      setRoomNameDraft(room.name)
    }
    setEditingRoomName(false)
  }

  const roomNotes = room.notes ?? []
  const roomImages = room.images ?? []

  return (
    <motion.div
      layout
      whileHover={expanded ? undefined : { scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-3xl overflow-hidden cursor-pointer border ${
        isActiveRoom
          ? 'border-2 animate-neon-border'
          : isDone
            ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
            : 'border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
      }`}
      style={{
        background: `linear-gradient(145deg, ${room.colorFrom}22, ${room.colorTo}22)`,
        color: room.textColor,
      }}
    >
      {/* Card header */}
      <motion.div
        layout="position"
        className="p-6 md:p-8 relative"
        onClick={() => { onPlayPop(); setExpanded(!expanded) }}
      >
        {/* Neon accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ background: `linear-gradient(90deg, ${room.colorFrom}, ${room.colorTo})` }}
        />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.span
              className="text-4xl md:text-5xl flex-shrink-0"
              style={{ filter: `drop-shadow(0 0 12px ${room.colorFrom}80)` }}
              animate={isDone ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: isDone ? Infinity : 0, duration: 1.5 }}
            >
              {room.emoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              {/* Inline room name edit */}
              {editingRoomName ? (
                <input
                  ref={roomNameRef}
                  value={roomNameDraft}
                  onChange={e => setRoomNameDraft(e.target.value)}
                  onBlur={handleRoomNameSave}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRoomNameSave()
                    if (e.key === 'Escape') { setRoomNameDraft(room.name); setEditingRoomName(false) }
                    e.stopPropagation()
                  }}
                  onClick={e => e.stopPropagation()}
                  className="text-2xl md:text-3xl font-black bg-transparent border-b-2 border-white/30 focus:border-purple-400 focus:outline-none w-full"
                  style={{ color: room.colorTo }}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 group/name">
                  <h2
                    className="text-2xl md:text-3xl font-black truncate"
                    style={{ color: room.colorTo }}
                  >
                    {room.name}
                  </h2>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setRoomNameDraft(room.name)
                      setEditingRoomName(true)
                      setTimeout(() => roomNameRef.current?.select(), 50)
                    }}
                    className="opacity-0 group-hover/name:opacity-100 p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all flex-shrink-0 text-sm"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm md:text-base text-gray-400">
                  {completedTasks}/{totalTasks} משימות
                </p>
                {activeCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_4px_#f87171]"
                    />
                    <span className="text-xs font-bold text-purple-300">
                      {activeCount} פעיל{activeCount > 1 ? 'ים' : ''}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isDone && (
              <motion.div
                className="animate-pop-in px-3 py-1.5 rounded-full text-sm font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30"
              >
                ✨ סיימנו!
              </motion.div>
            )}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-xl text-gray-500"
            >
              ▼
            </motion.span>
          </div>
        </div>

        {/* Neon progress bar */}
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${room.colorFrom}, ${room.colorTo})`,
              boxShadow: `0 0 10px ${room.colorFrom}60`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-2">
              {/* Room-level notes & images */}
              <div className="flex gap-2 mb-4 flex-wrap" onClick={e => e.stopPropagation()}>
                <NotesPanel
                  notes={roomNotes}
                  accentColor={room.colorFrom}
                  onAdd={text => onAddRoomNote(room.id, text)}
                  onEdit={(nid, text) => onEditRoomNote(room.id, nid, text)}
                  onDelete={nid => onDeleteRoomNote(room.id, nid)}
                />
                <ImagesPanel
                  images={roomImages}
                  accentColor={room.colorFrom}
                  onAdd={imgs => onAddRoomImages(room.id, imgs)}
                  onDelete={iid => onDeleteRoomImage(room.id, iid)}
                />
              </div>

              {incompleteTasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  roomId={room.id}
                  roomColor={room.colorFrom}
                  isActive={activeTaskIds.includes(task.id)}
                  onStart={() => onStartTask(room.id, task.id)}
                  onToggle={() => { onPlayDing(); onToggleTask(room.id, task.id) }}
                  onDelete={() => { onPlayThud(); onDeleteTask(room.id, task.id) }}
                  onRename={text => onRenameTask(room.id, task.id, text)}
                  onAddNote={text => onAddTaskNote(room.id, task.id, text)}
                  onEditNote={(nid, text) => onEditTaskNote(room.id, task.id, nid, text)}
                  onDeleteNote={nid => onDeleteTaskNote(room.id, task.id, nid)}
                  onAddImages={imgs => onAddTaskImages(room.id, task.id, imgs)}
                  onDeleteImage={iid => onDeleteTaskImage(room.id, task.id, iid)}
                />
              ))}

              {doneTasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={incompleteTasks.length + i}
                  roomId={room.id}
                  roomColor={room.colorFrom}
                  isActive={false}
                  onStart={() => {}}
                  onToggle={() => onToggleTask(room.id, task.id)}
                  onDelete={() => { onPlayThud(); onDeleteTask(room.id, task.id) }}
                  onRename={text => onRenameTask(room.id, task.id, text)}
                  onAddNote={text => onAddTaskNote(room.id, task.id, text)}
                  onEditNote={(nid, text) => onEditTaskNote(room.id, task.id, nid, text)}
                  onDeleteNote={nid => onDeleteTaskNote(room.id, task.id, nid)}
                  onAddImages={imgs => onAddTaskImages(room.id, task.id, imgs)}
                  onDeleteImage={iid => onDeleteTaskImage(room.id, task.id, iid)}
                />
              ))}

              {/* Add task */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="משימה חדשה..."
                  className="flex-1 text-lg p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  onClick={e => e.stopPropagation()}
                />
                <motion.button
                  whileHover={{ scale: 1.1, boxShadow: `0 0 15px ${room.colorFrom}40` }}
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); handleAddTask() }}
                  className="px-4 py-3 rounded-xl text-lg font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
                >
                  +
                </motion.button>
              </div>

              {/* Delete room */}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                onClick={(e) => { e.stopPropagation(); onPlayThud(); onDeleteRoom(room.id) }}
                className="w-full mt-2 p-2 rounded-xl text-sm text-red-400/60 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
              >
                מחק חדר
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function formatCompletedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

interface TaskRowProps {
  task: Task
  index: number
  roomId: string
  roomColor: string
  isActive: boolean
  onStart: () => void
  onToggle: () => void
  onDelete: () => void
  onRename: (text: string) => void
  onAddNote: (text: string) => void
  onEditNote: (noteId: string, text: string) => void
  onDeleteNote: (noteId: string) => void
  onAddImages: (imgs: ImageAttachment[]) => void
  onDeleteImage: (imageId: string) => void
}

function TaskRow({
  task, index, roomColor, isActive,
  onStart, onToggle, onDelete, onRename,
  onAddNote, onEditNote, onDeleteNote,
  onAddImages, onDeleteImage,
}: TaskRowProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(task.text)
  const [showSubpanel, setShowSubpanel] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const taskNotes: Note[] = task.notes ?? []
  const taskImages: ImageAttachment[] = task.images ?? []
  const hasExtras = taskNotes.length > 0 || taskImages.length > 0

  const handleNameSave = () => {
    if (nameDraft.trim() && nameDraft.trim() !== task.text) {
      onRename(nameDraft.trim())
    } else {
      setNameDraft(task.text)
    }
    setEditingName(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: task.completed ? 0.4 : 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-xl transition-all ${
        isActive
          ? 'bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
          : 'bg-white/5 hover:bg-white/10 border border-transparent'
      }`}
      onClick={e => e.stopPropagation()}
    >
      <div className="group flex items-center gap-3 p-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.completed
              ? 'bg-emerald-500/30 border-emerald-500/50'
              : 'border-gray-600 hover:border-gray-400'
          }`}
        >
          {task.completed && (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10L8 14L16 6"
                stroke="#34D399"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-check"
              />
            </svg>
          )}
        </button>

        {/* Task name — inline edit */}
        {editingName ? (
          <input
            ref={inputRef}
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNameSave()
              if (e.key === 'Escape') { setNameDraft(task.text); setEditingName(false) }
            }}
            className="flex-1 text-lg font-medium bg-transparent border-b border-white/30 focus:border-purple-400 focus:outline-none text-gray-200"
            autoFocus
          />
        ) : (
          <span
            className={`flex-1 text-lg font-medium ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-200'
            }`}
            onDoubleClick={() => {
              setNameDraft(task.text)
              setEditingName(true)
              setTimeout(() => inputRef.current?.select(), 50)
            }}
          >
            {task.text}
          </span>
        )}

        {/* Completed time */}
        {task.completed && task.completedIn != null && (
          <span className="text-xs text-gray-500 font-mono tabular-nums flex-shrink-0">
            {formatCompletedTime(task.completedIn)}
          </span>
        )}

        {/* Extras badge */}
        {hasExtras && (
          <button
            onClick={() => setShowSubpanel(v => !v)}
            className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white/5 text-gray-500 text-xs hover:bg-white/10 transition-all flex-shrink-0"
          >
            {taskNotes.length > 0 && <span>📝{taskNotes.length}</span>}
            {taskImages.length > 0 && <span>🖼️{taskImages.length}</span>}
          </button>
        )}

        {/* Start / Active */}
        {!task.completed && !isActive && !editingName && (
          <motion.button
            whileHover={{ scale: 1.15, boxShadow: `0 0 15px ${roomColor}40` }}
            whileTap={{ scale: 0.9 }}
            onClick={onStart}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 px-3 py-1.5 rounded-lg text-sm font-bold text-white/80 border border-white/20 bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
          >
            ▶ התחל
          </motion.button>
        )}

        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="px-3 py-1.5 rounded-lg text-sm font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)] flex-shrink-0"
          >
            ⏱ פעיל
          </motion.div>
        )}

        {/* Rename button */}
        {!editingName && (
          <button
            onClick={() => { setNameDraft(task.text); setEditingName(true); setTimeout(() => inputRef.current?.select(), 50) }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-all text-sm flex-shrink-0"
            title="שנה שם"
          >
            ✏️
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all text-lg flex-shrink-0"
        >
          🗑️
        </button>
      </div>

      {/* Notes & Images subpanel for task */}
      <AnimatePresence>
        {showSubpanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-3"
          >
            <div className="flex gap-2 flex-wrap">
              <NotesPanel
                notes={taskNotes}
                accentColor={roomColor}
                onAdd={onAddNote}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
              <ImagesPanel
                images={taskImages}
                accentColor={roomColor}
                onAdd={onAddImages}
                onDelete={onDeleteImage}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible note/image buttons when no extras */}
      {!hasExtras && (
        <div className="px-3 pb-2 flex gap-2">
          <NotesPanel
            notes={taskNotes}
            accentColor={roomColor}
            onAdd={onAddNote}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
          />
          <ImagesPanel
            images={taskImages}
            accentColor={roomColor}
            onAdd={onAddImages}
            onDelete={onDeleteImage}
          />
        </div>
      )}
    </motion.div>
  )
}
