/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railnavy: {
          50: '#F4F7FE',
          100: '#E9EDF7',
          200: '#D3DCF0',
          300: '#94A3B8',
          500: '#4318FF',
          800: '#2B3674',
          900: '#1B254B',
        },
        pastel: {
          blue: '#E0F2FE',
          emerald: '#D1FAE5',
          amber: '#FEF3C7',
          rose: '#FFE4E6',
          purple: '#EDE9FE',
          indigo: '#E0E7FF',
          teal: '#CCFBF1',
          orange: '#FFEDD5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
