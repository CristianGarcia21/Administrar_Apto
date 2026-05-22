import ModalLayout from '../../templates/ModalLayout/ModalLayout.jsx'
import Button from '../../atoms/Button/Button.jsx'

export default function CheckRapidoModal({ alertas, onClose }) {
  const urgentes = alertas.filter(
    (alerta) => alerta.urgencia === 'alta' || alerta.urgencia === 'media',
  )

  return (
    <ModalLayout
      title="Check rapido"
      description="Solo lo urgente para hoy."
      onClose={onClose}
    >
      {urgentes.length === 0 ? (
        <div className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4">
          <p className="text-sm text-textMuted">Sin novedades. Buen dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {urgentes.map((alerta) => (
            <div
              key={alerta.id}
              className="rounded-xl border border-border bg-cardMuted/70 px-4 py-4"
            >
              <p className="text-sm font-semibold text-textMain">
                {alerta.titulo}
              </p>
              <p className="mt-1 text-xs text-textMuted">{alerta.detalle}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <Button className="text-xs" onClick={onClose}>
          Listo
        </Button>
      </div>
    </ModalLayout>
  )
}
