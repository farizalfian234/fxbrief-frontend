/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f8',
          100: '#d6e2ee',
          200: '#aec6dd',
          300: '#7da3c6',
          400: '#4f7fab',
          500: '#2f6291',
          600: '#1B4F72',
          700: '#173f5c',
          800: '#122f45',
          900: '#0d2233'
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f7fa',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif']
      },
      maxWidth: {
        content: '1200px'
      }
    }
  },
  plugins: []
};
