import { format, getDaysInMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useUiStore } from '../../store/uiStore.js'
import { formatCOP } from '../../utils/formatCOP.js'

const saludoPorHora = (hora) => {
  if (hora < 12) return 'Buenos días'
  if (hora < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardHeader({ nombre = 'Camilo' }) {
  const ahora      = new Date()
  const saludo     = saludoPorHora(ahora.getHours())
  const fecha      = format(ahora, "EEEE d 'de' MMMM", { locale: es })

  const habitaciones = useHabitacionesStore((s) => s.habitaciones)
  const pagos        = usePagosStore((s) => s.pagos)
  const mesActivo    = useUiStore((s) => s.mesActivo)

  const ocupadas          = habitaciones.filter((h) => h.estado === 'ocupada').length
  // Filtrado por mesActivo, correcto
  const ingresoConfirmado = pagos
    .filter((p) => p.estado === 'pagado' && p.mes === mesActivo)
    .reduce((t, p) => t + p.monto, 0)

  // ── Barra de progreso del mes ──────────────────────────────────
  const diasEnMes  = getDaysInMonth(ahora)
  const diaActual  = ahora.getDate()
  const progresoMes = Math.round((diaActual / diasEnMes) * 100)
  const diasRestantes = diasEnMes - diaActual

  return (
    <header
      className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-6"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}
    >
      {/* Glows decorativos */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-15"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="pointer-events-none absolute left-1/2 bottom-0 h-24 w-48 -translate-x-1/2 rounded-full opacity-10"
        style={{ background: 'var(--info)' }}
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        {/* ── Saludo + fecha ── */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-textMuted">
            Tablero de control
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {saludo}, {nombre}
          </h1>
          <p className="mt-1 capitalize text-textMuted text-sm">{fecha}</p>

          {/* ── Barra de progreso del mes ── */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-textMuted">
                Progreso del mes
              </p>
              <p className="text-[11px] text-textMuted">
                <span className="font-semibold text-textMain">Día {diaActual}</span>
                {' '}de {diasEnMes}
                {diasRestantes > 0 && (
                  <span className="ml-1" style={{ color: 'var(--accent)' }}>
                    · {diasRestantes} restantes
                  </span>
                )}
              </p>
            </div>
            {/* Track */}
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progresoMes}%`,
                  background: progresoMes >= 80
                    ? 'linear-gradient(90deg, var(--accent), var(--accent-bright))'
                    : 'linear-gradient(90deg, var(--info), var(--accent))',
                }}
              />
            </div>
            {/* Marcas de semana cada 25% */}
            <div className="mt-1.5 flex justify-between">
              {['S1', 'S2', 'S3', 'S4'].map((s, i) => {
                const pct = (i + 1) * 25
                return (
                  <span
                    key={s}
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{
                      color: progresoMes >= pct ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    {s}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Badges de estado ── */}
        <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
          {/* Habitaciones ocupadas */}
          <div
            className="rounded-2xl border border-border px-5 py-4 text-center"
            style={{ background: 'var(--bg-elevated)', minWidth: 110 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-textMuted">Ocupadas</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {ocupadas}
              <span className="text-base text-textMuted">/{habitaciones.length}</span>
            </p>
            <p className="text-[11px] text-textMuted">habitaciones</p>
          </div>

          {/* Ingreso confirmado */}
          <div
            className="rounded-2xl border px-5 py-4 text-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)',
              borderColor: 'var(--accent)',
              minWidth: 140,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(15,25,35,0.7)' }}>
              Recibido
            </p>
            <p className="mt-1 font-mono text-2xl font-bold" style={{ color: '#0f1923' }}>
              {formatCOP(ingresoConfirmado)}
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(15,25,35,0.7)' }}>este mes</p>
          </div>
        </div>
      </div>
    </header>
  )
}
