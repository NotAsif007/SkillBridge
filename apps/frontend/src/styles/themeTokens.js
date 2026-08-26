/**
 * themeTokens.js — Unified Design System Tokens
 * Supports Apple Light and rich Multi-Accent Yellow Graphite Dark Mode
 */
export function getTokens(isDark) {
  if (isDark) {
    return {
      isDark: true,
      appBg: '#121317',
      surface: '#191B22',
      surfaceSubtle: '#21242E',
      surfaceHover: '#262935',
      border: '#2B2E3C',
      borderSubtle: '#232632',
      textPrimary: '#F3F4F6',
      textMuted: '#9CA3AF',
      textSubtle: '#6B7280',
      
      // Multi-accent harmonious palette
      yellow: '#F59E0B',
      yellowBg: 'rgba(245, 158, 11, 0.16)',
      yellowText: '#FBBF24',
      yellowBorder: 'rgba(245, 158, 11, 0.35)',

      emerald: '#10B981',
      emeraldBg: 'rgba(16, 185, 129, 0.16)',
      emeraldText: '#34D399',
      emeraldBorder: 'rgba(16, 185, 129, 0.35)',

      teal: '#06B6D4',
      tealBg: 'rgba(6, 182, 212, 0.16)',
      tealText: '#22D3EE',
      tealBorder: 'rgba(6, 182, 212, 0.35)',

      indigo: '#6366F1',
      indigoBg: 'rgba(99, 102, 241, 0.16)',
      indigoText: '#818CF8',
      indigoBorder: 'rgba(99, 102, 241, 0.35)',

      rose: '#F43F5E',
      roseBg: 'rgba(244, 63, 94, 0.16)',
      roseText: '#FB7185',
      roseBorder: 'rgba(244, 63, 94, 0.35)',

      purple: '#A855F7',
      purpleBg: 'rgba(168, 85, 247, 0.16)',
      purpleText: '#C084FC',
      purpleBorder: 'rgba(168, 85, 247, 0.35)',

      buttonPrimaryBg: '#F59E0B',
      buttonPrimaryText: '#121317',
      buttonSecondaryBg: '#21242E',
      buttonSecondaryText: '#F3F4F6',
    };
  }

  // Light Mode Tokens
  return {
    isDark: false,
    appBg: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceSubtle: '#F5F5F7',
    surfaceHover: '#F0F0F2',
    border: '#E5E5EA',
    borderSubtle: '#EBEBF0',
    textPrimary: '#1D1D1F',
    textMuted: '#6E6E73',
    textSubtle: '#86868B',

    // Multi-accent harmonious palette (Light)
    yellow: '#D97706',
    yellowBg: '#FFFBEB',
    yellowText: '#B45309',
    yellowBorder: '#FDE68A',

    emerald: '#059669',
    emeraldBg: '#ECFDF5',
    emeraldText: '#047857',
    emeraldBorder: '#A7F3D0',

    teal: '#0D9488',
    tealBg: '#F0FDFA',
    tealText: '#0F766E',
    tealBorder: '#99F6E4',

    indigo: '#4F46E5',
    indigoBg: '#EEF2FF',
    indigoText: '#4338CA',
    indigoBorder: '#C7D2FE',

    rose: '#E11D48',
    roseBg: '#FFF1F2',
    roseText: '#BE123C',
    roseBorder: '#FECDD3',

    purple: '#9333EA',
    purpleBg: '#FAF5FF',
    purpleText: '#7E22CE',
    purpleBorder: '#E9D5FF',

    buttonPrimaryBg: '#1D1D1F',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondaryBg: '#F5F5F7',
    buttonSecondaryText: '#1D1D1F',
  };
}
