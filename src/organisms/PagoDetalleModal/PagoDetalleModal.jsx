import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const estadoTone = {
  pagado: 'success',
  pendiente: 'warning',
  vencido: 'danger',
}

export default function PagoDetalleModal({ pago, onClose }) {
  return (
    <ModalLayout
      title="Detalle del pago"
      description="Vista rapida del registro seleccionado."
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
                {pago.inquilino}
              </p>
              <p className="mt-2 text-sm text-textMuted">
                {pago.habitacion}
              </p>
            </div>
            <Badge label={pago.estado} tone={estadoTone[pago.estado]} />
          </div>
          <p className="mt-3 font-mono text-xl text-accent">
            {formatCOP(pago.monto)}
          </p>
          <p className="mt-2 text-xs text-textMuted">Fecha: {pago.fecha}</p>
          <p className="mt-1 text-xs text-textMuted">Metodo: {pago.metodo}</p>
        </div>

        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Notas
          </p>
          <p className="mt-2 text-sm text-textMain">
            {pago.notas || 'Sin notas.'}
          </p>
        </div>
      </div>
    </ModalLayout>
  )
}
