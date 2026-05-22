import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import { formatCOP } from '../../utils/formatCOP.js'
import { TrendingUp, TrendingDown } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const ingresos = payload.find((p) => p.dataKey === 'ingresos')
  const gastos = payload.find((p) => p.dataKey === 'gastos')
  const margen = (ingresos?.value ?? 0) - (gastos?.value ?? 0)

  return (
    <div
      className="rounded-xl border border-border px-4 py-3 text-xs shadow-xl"
      style={{ background: 'var(--bg-elevated)', minWidth: 180 }}
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-textMuted font-semibold">
        {label}
      </p>
      {ingresos && (
        <div className="flex items-center justify-between gap-6">
          <span className="text-textMuted">Ingresos</span>
          <span className="font-mono font-semibold" style={{ color: 'var(--info)' }}>
            {formatCOP(ingresos.value)}
          </span>
        </div>
      )}
      {gastos && (
        <div className="flex items-center justify-between gap-6 mt-1">
          <span className="text-textMuted">Gastos</span>
          <span className="font-mono font-semibold" style={{ color: 'var(--danger)' }}>
            {formatCOP(gastos.value)}
          </span>
        </div>
      )}
      <div
        className="mt-2 border-t border-border pt-2 flex items-center justify-between gap-6"
      >
        <span className="text-textMuted">Margen</span>
        <span
          className="font-mono font-semibold"
          style={{ color: margen >= 0 ? 'var(--positive)' : 'var(--danger)' }}
        >
          {formatCOP(margen)}
        </span>
      </div>
    </div>
  )
}

const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-6 mt-2">
    {payload?.map((entry) => (
      <div key={entry.dataKey} className="flex items-center gap-2 text-xs text-textMuted">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: entry.color }}
        />
        <span className="capitalize">{entry.dataKey}</span>
      </div>
    ))}
  </div>
)

export default function TendenciaFinanciera({ data }) {
  const totalMargen = data.reduce((sum, d) => sum + (d.ingresos - d.gastos), 0)
  const mesesPositivos = data.filter((d) => d.ingresos >= d.gastos).length
  const mesesNegativos = data.length - mesesPositivos
  const avgIngresos = data.reduce((sum, d) => sum + d.ingresos, 0) / (data.length || 1)

  return (
    <section
      className="rounded-2xl border border-border bg-card px-6 py-6"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">
            Tendencia financiera
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Ingresos vs Gastos — 12 meses
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
            style={
              mesesNegativos > 0
                ? { background: 'var(--warning-dim)', color: 'var(--warning)' }
                : { background: 'var(--positive-dim)', color: 'var(--positive)' }
            }
          >
            {mesesNegativos > 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {mesesNegativos} {mesesNegativos === 1 ? 'mes' : 'meses'} en déficit
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
            style={
              totalMargen >= 0
                ? { background: 'var(--positive-dim)', color: 'var(--positive)' }
                : { background: 'var(--danger-dim)', color: 'var(--danger)' }
            }
          >
            <span className="font-mono text-xs font-bold">
              {totalMargen >= 0 ? '+' : ''}{(totalMargen / 1000).toFixed(0)}K neto anual
            </span>
          </div>
        </div>
      </div>


      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--info)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--info)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--border-subtle)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="mes"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toUpperCase()}
            />
            <YAxis
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
              }
              width={52}
            />
            <ReferenceLine
              y={avgIngresos}
              stroke="var(--accent)"
              strokeDasharray="5 3"
              strokeOpacity={0.5}
              label={{
                value: 'Promedio',
                fill: 'var(--accent)',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-normal)', strokeWidth: 1 }} />
            <Legend content={<CustomLegend />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="var(--info)"
              fill="url(#gradIngresos)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--info)', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="var(--danger)"
              fill="url(#gradGastos)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--danger)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
