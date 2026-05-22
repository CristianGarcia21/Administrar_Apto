import { FileX } from 'lucide-react'

export default function EmptyState({
  title,
  description,
  icon: Icon = FileX,
  action,
  actionLabel = 'Crear nuevo',
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-cardMuted/70 px-6 py-12 text-center">
      {Icon && (
        <div className="rounded-full bg-card p-3">
          <Icon className="h-6 w-6 text-textMuted" />
        </div>
      )}
      <p className="mt-4 text-sm font-semibold text-textMain">{title}</p>
      {description && (
        <p className="mt-2 max-w-xs text-xs text-textMuted">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
