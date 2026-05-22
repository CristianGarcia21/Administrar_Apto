import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useUiStore } from '../../store/uiStore.js'
import NuevoMesModal from '../NuevoMesModal/NuevoMesModal.jsx'

function getNextMonthLabel(mesActivo) {
  const [y, m] = mesActivo.split('-').map(Number)
  const next = addMonths(new Date(y, m - 1, 1), 1)
  return format(next, "MMMM 'de' yyyy", { locale: es })
}

export default function RolloverBanner() {
  const pendingRollover = useUiStore((s) => s.pendingRollover)
  const setPendingRollover = useUiStore((s) => s.setPendingRollover)
  const mesActivo = useUiStore((s) => s.mesActivo)
  const [showModal, setShowModal] = useState(false)

  if (!pendingRollover) return null

  const label = getNextMonthLabel(mesActivo)

  return (
    <>
      <div
        className="relative z-20 flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
        style={{
          background: 'linear-gradient(90deg, var(--accent-dim) 0%, var(--info-dim) 100%)',
          borderBottom: '1px solid var(--accent)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <p className="font-medium text-textMain">
            <span className="capitalize font-bold" style={{ color: 'var(--accent)' }}>{label}</span>
            {' '}está listo para iniciar — ajusta los servicios y confirma
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg px-3 py-1 text-xs font-bold transition hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#0f1923' }}
          >
            Iniciar mes
          </button>
          <button
            onClick={() => setPendingRollover(false)}
            className="rounded-lg p-1 text-textMuted transition hover:text-textMain"
            aria-label="Cerrar aviso"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <NuevoMesModal onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
