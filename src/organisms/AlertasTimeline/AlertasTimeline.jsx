import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Badge from '../../atoms/Badge/Badge.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { getAnimationConfig } from '../../utils/accessibility.js'

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

const itemVariants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: getAnimationConfig({
      delay: index * 0.06,
      duration: 0.25,
      ease: 'easeOut',
    }),
  }),
}

const toneMap = {
  alta: { border: 'var(--danger)', bg: 'var(--danger-dim)', badge: 'danger' },
  media: { border: 'var(--warning)', bg: 'var(--warning-dim)', badge: 'warning' },
  baja: { border: 'var(--info)', bg: 'var(--info-dim)', badge: 'info' },
  success: { border: 'var(--positive)', bg: 'var(--positive-dim)', badge: 'success' },
}

export default function AlertasTimeline({ alertas, onDismiss, onViewAll, onAction }) {
  return (
    <section className="card px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted">
            Alertas activas
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Lo que requiere atencion</h2>
        </div>
        <Button variant="ghost" className="text-xs" onClick={onViewAll}>
          Ver todas
        </Button>
      </div>
      <div className="mt-5 space-y-3">
        {alertas.map((alerta, index) => (
          <motion.div
            key={alerta.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
            style={{
              borderLeft: `2px solid ${toneMap[alerta.urgencia].border}`,
              background: toneMap[alerta.urgencia].bg,
              borderRadius: 0,
            }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-card p-2 text-primary shadow-sm">
                  <alerta.icono className="h-4 w-4" />
                </span>
                <p className="font-semibold">{alerta.titulo}</p>
                <Badge
                  label={alerta.urgencia}
                  tone={toneMap[alerta.urgencia].badge}
                />
              </div>
              <p className="mt-2 text-sm text-textMuted">{alerta.detalle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="text-xs"
                variant="secondary"
                onClick={() => onAction?.(alerta)}
              >
                {alerta.accion}
              </Button>
              {onDismiss && !alerta.persistente && (
                <Button
                  className="text-xs"
                  variant="ghost"
                  onClick={() => onDismiss(alerta.id)}
                >
                  <X className="h-4 w-4" />
                  Descartar
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
