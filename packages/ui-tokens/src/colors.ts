/**
 * Plotto brand tokens — single source of truth for both mobile (NativeWind)
 * and web (Tailwind). Imported by each app's tailwind.config to stay in sync.
 *
 * Brand direction (PRODUCT.md §10):
 *   - Warm paper background
 *   - Deep coral accent
 *   - Ink-black text
 */

export const colors = {
  // Brand
  coral: {
    50: '#fff4f1',
    100: '#ffe4dc',
    200: '#ffc5b5',
    300: '#ff9a80',
    400: '#ff6e4e',
    500: '#ef4a27', // primary brand accent
    600: '#d03718',
    700: '#ac2a13',
    800: '#882414',
    900: '#6f2114',
    950: '#3d0c05',
  },
  // Paper / neutrals (warm)
  paper: {
    50: '#fbf8f4',
    100: '#f5efe5',
    200: '#ebe0cd',
    300: '#d9c6a4',
    400: '#c2a678',
    500: '#a88657',
    600: '#8d6e48',
    700: '#71573c',
    800: '#5c4733',
    900: '#4d3b2c',
    950: '#291f16',
  },
  // Ink (primary text)
  ink: {
    50: '#f5f5f4',
    100: '#e7e5e4',
    200: '#d6d3d1',
    300: '#a8a29e',
    400: '#78716c',
    500: '#57534e',
    600: '#44403c',
    700: '#292524',
    800: '#1c1917',
    900: '#0e0c0b',
    950: '#050404',
  },
} as const;

export type BrandColors = typeof colors;
