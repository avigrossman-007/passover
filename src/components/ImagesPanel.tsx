import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ImageAttachment } from '../types'

interface ImagesPanelProps {
  images: ImageAttachment[]
  accentColor: string
  onAdd: (imgs: ImageAttachment[]) => void
  onDelete: (id: string) => void
  addOnly?: boolean // show only add buttons, no thumbnail grid (used in TaskRow)
}

const MAX_IMAGE_SIZE_MB = 2
const MAX_IMAGES = 20

export default function ImagesPanel({ images, accentColor, onAdd, onDelete, addOnly = false }: ImagesPanelProps) {
  const [open, setOpen] = useState(false)
  const [lightbox, setLightbox] = useState<ImageAttachment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const count = images.length

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`מקסימום ${MAX_IMAGES} תמונות`)
      return
    }
    const toProcess = Array.from(files).slice(0, remaining)
    const results: ImageAttachment[] = []

    for (const file of toProcess) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`תמונה ${file.name} גדולה מדי (מקסימום ${MAX_IMAGE_SIZE_MB}MB)`)
        continue
      }
      const dataUrl = await readAsDataURL(file)
      results.push({
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl,
        createdAt: Date.now(),
      })
    }
    if (results.length > 0) onAdd(results)
  }

  // addOnly mode: compact add buttons only (no toggle/panel)
  if (addOnly) {
    return (
      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => processFiles(e.target.files)} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => processFiles(e.target.files)} />
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 hover:text-gray-300 text-xs transition-all">
          📁 תמונה
        </button>
        <button onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 hover:text-gray-300 text-xs transition-all">
          📷
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }

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
        <span>🖼️</span>
        <span className="font-medium">{count > 0 ? count : 'תמונות'}</span>
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
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => processFiles(e.target.files)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => processFiles(e.target.files)}
              />

              {/* Upload buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all"
                >
                  <span>📁</span>
                  <span>בחר תמונות</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all"
                >
                  <span>📷</span>
                  <span>צלם תמונה</span>
                </motion.button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Thumbnails grid */}
              {images.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-2">אין תמונות עדיין</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map(img => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer"
                      onClick={() => setLightbox(img)}
                    >
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(img.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-red-500/80 text-white text-xs transition-all hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden"
            >
              <img
                src={lightbox.dataUrl}
                alt={lightbox.name}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => onDelete(lightbox.id)}
                  className="p-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 transition-all"
                >
                  🗑️
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
                >
                  ✕
                </button>
              </div>
              <p className="absolute bottom-3 left-3 text-xs text-white/60 bg-black/40 px-2 py-1 rounded-lg">
                {lightbox.name} · {new Date(lightbox.createdAt).toLocaleDateString('he-IL')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
