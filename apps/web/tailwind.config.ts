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
    ]),
  ],
  theme: {
    extend: {
      colors: {
        coral: colors.coral,
        paper: colors.paper,
        ink: colors.ink,
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
