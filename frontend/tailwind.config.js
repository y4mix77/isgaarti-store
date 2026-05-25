/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: 'rgba(24, 24, 27, 0.5)',
        surfaceDark: 'rgba(0, 0, 0, 0.6)',
      },
      boxShadow: {
        'neon': '0 0 15px rgba(255,255,255,0.07)',
        'neon-hover': '0 0 25px rgba(255,255,255,0.15)',
        'glow-gold': '0 0 15px rgba(251, 191, 36, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or any striking font we pick
      }
    },
  },
  plugins: [],
}
