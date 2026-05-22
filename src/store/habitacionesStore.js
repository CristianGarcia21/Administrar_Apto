import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_DATA } from '../constants/seed.js'

export const useHabitacionesStore = create(
  persist(
    (set, get) => ({
      habitaciones: SEED_DATA.habitaciones,
      setHabitaciones: (habitaciones) => set({ habitaciones }),
      addHabitacion: (habitacion) =>
        set({ habitaciones: [...get().habitaciones, habitacion] }),
      updateHabitacion: (id, cambios) =>
        set({
          habitaciones: get().habitaciones.map((habitacion) =>
            habitacion.id === id ? { ...habitacion, ...cambios } : habitacion,
          ),
        }),
      removeHabitacion: (id) =>
        set({
          habitaciones: get().habitaciones.filter(
            (habitacion) => habitacion.id !== id,
          ),
        }),

      /**
       * Aplica el ajuste IPC anual a un conjunto de habitaciones.
       * @param ajustes Array<{ habitacionId, nuevoPrecio }>
       * @param anio   El año del ajuste (ej: 2025)
       */
      applyIpcAdjustment: (ajustes, anio) =>
        set({
          habitaciones: get().habitaciones.map((hab) => {
            const ajuste = ajustes.find((a) => a.habitacionId === hab.id)
            if (!ajuste) return hab
            return {
              ...hab,
              precioActual: ajuste.nuevoPrecio,
              precioMinimo: Math.round(ajuste.nuevoPrecio * 0.9),
              ultimoAjusteAnio: anio,
              precioHistorial: [
                ...(hab.precioHistorial ?? []),
                {
                  fecha: new Date().toISOString().slice(0, 10),
                  anio,
                  precioAntes: hab.precioActual,
                  precioDespues: ajuste.nuevoPrecio,
                },
              ],
            }
          }),
        }),
    }),
    { name: 'rentapp-habitaciones' },
  ),
)
