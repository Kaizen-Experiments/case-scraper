export function ProgressBar({
  value = 0,
  color = 'primary',
  animated = true,
  showLabel = true,
  size = 'md',
  className = ''
}) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  }

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }

  // Determine color based on completion
  const barColor = clampedValue >= 100 ? 'success' : color

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-border rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses[barColor]} ${animated ? 'animate-progress' : ''}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-sm text-text-muted min-w-[3.5rem] text-right">
          {clampedValue.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar
