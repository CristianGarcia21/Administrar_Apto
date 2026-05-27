import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa un nombre valido'),
  color: z.string().min(4),
  precioActual: z.number().min(100000),
  estado: z.enum(['ocupada', 'libre', 'mantenimiento']),
  descripcion: z.string().min(4, 'Describe la habitacion'),
})

export default function HabitacionModal({
  onClose,
  onSubmit,
  initialValues,
  title = 'Nueva habitacion',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: initialValues?.nombre ?? '',
      color: initialValues?.color ?? '#4E7D9A',
      precioActual: initialValues?.precioActual ?? 850000,
      estado: initialValues?.estado ?? 'ocupada',
      descripcion: initialValues?.descripcion ?? '',
    },
  })

  return (
    <ModalLayout
      title={title}
      description="Crea una habitacion con su precio y estado inicial."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">

        <div className="relative">
          <label htmlFor="hab-nombre" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Nombre de la habitacion</label>
          <input
            id="hab-nombre"
            {...register('nombre')}
            className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
          />
          {errors.nombre && (
            <span className="mt-2 block text-xs font-medium text-danger">{errors.nombre.message}</span>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative">
            <label htmlFor="hab-precio" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Precio actual (COP)</label>
            <input
              id="hab-precio"
              type="number"
              {...register('precioActual', { valueAsNumber: true })}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label htmlFor="hab-estado" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Estado</label>
            <select
              id="hab-estado"
              {...register('estado')}
              className="w-full appearance-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            >
              <option value="ocupada">Ocupada</option>
              <option value="libre">Libre</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="relative md:col-span-2">
            <label htmlFor="hab-color" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Color de etiqueta</label>
            <div className="flex items-center gap-3">
              <input
                id="hab-color"
                type="color"
                {...register('color')}
                className="h-12 w-16 cursor-pointer rounded-xl border border-border bg-card shadow-sm"
              />
              <span className="text-xs text-textMuted">Identificador visual</span>
            </div>
          </div>
        </div>

        <div className="relative pt-2">
          <label htmlFor="hab-descripcion" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Descripcion / Notas</label>
          <textarea
            id="hab-descripcion"
            {...register('descripcion')}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
          />
          {errors.descripcion && (
            <span className="mt-2 block text-xs font-medium text-danger">{errors.descripcion.message}</span>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar habitacion
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}
