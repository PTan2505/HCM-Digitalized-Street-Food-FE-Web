import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration
 *
 * Note: This project uses Tailwind CSS v4 with CSS-first configuration.
 * This file is provided for reference only. The actual configuration
 * is in src/index.css using @theme directive.
 *
 * If you need to use this config file (e.g., for v3 compatibility),
 * downgrade to Tailwind v3 and update package.json accordingly.
 */

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9e8',
          100: '#d9f0c2',
          200: '#c1e89a',
          300: '#a9df71',
          400: '#91d749',
          500: '#9fd356', // DEFAULT
          600: '#7ab82d', // dark
          700: '#5f9324',
          800: '#486e1b',
          900: '#314913',
          light: '#b8e986',
          DEFAULT: '#9fd356',
          dark: '#7ab82d',
        },
        secondary: '#7fae9b',
        success: '#00b374',
        error: '#f53425',
        warning: '#e39400',
        moderator: {
          from: '#89d151',
          to: '#e8f5dd',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, #7ab82d 0%, #9fd356 100%)',
        'gradient-moderator':
          'linear-gradient(180deg, #89d151 0%, #e8f5dd 100%)',
      },
    },
  },
  plugins: [
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, any>) => void;
    }) {
      addUtilities({
        // Title variants matching mobile design system
        '.title-xl': {
          fontSize: '32px',
          lineHeight: '40px',
          fontWeight: '700',
        },
        '.title-lg': {
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: '700',
        },
        '.title-md': {
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: '600',
        },
        '.title-sm': {
          fontSize: '18px',
          lineHeight: '24px',
          fontWeight: '600',
        },
        '.title-xs': {
          fontSize: '16px',
          lineHeight: '22px',
          fontWeight: '600',
        },
      });
    },
  ],
};

export default config;
