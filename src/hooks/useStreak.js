import { useEffect } from 'react'
import { useUiStore } from '../store/uiStore.js'

/**
 * Hook para rastrear y actualizar el streak de uso de la app
 * @returns {object} { currentStreak, longestStreak, totalDaysUsed, daysToMilestone }
 */
export default function useStreak() {
  const {
    currentStreak,
    longestStreak,
    totalDaysUsed,
    updateStreak,
  } = useUiStore((state) => ({
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    totalDaysUsed: state.totalDaysUsed,
    updateStreak: state.updateStreak,
  }))

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  // Calcular badges y hitos
  const streakBadge = () => {
    if (currentStreak >= 90) return 'Nivel elite (90+ dias)'
    if (currentStreak >= 30) return 'Nivel avanzado (30+ dias)'
    if (currentStreak >= 7) return 'Racha activa (7+ dias)'
    return null
  }

  const daysToMilestone = (() => {
    if (currentStreak < 7) return 7 - currentStreak
    if (currentStreak < 30) return 30 - currentStreak
    if (currentStreak < 90) return 90 - currentStreak
    return null
  })()

  return {
    currentStreak,
    longestStreak,
    totalDaysUsed,
    streakBadge: streakBadge(),
    daysToMilestone,
  }
}
