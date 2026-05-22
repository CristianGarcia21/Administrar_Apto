const generarTextoRecomendacion = (urgencia, razones, precioSugerido) => {
  if (urgencia === 'ninguna') {
    return 'No hay presion para subir el precio este mes.'
  }

  const encabezado =
    urgencia === 'alta'
      ? 'Recomendacion prioritaria: ajusta el precio pronto.'
      : urgencia === 'media'
        ? 'Recomendacion moderada: considera un ajuste.'
        : 'Recomendacion leve: evalua un ajuste cuando sea oportuno.'

  return `${encabezado} Precio sugerido: ${precioSugerido.toLocaleString('es-CO')}`
}

export function calcularRecomendacion(
  habitacion,
  historialPagos,
  historialServicios,
  config,
) {
  const { ipcAnual = 9, objetivoMargen = 20, mesActivo } = config

  let fechaBase = null
  if (habitacion.precioHistorial && habitacion.precioHistorial.length > 0) {
    const ultimoAjuste = habitacion.precioHistorial[habitacion.precioHistorial.length - 1]
    if (ultimoAjuste && ultimoAjuste.fecha) {
      fechaBase = ultimoAjuste.fecha
    }
  }

  if (!fechaBase && habitacion.inquilinoId && habitacion.inquilinoFechaIngreso) {
    fechaBase = habitacion.inquilinoFechaIngreso
  }

  if (!fechaBase) {
    fechaBase = habitacion.fechaCreacion || '2024-01-01'
  }

  let mesesSinSubida = 0
  if (fechaBase && mesActivo) {
    const partsStart = fechaBase.split('-')
    const partsEnd = mesActivo.split('-')
    const yearStart = parseInt(partsStart[0], 10)
    const monthStart = parseInt(partsStart[1], 10)
    const yearEnd = parseInt(partsEnd[0], 10)
    const monthEnd = parseInt(partsEnd[1], 10)
    mesesSinSubida = Math.max(0, (yearEnd - yearStart) * 12 + (monthEnd - monthStart))
  } else if (config.mesesSinSubida !== undefined) {
    mesesSinSubida = config.mesesSinSubida
  }

  const razones = []
  let puntuacion = 0

  if (mesesSinSubida >= 12) {
    puntuacion += 40
    razones.push(
      `Han pasado ${mesesSinSubida} meses sin actualizar el precio`,
    )
    razones.push(
      `El IPC acumulado en ese periodo es aproximadamente ${(
        (ipcAnual * mesesSinSubida) /
        12
      ).toFixed(1)}%`,
    )
  } else if (mesesSinSubida >= 6) {
    puntuacion += 20
    razones.push(
      `Han pasado ${mesesSinSubida} meses; considerar subida preventiva`,
    )
  }

  const pagosPuntuales = historialPagos.filter((pago) => pago.diasMora === 0)
    .length
  const totalPagos = historialPagos.length
  const tasaPuntualidad = totalPagos > 0 ? pagosPuntuales / totalPagos : 0

  if (tasaPuntualidad >= 0.9 && totalPagos >= 3) {
    puntuacion += 20
    razones.push(
      `El inquilino paga puntualmente (${Math.round(
        tasaPuntualidad * 100,
      )}% de los meses)`,
    )
  } else if (tasaPuntualidad < 0.5) {
    puntuacion -= 15
    razones.push(
      'Inquilino con historial de mora; resolver eso antes de subir.',
    )
  }

  const serviciosRecientes = historialServicios.slice(-3)
  const serviciosAnteriores = historialServicios.slice(-6, -3)

  if (serviciosAnteriores.length > 0) {
    const promedioReciente =
      serviciosRecientes.reduce((total, servicio) => total + servicio.monto, 0) /
      serviciosRecientes.length
    const promedioAnterior =
      serviciosAnteriores.reduce((total, servicio) => total + servicio.monto, 0) /
      serviciosAnteriores.length
    const subidaServicios =
      ((promedioReciente - promedioAnterior) / promedioAnterior) * 100

    if (subidaServicios > 5) {
      puntuacion += 15
      razones.push(
        `Los servicios subieron ${subidaServicios.toFixed(1)}% en promedio`,
      )
    }
  }

  const factorIPC = 1 + (ipcAnual * Math.max(mesesSinSubida, 6)) / 12 / 100
  const precioSugerido = Math.round((habitacion.precioActual * factorIPC) / 10000) * 10000
  const incrementoPorcentaje =
    ((precioSugerido - habitacion.precioActual) / habitacion.precioActual) * 100

  let urgencia = 'ninguna'
  if (puntuacion >= 60) urgencia = 'alta'
  else if (puntuacion >= 40) urgencia = 'media'
  else if (puntuacion >= 20) urgencia = 'baja'

  const debeSubir = puntuacion >= 30

  return {
    debeSubir,
    precioActual: habitacion.precioActual,
    precioSugerido: debeSubir ? precioSugerido : habitacion.precioActual,
    incrementoPorcentaje: debeSubir ? incrementoPorcentaje : 0,
    urgencia,
    razones,
    recomendacionTexto: generarTextoRecomendacion(
      urgencia,
      razones,
      precioSugerido,
    ),
    impactoMensual: debeSubir ? precioSugerido - habitacion.precioActual : 0,
    impactoAnual: debeSubir
      ? (precioSugerido - habitacion.precioActual) * 12
      : 0,
    objetivoMargen,
  }
}
