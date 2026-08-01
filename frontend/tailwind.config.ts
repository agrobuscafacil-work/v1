import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f8f4',
          100: '#e3ede3',
          200: '#c8dcc8',
          300: '#a5c5a5',
          400: '#7aab7a',
          500: '#5a8f5a',
          600: '#4a754a',
          700: '#3b5e3b',
          800: '#304b30',
          900: '#263b26',
          950: '#151f15',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        earth: {
          50: '#fdf8f0',
          100: '#f5e6d0',
          200: '#e8d0a8',
          300: '#d4b07a',
          400: '#c09450',
          500: '#a07830',
          600: '#7a5c28',
          700: '#5a4420',
          800: '#3e3018',
          900: '#2a2010',
          950: '#1a1408',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'leaf-drift': 'leafDrift 8s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'grow': 'grow 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        leafDrift: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.3' },
          '25%': { transform: 'translateY(-20px) rotate(5deg)', opacity: '0.5' },
          '50%': { transform: 'translateY(-10px) rotate(-3deg)', opacity: '0.4' },
          '75%': { transform: 'translateY(-25px) rotate(3deg)', opacity: '0.5' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        grow: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
