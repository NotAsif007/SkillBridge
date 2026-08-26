/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/app/**/*.{js,jsx}',
    './src/api/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/layouts/**/*.{js,jsx}',
    './src/features/student/**/*.{js,jsx}',
    './src/features/admin/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design system tokens from docs/DESIGN.md
        // App Background
        'app-dark': '#0B0F17',
        'app-light': '#F8FAFC',
        // Surface / Card
        'card-dark': '#111827',
        'card-light': '#FFFFFF',
        // Border / Divider
        'border-dark': '#1F2937',
        'border-light': '#E2E8F0',
        // Placement Readiness / Growth — Emerald
        readiness: {
          DEFAULT: '#059669',
          badge: 'rgba(5, 150, 105, 0.15)',
          text: '#34D399',
          'badge-light': '#ECFDF5',
          'text-light': '#065F46',
        },
        // Institutional Primary — Deep Cobalt / Navy
        cobalt: {
          DEFAULT: '#1E3A8A',
          interactive: '#2563EB',
          hover: '#1D4ED8',
        },
        // Skill Gap / Attention — Amber
        gap: {
          DEFAULT: '#D97706',
          badge: 'rgba(217, 119, 6, 0.15)',
          text: '#FBBF24',
        },
        // Critical Gap — Crimson / Rose
        danger: {
          DEFAULT: '#DC2626',
          badge: 'rgba(220, 38, 38, 0.15)',
          text: '#F87171',
        },
        // Informational / Analytics — Teal / Cyan
        analytics: {
          DEFAULT: '#0D9488',
        },
      },
      fontFamily: {
        // Primary body & display (DESIGN.md §3)
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        // Code, metrics & technical data
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Typography scale from DESIGN.md §3
        'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['1rem',    { lineHeight: '1.5rem',  fontWeight: '600', letterSpacing: '0' }],
        'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'meta': ['0.75rem',  { lineHeight: '1rem',    fontWeight: '500', letterSpacing: '0.01em' }],
        'metric': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        // DESIGN.md §5 Radius tokens
        card: '10px',   // rounded-xl equivalent
        btn: '8px',     // rounded-lg equivalent
        pill: '9999px', // rounded-full
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
