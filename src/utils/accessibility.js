/**
 * Detecta si el usuario prefiere reducir movimiento
 * @returns {boolean} true si prefers-reduced-motion está activo
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Retorna objeto de configuración de animación según preferencias del usuario
 * Si prefiere reducir movimiento, las duraciones son 0
 * @param {object} config - { duration: ms, delay: ms, ...other }
 * @returns {object} config adaptado
 */
export const getAnimationConfig = (config = {}) => {
  if (prefersReducedMotion()) {
    return {
      ...config,
      duration: 0,
      delay: 0,
    }
  }
  return config
}

/**
 * Hook helper: retorna clase CSS o inline para transitions
 * @param {string} property - CSS property a transicionar (all, opacity, transform, etc)
 * @param {number} duration - Duración en ms (default 300)
 * @returns {string} CSS className listo para usar
 */
export const getTransitionClass = (property = 'all', duration = 300) => {
  if (prefersReducedMotion()) {
    return '' // Sin transición
  }
  const durationSecs = duration / 1000
  return `transition-${property} duration-${Math.round(durationSecs * 1000)}`
}
