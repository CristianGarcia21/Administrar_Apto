import { useState } from 'react'
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Users,
  Clock,
  Target,
  Activity,
  Calendar,
  ChevronRight,
  Info,
} from 'lucide-react'
import RecomendacionPrecios from '../../organisms/RecomendacionPrecios/RecomendacionPrecios.jsx'
import TendenciaFinanciera from '../../organisms/TendenciaFinanciera/TendenciaFinanciera.jsx'
import TendenciaServiciosChart from '../../organisms/TendenciaServiciosChart/TendenciaServiciosChart.jsx'
import { useRecomendacionPrecios } from '../../hooks/useRecomendacionPrecios.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useHistorialStore } from '../../store/historialStore.js'
import { useUiStore } from '../../store/uiStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import { formatCOP } from '../../utils/formatCOP.js'
import toast from 'react-hot-toast'

const TABS = ['Resumen', 'Tendencia', 'Servicios', 'Precios']

// ── Componentes internos ──────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, tone = 'neutral', trend }) {
  const toneStyles = {
    positive: { icon: 'var(--positive)', iconBg: 'var(--positive-dim)', value: 'var(--positive)' },
    danger:   { icon: 'var(--danger)',   iconBg: 'var(--danger-dim)',   value: 'var(--danger)' },
    accent:   { icon: 'var(--accent)',   iconBg: 'var(--accent-dim)',   value: 'var(--accent)' },
    info:     { icon: 'var(--info)',     iconBg: 'var(--info-dim)',     value: 'var(--info)' },
    neutral:  { icon: 'var(--text-secondary)', iconBg: 'var(--bg-elevated)', value: 'var(--text-primary)' },
  }
  const styles = toneStyles[tone]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-5 transition-all duration-300 hover:shadow-lg"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30"
        style={{ background: styles.iconBg }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: styles.iconBg }}
        >
          <Icon className="h-5 w-5" style={{ color: styles.icon }} />
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: trend >= 0 ? 'var(--positive-dim)' : 'var(--danger-dim)',
                     color:      trend >= 0 ? 'var(--positive)'     : 'var(--danger)' }}
          >
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-textMuted">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold" style={{ color: styles.value }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-textMuted">{sub}</p>}
    </div>
  )
}

function ProgressBar({ label, value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-textMuted mb-1">
        <span>{label}</span>
        <span className="font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────

export default function Reportes() {
  const [activeTab, setActiveTab] = useState('Resumen')

  const habitaciones    = useHabitacionesStore((s) => s.habitaciones)
  const updateHabitacion = useHabitacionesStore((s) => s.updateHabitacion)
  const pagos           = usePagosStore((s) => s.pagos)
  const serviciosPublicos = useServiciosStore((s) => s.serviciosPublicos)
  const serviciosHabitacion = useServiciosStore((s) => s.serviciosHabitacion)
  const historial       = useHistorialStore((s) => s.historial)
  const mesActivo       = useUiStore((s) => s.mesActivo)
  const mesVisualizado  = useUiStore((s) => s.mesVisualizado)
  const ipcHistorial    = useAppSettingsStore((s) => s.ipcHistorial ?? [])

  // ── KPIs del mes visualizado ──
  const pagosPagados = pagos.filter((p) => p.estado === 'pagado' && p.mes === mesVisualizado)
  const ingresoReal  = pagosPagados.reduce((t, p) => t + p.monto, 0)
  const gastoTotal   = serviciosPublicos
    .filter((s) => s.mes === mesVisualizado)
    .reduce((t, s) => t + s.monto, 0)
  const margenNeto   = ingresoReal - gastoTotal
  const margenPct    = ingresoReal > 0 ? Math.round((margenNeto / ingresoReal) * 100) : 0

  const ocupadas  = habitaciones.filter((h) => h.estado === 'ocupada').length
  const ocupacion = habitaciones.length ? Math.round((ocupadas / habitaciones.length) * 100) : 0

  const pagosPuntuales = pagos.filter((p) => p.mes === mesVisualizado && p.diasMora === 0).length
  const pagosTotalesMes = pagos.filter((p) => p.mes === mesVisualizado).length
  const puntualidad = pagosTotalesMes ? Math.round((pagosPuntuales / pagosTotalesMes) * 100) : 0

  // ── Proyeccion anual mejorada: promedio del historial o mes actual ──
  const mesesReales = historial.filter((h) => h.mes !== '2026-04') // excluir seed simulado
  const basePara12 = mesesReales.length >= 2
    ? mesesReales.reduce((sum, h) => sum + h.ingresos, 0) / mesesReales.length
    : ingresoReal
  const proyeccionAnual = Math.round(basePara12 * 12)
  const proyeccionLabel = mesesReales.length >= 2
    ? `Promedio de ${mesesReales.length} meses reales`
    : 'Basado en ingreso actual'
  const ingresoPromedioPorHab = ocupadas > 0 ? Math.round(ingresoReal / ocupadas) : 0

  // ── Variacion vs mes anterior (desde historial) ──
  const mesAnteriorSnap = historial.length > 0 ? historial[historial.length - 1] : null
  const variacionIngreso = mesAnteriorSnap && mesAnteriorSnap.ingresos > 0
    ? Math.round(((ingresoReal - mesAnteriorSnap.ingresos) / mesAnteriorSnap.ingresos) * 100)
    : null

  // ── Tendencia: historial guardado + mes visualizado en vivo ──
  const mesActivoLabel = new Date(
    Number(mesVisualizado.split('-')[0]),
    Number(mesVisualizado.split('-')[1]) - 1,
    1,
  ).toLocaleString('es-CO', { month: 'short' }).replace('.', '')

  const tendenciaData = [
    ...historial.map((h) => ({
      mes: h.mesLabel,
      ingresos: h.ingresos,
      gastos: h.gastos,
      simulado: h.mes === '2026-04', // Marcar el dato simulado de abril
    })),
    // Mes actual en vivo (solo si tiene datos o está en progreso)
    {
      mes: mesActivoLabel,
      ingresos: ingresoReal,
      gastos: gastoTotal,
      simulado: false,
      enVivo: true,
    },
  ]

  // ── Recomendaciones de precios ──
  const recomendaciones = useRecomendacionPrecios(
    habitaciones, pagos, serviciosHabitacion,
    { ipcAnual: 9, mesesSinSubida: 9, objetivoMargen: 20 },
  )
  const items = recomendaciones.map((item) => ({
    habitacion: habitaciones.find((h) => h.id === item.habitacionId),
    recomendacion: item.recomendacion,
  }))

  // ── Handlers ──
  const handleApply = (item) => {
    if (!item?.habitacion?.id) return
    const nuevoPrecio = item.recomendacion.precioSugerido
    updateHabitacion(item.habitacion.id, {
      precioActual: nuevoPrecio,
      precioMinimo: Math.round(nuevoPrecio * 0.9),
    })
    toast.success(`Precio actualizado en ${item.habitacion.nombre}`)
  }

  const handleApplyAll = () => {
    items.forEach((item) => {
      if (!item?.habitacion?.id) return
      const nuevoPrecio = item.recomendacion.precioSugerido
      updateHabitacion(item.habitacion.id, {
        precioActual: nuevoPrecio,
        precioMinimo: Math.round(nuevoPrecio * 0.9),
      })
    })
    toast.success('Precios aplicados en bloque')
  }

  const handleMarkReviewed = (item) => {
    if (!item?.habitacion?.id) return
    toast.success(`Recomendacion revisada para ${item.habitacion.nombre}`)
  }

  const handleExportJSON = () => {
    const payload = {
      generadoEn: new Date().toISOString(),
      mesActivo,
      resumen: { ingresoReal, gastoTotal, margenNeto, ocupacion, puntualidad, proyeccionAnual },
      historial,
      recomendaciones: items,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rentapp-reporte.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Reporte JSON exportado')
  }

  const handleExportCSV = () => {
    const rows = [
      ['Mes', 'Ingresos', 'Gastos', 'Margen', 'Fuente'],
      ...tendenciaData.map((d) => [
        d.mes,
        d.ingresos,
        d.gastos,
        d.ingresos - d.gastos,
        d.simulado ? 'simulado' : d.enVivo ? 'en vivo' : 'real',
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rentapp-tendencia.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Tendencia CSV exportada')
  }

  const now = new Date()
  const dateLabel = now.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Cabecera de página ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-6"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20"
          style={{ background: 'var(--accent)' }}
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-textMuted">
              <Calendar className="h-3 w-3" />
              {dateLabel}
            </div>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Analitica y Decisiones
            </h1>
            <p className="mt-1 text-sm text-textMuted">
              Diagnostico financiero integral y recomendaciones accionables.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              <FileText className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-elevated)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 ${
                activeTab === tab ? 'shadow-md' : 'text-textMuted hover:text-textMain'
              }`}
              style={activeTab === tab ? { background: 'var(--accent)', color: '#0f1923' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: Tendencia Servicios ── */}
      {activeTab === 'Servicios' && (
        <div className="space-y-6">
          <div className="card px-6 py-8 border border-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--accent-dim)] to-transparent opacity-5 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Evolución de Servicios</h2>
              <p className="mt-2 text-sm text-textMuted mb-8">
                Compara gráficamente el comportamiento de tus gastos (agua, luz, gas, internet) a lo largo de los meses para identificar anomalías o sobrecostos.
              </p>
              <TendenciaServiciosChart serviciosPublicos={serviciosPublicos} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Resumen ── */}
      {activeTab === 'Resumen' && (
        <div className="space-y-6">

          {/* KPI grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <KpiCard
              icon={DollarSign}
              label="Ingreso real"
              value={formatCOP(ingresoReal)}
              sub={`${pagosPagados.length} pago${pagosPagados.length !== 1 ? 's' : ''} confirmado${pagosPagados.length !== 1 ? 's' : ''}`}
              tone="accent"
              trend={variacionIngreso ?? undefined}
            />
            <KpiCard
              icon={TrendingDown}
              label="Gasto total"
              value={formatCOP(gastoTotal)}
              sub="Servicios del mes"
              tone="danger"
            />
            <KpiCard
              icon={Activity}
              label="Margen neto"
              value={formatCOP(margenNeto)}
              sub={`${margenPct}% del ingreso`}
              tone={margenNeto >= 0 ? 'positive' : 'danger'}
            />
            <KpiCard
              icon={Home}
              label="Ocupacion"
              value={`${ocupacion}%`}
              sub={`${ocupadas} de ${habitaciones.length} hab. ocupadas`}
              tone="info"
            />
            <KpiCard
              icon={Clock}
              label="Puntualidad"
              value={`${puntualidad}%`}
              sub="Pagos sin mora este mes"
              tone="positive"
            />
            <KpiCard
              icon={Target}
              label="Proyeccion anual"
              value={formatCOP(proyeccionAnual)}
              sub={proyeccionLabel}
              tone="accent"
            />
            <KpiCard
              icon={Users}
              label="Ingreso / hab."
              value={formatCOP(ingresoPromedioPorHab)}
              sub="Promedio por habitacion ocupada"
              tone="neutral"
            />
            <KpiCard
              icon={variacionIngreso !== null && variacionIngreso >= 0 ? TrendingUp : TrendingDown}
              label="Variacion mensual"
              value={variacionIngreso !== null ? `${variacionIngreso >= 0 ? '+' : ''}${variacionIngreso}%` : 'Sin datos'}
              sub={mesAnteriorSnap ? `vs ${mesAnteriorSnap.mesLabel}` : 'Registra el primer mes completo'}
              tone={variacionIngreso !== null ? (variacionIngreso >= 0 ? 'positive' : 'danger') : 'neutral'}
            />
          </div>

          {/* Progress metrics */}
          <div
            className="rounded-2xl border border-border bg-card px-6 py-5"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Metricas clave</p>
                <h2 className="mt-1 text-xl font-semibold">Performance del mes</h2>
              </div>
              <ChevronRight className="h-4 w-4 text-textMuted" />
            </div>
            <div className="mt-6 space-y-5">
              <ProgressBar
                label="Tasa de ocupacion"
                value={ocupadas}
                max={habitaciones.length || 1}
                color="var(--info)"
              />
              <ProgressBar
                label="Puntualidad de pagos"
                value={pagosPuntuales}
                max={pagosTotalesMes || 1}
                color="var(--positive)"
              />
              <ProgressBar
                label="Margen neto sobre ingresos"
                value={Math.max(0, margenNeto)}
                max={ingresoReal || 1}
                color="var(--accent)"
              />
            </div>
          </div>

          {/* Tabla historica */}
          <div
            className="rounded-2xl border border-border bg-card px-6 py-5 overflow-x-auto"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Historico real</p>
              {historial.some((h) => h.simulado || h.mes === '2026-04') && (
                <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
                  <Info className="h-3 w-3 flex-shrink-0" />
                  Abr es dato de referencia
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-5">Tendencia mensual</h2>

            {tendenciaData.length <= 1 ? (
              <div
                className="rounded-xl border border-border px-6 py-8 text-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <p className="text-sm font-semibold text-textMain">
                  Solo hay datos del mes actual
                </p>
                <p className="mt-1 text-xs text-textMuted">
                  Al confirmar cada nuevo mes se guarda el historico automaticamente.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs uppercase tracking-[0.2em] text-textMuted font-semibold">Mes</th>
                    <th className="pb-3 text-left text-xs uppercase tracking-[0.2em] text-textMuted font-semibold">Fuente</th>
                    <th className="pb-3 text-right text-xs uppercase tracking-[0.2em] text-textMuted font-semibold">Ingresos</th>
                    <th className="pb-3 text-right text-xs uppercase tracking-[0.2em] text-textMuted font-semibold">Gastos</th>
                    <th className="pb-3 text-right text-xs uppercase tracking-[0.2em] text-textMuted font-semibold">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {tendenciaData.map((row, i) => {
                    const margen = row.ingresos - row.gastos
                    const isLast = i === tendenciaData.length - 1
                    return (
                      <tr
                        key={`${row.mes}-${i}`}
                        className={`border-b border-border/50 transition hover:bg-cardMuted/40 ${isLast ? 'font-semibold' : ''}`}
                      >
                        <td className="py-3 text-textMain uppercase text-xs tracking-wider">{row.mes}</td>
                        <td className="py-3">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={
                              row.enVivo
                                ? { background: 'var(--info-dim)', color: 'var(--info)' }
                                : row.simulado
                                ? { background: 'var(--warning-dim)', color: 'var(--warning)' }
                                : { background: 'var(--positive-dim)', color: 'var(--positive)' }
                            }
                          >
                            {row.enVivo ? 'en vivo' : row.simulado ? 'referencia' : 'real'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-xs" style={{ color: 'var(--info)' }}>
                          {formatCOP(row.ingresos)}
                        </td>
                        <td className="py-3 text-right font-mono text-xs" style={{ color: 'var(--danger)' }}>
                          {formatCOP(row.gastos)}
                        </td>
                        <td
                          className="py-3 text-right font-mono text-xs"
                          style={{ color: margen >= 0 ? 'var(--positive)' : 'var(--danger)' }}
                        >
                          {formatCOP(margen)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Tendencia ── */}
      {activeTab === 'Tendencia' && (
        <TendenciaFinanciera data={tendenciaData} />
      )}

      {/* ── TAB: Precios ── */}
      {activeTab === 'Precios' && (
        <div className="space-y-6">
          <RecomendacionPrecios
            items={items}
            onApply={handleApply}
            onApplyAll={handleApplyAll}
            onMarkReviewed={handleMarkReviewed}
            onDismiss={(item) => toast(`Recomendacion para ${item.habitacion.nombre} descartada`, { icon: null })}
          />

          {/* Historial de ajustes IPC */}
          <div
            className="rounded-2xl border border-border bg-card px-6 py-5"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Ley 820 de 2003</p>
              <h2 className="mt-1 text-xl font-semibold">Historial de ajustes IPC</h2>
              <p className="mt-1 text-sm text-textMuted">
                Registro de cada actualizacion anual de arriendos.
              </p>
            </div>

            {/* IPC por año */}
            {ipcHistorial.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {[...ipcHistorial].sort((a, b) => b.anio - a.anio).map((h) => (
                  <div
                    key={h.anio}
                    className="rounded-xl border border-border px-3 py-2 text-center"
                    style={{ background: 'var(--bg-elevated)', minWidth: 80 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-textMuted">{h.anio - 1}</p>
                    <p className="font-mono text-lg font-bold" style={{ color: 'var(--accent)' }}>
                      {h.valor}%
                    </p>
                    <p className="text-[10px] text-textMuted">IPC</p>
                  </div>
                ))}
              </div>
            )}

            {/* Por habitacion */}
            <div className="space-y-4">
              {habitaciones.map((hab) => {
                const logs = (hab.precioHistorial ?? []).sort((a, b) => b.anio - a.anio)
                return (
                  <div key={hab.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ background: hab.color }}
                        />
                        <p className="text-sm font-semibold text-textMain">{hab.nombre}</p>
                      </div>
                      <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                        {formatCOP(hab.precioActual)}
                      </p>
                    </div>

                    {logs.length === 0 ? (
                      <p className="text-xs text-textMuted pl-5">Sin ajustes IPC registrados.</p>
                    ) : (
                      <div className="pl-5 space-y-2">
                        {logs.map((log, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
                            style={{ background: 'var(--bg-elevated)' }}
                          >
                            <div
                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                            >
                              {log.anio.toString().slice(2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-textMuted">
                                {log.fecha} — IPC {log.anio}
                              </p>
                              <p className="font-mono text-xs text-textMain">
                                {formatCOP(log.precioAntes)}
                                <span className="mx-1 text-textMuted">→</span>
                                <span style={{ color: 'var(--positive)' }}>{formatCOP(log.precioDespues)}</span>
                              </p>
                            </div>
                            <span
                              className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: 'var(--positive-dim)', color: 'var(--positive)' }}
                            >
                              +{log.precioAntes > 0
                                ? ((( log.precioDespues - log.precioAntes) / log.precioAntes) * 100).toFixed(1)
                                : '0'}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
