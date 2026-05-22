import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const estadoTone = {
  ocupada: 'success',
  libre: 'info',
  mantenimiento: 'warning',
}

export default function HabitacionDetalleModal({
  habitacion,
  pagos,
  onClose,
}) {
  const totalPagado = pagos
    .filter((pago) => pago.estado === 'pagado')
    .reduce((total, pago) => total + pago.monto, 0)

  return (
    <ModalLayout
      title="Detalle de habitacion"
      description="Resumen de pagos y estado actual."
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
                {habitacion.nombre}
              </p>
              <p className="mt-2 text-xl font-semibold text-textMain">
                {formatCOP(habitacion.precioActual)}
              </p>
            </div>
            <Badge label={habitacion.estado} tone={estadoTone[habitacion.estado]} />
          </div>
          <p className="mt-3 text-sm text-textMuted">
            {habitacion.descripcion}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Total recibido
          </p>
          <p className="mt-2 font-mono text-xl text-success">
            {formatCOP(totalPagado)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Historial de pagos
          </p>
          <div className="mt-3 space-y-2 text-sm">
            {pagos.length === 0 ? (
              <p className="text-textMuted">Sin pagos registrados.</p>
            ) : (
              pagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-none"
                >
                  <div>
                    <p className="font-semibold text-textMain">
                      {pago.mes}
                    </p>
                    <p className="text-xs text-textMuted">{pago.fecha}</p>
                  </div>
                  <span className="font-mono text-accent">
                    {formatCOP(pago.monto)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}
