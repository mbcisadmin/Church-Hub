import type { Config } from 'tailwindcss';
import baseConfig from '@church/tailwind-config';

/**
 * Tailwind Configuration for Church Hub Platform
 *
 * This extends the base Church Hub configuration with app-specific settings.
 * Church-specific branding is defined in globals.css via CSS variables.
 */
export default {
  presets: [baseConfig],
  content: ['./src/**/*.{ts,tsx}', '../../packages/nextjs-ui/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // App-specific theme extensions go here
      // Most branding should be done via CSS variables in globals.css
    },
  },
} satisfies Config;
