/**
 * Calcula el margen bruto (ingresos - costos)
 * @param {number} ingresosTotales - Ingresos por arriendo
 * @param {number} costosTotales - Costos por servicios + mantenimiento
 * @returns {object} { margenBruto: number, margenPorcentaje: number }
 */
export const calcularMargen = (ingresosTotales, costosTotales) => {
  if (ingresosTotales <= 0) {
    return {
      margenBruto: 0,
      margenPorcentaje: 0,
    }
  }

  const margenBruto = ingresosTotales - costosTotales
  const margenPorcentaje = (margenBruto / ingresosTotales) * 100

  return {
    margenBruto: Math.round(margenBruto),
    margenPorcentaje: Math.round(margenPorcentaje * 10) / 10, // 1 decimal
  }
}

/**
 * Calcula rentabilidad por habitación
 * @param {number} arriendo - Precio del arriendo
 * @param {number} serviciosDistribuidos - Costos de servicios asignados a esta habitación
 * @param {number} mantenimiento - Costos de mantenimiento (opcional)
 * @returns {object} { rentabilidad: number, rentabilidadPorcentaje: number }
 */
export const calcularRentabilidadHabitacion = (
  arriendo,
  serviciosDistribuidos = 0,
  mantenimiento = 0,
) => {
  if (arriendo <= 0) {
    return {
      rentabilidad: 0,
      rentabilidadPorcentaje: 0,
    }
  }

  const costos = serviciosDistribuidos + mantenimiento
  const rentabilidad = arriendo - costos
  const rentabilidadPorcentaje = (rentabilidad / arriendo) * 100

  return {
    rentabilidad: Math.round(rentabilidad),
    rentabilidadPorcentaje: Math.round(rentabilidadPorcentaje * 10) / 10,
  }
}

/**
 * Calcula ocupación y su impacto en el margen
 * @param {array} habitaciones - Array de habitaciones con estado
 * @returns {object} { ocupacion: number, ocupacionPorcentaje: number, impactoMargen: string }
 */
export const calcularOcupacionMargen = (habitaciones = []) => {
  if (habitaciones.length === 0) {
    return {
      ocupacion: 0,
      ocupacionPorcentaje: 0,
      impactoMargen: 'neutral',
    }
  }

  const ocupadas = habitaciones.filter((h) => h.estado === 'ocupada').length
  const ocupacionPorcentaje = (ocupadas / habitaciones.length) * 100

  let impactoMargen = 'neutral'
  if (ocupacionPorcentaje >= 90) impactoMargen = 'excelente'
  else if (ocupacionPorcentaje >= 75) impactoMargen = 'bueno'
  else if (ocupacionPorcentaje >= 50) impactoMargen = 'moderado'
  else if (ocupacionPorcentaje > 0) impactoMargen = 'bajo'
  else impactoMargen = 'critico'

  return {
    ocupacion: ocupadas,
    ocupacionPorcentaje: Math.round(ocupacionPorcentaje),
    impactoMargen,
  }
}
