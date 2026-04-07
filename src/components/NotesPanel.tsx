import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Note } from '../types'

interface NotesPanelProps {
  notes: Note[]
  accentColor: string
  onAdd: (text: string) => void
  onEdit: (id: string, text: string) => void
  onDelete: (id: string) => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function NotesPanel({ notes, accentColor, onAdd, onEdit, onDelete }: NotesPanelProps) {
  const [open, setOpen] = useState(false)
  const [newText, setNewText] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const handleAdd = () => {
    if (!newText.trim()) return
    onAdd(newText.trim())
    setNewText('')
  }

  const handleStartEdit = (note: Note) => {
    setEditId(note.id)
    setEditText(note.text)
  }

  const handleSaveEdit = () => {
    if (editId && editText.trim()) {
      onEdit(editId, editText.trim())
    }
    setEditId(null)
    setEditText('')
  }

  const count = notes.length

  return (
    <div onClick={e => e.stopPropagation()}>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 text-sm transition-all"
        style={count > 0 ? { borderColor: `${accentColor}40`, color: accentColor } : {}}
      >
        <span>📝</span>
        <span className="font-medium">{count > 0 ? count : 'הערות'}</span>
        {count > 0 && <span className="text-xs bg-white/10 rounded-full px-1.5">{count}</span>}
      </motion.button>

      {/* Expandable panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-2"
          >
            <div
              className="rounded-2xl border p-4 space-y-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: `${accentColor}30`,
              }}
            >
              {/* Existing notes */}
              {notes.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-2">אין הערות עדיין</p>
              )}
              {notes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl p-3 bg-white/[0.04] border border-white/5 group"
                >
                  {editId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                        rows={3}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit()
                          if (e.key === 'Escape') setEditId(null)
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs hover:bg-purple-500/30 transition-all"
                        >
                          שמור
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-all"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{note.text}</p>
                        <p className="text-xs text-gray-600 mt-1.5">
                          {formatDate(note.createdAt)}
                          {note.editedAt && note.editedAt !== note.createdAt && (
                            <span className="ml-2 text-gray-700">(עודכן)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all text-sm"
                          title="ערוך"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDelete(note.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all text-sm"
                          title="מחק"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Add note */}
              <div className="flex gap-2 pt-1">
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="הוסף הערה..."
                  rows={2}
                  className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-all"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.ctrlKey) handleAdd()
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="px-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10 disabled:opacity-30 transition-all self-stretch text-lg"
                >
                  +
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
