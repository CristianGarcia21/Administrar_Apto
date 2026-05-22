import { useMemo, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  BedDouble,
  LayoutDashboard,
  Moon,
  PlugZap,
  Receipt,
  Settings,
  Sun,
  Users,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUiStore } from '../../store/uiStore.js'
import useTheme from '../../hooks/useTheme.js'
import useMesRollover from '../../hooks/useMesRollover.js'
import useAutoMoraSync from '../../hooks/useAutoMoraSync.js'
import RolloverBanner from '../../organisms/RolloverBanner/RolloverBanner.jsx'
import { usePagosStore } from '../../store/pagosStore.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'

const navItems = [
  { path: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/habitaciones',  label: 'Habitaciones', icon: BedDouble },
  { path: '/inquilinos',    label: 'Inquilinos',   icon: Users },
  { path: '/pagos',         label: 'Pagos',        icon: Receipt },
  { path: '/servicios',     label: 'Servicios',    icon: PlugZap },
  { path: '/reportes',      label: 'Reportes',     icon: BarChart3 },
  { path: '/configuracion', label: 'Ajustes',      icon: Settings },
]

export default function DashboardLayout() {
  useTheme()
  useMesRollover()
  useAutoMoraSync()  // recalcula diasMora automaticamente al montar y al cambiar de mes

  const theme         = useUiStore((s) => s.theme)
  const toggleTheme   = useUiStore((s) => s.toggleTheme)
  const currentStreak = useUiStore((s) => s.currentStreak)
  const mesActivo     = useUiStore((s) => s.mesActivo)
  const mesVisualizado = useUiStore((s) => s.mesVisualizado)
  const setMesVisualizado = useUiStore((s) => s.setMesVisualizado)
  const location      = useLocation()
  const activeItem    = useMemo(
    () => navItems.find((item) => item.path === location.pathname),
    [location.pathname],
  )

  const pagos            = usePagosStore((s) => s.pagos)
  const serviciosPublicos = useServiciosStore((s) => s.serviciosPublicos)
  const apartamento      = useAppSettingsStore((s) => s.apartamento)

  // Scroll to top automatically when navigating
  useEffect(() => {
    document.getElementById('main-scroll-container')?.scrollTo(0, 0)
  }, [location.pathname])

  const tienesMora       = pagos.some((p) => p.mes === mesActivo && p.diasMora > 0)
  const serviciosVencidos = serviciosPublicos.some((s) => s.estado === 'vencido')
  const sistemaEstado    = tienesMora && serviciosVencidos ? 'critico'
    : tienesMora || serviciosVencidos ? 'atencion'
    : 'estable'
  const estadoConfig = {
    estable:  { color: 'var(--positive)', label: 'Estable' },
    atencion: { color: 'var(--warning)',  label: 'Atencion' },
    critico:  { color: 'var(--danger)',   label: 'Urgente' },
  }[sistemaEstado]

  const navigateMonth = (direction) => {
    const [y, m] = mesVisualizado.split('-').map(Number)
    const d = new Date(y, m - 1 + direction, 1)
    setMesVisualizado(d.toISOString().slice(0, 7))
  }
  const [visY, visM] = mesVisualizado.split('-').map(Number)
  const visLabel = format(new Date(visY, visM - 1, 1), "MMMM yyyy", { locale: es })
  const isCurrentMonth = mesVisualizado === mesActivo

  return (
    <div className="flex h-screen w-full relative overflow-hidden premium-mesh-bg">
      {/* ── Textura Cristalina sobre Malla Animada ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 mix-blend-overlay opacity-[0.04]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>

      {/* ─── Sidebar fijo 160px: icono + label siempre visibles ─── */}
      <aside
        className="sticky top-0 hidden h-screen w-[160px] flex-shrink-0 flex-col border-r border-border bg-card md:flex"
        style={{ overflow: 'hidden' }}
      >
        <div className="flex h-full flex-col px-3 py-5">

          {/* ── Brand ── */}
          <div className="mb-4 flex items-center gap-2.5 px-2">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold text-xs"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              {(apartamento ?? 'RA').slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate text-xs font-semibold text-textMuted leading-tight">
              {apartamento ?? 'RentApp'}
            </span>
          </div>

          {/* ── Theme toggle ── */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-textMuted transition hover:bg-cardMuted hover:text-textMain"
          >
            {theme === 'dark'
              ? <Sun  className="h-3.5 w-3.5 flex-shrink-0" />
              : <Moon className="h-3.5 w-3.5 flex-shrink-0" />
            }
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>

          {/* ── Nav ── */}
          <nav className="flex flex-1 flex-col gap-1 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-[#0f1923]'
                      : 'text-textMuted hover:bg-cardMuted/50 hover:text-textMain'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'var(--accent)', zIndex: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5 w-full">
                      <item.icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? 'text-[#0f1923]' : 'text-textMuted group-hover:text-textMain'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Meses Verdes (Perfect Months) ── */}
          {(() => {
            const allMonths = Array.from(new Set([
              ...pagos.map(p => p.mes),
              ...serviciosPublicos.map(s => s.mes)
            ]))
            
            const perfectMonthsCount = allMonths.filter(m => {
              const sForMonth = serviciosPublicos.filter(s => s.mes === m)
              const pForMonth = pagos.filter(p => p.mes === m)
              if (sForMonth.length === 0 && pForMonth.length === 0) return false
          
              const hasUnpaidServices = sForMonth.some(s => s.estado !== 'pagado')
              const hasMoraPayments = pForMonth.some(p => p.diasMora > 0)
              
              return !hasUnpaidServices && !hasMoraPayments
            }).length

            if (perfectMonthsCount === 0) return null

            return (
              <div
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 shadow-sm border"
                style={{ background: 'var(--positive-dim)', borderColor: 'var(--positive-dim)' }}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--positive)]/20 text-[color:var(--positive)]">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--positive)' }}>
                    Cierres Perfectos
                  </p>
                  <p className="text-xs font-extrabold leading-tight" style={{ color: 'var(--positive)' }}>
                    {perfectMonthsCount} {perfectMonthsCount === 1 ? 'Mes Verde' : 'Meses Verdes'}
                  </p>
                </div>
              </div>
            )
          })()}
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div id="main-scroll-container" className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto scroll-smooth">
        <RolloverBanner />

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-textMuted">
              {activeItem?.label ?? 'Dashboard'}
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              {activeItem?.label ?? 'Dashboard'}
            </h1>
          </div>

          {/* Month Switcher Central */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => navigateMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-[140px] flex-col items-center justify-center px-2">
              <span className="text-sm font-bold capitalize text-textMain">{visLabel}</span>
              {!isCurrentMonth ? (
                <button
                  onClick={() => setMesVisualizado(mesActivo)}
                  className="text-[10px] font-semibold uppercase tracking-wider text-accent transition hover:opacity-80"
                >
                  Volver al activo
                </button>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-positive">
                  Mes en curso
                </span>
              )}
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-textMuted transition hover:bg-cardMuted hover:text-textMain"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-textMuted">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: estadoConfig.color,
                  boxShadow: sistemaEstado !== 'estable' ? `0 0 6px ${estadoConfig.color}` : 'none',
                  animation: sistemaEstado !== 'estable' ? 'pulse 2s infinite' : 'none',
                }}
              />
              {estadoConfig.label}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-primary">
              RM
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pb-20 md:pb-0" // Espacio extra en movil para no tapar contenido con la barra inferior
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ─── Bottom Navigation Móvil (Solo visible en md:hidden) ─── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-1 overflow-x-auto border-t border-border bg-card/90 px-3 py-2 backdrop-blur-md pb-safe"
        style={{ 
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `nav::-webkit-scrollbar { display: none; }`}} />
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative flex flex-shrink-0 flex-col items-center justify-center p-2 w-[60px] h-[52px] transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute inset-1 rounded-xl"
                  style={{ background: 'var(--accent-dim)', zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                className={`relative z-10 h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'text-accent scale-110' : 'text-textMuted group-hover:text-textMain'
                }`}
              />
              <span 
                className={`relative z-10 mt-1 text-[9px] font-semibold tracking-wide ${
                  isActive ? 'text-accent' : 'text-textMuted'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
