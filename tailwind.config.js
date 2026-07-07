/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        panelRaised: 'rgb(var(--color-panel-raised) / <alpha-value>)',
        panelBorder: 'rgb(var(--color-panel-border) / <alpha-value>)',
        copper: 'rgb(var(--color-copper) / <alpha-value>)',
        copperDim: 'rgb(var(--color-copper-dim) / <alpha-value>)',
        mint: 'rgb(var(--color-mint) / <alpha-value>)',
        warnAmber: 'rgb(var(--color-warn-amber) / <alpha-value>)',
        textPrimary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        textDim: 'rgb(var(--color-text-dim) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
