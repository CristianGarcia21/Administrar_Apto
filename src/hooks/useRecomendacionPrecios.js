import { useMemo } from 'react'
import { calcularRecomendacion } from '../utils/recomendarPrecio.js'

export const useRecomendacionPrecios = (
  habitaciones,
  pagos,
  servicios,
  config,
) =>
  useMemo(() => {
    return habitaciones.map((habitacion) => {
      const historialPagos = pagos.filter(
        (pago) => pago.habitacionId === habitacion.id,
      )
      const historialServicios = servicios.filter(
        (servicio) => servicio.habitacionId === habitacion.id,
      )

      return {
        habitacionId: habitacion.id,
        recomendacion: calcularRecomendacion(
          habitacion,
          historialPagos,
          historialServicios,
          config,
        ),
      }
    })
  }, [habitaciones, pagos, servicios, config])
