import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_DATA } from '../constants/seed.js'

export const useServiciosStore = create(
  persist(
    (set, get) => ({
      serviciosPublicos: SEED_DATA.serviciosPublicos,
      serviciosHabitacion: SEED_DATA.serviciosHabitacion,
      setServiciosPublicos: (serviciosPublicos) => set({ serviciosPublicos }),
      setServiciosHabitacion: (serviciosHabitacion) =>
        set({ serviciosHabitacion }),
      updateServicioPublico: (id, cambios) =>
        set((state) => ({
          serviciosPublicos: state.serviciosPublicos.map((servicio) =>
            servicio.id === id ? { ...servicio, ...cambios } : servicio,
          ),
        })),
      getDeudaAcumulada: (servicioId, mesActual) => {
        const state = get()
        return state.serviciosPublicos
          .filter(
            (s) =>
              s.servicioId === servicioId &&
              s.mes < mesActual &&
              s.estado !== 'pagado'
          )
          .reduce((sum, s) => sum + (Number(s.monto) || 0), 0)
      },
      resolveDeudasPasadas: (servicioId, mesActual) =>
        set((state) => ({
          serviciosPublicos: state.serviciosPublicos.map((s) => {
            if (
              s.servicioId === servicioId &&
              s.mes < mesActual &&
              s.estado !== 'pagado'
            ) {
              return { ...s, estado: 'pagado' }
            }
            return s
          }),
        })),
      ensureServiciosForMonth: (mes) =>
        set((state) => {
          const hasServices = state.serviciosPublicos.some((s) => s.mes === mes)
          if (hasServices) return state

          const months = Array.from(
            new Set(state.serviciosPublicos.map((s) => s.mes)),
          ).sort()
          const referenceMonth = months.reverse().find((m) => m < mes) || months[0]

          if (!referenceMonth) return state

          const referenceServices = state.serviciosPublicos.filter(
            (s) => s.mes === referenceMonth,
          )
          const newServices = referenceServices.map((s) => {
            let nextVencimiento = s.fechaVencimiento
            try {
              const parts = s.fechaVencimiento.split('-')
              if (parts.length >= 3) {
                nextVencimiento = `${mes}-${parts[2]}`
              }
            } catch {
              nextVencimiento = `${mes}-20`
            }

            return {
              ...s,
              id: `${s.servicioId}-${mes}`,
              mes: mes,
              estado: 'pendiente',
              fechaVencimiento: nextVencimiento,
              monto: 0,
            }
          })

          return {
            serviciosPublicos: [...state.serviciosPublicos, ...newServices],
          }
        }),
    }),
    { name: 'rentapp-servicios' },
  ),
)
