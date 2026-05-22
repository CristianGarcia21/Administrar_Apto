import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PagosTable from '../../organisms/PagosTable/PagosTable.jsx'
import { usePagosStore } from '../../store/pagosStore.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { useInquilinosStore } from '../../store/inquilinosStore.js'
import { useUiStore } from '../../store/uiStore.js'
import RegistrarPagoModal from '../../organisms/RegistrarPagoModal/RegistrarPagoModal.jsx'
import { createId } from '../../utils/id.js'
import PagoDetalleModal from '../../organisms/PagoDetalleModal/PagoDetalleModal.jsx'
import ConfirmModal from '../../atoms/ConfirmModal/ConfirmModal.jsx'
import { formatCOP } from '../../utils/formatCOP.js'
import toast from 'react-hot-toast'

const formatFecha = (fechaISO) => {
  if (!fechaISO) return '-'
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

export default function Pagos() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)  // FIX #4

  const mesActivo = useUiStore((s) => s.mesActivo)
  const mesVisualizado = useUiStore((s) => s.mesVisualizado)

  const pagos        = usePagosStore((s) => s.pagos)
  const addPago      = usePagosStore((s) => s.addPago)
  const updatePago   = usePagosStore((s) => s.updatePago)
  const removePago   = usePagosStore((s) => s.removePago)
  const habitaciones = useHabitacionesStore((s) => s.habitaciones)
  const inquilinos   = useInquilinosStore((s) => s.inquilinos)

  const [mesY, mesM] = mesVisualizado.split('-').map(Number)
  const mesLabel = format(new Date(mesY, mesM - 1, 1), "MMMM 'de' yyyy", { locale: es })
  const isCurrentMonth = mesVisualizado === mesActivo

  // ── Datos filtrados por mes ──
  const pagosMes    = pagos.filter((p) => p.mes === mesVisualizado)
  const pagados     = pagosMes.filter((p) => p.estado === 'pagado')
  const pendientes  = pagosMes.filter((p) => p.estado === 'pendiente' || p.estado === 'vencido')
  const totalRecaudado = pagados.reduce((t, p) => t + p.monto, 0)
  const totalPendiente = pendientes.reduce((t, p) => t + p.monto, 0)

  // ── Resumen por inquilino (para WhatsApp) ──
  const resumenInquilinos = inquilinos
    .filter((i) => i.activo)
    .map((inq) => {
      const pago = pagosMes.find((p) => p.inquilinoId === inq.id)
      const hab  = habitaciones.find((h) => h.id === inq.habitacionId)
      return { inquilino: inq, habitacion: hab, pago }
    })

  const handleCopiarWhatsApp = () => {
    const lineas = resumenInquilinos.map(({ inquilino, habitacion, pago }) => {
      const estado = pago
        ? pago.estado === 'pagado' ? 'Pagado' : 'Pendiente'
        : 'Sin registro'
      const monto = pago ? formatCOP(pago.monto) : formatCOP(habitacion?.precioActual ?? 0)
      return `${inquilino.nombre} (${habitacion?.nombre ?? '?'}): ${monto} — ${estado}`
    })
    const texto = [
      `Resumen arriendos ${mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)}`,
      '─'.repeat(32),
      ...lineas,
      '─'.repeat(32),
      `Total recaudado: ${formatCOP(totalRecaudado)}`,
      `Pendiente: ${formatCOP(totalPendiente)}`,
    ].join('\n')

    navigator.clipboard.writeText(texto).then(() => {
      toast.success('Resumen copiado — listo para WhatsApp')
    }).catch(() => {
      toast.error('No se pudo copiar al portapapeles')
    })
  }

  // ── Tabla de pagos ──
  const pagosTable = pagosMes.map((pago) => {
    const habitacion = habitaciones.find((h) => h.id === pago.habitacionId)
    const inquilino  = inquilinos.find((i) => i.id === pago.inquilinoId)
    return {
      id: pago.id,
      fecha: formatFecha(pago.fecha),
      habitacion: habitacion?.nombre ?? 'Sin asignar',
      inquilino: inquilino?.nombre ?? 'Sin inquilino',
      monto: pago.monto,
      metodo: pago.metodoPago,
      estado: pago.estado,
      diasMora: pago.diasMora,
      notas: pago.notas,
    }
  })

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
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">Pagos</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Control de recaudo
            </h1>
            <p className="mt-1 text-sm text-textMuted">
              Registra y revisa cada pago con metodo, notas y mora.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopiarWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Copiar resumen
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#0f1923' }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Registrar pago
            </button>
          </div>
        </div>
      </header>

      {/* ── KPIs del mes ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-2xl border border-border bg-card px-5 py-5"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--positive-dim)' }}
          >
            <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--positive)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Recaudado</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--positive)' }}>
            {formatCOP(totalRecaudado)}
          </p>
          <p className="mt-1 text-xs text-textMuted">{pagados.length} pago{pagados.length !== 1 ? 's' : ''} confirmado{pagados.length !== 1 ? 's' : ''}</p>
        </div>

        <div
          className="rounded-2xl border border-border bg-card px-5 py-5"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--warning-dim)' }}
          >
            <Clock className="h-5 w-5" style={{ color: 'var(--warning)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Pendiente</p>
          <p className="mt-1 font-mono text-2xl font-bold" style={{ color: 'var(--warning)' }}>
            {formatCOP(totalPendiente)}
          </p>
          <p className="mt-1 text-xs text-textMuted">{pendientes.length} pago{pendientes.length !== 1 ? 's' : ''} por confirmar</p>
        </div>

        {/* Resumen por inquilino */}
        <div
          className="rounded-2xl border border-border bg-card px-5 py-5"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--info-dim)' }}
          >
            <AlertCircle className="h-5 w-5" style={{ color: 'var(--info)' }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-textMuted">Por inquilino</p>
          <div className="mt-2 space-y-1.5">
            {resumenInquilinos.map(({ inquilino, habitacion, pago }) => (
              <div key={inquilino.id} className="flex items-center justify-between">
                <span className="text-xs text-textMuted truncate max-w-[100px]">
                  {inquilino.nombre.split(' ')[0]}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase flex-shrink-0"
                  style={
                    pago?.estado === 'pagado'
                      ? { background: 'var(--positive-dim)', color: 'var(--positive)' }
                      : pago?.estado === 'vencido'
                      ? { background: 'var(--danger-dim)', color: 'var(--danger)' }
                      : pago
                      ? { background: 'var(--warning-dim)', color: 'var(--warning)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }
                  }
                >
                  {pago?.estado ?? 'sin registro'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla de pagos ── */}
      {pagosMes.length === 0 ? (
        <div
          className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <CreditCard className="h-7 w-7 text-textMuted" />
          </div>
          <p className="mt-4 font-semibold text-textMain">
            Sin pagos registrados en {mesLabel}
          </p>
          <p className="mt-1 text-sm text-textMuted max-w-xs">
            {isCurrentMonth
              ? 'Usa el boton "Registrar pago" para agregar el primero.'
              : 'Este mes no tiene registros guardados.'}
          </p>
        </div>
      ) : (
        <PagosTable
          pagos={pagosTable}
          onEdit={(pago) => {
            const base = pagos.find((item) => item.id === pago.id)
            setEditing(base)
            setShowModal(true)
          }}
          onDelete={(pago) => setConfirmTarget(pago)}
          onView={(pago) => setDetail(pago)}
        />
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <RegistrarPagoModal
            inquilinos={inquilinos}
            habitaciones={habitaciones}
            onClose={() => { setEditing(null); setShowModal(false) }}
            title={editing ? 'Editar pago' : 'Registrar pago'}
            initialValues={editing}
            onSubmit={(data) => {
              if (editing) {
                updatePago(editing.id, {
                  inquilinoId: data.inquilinoId,
                  habitacionId: data.habitacionId,
                  monto: data.monto,
                  fecha: data.fecha,
                  mes: data.fecha.slice(0, 7),
                  estado: data.estado,
                  metodoPago: data.metodoPago,
                  notas: data.notas ?? '',
                })
                toast.success('Pago actualizado')
              } else {
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
              }
              setEditing(null)
              setShowModal(false)
            }}
          />
        )}

        {detail && (
          <PagoDetalleModal pago={detail} onClose={() => setDetail(null)} />
        )}

        {confirmTarget && (
          <ConfirmModal
            title="Eliminar pago"
            message="Se eliminara este registro de pago permanentemente. Esta accion no se puede deshacer."
            confirmLabel="Eliminar pago"
            onConfirm={() => {
              removePago(confirmTarget.id)
              toast.success('Pago eliminado')
              setConfirmTarget(null)
            }}
            onCancel={() => setConfirmTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
