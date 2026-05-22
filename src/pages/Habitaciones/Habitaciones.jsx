import { useMemo, useState, useEffect } from 'react'
import { Plus, Sliders, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import HabitacionesGrid from '../../organisms/HabitacionesGrid/HabitacionesGrid.jsx'
import { useRecomendacionPrecios } from '../../hooks/useRecomendacionPrecios.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { useInquilinosStore } from '../../store/inquilinosStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import { useUiStore } from '../../store/uiStore.js'
import HabitacionModal from '../../organisms/HabitacionModal/HabitacionModal.jsx'
import { createId } from '../../utils/id.js'
import HabitacionDetalleModal from '../../organisms/HabitacionDetalleModal/HabitacionDetalleModal.jsx'
import ConfirmModal from '../../atoms/ConfirmModal/ConfirmModal.jsx'
import toast from 'react-hot-toast'

export default function Habitaciones() {
  const [showModal, setShowModal]           = useState(false)
  const [editing, setEditing]               = useState(null)
  const [detail, setDetail]                 = useState(null)
  const [confirmTarget, setConfirmTarget]   = useState(null)
  const [showSimulator, setShowSimulator]   = useState(false)

  const habitacionesBase  = useHabitacionesStore((s) => s.habitaciones)
  const addHabitacion     = useHabitacionesStore((s) => s.addHabitacion)
  const updateHabitacion  = useHabitacionesStore((s) => s.updateHabitacion)
  const removeHabitacion  = useHabitacionesStore((s) => s.removeHabitacion)
  const inquilinos        = useInquilinosStore((s) => s.inquilinos)
  const pagos             = usePagosStore((s) => s.pagos)
  const serviciosHabitacion = useServiciosStore((s) => s.serviciosHabitacion)
  const ipcAnual          = useAppSettingsStore((s) => s.ipcAnual)
  const addIpcAnio        = useAppSettingsStore((s) => s.addIpcAnio)
  const mesActivo         = useUiStore((s) => s.mesActivo)

  const [simulatedIpc, setSimulatedIpc] = useState(ipcAnual)

  useEffect(() => {
    setSimulatedIpc(ipcAnual)
  }, [ipcAnual])

  const habitaciones = habitacionesBase.map((hab) => {
    const inq = inquilinos.find((i) => i.id === hab.inquilinoId)
    return {
      ...hab,
      inquilino: inq ? inq.nombre : null,
      inquilinoFechaIngreso: inq ? inq.fechaIngreso : null,
    }
  })

  const recomConfig = useMemo(
    () => ({ ipcAnual, objetivoMargen: 20, mesActivo }),
    [ipcAnual, mesActivo],
  )

  const recomendaciones = useRecomendacionPrecios(
    habitaciones, pagos, serviciosHabitacion, recomConfig,
  )

  const recomendacionesActivas = recomendaciones.filter(
    (r) => r.recomendacion.urgencia !== 'ninguna',
  ).length

  const habitacionesOcupadas = useMemo(() => {
    return habitaciones.filter((h) => h.estado === 'ocupada' && h.inquilinoId)
  }, [habitaciones])

  const { totalIncrementoMensual, totalIncrementoAnual } = useMemo(() => {
    let mensual = 0
    habitacionesOcupadas.forEach((hab) => {
      const nuevoPrecio = Math.round((hab.precioActual * (1 + simulatedIpc / 100)) / 10000) * 10000
      mensual += Math.max(0, nuevoPrecio - hab.precioActual)
    })
    return {
      totalIncrementoMensual: mensual,
      totalIncrementoAnual: mensual * 12,
    }
  }, [habitacionesOcupadas, simulatedIpc])

  const handleApplyIpc = () => {
    const year = parseInt(mesActivo.split('-')[0], 10) || new Date().getFullYear()
    addIpcAnio(year, simulatedIpc)
    toast.success(`IPC del año ${year} actualizado a ${simulatedIpc}% en la configuración`)
  }

  const handleDeleteConfirmed = () => {
    if (!confirmTarget) return
    removeHabitacion(confirmTarget.id)
    toast.success(`${confirmTarget.nombre} eliminada`)
    setConfirmTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-6"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-15"
          style={{ background: 'var(--accent)' }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">Habitaciones</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Estado en tiempo real
            </h1>
            <p className="mt-1 text-sm text-textMuted">
              Cada habitacion tiene su color, estado y alertas de ajuste.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#0f1923' }}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar habitacion
          </button>
        </div>
      </header>

      {/* FIX #2: Banner de recomendaciones con dato real */}
      {recomendacionesActivas > 0 && (
        <div
          className="flex items-center justify-between rounded-2xl border px-5 py-4"
          style={{
            borderColor: 'var(--warning)',
            background: 'var(--warning-dim)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
              {recomendacionesActivas} habitacion{recomendacionesActivas > 1 ? 'es' : ''} con ajuste de precio sugerido
            </p>
            <p className="text-xs text-textMuted mt-0.5">
              Basado en IPC {ipcAnual}%, ocupacion y servicios. Revisalas en Reportes &rarr; Precios.
            </p>
          </div>
        </div>
      )}

      {/* ── Simulador de Impacto IPC ── */}
      <section className="glass-card overflow-hidden transition-all duration-300">
        <button
          type="button"
          onClick={() => setShowSimulator(!showSimulator)}
          className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Simulador de Impacto IPC
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Proyecta ingresos y ajusta arriendos basados en simulación de IPC.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              IPC Sim: {simulatedIpc.toFixed(1)}%
            </span>
            {showSimulator ? (
              <ChevronUp className="h-5 w-5 text-textMuted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-textMuted" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {showSimulator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-t border-border bg-card-muted/20 px-6 py-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Controles del Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-textMuted">
                      Tasa de IPC Simulado
                    </label>
                    <span className="text-2xl font-bold font-mono text-accent" style={{ color: 'var(--accent)' }}>
                      {simulatedIpc.toFixed(1)}%
                    </span>
                  </div>

                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.1"
                      value={simulatedIpc}
                      onChange={(e) => setSimulatedIpc(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border-subtle"
                      style={{
                        accentColor: 'var(--accent)',
                      }}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-textMuted mt-1">
                      <span>0% (Sin subida)</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>15% (Máx)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleApplyIpc}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition duration-200 border"
                      style={{
                        borderColor: 'var(--border-strong)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Aplicar IPC de {simulatedIpc.toFixed(1)}% a Configuración
                    </button>
                  </div>
                </div>

                {/* Métricas de Impacto Financiero */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="rounded-xl border border-border bg-card p-4"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-textMuted">
                        Ingreso Mensual Extra
                      </p>
                      <p
                        className="mt-2 text-xl font-bold font-mono text-positive"
                        style={{ color: 'var(--positive)' }}
                      >
                        + ${totalIncrementoMensual.toLocaleString('es-CO')}
                      </p>
                      <p className="text-[10px] text-textMuted mt-0.5">Para hab. ocupadas</p>
                    </div>

                    <div
                      className="rounded-xl border border-border bg-card p-4"
                      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-textMuted">
                        Ingreso Anual Extra
                      </p>
                      <p
                        className="mt-2 text-xl font-bold font-mono text-positive"
                        style={{ color: 'var(--positive)' }}
                      >
                        + ${totalIncrementoAnual.toLocaleString('es-CO')}
                      </p>
                      <p className="text-[10px] text-textMuted mt-0.5">Impacto proyectado</p>
                    </div>
                  </div>

                  <div className="text-xs text-textMuted leading-relaxed">
                    <AlertCircle className="inline h-3.5 w-3.5 mr-1 align-text-bottom text-accent" />
                    El incremento se calcula redondeando al valor de 10,000 pesos más cercano (ej: $872,000 pasa a $870,000 o $880,000) de acuerdo con las políticas estándar del apartamento.
                  </div>
                </div>
              </div>

              {/* Tabla de Previsualización */}
              <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-border-subtle/30 text-textMuted font-bold uppercase tracking-[0.05em]">
                        <th className="px-4 py-3">Habitación</th>
                        <th className="px-4 py-3">Inquilino</th>
                        <th className="px-4 py-3 text-right">Renta Actual</th>
                        <th className="px-4 py-3 text-right">Proyección IPC</th>
                        <th className="px-4 py-3 text-right">Incremento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {habitacionesOcupadas.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-textMuted">
                            No hay habitaciones ocupadas en este momento para proyectar incrementos.
                          </td>
                        </tr>
                      ) : (
                        habitacionesOcupadas.map((hab) => {
                          const nuevoPrecio = Math.round((hab.precioActual * (1 + simulatedIpc / 100)) / 10000) * 10000;
                          const dif = nuevoPrecio - hab.precioActual;
                          return (
                            <tr
                              key={hab.id}
                              className="border-b border-border-subtle last:border-0 hover:bg-border-subtle/10 transition duration-150"
                            >
                              <td className="px-4 py-3 font-semibold">{hab.nombre}</td>
                              <td className="px-4 py-3 text-textMuted">{hab.inquilino}</td>
                              <td className="px-4 py-3 text-right font-mono text-textMuted">
                                ${hab.precioActual.toLocaleString('es-CO')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-accent" style={{ color: 'var(--accent)' }}>
                                ${nuevoPrecio.toLocaleString('es-CO')}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-semibold text-positive" style={{ color: 'var(--positive)' }}>
                                +${dif.toLocaleString('es-CO')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <HabitacionesGrid
        habitaciones={habitaciones}
        recomendaciones={recomendaciones}
        onEdit={(habitacion) => { setEditing(habitacion); setShowModal(true) }}
        onDelete={(habitacion) => setConfirmTarget(habitacion)}  // FIX #4
        onView={(habitacion) => setDetail(habitacion)}
      />

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <HabitacionModal
            onClose={() => { setEditing(null); setShowModal(false) }}
            title={editing ? 'Editar habitacion' : 'Nueva habitacion'}
            initialValues={editing}
            onSubmit={(data) => {
              if (editing) {
                updateHabitacion(editing.id, {
                  nombre: data.nombre,
                  color: data.color,
                  precioActual: data.precioActual,
                  precioMinimo: Math.round(data.precioActual * 0.9),
                  estado: data.estado,
                  descripcion: data.descripcion,
                })
                toast.success('Habitacion actualizada')
              } else {
                addHabitacion({
                  id: createId('h'),
                  nombre: data.nombre,
                  color: data.color,
                  precioActual: data.precioActual,
                  precioMinimo: Math.round(data.precioActual * 0.9),
                  estado: data.estado,
                  inquilinoId: null,
                  descripcion: data.descripcion,
                  amenidades: [],
                  fechaCreacion: new Date().toISOString().slice(0, 10),
                })
                toast.success('Habitacion creada')
              }
              setEditing(null)
              setShowModal(false)
            }}
          />
        )}

        {detail && (
          <HabitacionDetalleModal
            habitacion={detail}
            pagos={pagos.filter((p) => p.habitacionId === detail.id)}
            onClose={() => setDetail(null)}
          />
        )}

        {confirmTarget && (
          <ConfirmModal
            title={`Eliminar ${confirmTarget?.nombre ?? 'habitacion'}`}
            message="Se eliminara la habitacion y todos sus datos asociados. Esta accion no se puede deshacer."
            confirmLabel="Eliminar habitacion"
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setConfirmTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
