import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { presetEmojis, presetColors } from '../data/defaultRooms'

interface AddRoomModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, emoji: string, colorFrom: string, colorTo: string, textColor: string) => void
  onPlayPop: () => void
  onPlayWhoosh: () => void
}

export default function AddRoomModal({ open, onClose, onAdd, onPlayPop, onPlayWhoosh }: AddRoomModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🧹')
  const [colorIdx, setColorIdx] = useState(0)

  const handleSubmit = () => {
    if (!name.trim()) return
    onPlayWhoosh()
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
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#1A1A2E] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-2xl font-bold font-serif text-gray-100 mb-6">הוספת חדר חדש ✨</h2>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם החדר..."
              className="w-full text-xl p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none mb-6 text-right transition-all"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            <p className="text-lg font-semibold text-gray-400 mb-3">בחר אימוג׳י</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {presetEmojis.map(e => (
                <motion.button
                  key={e}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { onPlayPop(); setEmoji(e) }}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    emoji === e
                      ? 'bg-purple-500/20 scale-110 ring-2 ring-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {e}
                </motion.button>
              ))}
            </div>

            <p className="text-lg font-semibold text-gray-400 mb-3">בחר צבע</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {presetColors.map((c, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { onPlayPop(); setColorIdx(i) }}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    colorIdx === i
                      ? 'scale-110 ring-2 ring-white/40 ring-offset-2 ring-offset-[#1A1A2E] shadow-lg'
                      : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                    boxShadow: colorIdx === i ? `0 0 20px ${c.from}60` : undefined,
                  }}
                />
              ))}
            </div>

            {/* Preview */}
            <motion.div
              layout
              className="rounded-2xl p-6 mb-6 text-center border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${presetColors[colorIdx].from}33, ${presetColors[colorIdx].to}33)`,
                color: presetColors[colorIdx].from,
                boxShadow: `0 0 30px ${presetColors[colorIdx].from}20`,
              }}
            >
              <motion.div
                key={emoji}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-5xl mb-2"
                style={{ filter: `drop-shadow(0 0 15px ${presetColors[colorIdx].from}60)` }}
              >
                {emoji}
              </motion.div>
              <div className="text-xl font-bold font-serif">{name || 'שם החדר'}</div>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 bg-gradient-to-l from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-30 text-white text-xl font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                הוסף ✨
              </motion.button>
              <button
                onClick={onClose}
                className="px-6 py-4 text-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-2xl transition-colors"
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
