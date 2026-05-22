import Stat from '../../atoms/Stat/Stat.jsx'

export default function QuickStat({ label, value, trend, tone }) {
  return (
    <div className="card px-5 py-4">
      <Stat label={label} value={value} tone={tone} />
      <p className="mt-3 text-xs text-textMuted">
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs mes anterior
      </p>
    </div>
  )
}
