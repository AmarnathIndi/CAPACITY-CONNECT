/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imd: {
          navy: '#002D62',
          dark: '#0A2540',
          blue: '#0284C7',
          sky: '#0EA5E9',
          light: '#F0F9FF',
          accent: '#FF9933', // Saffron Indian Gov accent
          green: '#138808',  // Tiranga green
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
