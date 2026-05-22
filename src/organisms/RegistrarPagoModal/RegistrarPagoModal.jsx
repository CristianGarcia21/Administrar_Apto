import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'

const schema = z.object({
  inquilinoId: z.string().min(1),
  habitacionId: z.string().min(1),
  monto: z.number().min(1),
  fecha: z.string().min(4),
  metodoPago: z.string().min(1),
  estado: z.enum(['pagado', 'pendiente', 'vencido']),
  notas: z.string().optional(),
})

export default function RegistrarPagoModal({
  onClose,
  onSubmit,
  inquilinos,
  habitaciones,
  initialValues,
  title = 'Registrar pago',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      inquilinoId: initialValues?.inquilinoId ?? inquilinos?.[0]?.id ?? '',
      habitacionId: initialValues?.habitacionId ?? habitaciones?.[0]?.id ?? '',
      monto: initialValues?.monto ?? 850000,
      fecha: initialValues?.fecha ?? new Date().toISOString().slice(0, 10),
      metodoPago: initialValues?.metodoPago ?? 'transferencia',
      estado: initialValues?.estado ?? 'pagado',
      notas: initialValues?.notas ?? '',
    },
  })

  return (
    <ModalLayout
      title={title}
      description="Guarda un pago con metodo y estado."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
        <div className="grid gap-5 md:grid-cols-2">
          
          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Inquilino
            </label>
            <select
              {...register('inquilinoId')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              {inquilinos.map((inquilino) => (
                <option key={inquilino.id} value={inquilino.id}>
                  {inquilino.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Habitacion
            </label>
            <select
              {...register('habitacionId')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              {habitaciones.map((habitacion) => (
                <option key={habitacion.id} value={habitacion.id}>
                  {habitacion.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Monto
            </label>
            <input
              type="number"
              {...register('monto', { valueAsNumber: true })}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Fecha
            </label>
            <input
              type="date"
              {...register('fecha')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Metodo
            </label>
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
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
              Estado
            </label>
            <select
              {...register('estado')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>

        <div className="relative pt-2">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">
            Notas
          </label>
          <textarea
            {...register('notas')}
            rows={2}
            placeholder="Opcional: Detalles del pago"
            className="w-full resize-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar pago
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}
