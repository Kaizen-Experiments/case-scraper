import { useState, useCallback } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'
import { ToastContext } from '../contexts/ToastContext'

const typeConfig = {
  success: { icon: Check, borderClass: 'border-l-success', iconClass: 'text-success' },
  error: { icon: X, borderClass: 'border-l-danger', iconClass: 'text-danger' },
  warning: { icon: AlertTriangle, borderClass: 'border-l-warning', iconClass: 'text-warning' },
  info: { icon: Info, borderClass: 'border-l-primary', iconClass: 'text-primary' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(toast => {
          const config = typeConfig[toast.type] || typeConfig.info
          const Icon = config.icon
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-surface border border-border ${config.borderClass} border-l-4 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px] animate-toast-in`}
            >
              <Icon size={16} className={config.iconClass} />
              <span className="text-sm text-text flex-1">{toast.message}</span>
              <button onClick={() => dismiss(toast.id)} className="text-text-muted hover:text-text shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

