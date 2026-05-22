import { useEffect } from 'react'
import { useUiStore } from '../store/uiStore.js'
import { getLocalMonthStr } from '../utils/dateUtils.js'

/**
 * Detecta si el mes real del sistema es distinto al mes activo guardado.
 * Si es así, activa pendingRollover para mostrar el banner/modal.
 */
export default function useMesRollover() {
  const mesActivo = useUiStore((state) => state.mesActivo)
  const setPendingRollover = useUiStore((state) => state.setPendingRollover)
  const pendingRollover = useUiStore((state) => state.pendingRollover)

  useEffect(() => {
    const mesReal = getLocalMonthStr()
    if (mesReal !== mesActivo && !pendingRollover) {
      setPendingRollover(true)
    }
  }, [mesActivo, pendingRollover, setPendingRollover])
}
