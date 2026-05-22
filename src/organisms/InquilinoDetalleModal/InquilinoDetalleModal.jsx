import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const estadoTone = {
  pagado: 'success',
  pendiente: 'warning',
  vencido: 'danger',
}

export default function InquilinoDetalleModal({
  inquilino,
  pagos,
  onClose,
}) {
  const totalPagado = pagos
    .filter((pago) => pago.estado === 'pagado')
    .reduce((total, pago) => total + pago.monto, 0)

  const promedioMora = pagos.length
    ? Math.round(
        pagos.reduce((total, pago) => total + pago.diasMora, 0) / pagos.length,
      )
    : 0

  return (
    <ModalLayout
      title="Detalle del inquilino"
      description="Historial y resumen de pagos."
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            {inquilino.nombre}
          </p>
          <p className="mt-2 text-sm text-textMuted">
            {inquilino.habitacion}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
              Total pagado
            </p>
            <p className="mt-2 font-mono text-xl text-success">
              {formatCOP(totalPagado)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
              Promedio mora
            </p>
            <p className="mt-2 text-xl font-semibold text-textMain">
              {promedioMora} dias
            </p>
          </div>
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
                  <div className="flex items-center gap-2">
                    <Badge label={pago.estado} tone={estadoTone[pago.estado]} />
                    <span className="font-mono text-accent">
                      {formatCOP(pago.monto)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}
