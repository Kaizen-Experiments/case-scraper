import { useState, useEffect } from 'react'
import { X, Play, ChevronDown, ChevronUp, FileText, ExternalLink, Loader2, RotateCcw, Clock, Check, AlertTriangle } from 'lucide-react'

function formatDateLong(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function disposalPill(nature) {
  if (!nature) return null
  const lower = nature.toLowerCase()
  if (lower.includes('disposed')) return { cls: 'text-success', dot: 'bg-success' }
  if (lower.includes('pending')) return { cls: 'text-warning', dot: 'bg-warning' }
  if (lower.includes('dismissed')) return { cls: 'text-danger', dot: 'bg-danger' }
  return { cls: 'text-text-muted', dot: 'bg-text-muted' }
}

function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 py-1.5">
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className="text-[13px] text-text">{value || <span className="text-text-dim">—</span>}</span>
    </div>
  )
}

export function CaseDrawer({ caseData, onClose }) {
  const [snippetOpen, setSnippetOpen] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!caseData) return null

  const pill = disposalPill(caseData.disposal_nature)
  const history = caseData.case_history || []
  const orders = caseData.orders || []
  const displayHistory = showAllHistory ? history : history.slice(0, 5)

  const handleFetch = () => {
    setFetchLoading(true)
    setTimeout(() => setFetchLoading(false), 2000)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[420px] bg-surface border-l border-border shadow-[-8px_0_32px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0">
          <div className="pr-4 min-w-0">
            <p className="font-mono text-sm text-primary">{caseData.cnr}</p>
            <p className="text-[15px] text-text mt-1 leading-snug">{caseData.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-black/5 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Case Information */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-muted mb-3 font-medium">Case Information</h3>
            <div className="space-y-0">
              <FieldRow label="Court" value={caseData.court} />
              <FieldRow label="Judge" value={caseData.judge} />
              <FieldRow label="Registered" value={formatDateLong(caseData.date_registered)} />
              <FieldRow label="Decision" value={formatDateLong(caseData.date_decision)} />
              <div className="grid grid-cols-[130px_1fr] gap-2 py-1.5">
                <span className="text-[13px] text-text-muted">Disposal</span>
                {pill ? (
                  <span className={`text-[13px] flex items-center gap-1.5 ${pill.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                    {caseData.disposal_nature}
                  </span>
                ) : (
                  <span className="text-[13px] text-text-dim">—</span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Case Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium">Case Details</h3>
              {caseData.detail_status === 'done' && (
                <span className="text-xs text-success flex items-center gap-1"><Check size={12} /> Fetched</span>
              )}
            </div>

            {caseData.detail_status === 'pending' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock size={14} className="text-warning" />
                  Details not yet fetched
                </div>
                <button
                  onClick={handleFetch}
                  disabled={fetchLoading}
                  className="w-full h-9 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetchLoading ? <><Loader2 size={14} className="animate-spin" /> Fetching...</> : <><Play size={14} /> Fetch Details Now</>}
                </button>
              </div>
            )}

            {caseData.detail_status === 'running' && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 size={14} className="animate-spin" />
                Fetching details...
              </div>
            )}

            {caseData.detail_status === 'failed' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle size={14} />
                  Failed to fetch details
                </div>
                <button
                  onClick={handleFetch}
                  disabled={fetchLoading}
                  className="w-full h-9 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm font-medium hover:bg-danger/15 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetchLoading ? <><Loader2 size={14} className="animate-spin" /> Retrying...</> : <><RotateCcw size={14} /> Retry</>}
                </button>
              </div>
            )}

            {caseData.detail_status === 'done' && (
              <div className="space-y-0">
                <FieldRow label="Petitioner" value={caseData.petitioner} />
                <FieldRow label="Respondent" value={caseData.respondent} />
                <FieldRow label="Case Type" value={caseData.case_type} />
                <FieldRow label="Status" value={caseData.disposal_nature} />
                <FieldRow label="Next Hearing" value={formatDateLong(caseData.next_hearing)} />
                <FieldRow label="Bench" value={caseData.bench} />
              </div>
            )}
          </div>

          {/* Case History (only when details fetched) */}
          {caseData.detail_status === 'done' && history.length > 0 && (
            <>
              <hr className="border-border" />
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-muted mb-3 font-medium">Case History</h3>
                <div className="space-y-0">
                  {displayHistory.map((h, i) => (
                    <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                      <span className="font-mono text-xs text-text-muted whitespace-nowrap">{formatDateLong(h.date)}</span>
                      <span className="text-[13px] text-text">{h.event}</span>
                    </div>
                  ))}
                </div>
                {history.length > 5 && (
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-xs text-primary hover:text-primary-hover mt-2 flex items-center gap-1"
                  >
                    {showAllHistory ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> View all {history.length} entries</>}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Orders (only when details fetched) */}
          {caseData.detail_status === 'done' && orders.length > 0 && (
            <>
              <hr className="border-border" />
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-muted mb-3 font-medium">Orders & Judgments</h3>
                <div className="space-y-2">
                  {orders.map((o, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-text-muted" />
                        <span className="text-[13px] text-text">Order — {formatDateLong(o.date)}</span>
                      </div>
                      <a href={o.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover flex items-center gap-1">
                        View PDF <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Snippet */}
          <hr className="border-border" />
          <div>
            <button
              onClick={() => setSnippetOpen(!snippetOpen)}
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium w-full"
            >
              Snippet
              {snippetOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {snippetOpen && (
              <div className="mt-3 bg-bg rounded-lg p-3 text-xs font-mono text-text-muted leading-relaxed">
                {caseData.court?.toUpperCase()} — MAIN CASE: {caseData.cnr}
                <br />
                {caseData.title}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CaseDrawer
