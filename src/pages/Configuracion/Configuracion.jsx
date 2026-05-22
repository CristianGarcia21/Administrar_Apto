import { Settings, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ConfiguracionForm from '../../organisms/ConfiguracionForm/ConfiguracionForm.jsx'

export default function Configuracion() {
  // FIX #3: timestamp real de la sesion actual (cuando se cargo la pagina)
  const ahora = new Date()
  const fechaLabel = format(ahora, "d 'de' MMMM, HH:mm", { locale: es })

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-6"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-15"
          style={{ background: 'var(--accent)' }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">Configuracion</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Ajustes esenciales
            </h1>
            <p className="mt-1 text-sm text-textMuted">
              Personaliza temas, IPC, reglas de negocio y URLs de pago. Todo se guarda al instante.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted flex-shrink-0">
            <Settings className="h-4 w-4" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]">Sesion actual</p>
              <p className="text-xs font-semibold text-textMain capitalize">{fechaLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <ConfiguracionForm />
    </div>
  )
}
