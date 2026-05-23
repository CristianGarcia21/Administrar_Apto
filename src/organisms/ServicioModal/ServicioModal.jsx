import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { formatCOP } from '../../utils/formatCOP.js'

const schema = z.object({
  monto: z.number().min(0),
  fechaVencimiento: z.string().min(4),
  estado: z.enum(['pagado', 'pendiente', 'vencido']),
  porcentajeInquilinos: z.number().min(0).max(100),
  nombre: z.string().min(2),
  empresa: z.string().min(2),
  color: z.string().min(4),
  urlPago: z.string().optional().nullable(),
  urlConsulta: z.string().optional().nullable(),
  campoBusqueda: z.string().optional(),
  periocidad: z.string().min(2),
  descripcion: z.string().min(4),
  referencia: z.string().optional(),
})

export default function ServicioModal({
  servicio,
  onClose,
  onSubmit,
  title = 'Editar servicio',
}) {
  const getDeudaAcumulada = useServiciosStore((s) => s.getDeudaAcumulada)
  const deudaPasada = servicio ? getDeudaAcumulada(servicio.servicioId, servicio.mes) : 0
  const consumoBase = Math.max(0, (servicio?.monto || 0) - deudaPasada)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      monto: consumoBase,
      fechaVencimiento: servicio?.fechaVencimiento ?? '',
      estado: servicio?.estado ?? 'pendiente',
      porcentajeInquilinos: servicio?.porcentajeInquilinos ?? 0,
      nombre: servicio?.nombre ?? '',
      empresa: servicio?.empresa ?? '',
      color: servicio?.color ?? '#1A3C5E',
      urlPago: servicio?.urlPago ?? '',
      urlConsulta: servicio?.urlConsulta ?? '',
      campoBusqueda: servicio?.campoBusqueda ?? '',
      periocidad: servicio?.periocidad ?? 'mensual',
      descripcion: servicio?.descripcion ?? '',
      referencia: servicio?.referencia ?? '',
    },
  })

  const handleInternalSubmit = (data) => {
    // Al guardar, sumamos el consumo aislado + la deuda pasada
    onSubmit({
      ...data,
      monto: data.monto + deudaPasada,
    })
  }

  return (
    <ModalLayout
      title={title}
      description="Actualiza el monto y el vencimiento del servicio."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(handleInternalSubmit)} className="space-y-5 mt-2">
        {deudaPasada > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--warning-dim)] bg-[color:var(--warning-dim)]/20 px-4 py-3 text-[color:var(--warning)]">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Deuda Acumulada: {formatCOP(deudaPasada)}</p>
              <p className="text-xs opacity-90 mt-0.5">Ingresa únicamente el consumo de este mes. El sistema le sumará automáticamente esta deuda al total.</p>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          
          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Nombre</label>
            <input
              {...register('nombre')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Empresa</label>
            <input
              {...register('empresa')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              {deudaPasada > 0 ? "Consumo de este mes (Sin la deuda)" : "Monto total a cobrar"}
            </label>
            <input
              type="number"
              {...register('monto', { valueAsNumber: true })}
              className="w-full rounded-xl border border-[color:var(--accent)] bg-[color:var(--accent-dim)]/10 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Fecha vencimiento</label>
            <input
              type="date"
              {...register('fechaVencimiento')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Frecuencia</label>
            <input
              {...register('periocidad')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Color (Identificador)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register('color')}
                className="h-12 w-16 cursor-pointer rounded-xl border border-border bg-card shadow-sm"
              />
              <span className="text-xs text-textMuted">Color del icono</span>
            </div>
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Estado</label>
            <select
              {...register('estado')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>


          
          <div className="relative md:col-span-2">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Referencia (Referencia de Pago / ID)</label>
            <input
              {...register('referencia')}
              placeholder="Ej. 12345678"
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative md:col-span-2">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Descripcion</label>
            <textarea
              rows={2}
              {...register('descripcion')}
              className="w-full resize-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar servicio
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}
