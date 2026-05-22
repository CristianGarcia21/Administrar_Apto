/**
 * Sincronización automática de diasMora en pagos del mes activo.
 * Se ejecuta al montar DashboardLayout y cuando cambia mesActivo.
 * Calcula diasMora en base al diaVencimiento del inquilino,
 * sin depender de que el usuario lo edite manualmente.
 */
import { useEffect } from 'react'
import { usePagosStore } from '../store/pagosStore.js'
import { useInquilinosStore } from '../store/inquilinosStore.js'
import { useUiStore } from '../store/uiStore.js'
import { calcularDiasMora } from '../utils/calcularMora.js'

export default function useAutoMoraSync() {
  const pagos      = usePagosStore((s) => s.pagos)
  const updatePago = usePagosStore((s) => s.updatePago)
  const inquilinos = useInquilinosStore((s) => s.inquilinos)
  const mesActivo  = useUiStore((s) => s.mesActivo)

  useEffect(() => {
    // Solo calcula mora en pagos del mes activo que no esten pagados
    const pagosPendientes = pagos.filter(
      (p) => p.mes === mesActivo && p.estado !== 'pagado',
    )

    pagosPendientes.forEach((pago) => {
      const inquilino = inquilinos.find((i) => i.id === pago.inquilinoId)
      if (!inquilino) return

      // Fecha de vencimiento = mes del pago + día de vencimiento del inquilino
      const dia = String(inquilino.diaVencimiento ?? 5).padStart(2, '0')
      const fechaVenc = `${pago.mes}-${dia}`
      const diasMora  = calcularDiasMora(fechaVenc)

      // Actualiza estado automaticamente: si hay mora → 'vencido', si no → 'pendiente'
      const nuevoEstado = diasMora > 0 ? 'vencido' : 'pendiente'

      if (pago.diasMora !== diasMora || pago.estado !== nuevoEstado) {
        updatePago(pago.id, { diasMora, estado: nuevoEstado })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesActivo]) // Solo recalcula al cambiar el mes o al montar
}
