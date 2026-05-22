import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLocalMonthStr } from '../utils/dateUtils.js'

const getStreakData = () => {
  const today = new Date().toISOString().split('T')[0]
  return {
    lastVisitDate: today,
    currentStreak: 1,
    longestStreak: 1,
    totalDaysUsed: 1,
  }
}

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      // Mes activo — el mes que el usuario ha «iniciado» formalmente
      mesActivo: getLocalMonthStr(),
      setMesActivo: (mes) => set({ mesActivo: mes, mesVisualizado: mes }),
      // Mes que el usuario esta visualizando navegando
      mesVisualizado: getLocalMonthStr(),
      setMesVisualizado: (mes) => set({ mesVisualizado: mes }),
      // Banner de nuevo mes pendiente
      pendingRollover: false,
      setPendingRollover: (v) => set({ pendingRollover: v }),
      dismissedAlertIds: [],
      dismissAlert: (id) =>
        set((state) => ({
          dismissedAlertIds: state.dismissedAlertIds.includes(id)
            ? state.dismissedAlertIds
            : [...state.dismissedAlertIds, id],
        })),
      clearDismissedAlerts: () => set({ dismissedAlertIds: [] }),
      // Eliminado el rastreo de racha diaria obsoleta.
      // Las rachas (Meses Perfectos) ahora se calculan dinámicamente.
    }),
    {
      name: 'rentapp-ui',
    },
  ),
)
