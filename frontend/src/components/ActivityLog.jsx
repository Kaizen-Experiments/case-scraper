import { useEffect, useRef } from 'react'
import { Check, X, List, Clock } from 'lucide-react'

const eventTypeConfig = {
  listed: {
    icon: List,
    iconClass: 'text-success',
    bgClass: 'bg-success/10'
  },
  detail_fetched: {
    icon: Check,
    iconClass: 'text-success',
    bgClass: 'bg-success/10'
  },
  failed: {
    icon: X,
    iconClass: 'text-danger',
    bgClass: 'bg-danger/10'
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function ActivityLog({ events = [], maxHeight = 280, autoScroll = true }) {
  const containerRef = useRef(null)
  const prevEventsLength = useRef(events.length)

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && containerRef.current && events.length > prevEventsLength.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
    prevEventsLength.current = events.length
  }, [events.length, autoScroll])

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <Clock size={32} className="mb-3 opacity-50" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-1">Start the scraper to see live events</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto space-y-1"
      style={{ maxHeight }}
    >
      {events.map((event, index) => {
        const config = eventTypeConfig[event.type] || eventTypeConfig.listed
        const Icon = config.icon
        const isNew = index === 0

        return (
          <div
            key={event.id}
            className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-black/5 ${isNew ? 'animate-slide-in' : ''}`}
          >
            <div className={`p-1.5 rounded-md ${config.bgClass}`}>
              <Icon size={12} className={config.iconClass} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">
                {event.message}
              </p>
              {event.cnr && (
                <p className="text-xs font-mono text-text-muted mt-0.5">
                  {event.cnr}
                </p>
              )}
            </div>
            <span className="text-xs font-mono text-text-dim whitespace-nowrap">
              {formatTime(event.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityLog
