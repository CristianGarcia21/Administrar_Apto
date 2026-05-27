import { useState } from 'react'
import { format, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  X,
  CalendarCheck,
  ChevronRight,
  ChevronLeft,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Home,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Info,
} from 'lucide-react'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useUiStore } from '../../store/uiStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useHistorialStore } from '../../store/historialStore.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import { formatCOP } from '../../utils/formatCOP.js'

const ICONOS = { Droplet: Droplets, Zap, Flame, Wifi, Home }

function getNextMonthStr(mesActivo) {
  const [y, m] = mesActivo.split('-').map(Number)
  return addMonths(new Date(y, m - 1, 1), 1).toISOString().slice(0, 7)
}

function advanceVencimiento(fechaStr, nextMes) {
  try {
    const [, , day] = fechaStr.split('-')
    return `${nextMes}-${day}`
  } catch {
    return `${nextMes}-20`
  }
}

// ── Paso IPC: solo en enero ──────────────────────────────────────
function StepIPC({ habitaciones, ipcActual, anioAjuste, onConfirm, onSkip }) {
  const [ipc, setIpc] = useState(ipcActual)
  const [precios, setPrecios] = useState(() =>
    Object.fromEntries(
      habitaciones.map((h) => [
        h.id,
        Math.round(h.precioActual * (1 + ipcActual / 100)),
      ]),
    ),
  )

  const recalcular = (nuevoIpc) => {
    const val = parseFloat(nuevoIpc) || 0
    setIpc(val)
    setPrecios(
      Object.fromEntries(
        habitaciones.map((h) => [
          h.id,
          Math.round(h.precioActual * (1 + val / 100)),
        ]),
      ),
    )
  }

  return (
    <>
      {/* Header */}
      <div className="relative px-6 pt-7 pb-5 border-b border-border">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}
        >
          <TrendingUp className="h-3 w-3" />
          Ajuste IPC — Enero {anioAjuste}
        </div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Actualizacion anual de arriendos
        </h2>
        <p className="mt-1 text-sm text-textMuted">
          Ingresa el IPC oficial publicado por el DANE para calcular los nuevos precios.
        </p>
      </div>

      {/* IPC input */}
      <div className="px-6 pt-5 pb-4">
        <div
          className="flex items-center gap-4 rounded-2xl border border-border px-4 py-4"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-textMuted">
              IPC {anioAjuste - 1} (DANE)
            </p>
            <p className="text-[11px] text-textMuted mt-0.5">
              Publicado en enero. Maximo permitido por Ley 820/2003.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.01"
              min="0"
              max="30"
              value={ipc}
              onChange={(e) => recalcular(e.target.value)}
              aria-label={`IPC ${anioAjuste - 1} en porcentaje`}
              className="w-20 rounded-xl border border-border bg-card px-3 py-2 text-right font-mono text-lg font-bold text-accent outline-none focus:border-accent"
            />
            <span className="text-lg font-bold text-textMuted">%</span>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-textMuted">
          <Info className="h-3 w-3 flex-shrink-0" />
          El ajuste solo aplica a habitaciones con mas de 12 meses de contrato (Ley 820).
        </div>
      </div>

      {/* Precios calculados */}
      <div className="max-h-[30vh] overflow-y-auto px-6 space-y-2 pb-4">
        {habitaciones.map((hab) => {
          const nuevo = precios[hab.id] ?? hab.precioActual
          const diff = nuevo - hab.precioActual
          return (
            <div
              key={hab.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div>
                <p className="text-sm font-semibold text-textMain">{hab.nombre}</p>
                <p className="text-[11px] text-textMuted">
                  Actual: <span className="font-mono">{formatCOP(hab.precioActual)}</span>
                </p>
              </div>
              <div className="text-right">
                <input
                  type="number"
                  value={nuevo}
                  onChange={(e) =>
                    setPrecios((prev) => ({
                      ...prev,
                      [hab.id]: Number(e.target.value),
                    }))
                  }
                  aria-label={`Precio con IPC para ${hab.nombre}`}
                  className="w-28 rounded-lg border border-border bg-cardMuted px-2 py-1 text-right font-mono text-sm text-accent outline-none focus:border-accent"
                />
                <p className="mt-0.5 text-[11px]" style={{ color: 'var(--positive)' }}>
                  +{formatCOP(diff)} ({ipc}%)
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-5 flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-textMuted transition hover:bg-cardMuted"
        >
          Omitir este ano
        </button>
        <button
          type="button"
          onClick={() => onConfirm(ipc, precios)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
          style={{ background: 'var(--warning)', color: '#0f1923' }}
        >
          Aplicar IPC {ipc}%
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  )
}

// ── Modal principal ──────────────────────────────────────────────
export default function NuevoMesModal({ onClose }) {
  const serviciosPublicos   = useServiciosStore((s) => s.serviciosPublicos)
  const setServiciosPublicos = useServiciosStore((s) => s.setServiciosPublicos)
  const mesActivo           = useUiStore((s) => s.mesActivo)
  const setMesActivo        = useUiStore((s) => s.setMesActivo)
  const setPendingRollover  = useUiStore((s) => s.setPendingRollover)
  const pagos               = usePagosStore((s) => s.pagos)
  const addSnapshot         = useHistorialStore((s) => s.addSnapshot)
  const habitaciones        = useHabitacionesStore((s) => s.habitaciones)
  const applyIpcAdjustment  = useHabitacionesStore((s) => s.applyIpcAdjustment)
  const ipcAnual            = useAppSettingsStore((s) => s.ipcAnual)
  const addIpcAnio          = useAppSettingsStore((s) => s.addIpcAnio)

  const nextMes = getNextMonthStr(mesActivo)
  const [nextY, nextM] = nextMes.split('-').map(Number)
  const isEnero = nextM === 1
  const nextMesLabel = format(new Date(nextY, nextM - 1, 1), "MMMM 'de' yyyy", { locale: es })

  const serviciosDelMesActivo = serviciosPublicos.filter((s) => s.mes === mesActivo)

  const [montos, setMontos] = useState(() =>
    Object.fromEntries(serviciosDelMesActivo.map((s) => [s.id, s.monto]))
  )
  // steps: 'ipc' (solo enero) → 'servicios' → 'done'
  const [step, setStep] = useState(isEnero ? 'ipc' : 'servicios')
  const [editingId, setEditingId] = useState(null)

  const total = serviciosDelMesActivo.reduce((sum, s) => sum + (montos[s.id] ?? s.monto), 0)

  // ── Handlers IPC ──
  const handleIpcConfirm = (ipcValor, preciosNuevos) => {
    const ajustes = Object.entries(preciosNuevos).map(([habitacionId, nuevoPrecio]) => ({
      habitacionId,
      nuevoPrecio,
    }))
    applyIpcAdjustment(ajustes, nextY)
    addIpcAnio(nextY, ipcValor)
    setStep('servicios')
  }

  const handleIpcSkip = () => setStep('servicios')

  // ── Handler confirmar mes ──
  const handleConfirm = () => {
    const ingresosDelMes = pagos
      .filter((p) => p.estado === 'pagado' && p.mes === mesActivo)
      .reduce((sum, p) => sum + p.monto, 0)
    const gastosDelMes = serviciosDelMesActivo.reduce((sum, s) => sum + s.monto, 0)
    const [my, mm] = mesActivo.split('-').map(Number)
    const mesLabelCorto = new Date(my, mm - 1, 1)
      .toLocaleString('es-CO', { month: 'short' })
      .replace('.', '')
    addSnapshot({ mes: mesActivo, mesLabel: mesLabelCorto, ingresos: ingresosDelMes, gastos: gastosDelMes })

    const newServices = serviciosDelMesActivo.map((s) => ({
      ...s,
      id: `${s.servicioId}-${nextMes}`,
      mes: nextMes,
      estado: 'pendiente',
      monto: montos[s.id] ?? s.monto,
      fechaVencimiento: advanceVencimiento(s.fechaVencimiento, nextMes),
    }))
    setServiciosPublicos([...serviciosPublicos, ...newServices])
    setMesActivo(nextMes)
    setPendingRollover(false)
    setStep('done')
  }

  const handleDismiss = () => {
    setPendingRollover(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)',
        }}
      >
        {/* Glow decorativo */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-15"
          style={{ background: step === 'ipc' ? 'var(--warning)' : 'var(--accent)' }}
        />
        <div
          className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full opacity-10"
          style={{ background: 'var(--info)' }}
        />

        {/* ── Paso: IPC (solo enero) ── */}
        {step === 'ipc' && (
          <StepIPC
            habitaciones={habitaciones.filter((h) => h.estado === 'ocupada')}
            ipcActual={ipcAnual}
            anioAjuste={nextY}
            onConfirm={handleIpcConfirm}
            onSkip={handleIpcSkip}
          />
        )}

        {/* ── Paso: Servicios ── */}
        {step === 'servicios' && (
          <>
            <div className="relative px-6 pt-7 pb-5 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {isEnero && (
                    <button
                      type="button"
                      onClick={() => setStep('ipc')}
                      className="mb-2 flex items-center gap-1 text-xs text-textMuted transition hover:text-textMain"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Ajuste IPC
                    </button>
                  )}
                  <div
                    className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                  >
                    <CalendarCheck className="h-3 w-3" />
                    {isEnero ? 'Paso 2 de 2 — ' : ''}Nuevo mes
                  </div>
                  <h2 className="text-2xl font-bold capitalize" style={{ fontFamily: 'var(--font-display)' }}>
                    {nextMesLabel}
                  </h2>
                  <p className="mt-1 text-sm text-textMuted">
                    Ajusta los montos si ya llegaron los recibos, luego confirma.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Cerrar"
                  className="rounded-xl border border-border p-2 text-textMuted transition hover:bg-cardMuted hover:text-textMain"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative max-h-[45vh] overflow-y-auto px-6 py-4 space-y-2">
              {serviciosDelMesActivo.map((servicio) => {
                const Icon = ICONOS[servicio.icono] ?? Home
                const isEditing = editingId === servicio.id
                const monto = montos[servicio.id] ?? servicio.monto
                return (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: servicio.color + '22', color: servicio.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textMain">{servicio.nombre}</p>
                        <p className="text-[11px] text-textMuted">{servicio.periocidad}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          type="number"
                          autoFocus
                          value={monto}
                          onChange={(e) =>
                            setMontos((prev) => ({ ...prev, [servicio.id]: Number(e.target.value) }))
                          }
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                          aria-label={`Monto de ${servicio.nombre}`}
                          className="w-28 rounded-lg border border-border bg-cardMuted px-2 py-1 text-right font-mono text-sm text-textMain outline-none focus:border-primary"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(servicio.id)}
                          className="group flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-cardMuted"
                        >
                          <span className="font-mono text-sm text-accent">{formatCOP(monto)}</span>
                          <Edit3 className="h-3 w-3 text-textMuted opacity-0 transition group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative border-t border-border px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-textMuted">Total estimado del mes</span>
                <span className="font-mono text-lg font-bold text-accent">{formatCOP(total)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-textMuted transition hover:bg-cardMuted"
                >
                  Recordar despues
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
                  style={{ background: 'var(--accent)', color: '#0f1923' }}
                >
                  Iniciar {nextMesLabel.split(' ')[0]}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Paso: Confirmacion ── */}
        {step === 'done' && (
          <div className="relative flex flex-col items-center px-8 py-12 text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: 'var(--positive-dim)' }}
            >
              <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--positive)' }} />
            </div>
            <h2 className="text-2xl font-bold capitalize" style={{ fontFamily: 'var(--font-display)' }}>
              {nextMesLabel.split(' ')[0]} iniciado
            </h2>
            <p className="mt-2 text-sm text-textMuted">
              Los servicios se reiniciaron a <strong>pendiente</strong> con los montos configurados.
              {isEnero && (
                <span className="block mt-1" style={{ color: 'var(--warning)' }}>
                  Los precios de arriendo se actualizaron con el IPC.
                </span>
              )}
            </p>
            <div
              className="mt-4 w-full rounded-xl px-4 py-3 text-left text-sm"
              style={{ background: 'var(--positive-dim)', color: 'var(--positive)' }}
            >
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Recuerda registrar los arriendos en Pagos
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#0f1923' }}
            >
              Ir al Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
