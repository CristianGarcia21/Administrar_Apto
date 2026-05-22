export const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

/**
 * Versión abreviada para cuando el espacio es limitado
 * 1200000 → $1.2M
 * 950000 → $950K
 * 15000 → $15K
 */
export const formatCOPAbrev = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toLocaleString('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}K`
  }
  return `$${value}`
}
