import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { m } from 'framer-motion'

/**
 * Modal de confirmacion reutilizable — reemplaza window.confirm().
 */
export default function ConfirmModal({
  title = 'Confirmar accion',
  message = '¿Estas seguro? Esta accion no se puede deshacer.',
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <m.div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
      />

      {/* Card */}
      <m.div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Glow peligro */}
        <div
          className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full opacity-20"
          style={{ background: 'var(--danger)' }}
        />

        <div className="relative px-6 pt-6 pb-5">
          {/* Icono */}
          <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'var(--danger-dim)' }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: 'var(--danger)' }} />
          </div>

          <h2 className="text-lg font-bold text-textMain">{title}</h2>
          <p className="mt-2 text-sm text-textMuted">{message}</p>

          <div className="mt-6 flex gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
              style={{ background: 'var(--danger)', color: '#fff' }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-textMuted transition hover:bg-cardMuted hover:text-textMain"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </m.div>
    </div>
  )
}

