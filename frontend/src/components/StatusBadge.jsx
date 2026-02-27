import { Check, Clock, Loader2, X, List } from 'lucide-react'

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/20'
  },
  running: {
    icon: Loader2,
    label: 'Running',
    className: 'bg-primary/15 text-primary border-primary/20',
    spin: true
  },
  done: {
    icon: Check,
    label: 'Done',
    className: 'bg-success/15 text-success border-success/20'
  },
  failed: {
    icon: X,
    label: 'Failed',
    className: 'bg-danger/15 text-danger border-danger/20'
  },
  listed: {
    icon: List,
    label: 'Listed',
    className: 'bg-success/10 text-success/80 border-success/15'
  },
  disposed: {
    icon: Check,
    label: 'Disposed',
    className: 'bg-success/15 text-success border-success/20'
  },
  dismissed: {
    icon: X,
    label: 'Dismissed',
    className: 'bg-text-muted/15 text-text-muted border-text-muted/20'
  }
}

export function StatusBadge({ status, showIcon = true, showLabel = true, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-1.5'
  }

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${config.className} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <Icon
          size={iconSizes[size]}
          className={config.spin ? 'animate-spin' : ''}
        />
      )}
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

export default StatusBadge
