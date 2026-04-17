/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#f5e6cc',
          200: '#e8c98a',
          300: '#d4a853',
          400: '#c08a2a',
          500: '#8B5E3C',
          600: '#7a4f30',
          700: '#6b3f23',
          800: '#4a2c18',
          900: '#2e1b0e',
        },
        cream: {
          50:  '#FEFDF9',
          100: '#FDF6E3',
          200: '#F5E9CC',
          300: '#EDD9A3',
          400: '#E0C47A',
        },
        espresso: '#2C1810',
        latte:    '#C4956A',
        foam:     '#F9F3E8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { from: { transform: 'translateY(-16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'warm': '0 4px 24px rgba(139,94,60,0.15)',
        'warm-lg': '0 8px 48px rgba(139,94,60,0.2)',
      },
    },
  },
  plugins: [],
};
