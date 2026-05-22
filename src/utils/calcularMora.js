/**
 * Calcula la cantidad de días de mora y el monto de la mora
 * @param {Date|string} fechaVencimiento - Fecha de vencimiento del pago
 * @param {number} porcentajeDiario - Porcentaje diario de mora (default 0.1%)
 * @returns {object} { diasMora: number, montoMora: number }
 */
export const calcularDiasMora = (fechaVencimiento, porcentajeDiario = 0.001) => {
  const hoy = new Date()
  const vencimiento = new Date(fechaVencimiento)
  
  // Resetear hora para comparación de fechas
  hoy.setHours(0, 0, 0, 0)
  vencimiento.setHours(0, 0, 0, 0)
  
  if (hoy <= vencimiento) {
    return 0
  }
  
  const diasTranscurridos = Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
  return Math.max(0, diasTranscurridos)
}

/**
 * Calcula el monto total de mora sobre un arriendo
 * @param {number} montoArriendo - Monto del arriendo
 * @param {number} diasMora - Cantidad de días de mora
 * @param {number} porcentajeDiario - Porcentaje diario (default 0.1%)
 * @returns {number} Monto de la mora redondeado
 */
export const calcularMontoMora = (montoArriendo, diasMora, porcentajeDiario = 0.001) => {
  if (diasMora <= 0 || montoArriendo <= 0) {
    return 0
  }
  
  // Interés compuesto: monto * (1 + porcentajeDiario) ^ diasMora
  const montoConMora = montoArriendo * Math.pow(1 + porcentajeDiario, diasMora)
  const mora = montoConMora - montoArriendo
  
  // Redondear a entero más cercano
  return Math.round(mora)
}

/**
 * Calcula mora completa en un solo paso
 * @param {number} montoArriendo - Monto del arriendo
 * @param {Date|string} fechaVencimiento - Fecha de vencimiento
 * @param {number} porcentajeDiario - Porcentaje diario (default 0.1%)
 * @returns {object} { diasMora: number, montoMora: number, totalConMora: number }
 */
export const calcularMora = (montoArriendo, fechaVencimiento, porcentajeDiario = 0.001) => {
  const diasMora = calcularDiasMora(fechaVencimiento, porcentajeDiario)
  const montoMora = calcularMontoMora(montoArriendo, diasMora, porcentajeDiario)
  
  return {
    diasMora,
    montoMora,
    totalConMora: montoArriendo + montoMora,
  }
}
