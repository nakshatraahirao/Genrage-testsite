/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1c1c1c',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#737373',
          400: '#a3a3a3',
          accent: '#ffffff',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
