import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { formatCOP } from '../../utils/formatCOP.js'
import { useServiciosStore } from '../../store/serviciosStore.js'

const schema = z.object({
  monto: z.number().min(1),
  fecha: z.string().min(4),
  metodoPago: z.string().min(1),
  referencia: z.string().optional(),
  notas: z.string().optional(),
})

export default function ServicioPagoModal({
  servicio,
  onClose,
  onSubmit,
  title = 'Registrar pago de servicio',
}) {
  const getDeudaAcumulada = useServiciosStore((s) => s.getDeudaAcumulada)
  const deudaPasada = servicio ? getDeudaAcumulada(servicio.servicioId, servicio.mes) : 0
  const totalConDeuda = (servicio?.monto ?? 0) + deudaPasada

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      monto: totalConDeuda,
      fecha: new Date().toISOString().slice(0, 10),
      metodoPago: 'transferencia',
      referencia: servicio?.referencia ?? '',
      notas: '',
    },
  })

  return (
    <ModalLayout
      title={title}
      description={`Servicio: ${servicio?.nombre ?? 'sin seleccionar'}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
        {deudaPasada > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--warning-dim)] bg-[color:var(--warning-dim)]/20 px-4 py-3 text-[color:var(--warning)]">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Deuda Acumulada: {formatCOP(deudaPasada)}</p>
              <p className="text-xs opacity-90 mt-0.5">El monto sugerido ya incluye la deuda de los meses pasados. Al registrar este pago, dichos meses tambien se marcaran como pagados.</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-cardMuted/30 px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-textMuted">Deuda Actual</p>
          <p className="mt-2 font-mono text-2xl font-bold text-accent">
            {formatCOP(totalConDeuda)}
          </p>
          <p className="mt-1 text-xs text-textMuted">El pago se abonara a esta factura y a meses anteriores acumulados.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Monto a pagar</label>
            <input
              type="number"
              {...register('monto', { valueAsNumber: true })}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>
          
          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Fecha de pago</label>
            <input
              type="date"
              {...register('fecha')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Metodo</label>
            <select
              {...register('metodoPago')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Referencia / No. Comprobante</label>
            <input
              {...register('referencia')}
              placeholder="Opcional"
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>
        </div>

        <div className="relative pt-2">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Notas adicionales</label>
          <textarea
            rows={2}
            {...register('notas')}
            placeholder="Opcional: Detalles del pago"
            className="w-full resize-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Registrar pago
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}
