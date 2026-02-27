import { useState, useCallback } from 'react'
import { getStats, getActivity } from '../api/client'
import { usePolling } from './usePolling'

export function useStats(pollInterval = 10000) {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        getStats(),
        getActivity(20)
      ])
      setStats(statsData)
      setActivity(activityData)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = usePolling(fetchData, pollInterval)

  return {
    stats,
    activity,
    loading,
    error,
    lastUpdated,
    refresh
  }
}

export default useStats
