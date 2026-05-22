const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 shadow-sm active:translate-y-[1px]'

const variants = {
  primary: 'bg-primary text-surface hover:bg-primaryMid',
  secondary:
    'bg-cardMuted/70 text-textMain border border-border hover:border-[color:var(--accent)] hover:bg-cardMuted',
  ghost: 'bg-transparent text-textMuted hover:text-textMain hover:bg-cardMuted/70',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
