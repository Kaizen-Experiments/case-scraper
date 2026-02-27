import { useEffect, useRef, useCallback } from 'react'

export function usePolling(callback, interval = 10000, enabled = true) {
  const savedCallback = useRef(callback)
  const intervalRef = useRef(null)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const tick = useCallback(() => {
    savedCallback.current()
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Call immediately on mount
    tick()

    // Then set up the interval
    intervalRef.current = setInterval(tick, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, enabled, tick])

  // Return a function to manually trigger a refresh
  return tick
}

export default usePolling
