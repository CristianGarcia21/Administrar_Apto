import { SEED_DATA } from '../constants/seed.js'
import { DEFAULT_SETTINGS, STORAGE_SCHEMA_VERSION } from '../constants/defaultSettings.js'

const KEY_MAP = {
  habitaciones:   'rentapp-habitaciones',
  inquilinos:     'rentapp-inquilinos',
  pagos:          'rentapp-pagos',
  servicios:      'rentapp-servicios',
  serviciosPagos: 'rentapp-servicios-pagos',
  historial:      'rentapp-historial',   // FIX: faltaba en la version original
  ui:             'rentapp-ui',
  settings:       'rentapp-settings',
}

const readPersisted = (key) => {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export const exportStateToJson = () => {
  const payload = {
    version: STORAGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      habitaciones:
        readPersisted(KEY_MAP.habitaciones)?.state?.habitaciones ??
        SEED_DATA.habitaciones,
      inquilinos:
        readPersisted(KEY_MAP.inquilinos)?.state?.inquilinos ??
        SEED_DATA.inquilinos,
      pagos:
        readPersisted(KEY_MAP.pagos)?.state?.pagos ??
        SEED_DATA.pagos,
      serviciosPublicos:
        readPersisted(KEY_MAP.servicios)?.state?.serviciosPublicos ??
        SEED_DATA.serviciosPublicos,
      serviciosHabitacion:
        readPersisted(KEY_MAP.servicios)?.state?.serviciosHabitacion ??
        SEED_DATA.serviciosHabitacion,
      serviciosPagos:
        readPersisted(KEY_MAP.serviciosPagos)?.state?.pagosServicios ??
        SEED_DATA.serviciosPagos,
      // FIX: historial ahora se incluye en el backup
      historial:
        readPersisted(KEY_MAP.historial)?.state?.historial ?? [],
      ui: {
        theme: readPersisted(KEY_MAP.ui)?.state?.theme ?? 'dark',
      },
      settings:
        readPersisted(KEY_MAP.settings)?.state ?? DEFAULT_SETTINGS,
    },
  }
  return JSON.stringify(payload, null, 2)
}

export const importStateFromJson = (jsonText) => {
  const parsed = JSON.parse(jsonText)

  if (!parsed?.data) throw new Error('Formato de archivo invalido')

  // FIX: validacion de version del schema
  const version = parsed.version ?? 1
  if (version < 1) throw new Error('Archivo de backup demasiado antiguo')
  if (version > STORAGE_SCHEMA_VERSION) {
    throw new Error(
      `Este backup fue creado con una version mas reciente de RentApp (v${version}). ` +
      `Actualiza la app para poder importarlo.`
    )
  }

  return {
    habitaciones:
      parsed.data.habitaciones ?? SEED_DATA.habitaciones,
    inquilinos:
      parsed.data.inquilinos ?? SEED_DATA.inquilinos,
    pagos:
      parsed.data.pagos ?? SEED_DATA.pagos,
    serviciosPublicos:
      parsed.data.serviciosPublicos ?? SEED_DATA.serviciosPublicos,
    serviciosHabitacion:
      parsed.data.serviciosHabitacion ?? SEED_DATA.serviciosHabitacion,
    serviciosPagos:
      parsed.data.serviciosPagos ?? SEED_DATA.serviciosPagos,
    // FIX: historial restaurado al importar
    historial:
      parsed.data.historial ?? [],
    ui:
      parsed.data.ui ?? { theme: 'dark' },
    settings:
      parsed.data.settings ?? DEFAULT_SETTINGS,
  }
}
