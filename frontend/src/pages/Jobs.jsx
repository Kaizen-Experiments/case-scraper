import { useState, useEffect } from 'react'
import { RotateCcw, AlertTriangle, Loader2, Check, Cog, ChevronLeft, ChevronRight } from 'lucide-react'
import { getJobs, retryJobs, mockJobSummary, mockIndexJobs, mockDetailJobs } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'

const statusFilters = ['all', 'pending', 'running', 'done', 'failed']

function formatDuration(ms) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function attemptsColor(n) {
  if (n <= 1) return 'text-success'
  if (n <= 2) return 'text-warning'
  return 'text-danger'
}

export function Jobs() {
  const [mode, setMode] = useState('index')
  const [statusFilter, setStatusFilter] = useState('failed')
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 50

  const summary = mockJobSummary

  const indexTotal = mockIndexJobs.length
  const detailTotal = mockDetailJobs.length
  const failedCount = summary.total_failed

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const params = { mode, page, limit: perPage }
        if (statusFilter !== 'all') params.status = statusFilter
        const result = await getJobs(params)
        setJobs(result.jobs || [])
        setTotal(result.total || 0)
      } catch {
        setJobs([])
        setTotal(0)
      }
      setLoading(false)
    }
    fetchJobs()
  }, [mode, statusFilter, page])

  const handleRetry = async (errorType) => {
    setRetrying(errorType || 'all')
    try {
      await retryJobs(mode, errorType || null)
    } catch {
      // ignore
    }
    setTimeout(() => setRetrying(null), 1500)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const startRow = (page - 1) * perPage + 1
  const endRow = Math.min(page * perPage, total)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text">Jobs</h1>
        <p className="text-sm text-text-muted mt-0.5">Monitor scrape jobs and manage failures</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => { setMode('index'); setPage(1) }}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            mode === 'index'
              ? 'text-text border-primary'
              : 'text-text-muted border-transparent hover:text-text'
          }`}
        >
          Index Jobs <span className="font-mono text-xs text-text-muted ml-1">({indexTotal.toLocaleString()})</span>
        </button>
        <button
          onClick={() => { setMode('details'); setPage(1) }}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            mode === 'details'
              ? 'text-text border-primary'
              : 'text-text-muted border-transparent hover:text-text'
          }`}
        >
          Detail Jobs <span className="font-mono text-xs text-text-muted ml-1">({detailTotal.toLocaleString()})</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'failed' && failedCount > 0 && (
              <span className="ml-1.5 bg-danger/15 text-danger text-xs px-1.5 py-0.5 rounded font-mono">{failedCount.toLocaleString()}</span>
            )}
          </button>
        ))}
      </div>

      {/* Failed Jobs Summary */}
      {statusFilter === 'failed' && failedCount > 0 && (
        <div className="bg-danger/5 border border-danger/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-danger" />
            <span className="text-sm font-medium text-text">
              <span className="font-mono">{failedCount.toLocaleString()}</span> failed jobs need attention
            </span>
          </div>

          <div className="space-y-3 mb-5">
            {summary.error_breakdown.map(err => (
              <div key={err.type} className="flex items-center gap-3">
                <span className="text-sm text-text-muted w-32">{err.label}</span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger/60 rounded-full"
                    style={{ width: `${err.pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-text w-16 text-right">{err.count.toLocaleString()}</span>
                <span className="text-xs text-text-muted w-10">({err.pct}%)</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleRetry(null)}
              disabled={retrying !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {retrying === 'all' ? <><Loader2 size={14} className="animate-spin" /> Retrying...</> : <><RotateCcw size={14} /> Retry All</>}
            </button>
            {summary.error_breakdown.map(err => (
              <button
                key={err.type}
                onClick={() => handleRetry(err.type)}
                disabled={retrying !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-text-muted rounded-lg text-sm hover:text-text hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                {retrying === err.type ? <><Loader2 size={14} className="animate-spin" /> Retrying...</> : <>Retry {err.label.split(' ')[0]}</>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && jobs.length > 0 && (
        <div className="text-sm text-text-muted">
          Showing <span className="font-mono text-text">{startRow}</span>–<span className="font-mono text-text">{endRow}</span> of <span className="font-mono text-text">{total.toLocaleString()}</span> {statusFilter !== 'all' ? statusFilter : ''} jobs
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {mode === 'index' ? (
                  <>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[100px]">Page #</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[120px]">Status</th>
                    <th className="text-center text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[100px]">Cases Found</th>
                    <th className="text-center text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[90px]">Attempts</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[100px]">Duration</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3">Error</th>
                  </>
                ) : (
                  <>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[180px]">CNR</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[180px]">Court</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[120px]">Status</th>
                    <th className="text-center text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[90px]">Attempts</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[100px]">Duration</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3">Error</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-border/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    {statusFilter === 'failed' ? (
                      <>
                        <Check size={40} className="mx-auto text-success mb-3" />
                        <p className="text-text-muted">No failed jobs</p>
                        <p className="text-sm text-text-dim mt-1">Everything is running smoothly</p>
                      </>
                    ) : (
                      <>
                        <Cog size={40} className="mx-auto text-text-dim mb-3" />
                        <p className="text-text-muted">No jobs yet</p>
                        <p className="text-sm text-text-dim mt-1">Run the scraper to create jobs</p>
                      </>
                    )}
                  </td>
                </tr>
              ) : mode === 'index' ? (
                jobs.map((job, i) => (
                  <tr key={i} className="border-b border-border hover:bg-black/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-text">{job.page_number?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} size="xs" /></td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-text-muted">{job.status === 'done' ? job.cases_found : '—'}</td>
                    <td className={`px-4 py-3 text-center font-mono text-sm ${attemptsColor(job.attempts)}`}>{job.attempts}</td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">{formatDuration(job.duration_ms)}</td>
                    <td className="px-4 py-3 text-sm text-danger truncate max-w-[300px]" title={job.error || ''}>
                      {job.error || <span className="text-text-dim">—</span>}
                    </td>
                  </tr>
                ))
              ) : (
                jobs.map((job, i) => (
                  <tr key={i} className="border-b border-border hover:bg-black/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-primary">{job.cnr}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{job.court}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} size="xs" /></td>
                    <td className={`px-4 py-3 text-center font-mono text-sm ${attemptsColor(job.attempts)}`}>{job.attempts}</td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">{formatDuration(job.duration_ms)}</td>
                    <td className="px-4 py-3 text-sm text-danger truncate max-w-[300px]" title={job.error || ''}>
                      {job.error || <span className="text-text-dim">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && jobs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-text-muted">
            Page <span className="font-mono text-text">{page}</span> of <span className="font-mono text-text">{totalPages.toLocaleString()}</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Jobs
