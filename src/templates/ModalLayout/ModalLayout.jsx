import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getAnimationConfig } from '../../utils/accessibility.js'

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

export default function ModalLayout({ title, description, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={getAnimationConfig({ duration: 0.2 })}
      />
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        initial={{
          opacity: 0,
          y: prefersReducedMotion ? 0 : 16,
          scale: prefersReducedMotion ? 1 : 0.98,
        }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: prefersReducedMotion ? 0 : 12,
          scale: prefersReducedMotion ? 1 : 0.98,
        }}
        transition={getAnimationConfig({ duration: 0.2, ease: 'easeOut' })}
      >
        <div className="h-0.5 w-full" style={{ background: 'var(--accent)' }} />
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">
              {title}
            </p>
            {description && (
              <p className="mt-2 text-sm text-textMuted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-cardMuted p-2 text-textMuted transition hover:text-textMain"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  )
}
