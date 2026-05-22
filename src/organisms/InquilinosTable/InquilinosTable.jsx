import { useMemo, useState } from 'react'
import { Calendar, CreditCard, Edit3, History, Trash2, LogOut } from 'lucide-react'
import Button from '../../atoms/Button/Button.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'
import InquilinoAvatar from '../../molecules/InquilinoAvatar/InquilinoAvatar.jsx'
import EmptyState from '../../atoms/EmptyState/EmptyState.jsx'

const estadoTone = {
  pagado: 'success',
  pendiente: 'warning',
  vencido: 'danger',
}

export default function InquilinosTable({
  inquilinos,
  onEdit,
  onDelete,
  onView,
  onRegisterPago,
  onCheckout,
  mostrarSalidas = false,
  loading = false,
}) {
  const [soloMes, setSoloMes] = useState(false)
  const filteredInquilinos = useMemo(() => {
    if (mostrarSalidas) return inquilinos
    return soloMes ? inquilinos.filter((item) => item.pagoMes) : inquilinos
  }, [inquilinos, soloMes, mostrarSalidas])

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-textMuted">
            {mostrarSalidas ? 'Historial de salidas' : 'Inquilinos activos'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {mostrarSalidas ? 'Ex-inquilinos' : 'Estado del mes'}
          </h2>
        </div>
        {!mostrarSalidas && (
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => setSoloMes((prev) => !prev)}
          >
            <Calendar className="h-4 w-4" />
            Filtrar mes{soloMes ? ': activo' : ''}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-textMuted">
            <tr>
              <th className="px-6 py-3">Inquilino</th>
              <th className="px-6 py-3">Habitacion</th>
              <th className="px-6 py-3">Ingreso</th>
              {mostrarSalidas ? (
                <th className="px-6 py-3">Salida</th>
              ) : (
                <th className="px-6 py-3">Estado</th>
              )}
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-3 w-40 rounded-full bg-border" />
                    <div className="h-3 w-56 rounded-full bg-border" />
                    <div className="h-3 w-32 rounded-full bg-border" />
                  </div>
                </td>
              </tr>
            )}
            {!loading && filteredInquilinos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <EmptyState
                    title={mostrarSalidas ? "Sin historial de salidas" : "Sin inquilinos"}
                    description={mostrarSalidas ? "No se han registrado salidas de inquilinos." : "Registra tu primer inquilino para ver su historial aqui."}
                  />
                </td>
              </tr>
            )}
            {!loading &&
              filteredInquilinos.map((inquilino) => (
              <tr
                key={inquilino.id}
                className="group border-b border-border last:border-none hover:bg-cardMuted/60"
              >
                <td className="px-6 py-4">
                  <InquilinoAvatar
                    nombre={inquilino.nombre}
                    habitacion={inquilino.habitacion}
                    moraDias={inquilino.diasMora}
                    color={inquilino.color}
                  />
                </td>
                <td className="px-6 py-4 text-textMain">
                  {inquilino.habitacion || 'Ninguna (Salida)'}
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {inquilino.fechaIngreso}
                </td>
                {mostrarSalidas ? (
                  <td className="px-6 py-4 text-textMuted">
                    {inquilino.fechaSalida || 'N/A'}
                  </td>
                ) : (
                  <td className="px-6 py-4">
                    <Badge
                      label={inquilino.estadoPago}
                      tone={estadoTone[inquilino.estadoPago]}
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 opacity-0 transition group-hover:opacity-100">
                    {mostrarSalidas ? (
                      <>
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => onView?.(inquilino)}
                        >
                          <History className="h-4 w-4" />
                          Historial de Pagos
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs text-red-500/80 hover:text-red-400"
                          onClick={() => onDelete?.(inquilino)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar registro
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="text-xs"
                          onClick={() => onRegisterPago?.(inquilino)}
                        >
                          <CreditCard className="h-4 w-4" />
                          Registrar pago
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => onView?.(inquilino)}
                        >
                          <History className="h-4 w-4" />
                          Historial
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs text-rose-500 hover:text-rose-400"
                          onClick={() => onCheckout?.(inquilino)}
                        >
                          <LogOut className="h-4 w-4" />
                          Registrar Salida
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs"
                          onClick={() => onEdit?.(inquilino)}
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs text-red-500/80 hover:text-red-400"
                          onClick={() => onDelete?.(inquilino)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
