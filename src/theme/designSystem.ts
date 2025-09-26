// Centralized design tokens & helpers
// Extend or generate from backend config/theme service if needed

export const palette = {
  primary: '#4CAF50',
  primaryAlt: '#66BB6A',
  primaryDark: '#2E7D32',
  accent: '#FF9800',
  danger: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  info: '#0288D1',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  bgLight: '#FAFAFA',
  bgDark: '#121212',
  textPrimaryLight: '#212121',
  textSecondaryLight: '#555555',
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#BDBDBD',
  outline: '#E0E0E0',
};

export const spacing = (factor: number) => factor * 4; // 4pt rhythm

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const shadows = {
  light: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  medium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
};

export const typography = {
  scale: {
    h1: 32,
    h2: 26,
    h3: 22,
    title: 18,
    body: 14,
    small: 12,
  },
};

export interface DesignSystem {
  palette: typeof palette;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  typography: typeof typography;
}

export const ds: DesignSystem = { palette, spacing, radii, shadows, typography };

export function createGradient(isDark: boolean): [string, string] {
  return isDark ? ['#2E7D32', '#388E3C'] : [palette.primary, palette.primaryAlt];
}

// Helper to clamp dynamic type sizes
export function dynamicFont(base: number, multiplier: number = 1) {
  const scaled = base * multiplier;
  return Math.min(scaled, base * 1.35); // guard runaway scaling
}
