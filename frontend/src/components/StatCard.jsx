export function StatCard({
  value,
  label,
  color = 'text',
  size = 'md',
  action = null,
  className = ''
}) {
  const colorClasses = {
    text: 'text-text',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    muted: 'text-text-muted'
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  // Format large numbers
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString()
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono font-semibold ${sizeClasses[size]} ${colorClasses[color]}`}>
          {formatNumber(value)}
        </span>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            {action.icon && <action.icon size={12} />}
            {action.label}
          </button>
        )}
      </div>
      <span className="text-xs text-text-muted uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  )
}

export default StatCard
