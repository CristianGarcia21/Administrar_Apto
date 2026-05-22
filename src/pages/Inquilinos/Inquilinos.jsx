import { useState } from 'react'
import { Plus, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import InquilinosTable from '../../organisms/InquilinosTable/InquilinosTable.jsx'
import { useInquilinosStore } from '../../store/inquilinosStore.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useUiStore } from '../../store/uiStore.js'
import InquilinoModal from '../../organisms/InquilinoModal/InquilinoModal.jsx'
import { createId } from '../../utils/id.js'
import InquilinoDetalleModal from '../../organisms/InquilinoDetalleModal/InquilinoDetalleModal.jsx'
import RegistrarPagoModal from '../../organisms/RegistrarPagoModal/RegistrarPagoModal.jsx'
import ConfirmModal from '../../atoms/ConfirmModal/ConfirmModal.jsx'
import { formatCOP } from '../../utils/formatCOP.js'
import toast from 'react-hot-toast'

const formatFecha = (fechaISO) => {
  if (!fechaISO) return '-'
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function Inquilinos() {
  const [showModal, setShowModal]       = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [editing, setEditing]           = useState(null)
  const [detail, setDetail]             = useState(null)
  const [pagoTarget, setPagoTarget]     = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [activeTab, setActiveTab]       = useState('activos')
  const [checkoutTarget, setCheckoutTarget] = useState(null)

  const inquilinos      = useInquilinosStore((s) => s.inquilinos)
  const addInquilino    = useInquilinosStore((s) => s.addInquilino)
  const updateInquilino = useInquilinosStore((s) => s.updateInquilino)
  const removeInquilino = useInquilinosStore((s) => s.removeInquilino)
  const habitaciones    = useHabitacionesStore((s) => s.habitaciones)
  const updateHabitacion = useHabitacionesStore((s) => s.updateHabitacion)
  const pagos           = usePagosStore((s) => s.pagos)
  const addPago         = usePagosStore((s) => s.addPago)
  // FIX #5: usar mesActivo, no new Date()
  const mesActivo       = useUiStore((s) => s.mesActivo)

  // ── KPIs reales (FIX #1) ──
  const pagosMes    = pagos.filter((p) => p.mes === mesActivo)
  const pagados     = pagosMes.filter((p) => p.estado === 'pagado').length
  const conMora     = pagosMes.filter((p) => p.diasMora > 0).length
  const pendientes  = pagosMes.filter((p) => p.estado === 'pendiente' || p.estado === 'vencido').length
  const activos     = inquilinos.filter((i) => i.activo).length

  const filteredInquilinos = inquilinos.filter((i) => activeTab === 'activos' ? i.activo : !i.activo)

  const inquilinosTable = filteredInquilinos.map((inquilino) => {
    const habitacion = habitaciones.find((h) => h.id === inquilino.habitacionId)
    // FIX #5: filtrar pago por mesActivo
    const pago = pagos.find(
      (p) => p.inquilinoId === inquilino.id && p.mes === mesActivo,
    )

    return {
      id: inquilino.id,
      nombre: inquilino.nombre,
      habitacion: habitacion?.nombre ?? 'Sin asignar',
      fechaIngreso: formatFecha(inquilino.fechaIngreso),
      fechaSalida: formatFecha(inquilino.fechaSalida),
      estadoPago: pago?.estado ?? 'pendiente',
      diasMora: pago?.diasMora ?? 0,
      pagoMes: !!pago,
      color: habitacion?.color ?? '#4E7D9A',
    }
  })

  const handleDeleteConfirmed = () => {
    if (!confirmTarget) return
    const base = inquilinos.find((i) => i.id === confirmTarget.id)
    if (base?.habitacionId) {
      updateHabitacion(base.habitacionId, { inquilinoId: null, estado: 'libre' })
    }
    removeInquilino(confirmTarget.id)
    toast.success(`${confirmTarget.nombre} eliminado`)
    setConfirmTarget(null)
  }

  const handleCheckoutConfirmed = () => {
    if (!checkoutTarget) return
    const today = new Date().toISOString().slice(0, 10)
    
    updateInquilino(checkoutTarget.id, {
      activo: false,
      fechaSalida: today,
    })

    if (checkoutTarget.habitacionId) {
      updateHabitacion(checkoutTarget.habitacionId, {
        inquilinoId: null,
        estado: 'libre',
      })
    }

    toast.success(`Salida registrada para ${checkoutTarget.nombre}`)
    setCheckoutTarget(null)
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
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">Inquilinos</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Gestion humana y clara
            </h1>
            <p className="mt-1 text-sm text-textMuted">
              Ten a la vista pagos, mora y acciones en un solo lugar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#0f1923' }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo inquilino
          </button>
        </div>
      </header>

      {/* ── KPIs reales (FIX #1) ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card px-5 py-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--info-dim)' }}>
            <Users className="h-4 w-4" style={{ color: 'var(--info)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Activos</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--info)' }}>{activos}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--positive-dim)' }}>
            <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--positive)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Pagaron</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--positive)' }}>{pagados}</p>
          <p className="mt-0.5 text-[11px] text-textMuted">este mes</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--warning-dim)' }}>
            <Clock className="h-4 w-4" style={{ color: 'var(--warning)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Pendientes</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--warning)' }}>{pendientes}</p>
          <p className="mt-0.5 text-[11px] text-textMuted">sin confirmar</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--danger-dim)' }}>
            <AlertCircle className="h-4 w-4" style={{ color: 'var(--danger)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Con mora</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--danger)' }}>{conMora}</p>
          <p className="mt-0.5 text-[11px] text-textMuted">este mes</p>
        </div>
      </div>

      {/* ── Tabs de Navegación ── */}
      <div className="flex border-b border-border/80 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('activos')}
          className="relative px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] focus:outline-none transition duration-200"
          style={{
            color: activeTab === 'activos' ? 'var(--accent)' : 'var(--text-secondary)'
          }}
        >
          Inquilinos Activos
          {activeTab === 'activos' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('salidas')}
          className="relative px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] focus:outline-none transition duration-200"
          style={{
            color: activeTab === 'salidas' ? 'var(--accent)' : 'var(--text-secondary)'
          }}
        >
          Historial de Salidas
          {activeTab === 'salidas' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </button>
      </div>

      <InquilinosTable
        inquilinos={inquilinosTable}
        mostrarSalidas={activeTab === 'salidas'}
        onRegisterPago={(inquilino) => {
          setPagoTarget(inquilino)
          setShowPagoModal(true)
        }}
        onEdit={(inquilino) => {
          const base = inquilinos.find((i) => i.id === inquilino.id)
          setEditing(base)
          setShowModal(true)
        }}
        onDelete={(inquilino) => setConfirmTarget(inquilino)}
        onView={(inquilino) => {
          const base = inquilinos.find((i) => i.id === inquilino.id)
          setDetail({ ...inquilino, habitacion: inquilino.habitacion, inquilinoId: base?.id })
        }}
        onCheckout={(inquilino) => {
          const base = inquilinos.find((i) => i.id === inquilino.id)
          setCheckoutTarget(base)
        }}
      />

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <InquilinoModal
            habitaciones={habitaciones}
            onClose={() => { setEditing(null); setShowModal(false) }}
            onCheckout={() => {
              setCheckoutTarget(editing)
              setEditing(null)
              setShowModal(false)
            }}
            title={editing ? 'Editar inquilino' : 'Nuevo inquilino'}
            initialValues={editing}
            onSubmit={(data) => {
              if (editing) {
                updateInquilino(editing.id, {
                  nombre: data.nombre,
                  telefono: data.telefono,
                  email: data.email,
                  cedula: data.cedula,
                  habitacionId: data.habitacionId,
                  diaVencimiento: data.diaVencimiento,
                })
                if (editing.habitacionId !== data.habitacionId) {
                  updateHabitacion(editing.habitacionId, { inquilinoId: null })
                  updateHabitacion(data.habitacionId, { inquilinoId: editing.id })
                }
                toast.success('Inquilino actualizado')
              } else {
                const id = createId('i')
                addInquilino({
                  id,
                  nombre: data.nombre,
                  telefono: data.telefono,
                  email: data.email,
                  cedula: data.cedula,
                  habitacionId: data.habitacionId,
                  fechaIngreso: new Date().toISOString().slice(0, 10),
                  fechaSalida: null,
                  diaVencimiento: data.diaVencimiento,
                  activo: true,
                  notes: '',
                })
                updateHabitacion(data.habitacionId, { inquilinoId: id, estado: 'ocupada' })
                toast.success('Inquilino agregado')
              }
              setEditing(null)
              setShowModal(false)
            }}
          />
        )}

        {showPagoModal && (
          <RegistrarPagoModal
            inquilinos={inquilinos}
            habitaciones={habitaciones}
            initialValues={{
              inquilinoId: pagoTarget?.id ?? '',
              habitacionId: inquilinos.find((i) => i.id === pagoTarget?.id)?.habitacionId ?? '',
            }}
            title="Registrar pago"
            onClose={() => { setPagoTarget(null); setShowPagoModal(false) }}
            onSubmit={(data) => {
              addPago({
                id: createId('p'),
                inquilinoId: data.inquilinoId,
                habitacionId: data.habitacionId,
                monto: data.monto,
                fecha: data.fecha,
                mes: data.fecha.slice(0, 7),
                tipo: 'arriendo',
                estado: data.estado,
                metodoPago: data.metodoPago,
                diasMora: 0,
                notas: data.notas ?? '',
              })
              toast.success('Pago registrado')
              setPagoTarget(null)
              setShowPagoModal(false)
            }}
          />
        )}

        {detail && (
          <InquilinoDetalleModal
            inquilino={detail}
            pagos={pagos.filter((p) => p.inquilinoId === detail.inquilinoId)}
            onClose={() => setDetail(null)}
          />
        )}

        {confirmTarget && (
          <ConfirmModal
            title={`Eliminar ${confirmTarget?.nombre ?? 'inquilino'}`}
            message="Se eliminara el inquilino y su vinculo con la habitacion. Esta accion no se puede deshacer."
            confirmLabel="Eliminar"
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setConfirmTarget(null)}
          />
        )}

        {checkoutTarget && (
          <ConfirmModal
            title={`Registrar Salida de ${checkoutTarget?.nombre}`}
            message={`Se registrará la salida del inquilino y la habitación asociada quedará disponible. Toda la información histórica de pagos y datos se conservará intacta.`}
            confirmLabel="Confirmar Salida"
            onConfirm={handleCheckoutConfirmed}
            onCancel={() => setCheckoutTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
