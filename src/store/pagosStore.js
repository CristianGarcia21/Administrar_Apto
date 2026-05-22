import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_DATA } from '../constants/seed.js'

export const usePagosStore = create(
  persist(
    (set, get) => ({
      pagos: SEED_DATA.pagos,
      setPagos: (pagos) => set({ pagos }),
      addPago: (pago) => set({ pagos: [...get().pagos, pago] }),
      updatePago: (id, cambios) =>
        set({
          pagos: get().pagos.map((pago) =>
            pago.id === id ? { ...pago, ...cambios } : pago,
          ),
        }),
      removePago: (id) =>
        set({ pagos: get().pagos.filter((pago) => pago.id !== id) }),
    }),
    { name: 'rentapp-pagos' },
  ),
)
