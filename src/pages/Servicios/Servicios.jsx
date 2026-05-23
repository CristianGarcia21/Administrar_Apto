import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { AnimatePresence } from 'framer-motion'
import { es } from 'date-fns/locale'
import { ArrowUpRight, Calculator, CalendarCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ServiciosPanel from '../../organisms/ServiciosPanel/ServiciosPanel.jsx'
import { formatCOP } from '../../utils/formatCOP.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useServiciosPagosStore } from '../../store/serviciosPagosStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import { useUiStore } from '../../store/uiStore.js'
import ServicioModal from '../../organisms/ServicioModal/ServicioModal.jsx'
import ServicioPagoModal from '../../organisms/ServicioPagoModal/ServicioPagoModal.jsx'
import EmptyState from '../../atoms/EmptyState/EmptyState.jsx'
import toast from 'react-hot-toast'

export default function Servicios() {
  const [editing, setEditing] = useState(null)
  const [pagoTarget, setPagoTarget] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const mesActivo = useUiStore((s) => s.mesActivo)
  const mesVisualizado = useUiStore((s) => s.mesVisualizado)
  const ensureServiciosForMonth = useServiciosStore((s) => s.ensureServiciosForMonth)
  const resolveDeudasPasadas = useServiciosStore((s) => s.resolveDeudasPasadas)
  const serviciosPublicosAll = useServiciosStore(
    (state) => state.serviciosPublicos,
  )
  
  useEffect(() => {
    ensureServiciosForMonth(mesVisualizado)
  }, [mesVisualizado, ensureServiciosForMonth])

  const serviciosPublicos = useMemo(() => 
    serviciosPublicosAll.filter((s) => s.mes === mesVisualizado),
  [serviciosPublicosAll, mesVisualizado])
  const updateServicioPublico = useServiciosStore(
    (state) => state.updateServicioPublico,
  )
  const addPagoServicio = useServiciosPagosStore(
    (state) => state.addPagoServicio,
  )
  const pagosServicios = useServiciosPagosStore(
    (state) => state.pagosServicios,
  )
  const servicioLinks = useAppSettingsStore((state) => state.servicioLinks)

  const getMesAnterior = (mesActualStr) => {
    const [year, month] = mesActualStr.split('-').map(Number)
    let prevYear = year
    let prevMonth = month - 1
    if (prevMonth === 0) {
      prevMonth = 12
      prevYear -= 1
    }
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
  }

  const prevMesStr = getMesAnterior(mesVisualizado)

  const servicios = useMemo(
    () =>
      serviciosPublicos.map((servicio) => {
        const prevServicio = serviciosPublicosAll.find(
          (s) => s.servicioId === servicio.servicioId && s.mes === prevMesStr
        )
        
        let tendencia = null
        if (prevServicio && prevServicio.monto > 0 && servicio.monto > 0) {
          tendencia = Math.round(((servicio.monto - prevServicio.monto) / prevServicio.monto) * 100)
        }

        return {
          ...servicio,
          urlPago:
            servicioLinks?.[servicio.servicioId]?.urlPago || servicio.urlPago,
          urlConsulta:
            servicioLinks?.[servicio.servicioId]?.urlConsulta ||
            servicio.urlConsulta,
          montoFormateado: formatCOP(servicio.monto),
          tendencia,
          vencimientoFormateado: format(
            new Date(servicio.fechaVencimiento),
            "d 'de' MMMM",
            {
              locale: es,
            },
          ),
        }
      }),
    [serviciosPublicos, serviciosPublicosAll, prevMesStr, servicioLinks],
  )

  const queryServicioId = searchParams.get('servicio')
  const queryAccion = searchParams.get('accion')
  const queryServicio = queryServicioId
    ? serviciosPublicos.find((item) => item.id === queryServicioId) ?? null
    : null

  const totalServicios = servicios.reduce(
    (total, servicio) => total + servicio.monto,
    0,
  )

  const handleRegistrar = (servicio) => {
    setPagoTarget(servicio)
  }

  const [mesY, mesM] = mesVisualizado.split('-').map(Number)
  const mesLabel = format(new Date(mesY, mesM - 1, 1), "MMMM 'de' yyyy", { locale: es })

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-textMuted">
            <CalendarCheck className="h-3 w-3" />
            <span className="capitalize">{mesLabel}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold">Pagos sin friccion</h1>
          <p className="mt-2 text-textMuted">
            Acceso directo a los portales de pago y control mensual.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
          <p className="text-xs uppercase tracking-[0.2em]">Total Gastos</p>
          <p className="font-mono text-xl font-bold" style={{ color: 'var(--accent)' }}>
            {formatCOP(totalServicios)}
          </p>
        </div>
      </div>

      <ServiciosPanel
        servicios={servicios}
        onRegistrar={handleRegistrar}
        onEdit={(servicio) => setEditing(servicio)}
      />


      <section className="card px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Historial de pagos</h2>
            <p className="mt-2 text-textMuted">
              Registros recientes por servicio.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {pagosServicios.length === 0 ? (
            <EmptyState
              title="Sin pagos de servicios"
              description="Registra el primer pago para dejar trazabilidad."
            />
          ) : (
            pagosServicios
              .slice()
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((pago) => {
                const servicio = serviciosPublicosAll.find(
                  (item) => item.id === pago.servicioId,
                )

                return (
                  <div
                    key={pago.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-cardMuted/70 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-textMain">
                        {servicio?.nombre ?? 'Servicio eliminado'}
                      </p>
                      <p className="mt-1 text-xs text-textMuted">
                        {pago.metodoPago} · {pago.fecha} · {pago.referencia || 'Sin referencia'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-accent">
                        {formatCOP(pago.monto)}
                      </span>
                      <span className="chip text-[color:var(--positive)] bg-[color:var(--positive-dim)] border-[color:var(--positive-dim)]">
                        pagado
                      </span>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </section>

      <AnimatePresence>
        {((editing && editing) || (queryAccion === 'editar' && queryServicio)) && (
          <ServicioModal
            servicio={editing ?? queryServicio}
            onClose={() => {
              setEditing(null)
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('servicio')
              nextParams.delete('accion')
              setSearchParams(nextParams, { replace: true })
            }}
            onSubmit={(data) => {
              const serviceId = (editing ?? queryServicio)?.id
              if (!serviceId) return
              updateServicioPublico(serviceId, {
                nombre: data.nombre,
                empresa: data.empresa,
                color: data.color,
                urlPago: data.urlPago || null,
                urlConsulta: data.urlConsulta || null,
                campoBusqueda: data.campoBusqueda || '',
                periocidad: data.periocidad,
                descripcion: data.descripcion,
                monto: data.monto,
                fechaVencimiento: data.fechaVencimiento,
                estado: data.estado,
                porcentajeInquilinos: data.porcentajeInquilinos,
                referencia: data.referencia,
              })
              if (data.estado === 'pagado') {
                resolveDeudasPasadas((editing ?? queryServicio).servicioId, mesVisualizado)
              }
              toast.success('Servicio actualizado')
              setEditing(null)
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('servicio')
              nextParams.delete('accion')
              setSearchParams(nextParams, { replace: true })
            }}
          />
        )}

        {(pagoTarget || (queryAccion === 'registrar' && queryServicio)) && (
          <ServicioPagoModal
            servicio={pagoTarget ?? queryServicio}
            onClose={() => {
              setPagoTarget(null)
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('servicio')
              nextParams.delete('accion')
              setSearchParams(nextParams, { replace: true })
            }}
            onSubmit={(data) => {
              const service = pagoTarget ?? queryServicio
              if (!service) return
              addPagoServicio({
                id: `sp-${service.id}-${Date.now()}`,
                servicioId: service.id,
                monto: data.monto,
                fecha: data.fecha,
                metodoPago: data.metodoPago,
                referencia: data.referencia ?? service.referencia ?? '',
                notas: data.notas ?? '',
              })
              updateServicioPublico(service.id, { estado: 'pagado' })
              resolveDeudasPasadas(service.servicioId, mesVisualizado)
              toast.success('Pago registrado y deudas resueltas')
              setPagoTarget(null)
              const nextParams = new URLSearchParams(searchParams)
              nextParams.delete('servicio')
              nextParams.delete('accion')
              setSearchParams(nextParams, { replace: true })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
