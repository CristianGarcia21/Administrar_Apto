import { Calendar, Edit3, Trash2 } from 'lucide-react'
import Badge from '../../atoms/Badge/Badge.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { formatCOP } from '../../utils/formatCOP.js'

const estadoTone = {
  pagado: 'success',
  pendiente: 'warning',
  vencido: 'danger',
}

export default function PaymentRow({ pago, onEdit, onDelete, onView }) {
  return (
    <tr className="group border-b border-border last:border-none hover:bg-cardMuted/60">
      <td className="px-6 py-4 text-sm text-textMuted">{pago.fecha}</td>
      <td className="px-6 py-4 text-sm text-textMain">{pago.habitacion}</td>
      <td className="px-6 py-4 text-sm text-textMain">{pago.inquilino}</td>
      <td className="px-6 py-4 font-mono text-sm text-accent">
        {formatCOP(pago.monto)}
      </td>
      <td className="px-6 py-4 text-sm text-textMuted">{pago.metodo}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Badge label={pago.estado} tone={estadoTone[pago.estado]} />
          {pago.diasMora > 0 && (
            <span className="chip text-[color:var(--danger)] bg-[color:var(--danger-dim)] border-[color:var(--danger-dim)]">
              {pago.diasMora} dias
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-textMuted">{pago.notas}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2 opacity-0 transition group-hover:opacity-100">
          <Button className="text-xs" onClick={() => onView?.(pago)}>
            <Calendar className="h-4 w-4" />
            Ver mes
          </Button>
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => onEdit?.(pago)}
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => onDelete?.(pago)}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  )
}
