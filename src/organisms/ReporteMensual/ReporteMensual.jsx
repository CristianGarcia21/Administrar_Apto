import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { formatCOP } from '../../utils/formatCOP.js'

export default function ReporteMensual({ resumen }) {
  const tendenciaIcon = resumen.variacionIngreso >= 0 ? TrendingUp : TrendingDown
  const TrendIcon = tendenciaIcon

  return (
    <section className="card px-6 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-textMuted">
            Resumen ejecutivo
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Reporte mensual</h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
          <TrendIcon className="h-4 w-4" />
          {Math.abs(resumen.variacionIngreso)}% vs mes anterior
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Ingreso real
          </p>
          <p className="mt-2 font-mono text-xl text-accent">
            {formatCOP(resumen.ingresoReal)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Gasto total
          </p>
          <p className="mt-2 font-mono text-xl text-danger">
            {formatCOP(resumen.gastoTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Margen neto
          </p>
          <p className="mt-2 font-mono text-xl text-success">
            {formatCOP(resumen.margenNeto)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Ocupacion
          </p>
          <p className="mt-2 text-xl font-semibold text-textMain">
            {resumen.ocupacion}%
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
          <ArrowUpRight className="h-4 w-4" />
          Puntualidad {resumen.puntualidad}%
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
          <ArrowUpRight className="h-4 w-4" />
          Proyeccion anual {formatCOP(resumen.proyeccionAnual)}
        </div>
      </div>
    </section>
  )
}
