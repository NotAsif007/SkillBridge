/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Apple-inspired Light Design System ──────────────────────── */
        canvas:   '#F5F5F7',
        surface:  '#FFFFFF',
        graphite: '#1D1D1F',
        muted:    '#6E6E73',
        divider:  '#E5E5EA',
        subtle:   '#86868B',

        /* ─── Semantic tokens ────────────────────────────────────────── */
        readiness: {
          DEFAULT: '#059669',
          bg:      '#ECFDF5',
          text:    '#065F46',
        },
        gap: {
          DEFAULT: '#D97706',
          bg:      '#FFFBEB',
          text:    '#92400E',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg:      '#FEF2F2',
          text:    '#991B1B',
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
        btn:  '8px',
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