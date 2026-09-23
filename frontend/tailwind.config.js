/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36abf7',
          500: '#0c8ee9',
          600: '#0170c7',
          700: '#0259a1',
          800: '#064b84',
          900: '#0b3f6e',
          950: '#072849',
        },
        navy: {
          800: '#0A2540',
          900: '#071A2E',
          950: '#04101D',
        }
      }
    },
  },
  plugins: [],
}
