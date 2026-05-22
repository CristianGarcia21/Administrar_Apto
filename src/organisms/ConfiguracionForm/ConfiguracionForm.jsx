import { useMemo, useState } from 'react'
import { Download, Moon, Sliders, Sun, Upload, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../atoms/Button/Button.jsx'
import { useUiStore } from '../../store/uiStore.js'
import { useAppSettingsStore } from '../../store/appSettingsStore.js'
import { useHabitacionesStore } from '../../store/habitacionesStore.js'
import { useInquilinosStore } from '../../store/inquilinosStore.js'
import { usePagosStore } from '../../store/pagosStore.js'
import { useServiciosStore } from '../../store/serviciosStore.js'
import { useServiciosPagosStore } from '../../store/serviciosPagosStore.js'
import { useHistorialStore } from '../../store/historialStore.js'
import {
  exportStateToJson,
  importStateFromJson,
} from '../../utils/storageExport.js'
import { aplicarIPCAnual } from '../../utils/ipcEngine.js'

const serviceOptions = [
  { id: 'agua', label: 'Agua y alcantarillado' },
  { id: 'energia', label: 'Energia electrica' },
  { id: 'gas', label: 'Gas natural' },
  { id: 'internet', label: 'Internet / Television' },
  { id: 'arriendo_base', label: 'Arriendo apartamento' },
]

export default function ConfiguracionForm() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const settings = useAppSettingsStore((state) => state)
  const setSettings = useAppSettingsStore((state) => state.setSettings)
  const updateServiceLink = useAppSettingsStore(
    (state) => state.updateServiceLink,
  )
  const setHabitaciones = useHabitacionesStore(
    (state) => state.setHabitaciones,
  )
  const habitaciones = useHabitacionesStore((state) => state.habitaciones)
  const updateHabitacion = useHabitacionesStore((state) => state.updateHabitacion)
  const addIpcAnio = useAppSettingsStore((state) => state.addIpcAnio)
  const setInquilinos = useInquilinosStore((state) => state.setInquilinos)
  const setPagos = usePagosStore((state) => state.setPagos)
  const setServiciosPublicos = useServiciosStore(
    (state) => state.setServiciosPublicos,
  )
  const setServiciosHabitacion = useServiciosStore((s) => s.setServiciosHabitacion)
  const setPagosServicios = useServiciosPagosStore((s) => s.setPagosServicios)
  const setHistorial = useHistorialStore((s) => s.resetHistorial)
  // Usar addSnapshot para restaurar multiples snapshots o guardar eventos IPC
  const addSnapshot = useHistorialStore((s) => s.addSnapshot)
  const serviciosPublicos = useServiciosStore((s) => s.serviciosPublicos)

  const [ipcInputAnio, setIpcInputAnio] = useState(new Date().getFullYear())
  const [ipcInputValor, setIpcInputValor] = useState('')

  const handleApplyIPC = () => {
    if (!ipcInputValor || Number(ipcInputValor) <= 0) {
      toast.error('Ingresa un porcentaje de IPC valido (ej. 9.28)')
      return
    }
    try {
      const actualizadas = aplicarIPCAnual(
        ipcInputValor,
        ipcInputAnio,
        habitaciones,
        updateHabitacion,
        addSnapshot
      )
      addIpcAnio(ipcInputAnio, Number(ipcInputValor))
      updateSetting('ipcAnual', Number(ipcInputValor))
      toast.success(`IPC aplicado! ${actualizadas} habitaciones aumentaron su valor base.`)
      setIpcInputValor('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const serviceValues = useMemo(
    () =>
      serviceOptions.reduce((accumulator, service) => {
        const currentService = serviciosPublicos.find(
          (item) => item.servicioId === service.id,
        )
        const override = settings.servicioLinks?.[service.id] ?? {}

        accumulator[service.id] = {
          urlPago:
            override.urlPago ?? currentService?.urlPago ?? '',
          urlConsulta:
            override.urlConsulta ?? currentService?.urlConsulta ?? '',
        }

        return accumulator
      }, {}),
    [serviciosPublicos, settings.servicioLinks],
  )

  const updateSetting = (key, value) => {
    setSettings({ [key]: value })
  }

  const handleExport = () => {
    const json = exportStateToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rentapp-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = importStateFromJson(reader.result)
        setHabitaciones(data.habitaciones)
        setInquilinos(data.inquilinos)
        setPagos(data.pagos)
        setServiciosPublicos(data.serviciosPublicos)
        setServiciosHabitacion(data.serviciosHabitacion)
        setPagosServicios(data.serviciosPagos ?? [])
        setTheme(data.ui.theme ?? 'dark')
        // FIX: restaurar historial de snapshots
        if (Array.isArray(data.historial)) {
          setHistorial() // reset primero
          data.historial.forEach((snap) => addSnapshot(snap))
        }
        if (data.settings) {
          setSettings(data.settings)
          Object.entries(data.settings.servicioLinks ?? {}).forEach(
            ([serviceId, value]) => updateServiceLink(serviceId, value),
          )
        }
        toast.success('Datos importados correctamente')
      } catch (err) {
        // FIX: mostrar el mensaje real del error (version invalida, etc)
        toast.error(err?.message ?? 'El archivo no es valido')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <section className="card px-6 py-5">
        <div className="flex items-center gap-3">
          <Sliders className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Datos base</h2>
            <p className="text-sm text-textMuted">
              Todo se guarda al instante mientras editas.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          
          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Nombre del usuario</label>
            <input
              value={settings.nombre}
              onChange={(event) => updateSetting('nombre', event.target.value)}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Nombre del apartamento</label>
            <input
              value={settings.apartamento}
              onChange={(event) => updateSetting('apartamento', event.target.value)}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 text-sm font-semibold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Dia de corte mora</label>
            <input
              type="number"
              value={settings.diaCorteMora}
              onChange={(event) => updateSetting('diaCorteMora', Number(event.target.value || 0))}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Distribucion servicios (%)</label>
            <input
              type="number"
              value={settings.porcentajeServicios}
              onChange={(event) => updateSetting('porcentajeServicios', Number(event.target.value || 0))}
              className="w-full rounded-xl border border-border bg-cardMuted/30 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition-all focus:border-[color:var(--accent)] focus:bg-card focus:ring-4 focus:ring-[color:var(--accent-dim)]"
            />
          </div>
        </div>
      </section>

      {/* ── Sección Motor IPC Anual ── */}
      <section className="card px-6 py-8 relative overflow-hidden" style={{ borderColor: 'var(--accent-dim)' }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--accent-dim)] to-transparent opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>Ajuste Anual (Ley IPC)</h2>
              <p className="text-sm text-textMuted">
                Aumenta el precio base de todas tus habitaciones matematicamente con un solo clic.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Año de aplicacion</label>
              <input
                type="number"
                value={ipcInputAnio}
                onChange={(e) => setIpcInputAnio(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 font-mono text-sm font-bold shadow-sm outline-none transition focus:border-[color:var(--accent)]"
              />
            </div>
            
            <div className="relative flex-1">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-textMuted">Inflacion IPC (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 9.28"
                value={ipcInputValor}
                onChange={(e) => setIpcInputValor(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--accent)] bg-[color:var(--accent-dim)]/10 px-4 py-3.5 font-mono text-sm font-bold text-textMain shadow-sm outline-none transition focus:ring-4 focus:ring-[color:var(--accent-dim)]"
              />
            </div>
            
            <button
              onClick={handleApplyIPC}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition hover:opacity-90 w-full md:w-auto"
              style={{ background: 'var(--accent)', color: '#ffffff' }}
            >
              Aplicar a Habitaciones
            </button>
          </div>
          <p className="mt-4 text-xs font-semibold" style={{ color: 'var(--warning)', opacity: 0.8 }}>
            * El sistema redondeara automaticamente a la unidad de mil mas cercana (ej. 1,050,000) y solo aplicara el aumento a cada habitacion 1 vez por año, para evitar cobros duplicados por error.
          </p>
        </div>
      </section>

      <section className="card px-6 py-5">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-primary" />
          )}
          <div>
            <h2 className="text-2xl font-semibold">Tema</h2>
            <p className="text-sm text-textMuted">
              Cambia el modo al instante sin guardar.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
            <input
              type="radio"
              name="tema"
              value="light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
            />
            Claro
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-cardMuted/70 px-4 py-3 text-sm text-textMuted">
            <input
              type="radio"
              name="tema"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
            />
            Oscuro
          </label>
        </div>
      </section>

      <section className="card px-6 py-5">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">URLs de pago</h2>
            <p className="text-sm text-textMuted">
              Centraliza los enlaces para no editarlos uno por uno.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {serviceOptions.map((service) => {
            const value = serviceValues[service.id] ?? {
              urlPago: '',
              urlConsulta: '',
            }

            return (
              <div
                key={service.id}
                className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4"
              >
                <p className="text-sm font-semibold text-textMain">
                  {service.label}
                </p>
                <p className="mt-1 text-xs text-textMuted">
                  Mostrando la URL efectiva actual.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-textMuted">
                    URL de pago
                    <input
                      value={value.urlPago ?? ''}
                      onChange={(event) =>
                        updateServiceLink(service.id, {
                          urlPago: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-textMain outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-dim)]"
                    />
                  </label>
                  <label className="text-sm text-textMuted">
                    URL de consulta
                    <input
                      value={value.urlConsulta ?? ''}
                      onChange={(event) =>
                        updateServiceLink(service.id, {
                          urlConsulta: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-textMain outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-dim)]"
                    />
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="glass-card px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--info-dim)] to-transparent opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--info)]/20 text-[color:var(--info)]">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight text-textMain">Seguridad y Respaldo (Backup)</h2>
            <p className="mt-1 text-sm text-textMuted max-w-xl">
              Toda tu contabilidad se guarda localmente. Descarga una copia de seguridad en formato JSON periodicamente para blindarte ante cualquier perdida de datos o borrado de cache.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleExport}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition hover:opacity-90"
                style={{ background: 'var(--info)', color: '#ffffff' }}
              >
                <Download className="h-4 w-4" />
                Descargar Base de Datos
              </button>
              
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-5 py-3 text-sm font-bold text-textMain transition hover:border-[color:var(--info)]" style={{ hover: { backgroundColor: 'var(--info-dim)' } }}>
                <Upload className="h-4 w-4" style={{ color: 'var(--info)' }} />
                Restaurar Backup
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
