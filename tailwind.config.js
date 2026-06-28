/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        mb: {
          dark: '#0a0e1a',
          darker: '#060912',
          surface: '#111827',
          'surface-light': '#1e293b',
          accent: '#0ea5e9',
          'accent-light': '#38bdf8',
          'accent-dark': '#0284c7',
          muted: '#64748b',
          'muted-light': '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
