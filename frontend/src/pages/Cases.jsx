import { useState, useEffect } from 'react'
import { Search, X, Download, ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { getCases, mockStats } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { CaseDrawer } from './CaseDrawer'

const courts = mockStats.courts.map(c => c.name)
const disposalOptions = ['Disposed', 'Pending', 'Dismissed', 'Transferred']

function courtAbbrev(name) {
  const map = {
    'Andhra Pradesh High Court': 'AP HC',
    'High Court of Jammu and Kashmir': 'J&K HC',
    'Patna High Court': 'Patna HC',
    'Bombay High Court': 'Bombay HC',
    'High Court of Punjab and Haryana': 'P&H HC',
    'Madras High Court': 'Madras HC',
    'Allahabad High Court': 'Allahabad HC',
    'Calcutta High Court': 'Calcutta HC',
    'Karnataka High Court': 'Karnataka HC',
    'Gujarat High Court': 'Gujarat HC',
    'Delhi High Court': 'Delhi HC',
  }
  return map[name] || name.replace('High Court', 'HC').replace(' of ', ' ')
}

function courtColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const colors = [
    'bg-primary/10 text-primary border-primary/20',
    'bg-success/10 text-success border-success/20',
    'bg-warning/10 text-warning border-warning/20',
    'bg-danger/10 text-danger border-danger/20',
    'bg-text-muted/10 text-text-muted border-text-muted/20',
  ]
  return colors[Math.abs(hash) % colors.length]
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function disposalColor(disposal) {
  if (!disposal) return 'pending'
  const lower = disposal.toLowerCase()
  if (lower.includes('disposed')) return 'disposed'
  if (lower.includes('pending')) return 'pending'
  if (lower.includes('dismissed')) return 'dismissed'
  return 'pending'
}

export function Cases() {
  const [search, setSearch] = useState('')
  const [court, setCourt] = useState('')
  const [disposal, setDisposal] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCnr, setSelectedCnr] = useState(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const params = { page, limit: perPage }
        if (search) params.q = search
        if (court) params.court = court
        if (disposal) params.disposal = disposal
        if (fromDate) params.from = fromDate
        if (toDate) params.to = toDate
        const result = await getCases(params)
        if (!cancelled) setData(result)
      } catch {
        if (!cancelled) setData(null)
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [page, perPage, court, disposal, fromDate, toDate, search])

  const cases = data?.cases || []
  const total = data?.total || 0
  const totalPages = data?.pages || 1
  const startRow = (page - 1) * perPage + 1
  const endRow = Math.min(page * perPage, total)

  const activeFilters = []
  if (court) activeFilters.push({ key: 'court', label: court, clear: () => setCourt('') })
  if (disposal) activeFilters.push({ key: 'disposal', label: disposal, clear: () => setDisposal('') })
  if (fromDate) activeFilters.push({ key: 'from', label: `From: ${fromDate}`, clear: () => setFromDate('') })
  if (toDate) activeFilters.push({ key: 'to', label: `To: ${toDate}`, clear: () => setToDate('') })

  const clearAllFilters = () => {
    setSearch('')
    setCourt('')
    setDisposal('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const selectedCase = selectedCnr ? cases.find(c => c.cnr === selectedCnr) : null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Cases</h1>
          <p className="text-sm text-text-muted mt-0.5">Search and browse collected case data</p>
        </div>
        <span className="font-mono text-sm text-text-muted">{total.toLocaleString()} total</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by CNR or party name..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <select
            value={court}
            onChange={e => { setCourt(e.target.value); setPage(1) }}
            className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Courts</option>
            {courts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={disposal}
            onChange={e => { setDisposal(e.target.value); setPage(1) }}
            className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Disposals</option>
            {disposalOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-text-muted uppercase tracking-wide mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPage(1) }}
            className="h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted uppercase tracking-wide mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPage(1) }}
            className="h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map(f => (
            <span key={f.key} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20">
              {f.label}
              <button onClick={f.clear} className="hover:text-primary-hover"><X size={12} /></button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="text-xs text-text-muted hover:text-text transition-colors">Clear all</button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          Showing <span className="font-mono text-text">{startRow.toLocaleString()}</span>–<span className="font-mono text-text">{endRow.toLocaleString()}</span> of <span className="font-mono text-text">{total.toLocaleString()}</span> cases
          {activeFilters.length > 0 && <span className="text-text-dim ml-1">(filtered)</span>}
        </span>
        <button className="flex items-center gap-1.5 text-xs text-primary border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors">
          <Download size={14} />
          Export filtered
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-12">#</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[180px]">CNR</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3">Title</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[180px]">Court</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[110px]">Registered</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[110px]">Decision</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[140px]">Disposal</th>
                <th className="text-center text-[11px] uppercase tracking-wider text-text-muted font-medium px-4 py-3 w-[120px]">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-border/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <SearchX size={40} className="mx-auto text-text-dim mb-3" />
                    <p className="text-text-muted">No cases match your filters</p>
                    <button onClick={clearAllFilters} className="text-sm text-primary hover:text-primary-hover mt-2">Clear all filters</button>
                  </td>
                </tr>
              ) : (
                cases.map((c, i) => (
                  <tr
                    key={c.cnr}
                    onClick={() => setSelectedCnr(c.cnr)}
                    className={`border-b border-border cursor-pointer transition-colors ${
                      selectedCnr === c.cnr
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : 'hover:bg-black/3'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{startRow + i}</td>
                    <td className="px-4 py-3 font-mono text-sm text-primary truncate max-w-[180px]" title={c.cnr}>{c.cnr}</td>
                    <td className="px-4 py-3 text-sm text-text truncate max-w-[300px]" title={c.title}>{c.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-md border ${courtColor(c.court)}`}>
                        {courtAbbrev(c.court)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">{formatDate(c.date_registered) || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">{formatDate(c.date_decision) || <span className="text-text-dim">—</span>}</td>
                    <td className="px-4 py-3">
                      {c.disposal_nature ? (
                        <StatusBadge status={disposalColor(c.disposal_nature)} showIcon={false} size="xs" />
                      ) : (
                        <span className="text-text-dim text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.detail_status === 'done' && <span className="text-success text-xs font-medium">Fetched</span>}
                      {c.detail_status === 'pending' && <span className="text-warning text-xs">Pending</span>}
                      {c.detail_status === 'running' && <span className="text-primary text-xs">Running...</span>}
                      {c.detail_status === 'failed' && <span className="text-danger text-xs">Failed</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && cases.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {getPageNumbers().map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-mono transition-colors ${
                p === page
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text hover:bg-black/5'
              }`}
            >
              {p}
            </button>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-text-dim px-1">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-9 h-9 rounded-lg text-sm font-mono text-text-muted hover:text-text hover:bg-black/5 transition-colors"
              >
                {totalPages.toLocaleString()}
              </button>
            </>
          )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
            className="ml-4 h-9 bg-surface border border-border rounded-lg px-2 text-xs text-text-muted focus:outline-none"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      )}

      {/* Case Drawer */}
      {selectedCnr && (
        <CaseDrawer
          caseData={selectedCase}
          onClose={() => setSelectedCnr(null)}
        />
      )}
    </div>
  )
}

export default Cases
