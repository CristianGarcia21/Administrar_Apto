import { formatCOP } from '../../utils/formatCOP.js'

const toneClasses = {
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
  primary: 'text-primary',
}

export default function Stat({ label, value, prefix, suffix, tone = 'accent' }) {
  const display =
    typeof value === 'number' ? formatCOP(value).replace('COP', '').trim() : value

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-textMuted">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold font-mono ${
          toneClasses[tone] ?? toneClasses.accent
        }`}
      >
        {prefix}
        {display}
        {suffix}
      </p>
    </div>
  )
}
