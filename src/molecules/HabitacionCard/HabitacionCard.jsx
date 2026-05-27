import { m } from 'framer-motion'
import { ArrowUpRight, Edit3, Trash2, Users } from 'lucide-react'
import ProgressRing from '../../atoms/ProgressRing/ProgressRing.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const estadoTone = {
  ocupada: 'success',
  libre: 'info',
  mantenimiento: 'warning',
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HabitacionCard({
  habitacion,
  recomendacion,
  onEdit,
  onDelete,
  onView,
}) {
  const estado = habitacion.estado
  const ocupacion = estado === 'ocupada' ? 100 : estado === 'libre' ? 0 : 40

  return (
    <m.article
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? {} : { y: -5 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card flex flex-col gap-4 px-5 py-5"
      style={{ borderLeft: `4px solid ${habitacion.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            {habitacion.nombre}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-textMain">
            {formatCOP(habitacion.precioActual)}
          </h3>
          <p className="mt-1 text-sm text-textMuted">{habitacion.descripcion}</p>
        </div>
        <m.span
          whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="rounded-xl border border-border bg-cardMuted/70 px-3 py-2 cursor-pointer flex items-center justify-center flex-shrink-0"
        >
          <ProgressRing value={ocupacion} color={habitacion.color} size={54} />
        </m.span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge label={estado} tone={estadoTone[estado]} />
        {habitacion.inquilino && (
          <span className="inline-flex items-center gap-2 text-sm text-textMuted">
            <Users className="h-4 w-4" />
            {habitacion.inquilino}
          </span>
        )}
      </div>

      {recomendacion?.debeSubir && (
        <m.div
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-cardMuted/70 px-4 py-3"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
              Subir precio
            </p>
            <p className="mt-1 text-sm font-semibold text-textMain">
              Sugerido {formatCOP(recomendacion.precioSugerido)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <ArrowUpRight className="h-4 w-4 animate-pulse" />
            {recomendacion.incrementoPorcentaje.toFixed(1)}%
          </span>
        </m.div>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <Button className="text-xs" onClick={() => onView?.(habitacion)}>
          Ver detalle
        </Button>
        <Button
          variant="secondary"
          className="text-xs"
          onClick={() => onEdit?.(habitacion)}
        >
          <Edit3 className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => onDelete?.(habitacion)}
        >
          <Trash2 className="h-4 w-4 text-red-400/80 hover:text-red-400" />
          Eliminar
        </Button>
      </div>
    </m.article>
  )
}

