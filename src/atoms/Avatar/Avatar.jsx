export default function Avatar({ name, color = '#1f5e7a' }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initial}
    </div>
  )
}
