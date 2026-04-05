import { useState, useRef, useCallback, useEffect } from 'react'

interface StopwatchControls {
  elapsed: number // seconds
  running: boolean
  start: () => void
  stop: () => number // returns elapsed
  reset: () => void
}

export function useStopwatch(): StopwatchControls {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const clearSW = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clearSW()
    startTimeRef.current = Date.now() - elapsed * 1000
    setRunning(true)
  }, [clearSW, elapsed])

  const stop = useCallback(() => {
    clearSW()
    setRunning(false)
    return elapsed
  }, [clearSW, elapsed])

  const reset = useCallback(() => {
    clearSW()
    setElapsed(0)
    setRunning(false)
    startTimeRef.current = 0
  }, [clearSW])

  useEffect(() => {
    if (!running) return

    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 200)

    return clearSW
  }, [running, clearSW])

  return { elapsed, running, start, stop, reset }
}
