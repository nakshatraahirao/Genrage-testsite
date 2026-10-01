/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rage: {
          950: '#070707',
          900: '#0c0c0c',
          850: '#121212',
          800: '#181818',
          700: '#242424',
          600: '#333333',
          500: '#666666',
          400: '#999999',
          300: '#cccccc',
          200: '#e5e5e5',
          100: '#f5f5f5',
          red: '#e11d48',
          crimson: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        gothic: ['Impact', 'Haettenschweiler', 'Franklin Gothic Bold', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.3em'
      }
    },
  },
  plugins: [],
}
