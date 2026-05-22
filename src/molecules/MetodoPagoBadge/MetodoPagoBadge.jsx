import { Smartphone, Banknote, DollarSign, CreditCard, Send } from 'lucide-react'

/**
 * MetodoPagoBadge - Chip semántico por método de pago
 * Tipos: nequi, daviplata, efectivo, transferencia, pse, otro
 */
export default function MetodoPagoBadge({ 
  metodo = 'efectivo',
  className = ''
}) {
  const metodosMap = {
    nequi: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      icon: Smartphone,
      label: 'Nequi',
    },
    daviplata: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      icon: Smartphone,
      label: 'Daviplata',
    },
    efectivo: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      icon: DollarSign,
      label: 'Efectivo',
    },
    transferencia: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent',
      icon: Send,
      label: 'Transferencia',
    },
    bancolombia: {
      bg: 'bg-blue-600/10',
      border: 'border-blue-600/30',
      text: 'text-blue-600',
      icon: CreditCard,
      label: 'Bancolombia',
    },
    pse: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-500',
      icon: CreditCard,
      label: 'PSE',
    },
  }

  const config = metodosMap[metodo?.toLowerCase()] || metodosMap.efectivo
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} border ${config.border} px-2.5 py-1 ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${config.text}`} />
      <span className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
