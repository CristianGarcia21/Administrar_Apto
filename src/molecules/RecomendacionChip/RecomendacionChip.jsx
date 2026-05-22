import { TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'

/**
 * RecomendacionChip - Muestra una recomendación de urgencia con flecha
 * Visible solo si urgencia !== 'ninguna'
 */
export default function RecomendacionChip({ 
  urgencia = 'baja', 
  porcentaje = 0,
  precioActual = 0,
  precioSugerido = 0,
  className = '' 
}) {
  if (urgencia === 'ninguna') {
    return null
  }

  const urgenciaMap = {
    alta: {
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      text: 'text-danger',
      icon: AlertCircle,
      label: 'Subida urgente'
    },
    media: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      icon: TrendingUp,
      label: 'Subida recomendada'
    },
    baja: {
      bg: 'bg-info/10',
      border: 'border-info/30',
      text: 'text-info',
      icon: ChevronRight,
      label: 'Considerar ajuste'
    }
  }

  const config = urgenciaMap[urgencia] || urgenciaMap.baja
  const Icon = config.icon

  return (
    <div className={`rounded-lg border ${config.bg} ${config.border} px-3 py-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.text}`} />
        <span className={`text-sm font-medium ${config.text}`}>
          {config.label}
        </span>
        {porcentaje > 0 && (
          <span className={`ml-auto text-xs font-semibold ${config.text}`}>
            +{porcentaje}%
          </span>
        )}
      </div>
      {precioSugerido > precioActual && (
        <p className={`mt-1 text-xs ${config.text} opacity-80`}>
          ${precioSugerido.toLocaleString('es-CO')} vs ${precioActual.toLocaleString('es-CO')}
        </p>
      )}
    </div>
  )
}
