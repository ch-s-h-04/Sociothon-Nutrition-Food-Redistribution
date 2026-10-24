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
        background: '#0B0F19',
        surface: '#111827',
        surfaceHover: '#1F2937',
        border: '#374151',
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          amber: '#F59E0B',
          cyan: '#06B6D4',
          rose: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
}
