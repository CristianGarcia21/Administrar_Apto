export const aplicarIPCAnual = (
  porcentajeIPC,
  anio,
  habitaciones,
  updateHabitacion,
  addSnapshot
) => {
  let habitacionesActualizadas = 0
  const porcentaje = parseFloat(porcentajeIPC) / 100

  if (isNaN(porcentaje) || porcentaje <= 0) {
    throw new Error('El porcentaje IPC debe ser un numero mayor a 0.')
  }

  habitaciones.forEach((hab) => {
    // Solo aplicar a habitaciones que estan activas/ocupadas o que quieras subir el precio base
    // Si queremos subir todas para futuros contratos, no filtramos por estado, solo evitamos doble IPC en el mismo anio
    if (hab.ultimoAnioIPC !== anio) {
      // Precio nuevo = Precio Base + (Precio Base * IPC)
      const aumentoBruto = hab.precioBase * porcentaje
      const nuevoPrecioBruto = hab.precioBase + aumentoBruto
      
      // Redondeo a la centena mas cercana (ej. 154,200 -> 154,000 o 154,500 dependiendo del gusto, usaremos redondeo normal)
      // Para arriendos, redondear a miles es mas limpio (ej. 1,050,000)
      const nuevoPrecio = Math.round(nuevoPrecioBruto / 1000) * 1000

      updateHabitacion(hab.id, {
        precioBase: nuevoPrecio,
        ultimoAnioIPC: anio,
      })

      // Registrar en el historial de la app para auditoria
      addSnapshot({
        tipo: 'ipc_aplicado',
        titulo: `Ajuste IPC ${anio} aplicado`,
        descripcion: `Habitacion "${hab.nombre}" aumento de $${hab.precioBase} a $${nuevoPrecio} (${porcentajeIPC}%).`,
        fecha: new Date().toISOString(),
      })

      habitacionesActualizadas++
    }
  })

  return habitacionesActualizadas
}
