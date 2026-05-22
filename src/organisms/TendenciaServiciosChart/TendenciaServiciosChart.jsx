import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCOP } from '../../utils/formatCOP.js'

const CUSTOM_COLORS = [
  '#0EA5E9', // Agua (Azul)
  '#F59E0B', // Energía (Amarillo)
  '#F97316', // Gas (Naranja)
  '#6366F1', // Internet (Indigo)
  '#10B981', // Extra 1 (Verde)
  '#EC4899', // Extra 2 (Rosa)
]

export default function TendenciaServiciosChart({ serviciosPublicos }) {
  const chartData = useMemo(() => {
    // 1. Encontrar todos los meses únicos
    const meses = Array.from(new Set(serviciosPublicos.map((s) => s.mes))).sort()

    // 2. Construir los puntos de la gráfica
    return meses.map((mes) => {
      // Formatear la etiqueta del mes (ej. "2026-05" -> "may")
      const [y, m] = mes.split('-').map(Number)
      const date = new Date(y, m - 1, 1)
      const mesLabel = date.toLocaleString('es-CO', { month: 'short' }).replace('.', '')

      // Filtrar servicios de este mes
      const serviciosDelMes = serviciosPublicos.filter((s) => s.mes === mes)

      // Construir el nodo
      const node = { mesLabel, mesKey: mes }
      serviciosDelMes.forEach((servicio) => {
        // Solo graficar servicios que no sean "arriendo_base" para no distorsionar la escala
        if (servicio.servicioId !== 'arriendo_base') {
          node[servicio.nombre] = servicio.monto || 0
        }
      })
      return node
    })
  }, [serviciosPublicos])

  // Extraer los nombres de los servicios para crear las líneas dinámicamente
  const serviceNames = useMemo(() => {
    const names = new Set()
    serviciosPublicos.forEach((s) => {
      if (s.servicioId !== 'arriendo_base') {
        names.add(s.nombre)
      }
    })
    return Array.from(names)
  }, [serviciosPublicos])

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            {serviceNames.map((name, index) => {
              const color = CUSTOM_COLORS[index % CUSTOM_COLORS.length]
              return (
                <linearGradient key={name} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="mesLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, textTransform: 'capitalize' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickFormatter={(value) => `$${value / 1000}k`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'capitalize' }}
            formatter={(value) => [formatCOP(value), '']}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }} 
          />
          
          {serviceNames.map((name, index) => {
            const color = CUSTOM_COLORS[index % CUSTOM_COLORS.length]
            return (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-${index})`}
              />
            )
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
