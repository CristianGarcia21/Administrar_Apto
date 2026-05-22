import { useMemo, useState } from 'react'
import { Filter, Download } from 'lucide-react'
import PaymentRow from '../../molecules/PaymentRow/PaymentRow.jsx'
import Button from '../../atoms/Button/Button.jsx'
import { formatCOP } from '../../utils/formatCOP.js'
import EmptyState from '../../atoms/EmptyState/EmptyState.jsx'

export default function PagosTable({
  pagos,
  onEdit,
  onDelete,
  onView,
  loading = false,
}) {
  const [filter, setFilter] = useState('todos')

  const filteredPagos = useMemo(() => {
    if (filter === 'pendientes') {
      return pagos.filter((pago) => pago.estado === 'pendiente')
    }
    if (filter === 'vencidos') {
      return pagos.filter((pago) => pago.estado === 'vencido')
    }
    return pagos
  }, [pagos, filter])

  const totalMes = filteredPagos.reduce((total, pago) => total + pago.monto, 0)

  const handleFilter = () => {
    setFilter((prev) => {
      if (prev === 'todos') return 'pendientes'
      if (prev === 'pendientes') return 'vencidos'
      return 'todos'
    })
  }

  const handleExport = () => {
    const header = [
      'fecha',
      'habitacion',
      'inquilino',
      'monto',
      'metodo',
      'estado',
      'notas',
    ]
    const rows = filteredPagos.map((pago) => [
      pago.fecha,
      pago.habitacion,
      pago.inquilino,
      pago.monto,
      pago.metodo,
      pago.estado,
      pago.notas ?? '',
    ])
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pagos.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-textMuted">
            Pagos del mes
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Historial y control</h2>
          <p className="mt-2 text-sm text-textMuted">
            {pagos.length} registros en el mes actual
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="text-xs" onClick={handleFilter}>
            <Filter className="h-4 w-4" />
            Filtrar{filter !== 'todos' ? `: ${filter}` : ''}
          </Button>
          <Button className="text-xs" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-textMuted">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Habitacion</th>
              <th className="px-6 py-3">Inquilino</th>
              <th className="px-6 py-3">Monto</th>
              <th className="px-6 py-3">Metodo</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Notas</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-8">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-3 w-40 rounded-full bg-border" />
                    <div className="h-3 w-56 rounded-full bg-border" />
                    <div className="h-3 w-32 rounded-full bg-border" />
                  </div>
                </td>
              </tr>
            )}
            {!loading && filteredPagos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8">
                  <EmptyState
                    title="Sin pagos"
                    description="Registra el primer pago para ver el historial mensual."
                  />
                </td>
              </tr>
            )}
            {!loading &&
              filteredPagos.map((pago) => (
                <PaymentRow
                  key={pago.id}
                  pago={pago}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm">
        <span className="text-textMuted">Total del mes</span>
        <span className="font-mono text-base text-accent">
          {formatCOP(totalMes)}
        </span>
      </div>
    </div>
  )
}
