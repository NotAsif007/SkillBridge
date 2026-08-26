/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design system tokens from docs/DESIGN.md
        'app-dark': '#0B0F17',
        'app-light': '#F8FAFC',
        'card-dark': '#111827',
        'card-light': '#FFFFFF',
        'border-dark': '#1F2937',
        'border-light': '#E2E8F0',
        readiness: {
          DEFAULT: '#059669',
          badge: 'rgba(5, 150, 105, 0.15)',
          text: '#34D399',
          'badge-light': '#ECFDF5',
          'text-light': '#065F46',
        },
        cobalt: {
          DEFAULT: '#1E3A8A',
          interactive: '#2563EB',
          hover: '#1D4ED8',
        },
        gap: {
          DEFAULT: '#D97706',
          badge: 'rgba(217, 119, 6, 0.15)',
          text: '#FBBF24',
        },
        danger: {
          DEFAULT: '#DC2626',
          badge: 'rgba(220, 38, 38, 0.15)',
          text: '#F87171',
        },
        analytics: {
          DEFAULT: '#0D9488',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
        pill: '9999px',
      },
      maxWidth: {
        container: '1440px',
      },
      width: {
        sidebar: '260px',
      },
    },
  },
  plugins: [],
};