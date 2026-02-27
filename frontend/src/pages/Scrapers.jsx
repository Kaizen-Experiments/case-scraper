import { Play, Pause, Bot, Plus } from 'lucide-react'
import { useDialKit } from 'dialkit'
import { motion } from 'motion/react'

const scrapers = [
  {
    id: 'index',
    name: 'Index Scraper',
    desc: 'Lists judgment entries from the portal',
    status: 'running',
    workers: 3,
    speed: '42 pages/min',
  },
  {
    id: 'detail',
    name: 'Detail Scraper',
    desc: 'Fetches full judgment details and PDFs',
    status: 'stopped',
    workers: 0,
    speed: null,
  },
  {
    id: 'clean',
    name: 'Cleaning Pipeline',
    desc: 'Cleans and normalizes raw scraped data',
    status: 'running',
    workers: 2,
    speed: '120 cases/min',
  },
  {
    id: 'structure',
    name: 'Structuring Pipeline',
    desc: 'Parses cleaned data into structured fields',
    status: 'stopped',
    workers: 0,
    speed: null,
  },
  {
    id: 'rag',
    name: 'RAG Indexer',
    desc: 'Indexes structured data for retrieval',
    status: 'stopped',
    workers: 0,
    speed: null,
  },
]

const statusConfig = {
  running: { label: 'Running', cls: 'bg-success/10 text-success border-success/20' },
  stopped: { label: 'Stopped', cls: 'bg-text-dim/10 text-text-muted border-border' },
  error:   { label: 'Error',   cls: 'bg-danger/10 text-danger border-danger/20' },
}

export function Scrapers() {
  const ui = useDialKit('Scraper Cards', {
    borderRadius: [12, 0, 32],
    padding: [20, 8, 40],
    hoverScale: [1.01, 1, 1.08],
    springDuration: [0.3, 0.1, 1],
    springBounce: [0.15, 0, 0.8],
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Scrapers</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage scraping microservices</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          <Plus size={14} />
          New Scraper
        </button>
      </div>

      {/* Scraper cards */}
      <div className="space-y-4">
        {scrapers.map(s => {
          const cfg = statusConfig[s.status] || statusConfig.stopped
          const isRunning = s.status === 'running'

          return (
            <motion.div
              key={s.id}
              className="bg-surface border border-border shadow-sm"
              style={{ borderRadius: ui.borderRadius, padding: ui.padding }}
              whileHover={{ scale: ui.hoverScale }}
              transition={{ type: 'spring', visualDuration: ui.springDuration, bounce: ui.springBounce }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Bot size={18} className={isRunning ? 'text-primary' : 'text-text-dim'} />
                  <div>
                    <span className="text-sm font-medium text-text">{s.name}</span>
                    <p className="text-xs text-text-muted">{s.desc}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span><span className="font-mono text-text">{s.workers}</span> workers</span>
                  {s.speed && <span className="font-mono text-text">{s.speed}</span>}
                </div>
                {isRunning ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-lg text-xs font-medium hover:bg-warning/15 transition-colors">
                    <Pause size={12} />
                    Pause
                  </button>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors">
                    <Play size={12} />
                    Start
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Scrapers
