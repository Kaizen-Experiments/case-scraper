import { useState } from 'react'
import { Activity, Pause, Circle, AlertTriangle } from 'lucide-react'

const statusConfig = {
  running: {
    icon: Activity,
    label: 'workers',
    dotClass: 'bg-success animate-pulse-dot',
    textClass: 'text-success',
    bgClass: 'bg-success/10 border-success/20'
  },
  paused: {
    icon: Pause,
    label: 'Paused',
    dotClass: 'bg-warning',
    textClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20'
  },
  idle: {
    icon: Circle,
    label: 'Idle',
    dotClass: 'bg-text-dim',
    textClass: 'text-text-muted',
    bgClass: 'bg-black/5 border-border'
  },
  error: {
    icon: AlertTriangle,
    label: 'Error',
    dotClass: 'bg-danger',
    textClass: 'text-danger',
    bgClass: 'bg-danger/10 border-danger/20'
  }
}

const mockWorkers = [
  { id: 1, page: 45231, status: 'running' },
  { id: 2, page: 45198, status: 'running' },
  { id: 3, page: 45156, status: 'running' },
]

export function WorkerStatus({ status = 'running', workerCount = 3, workers = mockWorkers }) {
  const [showPopover, setShowPopover] = useState(false)
  const config = statusConfig[status] || statusConfig.idle
  const Icon = config.icon

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        onBlur={() => setTimeout(() => setShowPopover(false), 150)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${config.bgClass} ${config.textClass} hover:brightness-110`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
        {status === 'running' ? (
          <span className="font-mono">{workerCount} {config.label}</span>
        ) : (
          <>
            <Icon size={14} />
            <span>{config.label}</span>
          </>
        )}
      </button>

      {/* Popover */}
      {showPopover && status === 'running' && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl p-3 z-50">
          <div className="text-xs text-text-muted uppercase tracking-wide mb-2">Active Workers</div>
          <ul className="space-y-2">
            {workers.map((worker) => (
              <li key={worker.id} className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Worker {worker.id}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-text">Page {worker.page.toLocaleString()}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default WorkerStatus
