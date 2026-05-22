/**
 * Extrae el mes actual de forma segura respetando la zona horaria local del dispositivo (ej. Colombia UTC-5),
 * evitando el bug donde toISOString() adelanta el mes el ultimo dia a partir de las 7:00 PM.
 * @returns {string} - Formato 'YYYY-MM'
 */
export function getLocalMonthStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
