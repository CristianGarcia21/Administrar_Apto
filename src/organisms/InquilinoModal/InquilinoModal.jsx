import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa un nombre valido'),
  telefono: z.string().min(7),
  email: z.string().email('Email invalido'),
  cedula: z.string().min(5),
  habitacionId: z.string().min(1),
  diaVencimiento: z.number().min(1).max(30),
})

export default function InquilinoModal({
  onClose,
  onSubmit,
  habitaciones,
  initialValues,
  title = 'Nuevo inquilino',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: initialValues?.nombre ?? '',
      telefono: initialValues?.telefono ?? '',
      email: initialValues?.email ?? '',
      cedula: initialValues?.cedula ?? '',
      habitacionId:
        initialValues?.habitacionId ?? habitaciones?.[0]?.id ?? '',
      diaVencimiento: initialValues?.diaVencimiento ?? 5,
    },
  })

  return (
    <ModalLayout
      title={title}
      description="Registra datos personales y asigna habitacion."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
        <div className="grid gap-5 md:grid-cols-2">

          <div className="relative">
            <label htmlFor="inq-nombre" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Nombre completo</label>
            <input
              id="inq-nombre"
              {...register('nombre')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
            {errors.nombre && (
              <span className="mt-2 block text-xs font-medium text-danger">{errors.nombre.message}</span>
            )}
          </div>

          <div className="relative">
            <label htmlFor="inq-telefono" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Telefono</label>
            <input
              id="inq-telefono"
              {...register('telefono')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label htmlFor="inq-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Email</label>
            <input
              id="inq-email"
              {...register('email')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
            {errors.email && (
              <span className="mt-2 block text-xs font-medium text-danger">{errors.email.message}</span>
            )}
          </div>

          <div className="relative">
            <label htmlFor="inq-cedula" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Cedula</label>
            <input
              id="inq-cedula"
              {...register('cedula')}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label htmlFor="inq-habitacion" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Habitacion asignada</label>
            <select
              id="inq-habitacion"
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
            <label htmlFor="inq-dia" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Dia de vencimiento</label>
            <input
              id="inq-dia"
              type="number"
              {...register('diaVencimiento', { valueAsNumber: true })}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          {initialValues && initialValues.activo !== false && (
            <div className="mr-auto">
              <Button type="button" variant="ghost" onClick={() => onCheckout?.()} className="text-rose-500 hover:text-rose-400">
                Registrar Salida (Check-Out)
              </Button>
            </div>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar inquilino
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}
