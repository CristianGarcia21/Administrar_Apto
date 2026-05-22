import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_DATA } from '../constants/seed.js'

export const useInquilinosStore = create(
  persist(
    (set, get) => ({
      inquilinos: SEED_DATA.inquilinos,
      setInquilinos: (inquilinos) => set({ inquilinos }),
      addInquilino: (inquilino) =>
        set({ inquilinos: [...get().inquilinos, inquilino] }),
      updateInquilino: (id, cambios) =>
        set({
          inquilinos: get().inquilinos.map((inquilino) =>
            inquilino.id === id ? { ...inquilino, ...cambios } : inquilino,
          ),
        }),
      removeInquilino: (id) =>
        set({
          inquilinos: get().inquilinos.filter(
            (inquilino) => inquilino.id !== id,
          ),
        }),
    }),
    { name: 'rentapp-inquilinos' },
  ),
)
