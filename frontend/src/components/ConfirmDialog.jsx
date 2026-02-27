import { useEffect } from 'react'

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onCancel])

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center animate-modal-in" onClick={onCancel}>
      <div className="bg-surface border border-border rounded-xl p-6 w-[400px] shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-muted mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors ${
              danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
