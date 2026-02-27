import { useState } from 'react'
import { Play, Pause, RotateCcw, Zap, Clock } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { ProgressBar } from '../components/ProgressBar'
import { StatCard } from '../components/StatCard'
import { ActivityLog } from '../components/ActivityLog'
import { CourtBreakdown } from '../components/CourtBreakdown'
import { startScraper, pauseScraper, retryFailed } from '../api/client'

function ScraperSection({
  title,
  subtitle,
  stats,
  mode,
  isRunning,
  onStart,
  onPause,
  onRetry
}) {
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    await onStart(mode)
    setLoading(false)
  }

  const handlePause = async () => {
    setLoading(true)
    await onPause()
    setLoading(false)
  }

  const handleRetry = async () => {
    setLoading(true)
    await onRetry(mode)
    setLoading(false)
  }

  // Format hours to days/hours
  const formatTimeRemaining = (hours) => {
    if (!hours) return null
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (days > 0) {
      return `${days}.${Math.floor(remainingHours / 2.4)} days`
    }
    return `${hours} hours`
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {title}
          </h2>
          <p className="text-xs text-text-dim mt-0.5">{subtitle}</p>
        </div>
        {mode === 'details' && (
          <span className="text-[10px] text-text-dim bg-black/5 px-2 py-0.5 rounded">
            Runs independently
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={stats.pct_complete}
        color={isRunning ? 'primary' : 'success'}
        animated={true}
        className="mb-5"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard
          value={mode === 'index' ? stats.listed : stats.fetched}
          label={mode === 'index' ? 'Listed' : 'Fetched'}
          color="success"
          size="md"
        />
        <StatCard
          value={mode === 'index' ? stats.pending : stats.listed_not_fetched}
          label={mode === 'index' ? 'Pending' : 'Not Fetched'}
          color="muted"
          size="md"
        />
        <StatCard
          value={stats.failed}
          label="Failed"
          color={stats.failed > 0 ? 'danger' : 'muted'}
          size="md"
          action={stats.failed > 0 ? {
            label: 'Retry',
            icon: RotateCcw,
            onClick: handleRetry
          } : null}
        />
      </div>

      {/* Speed Row (only for index when running) */}
      {mode === 'index' && isRunning && stats.speed_pages_per_min && (
        <div className="flex items-center gap-4 text-sm text-text-muted mb-5 pb-5 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-warning" />
            <span>~{stats.speed_pages_per_min} pages/min</span>
          </div>
          <span className="text-text-dim">·</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>Est. {formatTimeRemaining(stats.est_hours_remaining)} remaining</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        {isRunning ? (
          <button
            onClick={handlePause}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning border border-warning/20 rounded-lg text-sm font-medium hover:bg-warning/15 transition-colors disabled:opacity-50"
          >
            <Pause size={16} />
            Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Play size={16} />
            Start {mode === 'index' ? 'Index' : 'Details'} Scraper
          </button>
        )}

        {isRunning && stats.running > 0 && (
          <span className="text-xs text-text-muted">
            <span className="font-mono text-text">{stats.running}</span> workers active
          </span>
        )}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { stats, activity, loading, error, lastUpdated } = useStats(10000)

  const handleStart = async (mode) => {
    try {
      await startScraper(3, mode)
    } catch (err) {
      console.error('Failed to start scraper:', err)
    }
  }

  const handlePause = async () => {
    try {
      await pauseScraper()
    } catch (err) {
      console.error('Failed to pause scraper:', err)
    }
  }

  const handleRetry = async (mode) => {
    try {
      await retryFailed(mode)
    } catch (err) {
      console.error('Failed to retry:', err)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center">
        <p className="text-danger font-medium">Cannot connect to backend</p>
        <p className="text-sm text-text-muted mt-1">
          Is the server running at localhost:8000?
        </p>
      </div>
    )
  }

  const isIndexRunning = stats?.scraper_status === 'running'
  const isDetailsRunning = stats?.details?.running > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Scraping progress and live activity
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-text-dim">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Scrapers */}
        <div className="col-span-7 space-y-6">
          {/* Case Index Section */}
          <ScraperSection
            title="Case Index"
            subtitle="Cases discovered from listing pages"
            stats={stats?.index || {}}
            mode="index"
            isRunning={isIndexRunning}
            onStart={handleStart}
            onPause={handlePause}
            onRetry={handleRetry}
          />

          {/* Case Details Section */}
          <ScraperSection
            title="Case Details"
            subtitle="Full data fetched for listed cases"
            stats={stats?.details || {}}
            mode="details"
            isRunning={isDetailsRunning}
            onStart={handleStart}
            onPause={handlePause}
            onRetry={handleRetry}
          />
        </div>

        {/* Right Column - Courts + Activity */}
        <div className="col-span-5 space-y-6">
          {/* Cases by Court */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              Cases by Court
            </h2>
            <CourtBreakdown courts={stats?.courts || []} initialLimit={5} />
          </div>

          {/* Activity Log */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              Activity Log
            </h2>
            <ActivityLog events={activity?.events || []} maxHeight={280} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
