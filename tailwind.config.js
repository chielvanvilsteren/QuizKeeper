/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1e40af',      // Modern blauw
        'secondary': '#3b82f6',    // Helder blauw
        'accent': '#06b6d4',       // Cyan accent
        'background': '#f8fafc',   // Zeer lichte grijze achtergrond
        'neutral': '#64748b',      // Moderne grijstint
        'text-dark': '#0f172a',    // Donkere tekst
        'success': '#10b981',      // Groen voor succes
        'warning': '#f59e0b',      // Oranje voor waarschuwingen
        'error': '#ef4444',        // Rood voor fouten
        'surface': '#ffffff',      // Wit voor cards/surfaces
        'border': '#e2e8f0',       // Lichte border
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
