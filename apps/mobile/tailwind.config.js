/** @type {import('tailwindcss').Config} */
const { colors } = require('@plotto/ui-tokens/colors');

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        coral: colors.coral,
        paper: colors.paper,
        ink: colors.ink,
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
