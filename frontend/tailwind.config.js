/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0f9fa',
          100: '#daf0f3',
          200: '#b6e1e8',
          300: '#84c9d5',
          400: '#4aa9bd',
          500: '#0d5c75', // Brand Deep Teal
          600: '#094c62',
          700: '#073e50',
          800: '#073342',
          900: '#0a2b38',
          950: '#041c25',
        },
        saffron: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#fedba8',
          300: '#fdc071',
          400: '#fb9b37',
          500: '#e06d14', // Brand Saffron Accent
          600: '#d1530b',
          700: '#ad3c0b',
          800: '#8b3010',
          900: '#712910',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
