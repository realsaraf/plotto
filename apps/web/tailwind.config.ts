import type { Config } from 'tailwindcss';
import { colors } from '@plotto/ui-tokens/colors';

const PERSON_TONES = [
  'coral',
  'amber',
  'emerald',
  'sky',
  'violet',
  'rose',
  'teal',
  'indigo',
];

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  safelist: [
    ...PERSON_TONES.flatMap((tone) => [
      `bg-${tone}-100`,
      `text-${tone}-800`,
      `border-${tone}-200`,
      `dark:bg-${tone}-950`,
      `dark:text-${tone}-300`,
      `dark:border-${tone}-900`,
    ]),
  ],
  theme: {
    extend: {
      colors: {
        coral: colors.coral,
        paper: colors.paper,
        ink: colors.ink,
        // Semantic theme tokens (driven by CSS vars in globals.css)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        card: 'rgb(var(--surface-elevated) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--fg-subtle) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--accent-strong) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        'warn-soft': 'rgb(var(--warn-soft) / <alpha-value>)',
        'warn-fg': 'rgb(var(--warn-fg) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        'success-soft': 'rgb(var(--success-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
