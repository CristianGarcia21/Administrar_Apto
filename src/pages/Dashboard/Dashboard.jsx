import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  Wallet,
  Home,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Receipt,
  Zap,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import DashboardHeader from '../../organisms/DashboardHeader/DashboardHeader.jsx'
import AlertasTimeline from '../../organisms/AlertasTimeline/AlertasTimeline.jsx'
import CheckRapidoModal from '../../organisms/CheckRapidoModal/CheckRapidoModal.jsx'
import NuevoMesModal from '../../organisms/NuevoMesModal/NuevoMesModal.jsx'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useInquilinosStore } from '../../store/inquilinosStore.js'
import { useUiStore } from '../../store/uiStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import useAlertas from '../../hooks/useAlertas.js'
import { formatCOP } from '../../utils/formatCOP.js'
import { getAnimationConfig } from '../../utils/accessibility.js'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: getAnimationConfig({ duration: 0.38, delay }),
  },
})

function KpiTile({ icon: Icon, label, value, sub, tone = 'neutral', onClick }) {
  const tones = {
    accent:  { icon: 'var(--accent)',   bg: 'var(--accent-dim)',   val: 'var(--accent)' },
    success: { icon: 'var(--positive)', bg: 'var(--positive-dim)', val: 'var(--positive)' },
    danger:  { icon: 'var(--danger)',   bg: 'var(--danger-dim)',   val: 'var(--danger)' },
    info:    { icon: 'var(--info)',     bg: 'var(--info-dim)',     val: 'var(--info)' },
    neutral: { icon: 'var(--text-secondary)', bg: 'var(--bg-elevated)', val: 'var(--text-primary)' },
  }
  const t = tones[tone]
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
      onClick={onClick}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-25" style={{ background: t.bg }} />
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: t.bg }}>
        <Icon className="h-5 w-5" style={{ color: t.icon }} />
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold" style={{ color: t.val }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-textMuted">{sub}</p>}
    </div>
  )
}

/** Tarjeta hero — ocupa 2 columnas, tipografia grande, barra de progreso de recaudo */
function KpiHero({ label, value, sub, collected, total, onClick }) {
  const pct = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border col-span-1 sm:col-span-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'rgba(201,168,76,0.25)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onClick={onClick}
    >
      {/* Glow accent */}
      <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full opacity-20" style={{ background: 'var(--accent)' }} />
      <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full opacity-10" style={{ background: 'var(--info)' }} />

      <div className="relative px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">{label}</p>
            <p
              className="mt-2 font-mono text-4xl font-bold leading-none tracking-tight"
              style={{ color: 'var(--accent)' }}
            >
              {value}
            </p>
            {sub && <p className="mt-2 text-xs text-textMuted">{sub}</p>}
          </div>
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'var(--accent-dim)' }}
          >
            <Wallet className="h-6 w-6" style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        {/* Barra recaudo */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-textMuted">Recaudo del mes</p>
            <p className="text-[11px] font-semibold" style={{ color: pct >= 80 ? 'var(--positive)' : 'var(--warning)' }}>
              {pct}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-void)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 80
                  ? 'linear-gradient(90deg, var(--positive), #4ade80)'
                  : 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AccionBtn({ icon: Icon, label, desc, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: color + '22', color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-textMain">{label}</p>
        <p className="text-xs text-textMuted truncate">{desc}</p>
      </div>
      <ArrowRight
        className="h-4 w-4 text-textMuted opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
      />
    </button>
  )
}

export default function Dashboard() {
  const [showQuickCheck, setShowQuickCheck] = useState(false)
  const [showNuevoMes, setShowNuevoMes] = useState(false)
  const navigate = useNavigate()

  const habitaciones = useHabitacionesStore((s) => s.habitaciones)
  const pagos = usePagosStore((s) => s.pagos)
  const serviciosPublicos = useServiciosStore((s) => s.serviciosPublicos)
  const inquilinos = useInquilinosStore((s) => s.inquilinos)
  const pendingRollover = useUiStore((s) => s.pendingRollover)
  const mesActivo = useUiStore((s) => s.mesActivo)
  const mesVisualizado = useUiStore((s) => s.mesVisualizado)
  const ensureServiciosForMonth = useServiciosStore((s) => s.ensureServiciosForMonth)
  const nombre = useAppSettingsStore((s) => s.nombre)
  const { alertas, dismissAlert } = useAlertas()

  useEffect(() => {
    ensureServiciosForMonth(mesVisualizado)
  }, [mesVisualizado, ensureServiciosForMonth])

  // Filtrar por mesVisualizado en lugar de mesActivo
  const ingresoMes = pagos
    .filter((p) => p.estado === 'pagado' && p.mes === mesVisualizado)
    .reduce((t, p) => t + p.monto, 0)
  const ocupadas = habitaciones.filter((h) => h.estado === 'ocupada').length
  const moraActiva = pagos
    .filter((p) => p.mes === mesVisualizado && p.diasMora > 0)
    .reduce((t, p) => t + p.monto, 0)
  const serviciosDelMes = serviciosPublicos.filter(s => s.mes === mesVisualizado)
  const gastoServicios = serviciosDelMes.reduce((t, s) => t + s.monto, 0)
  const margenNeto = ingresoMes - gastoServicios
  const serviciosPendientes = serviciosDelMes.filter((s) => s.estado === 'pendiente').length

  const [mesYear, mesMonth] = mesVisualizado.split('-').map(Number)
  const mesLabel = format(new Date(mesYear, mesMonth - 1, 1), "MMMM yyyy", { locale: es })

  return (
    <div className="space-y-6">

      {/* ── Bienvenida ── */}
      <m.div {...fadeUp(0)}>
        <DashboardHeader nombre={nombre} />
      </m.div>

      {/* ── Banner "Iniciar mes" cuando hay rollover pendiente ── */}
      {pendingRollover && (
        <m.div {...fadeUp(0.05)}>
          <button
            onClick={() => setShowNuevoMes(true)}
            className="group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:shadow-xl"
            style={{
              borderColor: 'var(--accent)',
              background: 'var(--bg-elevated)',
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-125"
              style={{ background: 'var(--accent)' }}
            />
            <div className="relative flex items-center gap-5 px-6 py-5">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'var(--accent)', color: '#0f1923' }}
              >
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    Nuevo mes disponible
                  </p>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-sm text-textMuted">
                  Inicia <span className="capitalize font-semibold text-textMain">{
                    format(new Date(mesYear, mesMonth, 1), "MMMM", { locale: es })
                  }</span> — ajusta los servicios y confirma en 30 segundos
                </p>
              </div>
              <div
                className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition group-hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#0f1923' }}
              >
                Iniciar mes →
              </div>
            </div>
          </button>
        </m.div>
      )}

      {/* ── KPIs ── */}
      <m.section
        {...fadeUp(0.1)}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* Hero tile: ingreso — ocupa 2 cols */}
        <KpiHero
          label="Ingreso del mes"
          value={formatCOP(ingresoMes)}
          sub={`${pagos.filter((p) => p.estado === 'pagado' && p.mes === mesVisualizado).length} pagos confirmados`}
          collected={ingresoMes}
          total={habitaciones.filter((h) => h.estado === 'ocupada').reduce((s, h) => s + h.precioActual, 0)}
          onClick={() => navigate('/pagos')}
        />
        <KpiTile
          icon={Home}
          label="Ocupacion"
          value={`${ocupadas}/${habitaciones.length}`}
          sub={`${Math.round((ocupadas / (habitaciones.length || 1)) * 100)}% del inmueble`}
          tone="success"
          onClick={() => navigate('/habitaciones')}
        />
        <KpiTile
          icon={AlertCircle}
          label="Mora activa"
          value={moraActiva > 0 ? formatCOP(moraActiva) : '—'}
          sub={moraActiva > 0 ? 'Pagos vencidos este mes' : 'Sin mora registrada'}
          tone={moraActiva > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/pagos')}
        />
        <KpiTile
          icon={TrendingUp}
          label="Margen neto"
          value={formatCOP(margenNeto)}
          sub={margenNeto >= 0 ? 'Positivo este mes' : 'Deficit — aportas de tu bolsillo'}
          tone={margenNeto >= 0 ? 'info' : 'danger'}
          onClick={() => navigate('/reportes')}
        />
      </m.section>

      {/* ── Estado del mes actual ── */}
      <m.section {...fadeUp(0.15)}>
        <div
          className="rounded-2xl border border-border bg-card px-6 py-5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Mes en curso</p>
              <h2 className="mt-1 text-xl font-semibold capitalize">{mesLabel}</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/servicios')}
              className="text-xs font-semibold text-textMuted transition hover:text-textMain"
            >
              Ver servicios →
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {serviciosDelMes.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div>
                  <p className="text-xs font-semibold text-textMain truncate max-w-[120px]">{s.nombre}</p>
                  <p className="text-[11px] text-textMuted">{formatCOP(s.monto)}</p>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background: s.estado === 'pagado'
                      ? 'var(--positive-dim)'
                      : s.estado === 'vencido'
                      ? 'var(--danger-dim)'
                      : 'var(--warning-dim)',
                    color: s.estado === 'pagado'
                      ? 'var(--positive)'
                      : s.estado === 'vencido'
                      ? 'var(--danger)'
                      : 'var(--warning)',
                  }}
                >
                  {s.estado}
                </span>
              </div>
            ))}
          </div>

          {serviciosPendientes > 0 && (
            <p className="mt-3 text-xs text-textMuted">
              <span className="font-semibold" style={{ color: 'var(--warning)' }}>
                {serviciosPendientes} servicio{serviciosPendientes > 1 ? 's' : ''} pendiente{serviciosPendientes > 1 ? 's' : ''}
              </span>
              {' '}— ve a Servicios para registrar los pagos
            </p>
          )}
        </div>
      </m.section>

      {/* ── Alertas ── */}
      <m.div {...fadeUp(0.2)}>
        <AlertasTimeline
          alertas={alertas}
          onDismiss={dismissAlert}
          onViewAll={() => navigate('/reportes')}
          onAction={(alerta) => {
            if (alerta.tipo === 'mora_inquilino') { navigate('/inquilinos'); return }
            if (alerta.tipo === 'servicio_vencido' || alerta.tipo === 'servicio_por_vencer') {
              navigate(`/servicios?servicio=${encodeURIComponent(alerta.serviceId)}&accion=registrar`)
              return
            }
            navigate('/reportes')
          }}
        />
      </m.div>

      {/* ── Acciones rápidas ── */}
      <m.section {...fadeUp(0.25)}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Acciones rápidas</h2>
          <p className="text-xs text-textMuted">En menos de 30 segundos</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AccionBtn
            icon={Receipt}
            label="Registrar pago"
            desc="Arriendos del mes"
            color="var(--accent)"
            onClick={() => navigate('/pagos')}
          />
          <AccionBtn
            icon={Zap}
            label="Ver servicios"
            desc={`${serviciosPendientes} pendientes`}
            color="var(--info)"
            onClick={() => navigate('/servicios')}
          />
          <AccionBtn
            icon={ClipboardCheck}
            label="Check rápido"
            desc="Estado en 10 seg."
            color="var(--positive)"
            onClick={() => setShowQuickCheck(true)}
          />
          <AccionBtn
            icon={CalendarCheck}
            label="Nuevo mes"
            desc="Reiniciar servicios"
            color="var(--warning)"
            onClick={() => setShowNuevoMes(true)}
          />
        </div>
      </m.section>

      {/* ── Resumen cobros por inquilino ── */}
      <m.section {...fadeUp(0.3)}>
        <div
          className="rounded-2xl border border-border bg-card px-6 py-5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-textMuted">Cobros</p>
              <h2 className="mt-1 text-lg font-semibold">Estado por inquilino</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pagos')}
              className="text-xs font-semibold text-textMuted transition hover:text-textMain"
            >
              Ver todos →
            </button>
          </div>

          <div className="space-y-3">
            {inquilinos
              .filter((inq) => inq.activo)
              .map((inq) => {
                const hab = habitaciones.find((h) => h.id === inq.habitacionId)
                const pago = pagos.find(
                  (p) => p.inquilinoId === inq.id && p.mes === mesVisualizado,
                )
                return (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 transition hover:bg-cardMuted/40"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                      >
                        {inq.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textMain">{inq.nombre}</p>
                        <p className="text-[11px] text-textMuted">
                          {hab?.nombre ?? 'Sin habitacion'} — {formatCOP(hab?.precioActual ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      {pago && (
                        <span className="font-mono text-sm text-textMuted">
                          {formatCOP(pago.monto)}
                        </span>
                      )}
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        style={
                          pago?.estado === 'pagado'
                            ? { background: 'var(--positive-dim)', color: 'var(--positive)' }
                            : pago?.estado === 'vencido'
                            ? { background: 'var(--danger-dim)', color: 'var(--danger)' }
                            : pago
                            ? { background: 'var(--warning-dim)', color: 'var(--warning)' }
                            : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                        }
                      >
                        {pago?.estado ?? 'sin registro'}
                      </span>
                    </div>
                  </div>
                )
              })}
            {inquilinos.filter((i) => i.activo).length === 0 && (
              <p className="text-center text-sm text-textMuted py-4">
                Sin inquilinos activos registrados.
              </p>
            )}
          </div>
        </div>
      </m.section>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showQuickCheck && (
          <CheckRapidoModal alertas={alertas} onClose={() => setShowQuickCheck(false)} />
        )}
        {showNuevoMes && (
          <NuevoMesModal onClose={() => setShowNuevoMes(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
