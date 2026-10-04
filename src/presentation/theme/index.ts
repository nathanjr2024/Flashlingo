/**
 * Design System - FlashLingo Theme
 * Tokens derived from the web prototype, adapted for mobile.
 */
import { Platform } from 'react-native';

export const Colors = {
  primary: '#6C63FF',
  primaryDark: '#574fd6',
  primaryLight: '#a78bfa',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  bg: '#f0f2ff',
  cardBg: '#ffffff',
  text: '#1e1b4b',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  // Dark mode
  darkBg: '#0f0d2e',
  darkCardBg: '#1a1744',
  darkText: '#e8e6ff',
  darkTextMuted: '#9ca3af',
  darkBorder: '#2d2a5e',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'normal',
    default: 'System',
  }),
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
  weights: {
    normal: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const Animation = {
  flipDuration: 500,
  slideDuration: 300,
  fadeDuration: 200,
  springConfig: {
    damping: 15,
    stiffness: 150,
  },
};