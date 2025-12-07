/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007aff',
        dark: {
          bg: '#000000',
          card: '#1c1c1e',
          elevated: '#2c2c2e',
        }
      }
    },
  },
  plugins: [],
}