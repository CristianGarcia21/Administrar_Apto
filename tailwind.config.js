/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.theme-dark'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryMid: 'var(--color-primary-mid)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        cardMuted: 'var(--color-card-muted)',
        textMain: 'var(--color-text-main)',
        textMuted: 'var(--color-text-muted)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)']
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
