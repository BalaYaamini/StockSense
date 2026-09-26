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
        sage: {
          50: '#f0f3f1',
          100: '#dce3de',
          200: '#c5d1c8',
          300: '#a8b9ad',
          400: '#8fa596',
          500: '#7c9082',
          600: '#6a7d6f',
          700: '#566559',
          800: '#465148',
          900: '#3a433c',
        },
        surface: {
          50: '#f8f7f4',
          100: '#f1f0ec',
          200: '#e8e6e1',
          300: '#ced4bf',
          400: '#bfc9bb',
          500: '#a8b9ad',
        },
      },
      fontFamily: {
        sans: ['"Times New Roman"', 'Times', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(26, 31, 46, 0.04), 0 1px 2px 0 rgba(26, 31, 46, 0.02)',
        'card-hover': '0 10px 25px -3px rgba(26, 31, 46, 0.06), 0 4px 6px -2px rgba(26, 31, 46, 0.03)',
        'modal': '0 20px 25px -5px rgba(26, 31, 46, 0.08), 0 8px 10px -6px rgba(26, 31, 46, 0.06)',
        'dropdown': '0 4px 20px -2px rgba(26, 31, 46, 0.08), 0 2px 6px -1px rgba(26, 31, 46, 0.04)',
      }
    },
  },
  plugins: [],
}
