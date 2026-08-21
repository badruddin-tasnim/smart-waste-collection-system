/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#FFFFFF',
        surface: '#FAFAFA',
        surface2: '#F2F2F2',
        border: { subtle: '#E7E7E7', DEFAULT: '#D4D4D4' },
        text: { primary: '#171717', secondary: '#5C5C5C', tertiary: '#8A8A8A' },
        accent: { DEFAULT: '#12A150', hover: '#0E8A44' },
        status: {
          pending: '#B7791F',
          resolved: '#12A150',
          missed: '#D64545',
          scheduled: '#737373',
        },
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { card: '8px', control: '6px', modal: '12px' },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}
