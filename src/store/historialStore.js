import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Abril 2026 como único mes histórico simulado (dato de referencia real del usuario)
const SEED_HISTORIAL = [
  {
    mes: '2026-04',
    mesLabel: 'abr',
    ingresos: 2100000,
    gastos: 2000000,
  },
]

export const useHistorialStore = create(
  persist(
    (set, get) => ({
      historial: SEED_HISTORIAL,

      /**
       * Guarda un snapshot del mes que se está cerrando.
       * Se llama desde NuevoMesModal al confirmar el rollover.
       */
      addSnapshot: (snapshot) => {
        const existing = get().historial.find((h) => h.mes === snapshot.mes)
        if (existing) {
          // Si ya existe ese mes, actualiza en lugar de duplicar
          set({
            historial: get().historial.map((h) =>
              h.mes === snapshot.mes ? { ...h, ...snapshot } : h,
            ),
          })
        } else {
          set({ historial: [...get().historial, snapshot] })
        }
      },

      /** Elimina el snapshot de un mes (por si hay que corregirlo) */
      removeSnapshot: (mes) =>
        set({ historial: get().historial.filter((h) => h.mes !== mes) }),

      /** Resetea a solo el seed (útil para testing) */
      resetHistorial: () => set({ historial: SEED_HISTORIAL }),
    }),
    { name: 'rentapp-historial' },
  ),
)
