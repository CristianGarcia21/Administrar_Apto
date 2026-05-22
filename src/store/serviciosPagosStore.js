import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useServiciosPagosStore = create(
  persist(
    (set, get) => ({
      pagosServicios: [],
      setPagosServicios: (pagosServicios) => set({ pagosServicios }),
      addPagoServicio: (pagoServicio) =>
        set({ pagosServicios: [...get().pagosServicios, pagoServicio] }),
      removePagoServicio: (id) =>
        set({
          pagosServicios: get().pagosServicios.filter(
            (pagoServicio) => pagoServicio.id !== id,
          ),
        }),
    }),
    { name: 'rentapp-servicios-pagos' },
  ),
)
