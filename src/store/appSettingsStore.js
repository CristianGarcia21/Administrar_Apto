import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from '../constants/defaultSettings.js'

export const useAppSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSettings: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
        })),
      updateServiceLink: (serviceId, changes) =>
        set((state) => ({
          servicioLinks: {
            ...state.servicioLinks,
            [serviceId]: {
              ...(state.servicioLinks?.[serviceId] ??
                DEFAULT_SETTINGS.servicioLinks[serviceId] ?? {
                  urlPago: '',
                  urlConsulta: '',
                }),
              ...changes,
            },
          },
        })),
      // Registra o actualiza el IPC de un año concreto
      addIpcAnio: (anio, valor) =>
        set((state) => {
          const existe = (state.ipcHistorial ?? []).find((h) => h.anio === anio)
          return {
            ipcHistorial: existe
              ? (state.ipcHistorial ?? []).map((h) =>
                  h.anio === anio ? { anio, valor } : h,
                )
              : [...(state.ipcHistorial ?? []), { anio, valor }],
            ipcAnual: valor,
          }
        }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'rentapp-settings' },
  ),
)
