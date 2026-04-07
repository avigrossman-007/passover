import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from './Confetti'

interface CelebrationOverlayProps {
  active: boolean
  taskText: string
  onDismiss: () => void
}

export default function CelebrationOverlay({ active, taskText, onDismiss }: CelebrationOverlayProps) {
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
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-7xl md:text-9xl font-bold font-serif text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            >
              כל הכבוד! 🎉
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl text-white/90 mt-6 drop-shadow-lg"
            >
              ✨ {taskText} — סיימנו
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
