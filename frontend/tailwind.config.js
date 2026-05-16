/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#d9e2ff',
          200: '#bcd0ff',
          300: '#8fb1ff',
          400: '#5c8aff',
          500: '#3361ff',
          600: '#2141ff',
          700: '#1a33e6',
          800: '#1a2bbc',
          900: '#1c2994',
        },
      },
    },
  },
  plugins: [],
}
