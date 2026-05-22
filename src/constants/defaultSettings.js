/**
 * Constantes por defecto de configuracion.
 * Fuente de verdad unica — importada por appSettingsStore Y storageExport
 * para evitar duplicacion de defaults.
 */
import { SEED_DATA } from './seed.js'

export const DEFAULT_SERVICIO_LINKS = SEED_DATA.serviciosPublicos.reduce(
  (links, servicio) => ({
    ...links,
    [servicio.servicioId]: {
      urlPago: servicio.urlPago ?? '',
      urlConsulta: servicio.urlConsulta ?? '',
    },
  }),
  {},
)

export const DEFAULT_SETTINGS = {
  nombre: 'Camilo',
  apartamento: 'Apartamento San Rafael',
  ipcAnual: 9,
  diaCorteMora: 5,
  porcentajeServicios: 70,
  servicioLinks: DEFAULT_SERVICIO_LINKS,
  ipcHistorial: [
    { anio: 2024, valor: 9.28 },
  ],
}

/** Version del schema de export/import — incrementar en breaking changes */
export const STORAGE_SCHEMA_VERSION = 2
