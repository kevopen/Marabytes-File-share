/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--app-bg)',
          glass: 'var(--app-glass)',
          'glass-hover': 'var(--app-glass-hover)',
          surface: 'var(--app-surface)',
          'surface-hover': 'var(--app-surface-hover)',
          text: 'var(--app-text)',
          'text-secondary': 'var(--app-text-secondary)',
          'text-muted': 'var(--app-text-muted)',
          border: 'var(--app-border)',
          'border-hover': 'var(--app-border-hover)',
          glow: 'var(--app-glow)',
        },
        accent: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
