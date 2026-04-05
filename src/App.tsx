import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Room, ActiveTask, Note, ImageAttachment } from './types'
import { defaultRooms } from './data/defaultRooms'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSound } from './hooks/useSound'
import { track } from './lib/analytics'
import { exportToExcel } from './lib/exportExcel'
import RoomCard from './components/RoomCard'
import AddRoomModal from './components/AddRoomModal'
import ActiveTaskCards from './components/ActiveTaskCards'
import CelebrationOverlay from './components/CelebrationOverlay'

// ── Tab data model ────────────────────────────────────────────────────────────
interface BoardTab {
  id: string      // unique stable id
  label: string   // display name (editable)
}

const defaultTabs: BoardTab[] = [
  { id: 'passover', label: '🧹 ניקיון פסח' },
  { id: 'home',    label: '🏠 משימות בית' },
]

// rooms are stored per-tab under key `passover-board-rooms-<tabId>`
// The original passover tab keeps using 'passover-rooms-v3' for backward compat

export default function App() {
  const [activeTasks, setActiveTasks] = useLocalStorage<ActiveTask[]>('passover-active-tasks', [])
  const [celebrating, setCelebrating] = useState(false)
  const [celebrationText, setCelebrationText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const { pop, ding, whoosh, fanfare, thud } = useSound()

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const [tabs, setTabs] = useLocalStorage<BoardTab[]>('passover-tabs-v1', defaultTabs)
  const [activeTabId, setActiveTabId] = useLocalStorage<string>('passover-active-tab', 'passover')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [tabDraft, setTabDraft] = useState('')
  const [addingTab, setAddingTab] = useState(false)
  const [newTabDraft, setNewTabDraft] = useState('')
  const tabInputRef = useRef<HTMLInputElement>(null)
  const newTabInputRef = useRef<HTMLInputElement>(null)

  // ── Main title ────────────────────────────────────────────────────────────────
  const [mainTitle, setMainTitle] = useLocalStorage('passover-label-main', 'ניקיון פסח ✨')
  const [editingMain, setEditingMain] = useState(false)
  const [mainDraft, setMainDraft] = useState('')
  const mainInputRef = useRef<HTMLInputElement>(null)

  // ── Per-tab rooms storage ─────────────────────────────────────────────────────
  // We keep ONE big map: tabId → Room[]
  // Backward compat: passover tab seeds from defaultRooms
  const [allBoards, setAllBoards] = useLocalStorage<Record<string, Room[]>>(
    'passover-all-boards-v1',
    { passover: defaultRooms, home: [] }
  )

  const currentRooms: Room[] = allBoards[activeTabId] ?? []

  const setCurrentRooms = useCallback((updater: Room[] | ((prev: Room[]) => Room[])) => {
    setAllBoards(prev => {
      const current = prev[activeTabId] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [activeTabId]: next }
    })
  }, [activeTabId, setAllBoards])

  const getRoomsForTab = (tabId: string) => allBoards[tabId] ?? []

  // All rooms combined (for active tasks lookup + export)
  const allRooms: Room[] = tabs.flatMap(tab =>
    (allBoards[tab.id] ?? []).map(r => ({ ...r, section: tab.id as 'passover' | 'home' }))
  )

  // ── Progress ──────────────────────────────────────────────────────────────────
  const totalTasks = currentRooms.reduce((s, r) => s + r.tasks.length, 0)
  const completedTasks = currentRooms.reduce((s, r) => s + r.tasks.filter(t => t.completed).length, 0)
  const overallProgress = totalTasks === 0 ? 0 : completedTasks / totalTasks

  // ── Tab management ────────────────────────────────────────────────────────────
  const handleAddTab = () => {
    if (!newTabDraft.trim()) return
    const id = crypto.randomUUID()
    setTabs(prev => [...prev, { id, label: newTabDraft.trim() }])
    setAllBoards(prev => ({ ...prev, [id]: [] }))
    setActiveTabId(id)
    setNewTabDraft('')
    setAddingTab(false)
    pop()
  }

  const handleDeleteTab = (tabId: string) => {
    if (tabs.length <= 1) return // keep at least one
    setTabs(prev => prev.filter(t => t.id !== tabId))
    setAllBoards(prev => {
      const next = { ...prev }
      delete next[tabId]
      return next
    })
    setActiveTasks(prev => prev.filter(at => !getRoomsForTab(tabId).some(r => r.id === at.roomId)))
    if (activeTabId === tabId) setActiveTabId(tabs.find(t => t.id !== tabId)?.id ?? '')
  }

  const handleRenameTab = (tabId: string, label: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, label } : t))
  }

  const startEditTab = (tab: BoardTab) => {
    setTabDraft(tab.label)
    setEditingTabId(tab.id)
    setTimeout(() => tabInputRef.current?.select(), 50)
  }

  const saveTabEdit = () => {
    if (tabDraft.trim() && editingTabId) handleRenameTab(editingTabId, tabDraft.trim())
    setEditingTabId(null)
  }

  // ── Task lifecycle ────────────────────────────────────────────────────────────
  const handleStartTask = useCallback((roomId: string, taskId: string) => {
    pop()
    if (activeTasks.some(at => at.roomId === roomId && at.taskId === taskId)) return
    setActiveTasks(prev => [...prev, { roomId, taskId, startedAt: Date.now() }])
    const room = allRooms.find(r => r.id === roomId)
    track('task_started', { room: room?.name, task: room?.tasks.find(t => t.id === taskId)?.text })
  }, [pop, activeTasks, allRooms])

  const handleStopTask = useCallback((roomId: string, taskId: string) => {
    const room = allRooms.find(r => r.id === roomId)
    const task = room?.tasks.find(t => t.id === taskId)
    if (task) {
      fanfare()
      setCelebrationText(task.text)
      setCelebrating(true)
      const activeEntry = activeTasks.find(at => at.roomId === roomId && at.taskId === taskId)
      const elapsed = activeEntry ? Math.floor((Date.now() - activeEntry.startedAt) / 1000) : undefined
      track('task_completed', { room: room?.name, task: task.text, elapsed_seconds: elapsed })
      // find which tab owns this room
      const ownerTabId = tabs.find(tab => (allBoards[tab.id] ?? []).some(r => r.id === roomId))?.id
      if (ownerTabId) {
        setAllBoards(prev => ({
          ...prev,
          [ownerTabId]: (prev[ownerTabId] ?? []).map(r =>
            r.id === roomId
              ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, completed: true, completedIn: elapsed } : t) }
              : r
          )
        }))
      }
    }
    setActiveTasks(prev => prev.filter(at => !(at.roomId === roomId && at.taskId === taskId)))
  }, [allRooms, fanfare, activeTasks, tabs, allBoards, setAllBoards])

  const handleToggleTask = useCallback((roomId: string, taskId: string) => {
    const isActive = activeTasks.some(at => at.roomId === roomId && at.taskId === taskId)
    if (isActive) { handleStopTask(roomId, taskId); return }
    setCurrentRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, tasks: room.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
          : room
      )
    )
  }, [activeTasks, handleStopTask, setCurrentRooms])

  const handleAddTask = useCallback((roomId: string, text: string) => {
    setCurrentRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, tasks: [...room.tasks, { id: crypto.randomUUID(), text, completed: false, order: room.tasks.length }] }
          : room
      )
    )
  }, [setCurrentRooms])

  const handleDeleteTask = useCallback((roomId: string, taskId: string) => {
    setActiveTasks(prev => prev.filter(at => !(at.roomId === roomId && at.taskId === taskId)))
    setCurrentRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, tasks: room.tasks.filter(t => t.id !== taskId) }
          : room
      )
    )
  }, [setCurrentRooms])

  const handleRenameRoom = useCallback((roomId: string, name: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, name } : r))
  }, [setCurrentRooms])

  const handleRenameTask = useCallback((roomId: string, taskId: string, text: string) => {
    setCurrentRooms(prev =>
      prev.map(r =>
        r.id === roomId
          ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, text } : t) }
          : r
      )
    )
  }, [setCurrentRooms])

  const handleAddRoom = useCallback((name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => {
    track('room_added', { name, tab: activeTabId })
    setCurrentRooms(prev => [
      ...prev,
      { id: crypto.randomUUID(), name, emoji, colorFrom, colorTo, textColor, tasks: [], order: prev.length },
    ])
  }, [setCurrentRooms, activeTabId])

  const handleDeleteRoom = useCallback((roomId: string) => {
    setActiveTasks(prev => prev.filter(at => at.roomId !== roomId))
    setCurrentRooms(prev => prev.filter(r => r.id !== roomId))
  }, [setCurrentRooms])

  // ── Notes & Images ────────────────────────────────────────────────────────────
  const handleAddTaskNote = useCallback((roomId: string, taskId: string, text: string) => {
    const note: Note = { id: crypto.randomUUID(), text, createdAt: Date.now() }
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, notes: [...(t.notes ?? []), note] } : t) } : r))
  }, [setCurrentRooms])

  const handleEditTaskNote = useCallback((roomId: string, taskId: string, noteId: string, text: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, notes: (t.notes ?? []).map(n => n.id === noteId ? { ...n, text, editedAt: Date.now() } : n) } : t) } : r))
  }, [setCurrentRooms])

  const handleDeleteTaskNote = useCallback((roomId: string, taskId: string, noteId: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, notes: (t.notes ?? []).filter(n => n.id !== noteId) } : t) } : r))
  }, [setCurrentRooms])

  const handleAddTaskImages = useCallback((roomId: string, taskId: string, imgs: ImageAttachment[]) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, images: [...(t.images ?? []), ...imgs] } : t) } : r))
  }, [setCurrentRooms])

  const handleDeleteTaskImage = useCallback((roomId: string, taskId: string, imageId: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, images: (t.images ?? []).filter(i => i.id !== imageId) } : t) } : r))
  }, [setCurrentRooms])

  const handleAddRoomNote = useCallback((roomId: string, text: string) => {
    const note: Note = { id: crypto.randomUUID(), text, createdAt: Date.now() }
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, notes: [...(r.notes ?? []), note] } : r))
  }, [setCurrentRooms])

  const handleEditRoomNote = useCallback((roomId: string, noteId: string, text: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, notes: (r.notes ?? []).map(n => n.id === noteId ? { ...n, text, editedAt: Date.now() } : n) } : r))
  }, [setCurrentRooms])

  const handleDeleteRoomNote = useCallback((roomId: string, noteId: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, notes: (r.notes ?? []).filter(n => n.id !== noteId) } : r))
  }, [setCurrentRooms])

  const handleAddRoomImages = useCallback((roomId: string, imgs: ImageAttachment[]) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: [...(r.images ?? []), ...imgs] } : r))
  }, [setCurrentRooms])

  const handleDeleteRoomImage = useCallback((roomId: string, imageId: string) => {
    setCurrentRooms(prev => prev.map(r => r.id === roomId ? { ...r, images: (r.images ?? []).filter(i => i.id !== imageId) } : r))
  }, [setCurrentRooms])

  const handleExport = () => {
    pop()
    exportToExcel(allRooms)
    track('export_excel', { rooms: allRooms.length })
  }

  const currentRoomIds = new Set(currentRooms.map(r => r.id))
  const currentActiveTasks = activeTasks.filter(at => currentRoomIds.has(at.roomId))
  const activeTabLabel = tabs.find(t => t.id === activeTabId)?.label ?? ''

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-gray-100 relative overflow-hidden">
      <CelebrationOverlay active={celebrating} taskText={celebrationText} onDismiss={() => setCelebrating(false)} />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute rounded-full animate-float-up pointer-events-none"
          style={{
            left: `${(i * 5 + 2.5) % 100}%`,
            width: `${3 + (i % 4)}px`, height: `${3 + (i % 4)}px`,
            background: ['#8B5CF6','#EC4899','#06B6D4','#F59E0B','#EF4444','#10B981'][i % 6],
            boxShadow: `0 0 ${8 + (i % 5) * 2}px currentColor`,
            animationDuration: `${8 + (i % 8) * 1.5}s`,
            animationDelay: `${(i % 10) * 0.8}s`,
            bottom: '-10px', opacity: 0.4,
          }}
        />
      ))}

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* Top bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex items-center justify-between mb-6 flex-wrap gap-3"
        >
          <span className="text-sm text-gray-500">חג פסח שמח 🍷 ממשפחת גרוסמן</span>
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
            >
              <span>📊</span><span>ייצוא Excel</span>
            </motion.button>
            <motion.div
              animate={{ boxShadow: ['0 0 15px rgba(139,92,246,0.1)','0 0 25px rgba(139,92,246,0.25)','0 0 15px rgba(139,92,246,0.1)'] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-gray-400 text-sm"
            >
              <span className="text-lg">📺</span>
              <span>טיפ: הקרינו על הטלוויזיה בסלון לחוויה הכי טובה!</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Main title — editable */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          {editingMain ? (
            <input
              ref={mainInputRef}
              value={mainDraft}
              onChange={e => setMainDraft(e.target.value)}
              onBlur={() => { if (mainDraft.trim()) setMainTitle(mainDraft.trim()); setEditingMain(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { if (mainDraft.trim()) setMainTitle(mainDraft.trim()); setEditingMain(false) }
                if (e.key === 'Escape') setEditingMain(false)
              }}
              className="text-5xl md:text-7xl font-black text-center bg-transparent border-b-2 border-purple-400 focus:outline-none w-full text-pink-300"
              dir="rtl" autoFocus
            />
          ) : (
            <div className="group/title flex items-center justify-center gap-3">
              <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-l from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                {mainTitle}
              </h1>
              <button
                onClick={() => { setMainDraft(mainTitle); setEditingMain(true); setTimeout(() => mainInputRef.current?.select(), 50) }}
                className="opacity-0 group-hover/title:opacity-100 p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all text-xl"
              >✏️</button>
            </div>
          )}
        </motion.div>

        {/* ── Tabs row ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex justify-center flex-wrap gap-2 mb-8"
        >
          {tabs.map(tab => {
            const isActive = activeTabId === tab.id
            const isEditing = editingTabId === tab.id
            return (
              <div key={tab.id} className="relative group/tab flex items-center gap-1">
                {isEditing ? (
                  <input
                    ref={tabInputRef}
                    value={tabDraft}
                    onChange={e => setTabDraft(e.target.value)}
                    onBlur={saveTabEdit}
                    onKeyDown={e => { if (e.key === 'Enter') saveTabEdit(); if (e.key === 'Escape') setEditingTabId(null) }}
                    className={`px-5 py-2.5 rounded-2xl text-base font-bold focus:outline-none text-center ${isActive ? 'bg-gradient-to-l from-purple-600 to-pink-500 text-white' : 'bg-white/10 text-gray-200 border border-white/20'}`}
                    style={{ minWidth: '120px' }} dir="rtl" autoFocus
                  />
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { pop(); setActiveTabId(tab.id) }}
                      className={`px-5 py-2.5 rounded-2xl text-base font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-l from-purple-600 to-pink-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {tab.label}
                    </motion.button>
                    {/* Edit tab name */}
                    <button
                      onClick={() => startEditTab(tab)}
                      className="opacity-0 group-hover/tab:opacity-100 p-1 rounded-lg hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-all text-xs"
                      title="ערוך שם"
                    >✏️</button>
                    {/* Delete tab — only if more than 1 */}
                    {tabs.length > 1 && (
                      <button
                        onClick={() => handleDeleteTab(tab.id)}
                        className="opacity-0 group-hover/tab:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-700 hover:text-red-400 transition-all text-xs"
                        title="מחק לשונית"
                      >✕</button>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {/* Add new tab */}
          {addingTab ? (
            <div className="flex items-center gap-2">
              <input
                ref={newTabInputRef}
                value={newTabDraft}
                onChange={e => setNewTabDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTab(); if (e.key === 'Escape') { setAddingTab(false); setNewTabDraft('') } }}
                placeholder="שם הלשונית..."
                className="px-4 py-2 rounded-2xl bg-white/10 border border-purple-500/40 text-gray-200 placeholder:text-gray-500 focus:outline-none text-sm"
                dir="rtl" autoFocus
              />
              <button onClick={handleAddTab} className="px-3 py-2 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm hover:bg-purple-500/30 transition-all">
                הוסף
              </button>
              <button onClick={() => { setAddingTab(false); setNewTabDraft('') }} className="px-3 py-2 rounded-2xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-all">
                ביטול
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setAddingTab(true); setTimeout(() => newTabInputRef.current?.focus(), 50) }}
              className="px-4 py-2.5 rounded-2xl border border-dashed border-white/20 text-gray-500 hover:text-purple-400 hover:border-purple-500/30 text-sm transition-all"
            >
              + לשונית חדשה
            </motion.button>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{completedTasks}/{totalTasks} משימות הושלמו</span>
            <span className="font-mono">{Math.round(overallProgress * 100)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
              animate={{ width: `${overallProgress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Active tasks */}
        <ActiveTaskCards activeTasks={currentActiveTasks} rooms={currentRooms} onStop={handleStopTask} onPlayPop={pop} />

        {/* Divider */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-l from-transparent via-purple-500/20 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <AnimatePresence mode="wait">
              <motion.span key={activeTabId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="bg-[#0F0F1A] px-4 text-sm text-gray-500 font-medium"
              >
                {activeTabLabel}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Room grid */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTabId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentRooms.sort((a, b) => a.order - b.order).map((room, i) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <RoomCard
                  room={room}
                  isActiveRoom={currentActiveTasks.some(at => at.roomId === room.id)}
                  activeTaskIds={currentActiveTasks.filter(at => at.roomId === room.id).map(at => at.taskId)}
                  onStartTask={handleStartTask}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteRoom={handleDeleteRoom}
                  onRenameRoom={handleRenameRoom}
                  onRenameTask={handleRenameTask}
                  onAddTaskNote={handleAddTaskNote}
                  onEditTaskNote={handleEditTaskNote}
                  onDeleteTaskNote={handleDeleteTaskNote}
                  onAddTaskImages={handleAddTaskImages}
                  onDeleteTaskImage={handleDeleteTaskImage}
                  onAddRoomNote={handleAddRoomNote}
                  onEditRoomNote={handleEditRoomNote}
                  onDeleteRoomNote={handleDeleteRoomNote}
                  onAddRoomImages={handleAddRoomImages}
                  onDeleteRoomImage={handleDeleteRoomImage}
                  onPlayPop={pop}
                  onPlayDing={ding}
                  onPlayWhoosh={whoosh}
                  onPlayThud={thud}
                />
              </motion.div>
            ))}

            {/* Add room button */}
            <motion.button
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: currentRooms.length * 0.06 }}
              whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
              onClick={() => { pop(); setModalOpen(true) }}
              className="w-full rounded-3xl min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 text-gray-500 hover:text-purple-400 hover:border-purple-500/30 transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <motion.span className="text-5xl mb-2" animate={{ rotate: [0, 90, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
                +
              </motion.span>
              <span className="text-lg font-semibold">הוסף חדר</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="flex justify-end items-center gap-2 mt-12 text-gray-600 text-sm"
        >
          <span>נבנה ע״י Omri Grossman</span>
          <a href="https://www.linkedin.com/in/omri-grossman-58384511b/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </motion.div>
      </div>

      <AddRoomModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddRoom} onPlayPop={pop} onPlayWhoosh={whoosh} />
    </div>
  )
}
