import {
  Droplet,
  Flame,
  Home,
  PlugZap,
  Wifi,
  Zap,
} from 'lucide-react'
import ServiceLink from '../../molecules/ServiceLink/ServiceLink.jsx'
import EmptyState from '../../atoms/EmptyState/EmptyState.jsx'

const iconMap = {
  Droplet,
  Zap,
  Flame,
  Wifi,
  Home,
}

export default function ServiciosPanel({ servicios, onEdit, onRegistrar }) {
  if (servicios.length === 0) {
    return (
      <EmptyState
        title="Sin servicios"
        description="Configura referencias para ver pagos y vencimientos aqui."
      />
    )
  }

  return (
    <section className="space-y-4">
      {servicios.map((servicio) => {
        const Icon = iconMap[servicio.icono] || PlugZap
        return (
          <div key={servicio.id} className="card px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${servicio.color}1A` }}
                >
                  <Icon className="h-5 w-5" style={{ color: servicio.color }} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-textMuted">
                    {servicio.empresa}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    {servicio.nombre}
                  </h3>
                </div>
              </div>
              <span
                className={`chip ${
                  servicio.estado === 'pagado'
                    ? 'text-[color:var(--positive)] bg-[color:var(--positive-dim)] border-[color:var(--positive-dim)]'
                    : servicio.estado === 'vencido'
                      ? 'text-[color:var(--danger)] bg-[color:var(--danger-dim)] border-[color:var(--danger-dim)]'
                      : 'text-[color:var(--warning)] bg-[color:var(--warning-dim)] border-[color:var(--warning-dim)]'
                }`}
              >
                {servicio.estado}
              </span>
            </div>
            <div className="mt-4">
              <ServiceLink
                servicio={servicio}
                referencia={servicio.referencia}
                monto={servicio.montoFormateado}
                vencimiento={servicio.vencimientoFormateado}
                onRegistrar={onRegistrar ? () => onRegistrar(servicio) : undefined}
                onEdit={onEdit ? () => onEdit(servicio) : undefined}
              />
            </div>
          </div>
        )
      })}
    </section>
  )
}
