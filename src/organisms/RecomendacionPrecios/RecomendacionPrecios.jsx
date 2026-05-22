import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, X, Info } from 'lucide-react'
import Button from '../../atoms/Button/Button.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const urgenciaTone = {
  alta: 'danger',
  media: 'warning',
  baja: 'info',
  ninguna: 'neutral',
}

export default function RecomendacionPrecios({
  items,
  onApply,
  onApplyAll,
  onMarkReviewed,
  onDismiss,
  dismissedIds = [],
}) {
  // Ids descartados localmente en esta sesion (el padre puede persistirlos)
  const [localDismissed, setLocalDismissed] = useState([])
  const allDismissed = new Set([...dismissedIds, ...localDismissed])

  const visibles = items.filter(
    (item) => item?.habitacion?.id && !allDismissed.has(item.habitacion.id),
  )

  const handleDismiss = (item) => {
    setLocalDismissed((prev) => [...prev, item.habitacion.id])
    onDismiss?.(item)
  }

  if (visibles.length === 0) {
    return (
      <section
        className="rounded-2xl border border-border bg-card px-6 py-8 text-center"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--positive-dim)' }}
        >
          <CheckCircle2 className="h-6 w-6" style={{ color: 'var(--positive)' }} />
        </div>
        <p className="mt-4 font-semibold text-textMain">Sin ajustes pendientes</p>
        <p className="mt-1 text-sm text-textMuted">
          Todos los precios estan al dia o fueron revisados.
        </p>
      </section>
    )
  }

  return (
    <section
      className="rounded-2xl border border-border bg-card px-6 py-5"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Recomendaciones</p>
          <h2 className="mt-1 text-2xl font-semibold">Ajustes sugeridos</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <Info className="h-3 w-3" />
            Descartar no aplica el precio
          </div>
          <Button variant="secondary" className="text-xs" onClick={onApplyAll}>
            Aplicar en bloque
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visibles.map((item) => (
          <div
            key={item.habitacion.id}
            className="rounded-2xl border border-border bg-cardMuted/70 px-4 py-4 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
                  {item.habitacion.nombre}
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  {formatCOP(item.recomendacion.precioActual)}
                </h3>
                <p className="mt-1 text-sm text-textMuted">
                  Sugerido{' '}
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {formatCOP(item.recomendacion.precioSugerido)}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  label={item.recomendacion.urgencia}
                  tone={urgenciaTone[item.recomendacion.urgencia]}
                />
                <button
                  type="button"
                  onClick={() => handleDismiss(item)}
                  className="flex items-center gap-1 text-[11px] text-textMuted transition hover:text-danger"
                  title="Descartar esta recomendacion"
                >
                  <X className="h-3 w-3" />
                  Descartar
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
              <ArrowUpRight className="h-4 w-4" />
              {item.recomendacion.incrementoPorcentaje.toFixed(1)}% de ajuste sugerido
            </div>

            <ul className="mt-3 space-y-1 text-xs text-textMuted list-disc list-inside">
              {item.recomendacion.razones.slice(0, 2).map((razon) => (
                <li key={razon}>{razon}</li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button className="text-xs" onClick={() => onApply?.(item)}>
                Aplicar precio
              </Button>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => onMarkReviewed?.(item)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar revisado
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
