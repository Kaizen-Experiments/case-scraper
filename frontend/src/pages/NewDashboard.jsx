import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Globe, Clock, AlertTriangle, X } from 'lucide-react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { usePolling } from '../hooks/usePolling'
import { getLiveCount, getLiveCountHistory, triggerRefresh } from '../api/client'

function fmt(n) { return n.toLocaleString('en-IN') }

function fmtCompact(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function pct(a, b) {
  if (!b) return 0
  return Math.round((a / b) * 1000) / 10
}

const pipeline = [
  { key: 'listed',      label: 'Listed',      desc: 'Judgment entries indexed from portal', barColor: 'bg-primary' },
  { key: 'scraped',     label: 'Scraped',     desc: 'Full case details fetched',          barColor: 'bg-success' },
  { key: 'cleaned',     label: 'Cleaned',     desc: 'Data cleaned and normalized',        barColor: 'bg-[#0ea5e9]' },
  { key: 'structured',  label: 'Structured',  desc: 'Parsed into structured fields',      barColor: 'bg-warning' },
  { key: 'rag',         label: 'RAG',         desc: 'Indexed for retrieval',              barColor: 'bg-danger' },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1 font-medium">{fmtDate(label)}</p>
      {payload.map(e => (
        <div key={e.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-text-muted">{e.name}:</span>
          <span className="font-mono text-text font-medium">{fmt(e.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function NewDashboard() {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [showRefetchModal, setShowRefetchModal] = useState(false)
  const [chartRange, setChartRange] = useState('7d')

  useEffect(() => {
    let cancelled = false
    const days = chartRange === '30d' ? 30 : 7
    getLiveCountHistory(days)
      .then(h => { if (!cancelled) setHistory(h) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [chartRange])

  const fetchLive = useCallback(async () => {
    try {
      const result = await getLiveCount()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch')
    }
    setLoading(false)
  }, [])

  usePolling(fetchLive, refreshing ? 5000 : 60000)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await triggerRefresh()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || 'Refresh failed')
    }
    setRefreshing(false)
  }

  const pipe = data?.pipeline || {}
  const ecourtsTotal = data?.ecourts_total || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Coverage</h1>
          <p className="text-sm text-text-muted mt-0.5">Judgments portal total vs our processing pipeline</p>
        </div>
        <button
          onClick={() => setShowRefetchModal(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refetching...' : 'Refetch from Portal'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5 text-sm text-danger">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* Portal total + Pipeline */}
      {loading && !data ? (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="h-4 w-32 bg-border/50 rounded animate-pulse mb-3" />
          <div className="h-8 w-48 bg-border/50 rounded animate-pulse mb-6" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5">
              <div className="h-3 w-16 bg-border/50 rounded animate-pulse" />
              <div className="flex-1 h-5 bg-border/30 rounded animate-pulse" />
              <div className="h-3 w-20 bg-border/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          {/* Portal hero number */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">Judgments Portal</span>
            </div>
            {data?.last_checked && (
              <span className="flex items-center gap-1 text-[11px] text-text-dim">
                <Clock size={11} />
                Fetched {timeAgo(data.last_checked)}
              </span>
            )}
          </div>
          <p className="text-3xl font-semibold font-mono text-text mb-5">
            {fmt(ecourtsTotal)}
          </p>

          {/* Compact pipeline rows */}
          <div className="space-y-2">
            {pipeline.map((stage, i) => {
              const count = pipe[stage.key] || 0
              const barPct = pct(count, ecourtsTotal)
              const prev = i === 0 ? ecourtsTotal : (pipe[pipeline[i - 1].key] || 0)
              const stepPct = pct(count, prev)

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-text">{stage.label}</span>
                  <div className="flex-1 h-5 bg-border/20 rounded overflow-hidden">
                    <div
                      className={`h-full ${stage.barColor} rounded transition-all duration-700`}
                      style={{ width: `${Math.max(barPct, 0.5)}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right font-mono text-xs text-text">{fmt(count)}</span>
                  <span className="w-12 shrink-0 text-right text-[10px] text-text-dim">{stepPct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom: Trend chart */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Trend
          </h2>
          <div className="flex gap-1 bg-black/5 rounded-lg p-0.5">
            {[['7d', '7 Days'], ['30d', '30 Days']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setChartRange(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  chartRange === key
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {history.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-text-dim text-sm">
            No history data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmtCompact}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="ecourts" name="Portal Total" stroke="#3b7cf5" strokeWidth={2} dot={{ r: 3, fill: '#3b7cf5' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="ours" name="Listed" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a' }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Refetch modal */}
      {showRefetchModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center animate-modal-in" onClick={() => setShowRefetchModal(false)}>
          <div className="bg-surface border border-border rounded-xl p-6 w-[420px] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Refetch Portal Total</h3>
              <button onClick={() => setShowRefetchModal(false)} className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-text-muted mb-2">
              This will scrape the judgments portal to fetch the latest total judgment count. The process may take a few seconds.
            </p>
            {data?.last_checked && (
              <p className="text-xs text-text-dim mb-5">
                Last fetched: {timeAgo(data.last_checked)}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRefetchModal(false)}
                className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowRefetchModal(false); handleRefresh() }}
                className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Refetch Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewDashboard
