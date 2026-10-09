/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        peach: {
          50: '#fffaf5',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        twilight: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#232d42',
          800: '#182032',
          850: '#141a29',
          900: '#0f1422',
          950: '#0a0d17',
        },
        pastel: {
          lavender: '#c4b5fd',
          lilac: '#a78bfa',
          mint: '#6ee7b7',
          sage: '#a7f3d0',
          peach: '#fdba74',
          coral: '#fca5a5',
          sky: '#7dd3fc',
          ice: '#bae6fd',
          rose: '#f472b6',
          blossom: '#fbcfe8',
          cream: '#fef08a',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
        'glow-soft': 'glowSoft 4s ease-in-out infinite alternate',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowSoft: {
          '0%': { opacity: '0.4', filter: 'blur(80px)' },
          '100%': { opacity: '0.7', filter: 'blur(100px)' },
        },
      },
    },
  },
  plugins: [],
}
