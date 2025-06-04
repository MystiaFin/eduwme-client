/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        'confirm-blue': 'var(--color-confirm-blue)',
        'header-blue': 'var(--color-header-blue)',
      },
    },
  },
  plugins: [],
}