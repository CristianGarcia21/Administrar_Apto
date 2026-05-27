import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import toast, { Toaster, resolveValue } from 'react-hot-toast'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import DashboardLayout from './templates/DashboardLayout/DashboardLayout.jsx'

function CustomToast({ toast: t }) {
  const message = resolveValue(t.message, t)

  let icon = <Info className="h-5 w-5 text-blue-400" />
  let progressBg = 'var(--info)'
  let borderGlow = 'rgba(59, 130, 246, 0.25)'

  if (t.type === 'success') {
    icon = (
      <m.div
        initial={{ scale: 0.6, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        <CheckCircle2 className="h-5 w-5 text-green-400" />
      </m.div>
    )
    progressBg = 'var(--positive)'
    borderGlow = 'rgba(34, 197, 94, 0.25)'
  } else if (t.type === 'error') {
    icon = (
      <m.div
        initial={{ scale: 0.6, x: -10 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
      >
        <XCircle className="h-5 w-5 text-red-400" />
      </m.div>
    )
    progressBg = 'var(--danger)'
    borderGlow = 'rgba(239, 68, 68, 0.25)'
  } else if (t.type === 'loading') {
    icon = (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-400" />
    )
    progressBg = 'var(--accent)'
    borderGlow = 'rgba(201, 168, 76, 0.25)'
  }

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-auto"
      style={{
        background: 'color-mix(in srgb, var(--bg-overlay) 88%, transparent)',
        borderColor: 'var(--border-strong)',
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.4), 0 0 16px ${borderGlow}`,
        maxWidth: '380px',
        width: '100%',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 text-sm font-semibold text-textMain pr-3 leading-normal">
          {message}
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Cerrar notificación"
          className="flex-shrink-0 text-textMuted hover:text-textMain transition-colors rounded-lg p-0.5 hover:bg-cardMuted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ProgressBar */}
      {t.type !== 'loading' && (
        <m.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (t.duration || 4000) / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-[3px]"
          style={{ background: progressBg }}
        />
      )}
    </m.div>
  )
}

// Carga inmediata — siempre necesaria al arrancar
import Dashboard from './pages/Dashboard/Dashboard.jsx'

// Lazy loading — se cargan solo cuando el usuario navega a esa seccion
const Habitaciones   = lazy(() => import('./pages/Habitaciones/Habitaciones.jsx'))
const Inquilinos     = lazy(() => import('./pages/Inquilinos/Inquilinos.jsx'))
const Pagos          = lazy(() => import('./pages/Pagos/Pagos.jsx'))
const Servicios      = lazy(() => import('./pages/Servicios/Servicios.jsx'))
const Reportes       = lazy(() => import('./pages/Reportes/Reportes.jsx'))
const Configuracion  = lazy(() => import('./pages/Configuracion/Configuracion.jsx'))

/** Fallback minimalista mientras carga el chunk */
function PageSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent-dim)' }}
        />
        <p className="text-xs uppercase tracking-[0.3em] text-textMuted">Cargando</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <LazyMotion features={domAnimation}>
    <BrowserRouter>
      <Toaster position="top-right">
        {(t) => <CustomToast toast={t} />}
      </Toaster>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habitaciones"  element={<Suspense fallback={<PageSkeleton />}><Habitaciones /></Suspense>} />
          <Route path="/inquilinos"    element={<Suspense fallback={<PageSkeleton />}><Inquilinos /></Suspense>} />
          <Route path="/pagos"         element={<Suspense fallback={<PageSkeleton />}><Pagos /></Suspense>} />
          <Route path="/servicios"     element={<Suspense fallback={<PageSkeleton />}><Servicios /></Suspense>} />
          <Route path="/reportes"      element={<Suspense fallback={<PageSkeleton />}><Reportes /></Suspense>} />
          <Route path="/configuracion" element={<Suspense fallback={<PageSkeleton />}><Configuracion /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LazyMotion>
  )
}

export default App
