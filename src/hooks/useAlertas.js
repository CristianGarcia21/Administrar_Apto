import { useMemo } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  MessageSquareWarning,
  TrendingUp,
} from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { usePagosStore } from '../store/pagosStore.js'
import { useServiciosStore } from '../store/serviciosStore.js'
import { useInquilinosStore } from '../store/inquilinosStore.js'
import { useHabitacionesStore } from '../store/habitacionesStore.js'
import { useUiStore } from '../store/uiStore.js'

export default function useAlertas() {
  const pagos = usePagosStore((state) => state.pagos)
  const serviciosPublicos = useServiciosStore((state) => state.serviciosPublicos)
  const inquilinos = useInquilinosStore((state) => state.inquilinos)
  const habitaciones = useHabitacionesStore((state) => state.habitaciones)
  const dismissedAlertIds = useUiStore((state) => state.dismissedAlertIds)
  const dismissAlert = useUiStore((state) => state.dismissAlert)
  const mesActivo = useUiStore((state) => state.mesActivo)

  const alertas = useMemo(() => {
    const hoy = new Date()
    const list = []

    serviciosPublicos.forEach((servicio) => {
      if (servicio.estado === 'pagado') return

      const dias = differenceInCalendarDays(
        new Date(servicio.fechaVencimiento),
        hoy,
      )

      if (dias < 0) {
        list.push({
          id: `servicio-vencido-${servicio.id}`,
          icono: AlertTriangle,
          titulo: `${servicio.nombre} vencido`,
          detalle: `Referencia ${servicio.referencia}`,
          urgencia: 'alta',
          accion: 'Pagar ahora',
          persistente: false,
          tipo: 'servicio_vencido',
          serviceId: servicio.id,
        })
      } else if (dias <= 5) {
        list.push({
          id: `servicio-por-vencer-${servicio.id}`,
          icono: CalendarClock,
          titulo: `${servicio.nombre} por vencer`,
          detalle: `Vence en ${dias} dias`,
          urgencia: 'media',
          accion: 'Pagar ahora',
          persistente: false,
          tipo: 'servicio_por_vencer',
          serviceId: servicio.id,
        })
      }
    })

    pagos
      .filter((pago) => pago.diasMora >= 3)
      .forEach((pago) => {
        const inquilino = inquilinos.find(
          (item) => item.id === pago.inquilinoId,
        )
        list.push({
          id: `mora-${pago.id}`,
          icono: MessageSquareWarning,
          titulo: 'Inquilino con mora',
          detalle: `${inquilino?.nombre ?? 'Inquilino'} lleva ${
            pago.diasMora
          } dias`,
          urgencia: 'alta',
          accion: 'Ver historial',
          persistente: true,
          tipo: 'mora_inquilino',
        })
      })

    const ingreso = pagos
      .filter((pago) => pago.estado === 'pagado')
      .reduce((total, pago) => total + pago.monto, 0)
    const gasto = serviciosPublicos.reduce(
      (total, servicio) => total + servicio.monto,
      0,
    )

    // Alerta IPC: aparece en enero si no se ha aplicado el ajuste
    const [mesY, mesM] = mesActivo.split('-').map(Number)
    if (mesM === 1) {
      const noAjustadas = habitaciones.filter(
        (h) => h.estado === 'ocupada' && (h.ultimoAjusteAnio ?? 0) < mesY,
      )
      if (noAjustadas.length > 0) {
        list.push({
          id: `ipc-enero-${mesY}`,
          icono: TrendingUp,
          titulo: `Ajuste IPC ${mesY} pendiente`,
          detalle: `${noAjustadas.length} habitacion${noAjustadas.length > 1 ? 'es' : ''} sin actualizar. Maxima subida: IPC ${mesY - 1}.`,
          urgencia: 'media',
          accion: 'Ajustar arriendos',
          persistente: false,
          tipo: 'ipc_enero',
        })
      }
    }

    if (ingreso > gasto) {
      list.push({
        id: 'mes-positivo',
        icono: TrendingUp,
        titulo: 'Mes positivo',
        detalle: 'El margen esta por encima de la meta.',
        urgencia: 'success',
        accion: 'Ver resumen',
        persistente: false,
        tipo: 'mes_positivo',
      })
    }

    if (list.length === 0) {
      list.push({
        id: 'sin-alertas',
        icono: CheckCircle2,
        titulo: 'Sin novedades',
        detalle: 'Todo esta al dia en el sistema.',
        urgencia: 'baja',
        accion: 'Ver resumen',
        persistente: false,
        tipo: 'sin_alertas',
      })
    }

    return list.filter(
      (alerta) => alerta.persistente || !dismissedAlertIds.includes(alerta.id),
    )
  }, [pagos, serviciosPublicos, inquilinos, habitaciones, mesActivo, dismissedAlertIds])

  return { alertas, dismissAlert }
}
