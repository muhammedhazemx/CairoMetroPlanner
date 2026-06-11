import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          blue: 'rgb(var(--brand-blue) / <alpha-value>)',
          blueMid: 'rgb(var(--brand-blue-mid) / <alpha-value>)',
          gold: 'rgb(var(--brand-gold) / <alpha-value>)',
        },
        line: {
          l1: '#C01010',
          l2: '#0050A0',
          l3: '#C8902F',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config;
