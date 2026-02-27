import { useState, useMemo } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { exportData, mockStats } from '../api/client'

const courts = mockStats.courts
const allCasesCount = mockStats.index.listed
const detailsFetchedCount = mockStats.details.fetched

const listingFields = [
  { key: 'cnr', label: 'CNR number', default: true },
  { key: 'title', label: 'Case title', default: true },
  { key: 'court', label: 'Court', default: true },
  { key: 'judge', label: 'Judge', default: true },
  { key: 'date_registered', label: 'Date registered', default: true },
  { key: 'date_decision', label: 'Date decision', default: true },
  { key: 'disposal_nature', label: 'Disposal', default: true },
  { key: 'snippet', label: 'Snippet text', default: false },
]

const detailFields = [
  { key: 'petitioner', label: 'Petitioner', default: false },
  { key: 'respondent', label: 'Respondent', default: false },
  { key: 'case_type', label: 'Case type', default: false },
  { key: 'next_hearing', label: 'Next hearing', default: false },
  { key: 'bench', label: 'Bench', default: false },
  { key: 'case_history', label: 'Case history', default: false },
  { key: 'orders', label: 'Orders list', default: false },
]

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `~${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `~${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function Export() {
  const [scope, setScope] = useState('all')
  const [selectedCourt, setSelectedCourt] = useState(courts[0]?.name || '')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [format, setFormat] = useState('csv')
  const [fields, setFields] = useState(() => {
    const initial = {}
    listingFields.forEach(f => { initial[f.key] = f.default })
    detailFields.forEach(f => { initial[f.key] = f.default })
    return initial
  })
  const [downloading, setDownloading] = useState(false)

  const toggleField = (key) => {
    setFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAll = (group) => {
    const updates = {}
    group.forEach(f => { updates[f.key] = true })
    setFields(prev => ({ ...prev, ...updates }))
  }

  const clearAll = (group) => {
    const updates = {}
    group.forEach(f => { updates[f.key] = false })
    setFields(prev => ({ ...prev, ...updates }))
  }

  const estimatedRows = useMemo(() => {
    if (scope === 'all') return allCasesCount
    if (scope === 'court') return courts.find(c => c.name === selectedCourt)?.listed || 0
    if (scope === 'date_range') return Math.round(allCasesCount * 0.3)
    if (scope === 'details_only') return detailsFetchedCount
    return allCasesCount
  }, [scope, selectedCourt])

  const selectedFields = Object.entries(fields).filter(([, v]) => v).map(([k]) => k)
  const bytesPerRow = format === 'csv' ? 160 : format === 'json' ? 280 : 260
  const estimatedSize = estimatedRows * bytesPerRow

  const previewHeader = selectedFields.join(',')
  const previewRows = [
    'APHC010460892016,"M. Seenappa vs PRL Secretary","AP HC","Tarlada Rajasekhar Rao","2016-04-18","2024-12-01","Disposed"',
    'JKHC010028062023,"Kefayat Ahmad vs Union Territory","J&K HC","Justice Rajnesh Oswal","2023-06-12","","Pending"',
  ]

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await exportData({
        format,
        scope,
        court: scope === 'court' ? selectedCourt : undefined,
        from: scope === 'date_range' ? fromDate : undefined,
        to: scope === 'date_range' ? toDate : undefined,
        fields: selectedFields,
      })
    } catch {
      // ignore
    }
    setTimeout(() => setDownloading(false), 2000)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text">Export Data</h1>
        <p className="text-sm text-text-muted mt-0.5">Configure and download a subset of the scraped dataset</p>
      </div>

      {/* Scope */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-1">Scope</h2>
        <p className="text-sm text-text-muted mb-4">What data do you want to export?</p>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input type="radio" name="scope" value="all" checked={scope === 'all'} onChange={() => setScope('all')} className="accent-primary" />
              <span className="text-sm text-text">All cases</span>
            </div>
            <span className="font-mono text-xs text-text-muted">{allCasesCount.toLocaleString()} cases</span>
          </label>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="scope" value="court" checked={scope === 'court'} onChange={() => setScope('court')} className="accent-primary" />
              <span className="text-sm text-text">By court</span>
            </label>
            {scope === 'court' && (
              <select
                value={selectedCourt}
                onChange={e => setSelectedCourt(e.target.value)}
                className="mt-2 ml-7 h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text focus:outline-none focus:border-primary"
              >
                {courts.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.listed.toLocaleString()})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="scope" value="date_range" checked={scope === 'date_range'} onChange={() => setScope('date_range')} className="accent-primary" />
              <span className="text-sm text-text">By date range</span>
            </label>
            {scope === 'date_range' && (
              <div className="flex items-center gap-2 mt-2 ml-7">
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary" />
                <span className="text-text-dim">—</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary" />
              </div>
            )}
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <input type="radio" name="scope" value="details_only" checked={scope === 'details_only'} onChange={() => setScope('details_only')} className="accent-primary" />
              <div>
                <span className="text-sm text-text">Details fetched only</span>
                <p className="text-xs text-text-muted mt-0.5">Only cases where full details have been scraped</p>
              </div>
            </div>
            <span className="font-mono text-xs text-text-muted">{detailsFetchedCount.toLocaleString()} cases</span>
          </label>
        </div>
      </div>

      {/* Format */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-4">Format</h2>
        <div className="space-y-3">
          {[
            { value: 'csv', label: 'CSV', desc: 'Spreadsheet-compatible, opens in Excel or Google Sheets' },
            { value: 'json', label: 'JSON', desc: 'Nested structure, best for developers and APIs' },
            { value: 'jsonl', label: 'JSON Lines', desc: 'One record per line — best for files over 500k rows' },
          ].map(f => (
            <label key={f.value} className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} className="accent-primary mt-0.5" />
              <div>
                <span className="text-sm text-text font-medium">{f.label}</span>
                <p className="text-xs text-text-muted mt-0.5">{f.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-1">Fields</h2>
        <p className="text-sm text-text-muted mb-4">Choose which fields to include</p>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium">Listing Data</span>
            <div className="flex gap-2">
              <button onClick={() => selectAll(listingFields)} className="text-xs text-primary hover:text-primary-hover">Select all</button>
              <button onClick={() => clearAll(listingFields)} className="text-xs text-text-muted hover:text-text">Clear all</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {listingFields.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fields[f.key]} onChange={() => toggleField(f.key)} className="accent-primary" />
                <span className="text-sm text-text">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium">Details Data</span>
            <div className="flex gap-2">
              <button onClick={() => selectAll(detailFields)} className="text-xs text-primary hover:text-primary-hover">Select all</button>
              <button onClick={() => clearAll(detailFields)} className="text-xs text-text-muted hover:text-text">Clear all</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {detailFields.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fields[f.key]} onChange={() => toggleField(f.key)} className="accent-primary" />
                <span className="text-sm text-text-muted">{f.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-text-dim mt-3">Detail fields will be empty for cases where details have not been fetched yet.</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-4">Preview</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs text-text-muted">Estimated rows</span>
            <p className="font-mono text-lg text-text">{estimatedRows.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-text-muted">Estimated size</span>
            <p className="font-mono text-lg text-text">{formatSize(estimatedSize)}</p>
          </div>
          <div>
            <span className="text-xs text-text-muted">Fields included</span>
            <p className="font-mono text-lg text-text">{selectedFields.length}</p>
          </div>
        </div>

        {format === 'csv' && selectedFields.length > 0 && (
          <div className="bg-bg rounded-lg p-3 overflow-hidden">
            <pre className="font-mono text-xs text-text-muted leading-relaxed overflow-hidden">
              <span className="text-text">{previewHeader}</span>{'\n'}
              {previewRows.map((row, i) => <span key={i}>{row}{'\n'}</span>)}
            </pre>
            <p className="text-[10px] text-text-dim mt-2">(first 2 rows preview)</p>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading || selectedFields.length === 0}
        className="w-full h-12 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {downloading ? (
          <><Loader2 size={18} className="animate-spin" /> Preparing export...</>
        ) : (
          <><Download size={18} /> Download Export</>
        )}
      </button>
    </div>
  )
}

export default Export
