/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          900: '#0f1729',
          800: '#1a2744',
          700: '#243460',
        },
        slate: {
          850: '#1e293b',
        },
        amber: {
          450: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
};
