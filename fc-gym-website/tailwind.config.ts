import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#080808',
        charcoal: '#151515',
        lime: '#C6FF00',
        silver: '#BFC3C7',
        bone: '#F5F5F5',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Narrow', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      screens: { xs: '400px' },
    },
  },
  plugins: [],
} satisfies Config;
