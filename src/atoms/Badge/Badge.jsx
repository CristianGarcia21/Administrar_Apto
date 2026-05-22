const tones = {
  success: { bg: 'var(--positive-dim)', color: 'var(--positive)' },
  warning: { bg: 'var(--warning-dim)', color: 'var(--warning)' },
  danger: { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  info: { bg: 'var(--info-dim)', color: 'var(--info)' },
  neutral: { bg: 'var(--border-subtle)', color: 'var(--text-tertiary)' },
}

export default function Badge({ label, tone = 'neutral' }) {
  const style = tones[tone] ?? tones.neutral
  return (
    <span
      className="chip"
      style={{ background: style.bg, color: style.color, borderColor: style.bg }}
      aria-label={label}
    >
      {label}
    </span>
  )
}
