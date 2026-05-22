import { ClipboardCheck, Copy, ExternalLink, PhoneCall } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../atoms/Button/Button.jsx'

export default function ServiceLink({
  servicio,
  referencia,
  monto,
  vencimiento,
  onRegistrar,
  onEdit,
}) {
  const estadoTone =
    servicio?.estado === 'pagado'
      ? {
          className:
            'text-[color:var(--positive)] bg-[color:var(--positive-dim)] border-[color:var(--positive-dim)]',
        }
      : servicio?.estado === 'vencido'
        ? {
            className:
              'text-[color:var(--danger)] bg-[color:var(--danger-dim)] border-[color:var(--danger-dim)]',
          }
        : {
            className:
              'text-[color:var(--warning)] bg-[color:var(--warning-dim)] border-[color:var(--warning-dim)]',
          }

  const handlePay = async () => {
    if (!servicio.urlPago) {
      toast('Este servicio no tiene portal de pago.')
      return
    }

    if (referencia) {
      try {
        await navigator.clipboard.writeText(referencia)
        const toastId = toast.success('Referencia copiada')
        setTimeout(() => toast.dismiss(toastId), 1500)
      } catch (error) {
        toast.error('No se pudo copiar la referencia')
      }
    }

    window.open(servicio.urlPago, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    if (!referencia) {
      toast('Sin referencia para copiar.')
      return
    }

    try {
      await navigator.clipboard.writeText(referencia)
      const toastId = toast.success('Referencia copiada')
      setTimeout(() => toast.dismiss(toastId), 1500)
    } catch (error) {
      toast.error('No se pudo copiar la referencia')
    }
  }

  const handleCall = () => {
    if (!servicio.telefono) {
      toast('Servicio sin telefono registrado.')
      return
    }

    window.open(`tel:${servicio.telefono}`, '_self')
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-5"
      style={{ borderLeft: `2px solid ${servicio.color ?? 'var(--accent)'}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            {servicio.empresa}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{servicio.nombre}</h3>
            <span className={`chip ${estadoTone.className}`}>
              {servicio.estado}
            </span>
          </div>
          <p className="mt-2 text-sm text-textMuted">{servicio.descripcion}</p>
        </div>
        <div className="rounded-xl border border-border bg-cardMuted/70 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Vence
          </p>
          <p className="mt-1 font-mono text-sm text-primary">{vencimiento}</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Monto
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className="font-mono text-lg text-accent">{monto}</p>
            {servicio.tendencia !== null && servicio.tendencia !== undefined && (
              <span
                className={`mb-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  servicio.tendencia > 0
                    ? 'bg-[color:var(--danger-dim)] text-[color:var(--danger)]'
                    : servicio.tendencia < 0
                      ? 'bg-[color:var(--positive-dim)] text-[color:var(--positive)]'
                      : 'bg-cardMuted text-textMuted'
                }`}
                title="Comparacion con el mes anterior"
              >
                {servicio.tendencia > 0 ? '▲' : servicio.tendencia < 0 ? '▼' : '='} {Math.abs(servicio.tendencia)}%
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
              Referencia
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-textMuted transition hover:text-textMain"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </button>
          </div>
          <p className="mt-1 font-mono text-sm text-textMain">{referencia}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
            Frecuencia
          </p>
          <p className="mt-1 text-sm text-textMain">{servicio.periocidad}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handlePay} className="text-xs">
          <ExternalLink className="h-4 w-4" />
          Pagar en linea
        </Button>
        <Button variant="secondary" onClick={onRegistrar} className="text-xs">
          <ClipboardCheck className="h-4 w-4" />
          Registrar pago
        </Button>
        {onEdit && (
          <Button variant="secondary" onClick={onEdit} className="text-xs">
            Editar
          </Button>
        )}
        <Button variant="ghost" onClick={handleCall} className="text-xs">
          <PhoneCall className="h-4 w-4" />
          Llamar soporte
        </Button>
      </div>
    </div>
  )
}
