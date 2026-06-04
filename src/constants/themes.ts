export interface Theme {
  primary: string
  primaryDark: string
  primaryLight: string
  primaryFaint: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  danger: string
  success: string
  warning: string
  white: string
}

export const themes: Record<string, Theme> = {
  greenFern: {
    primary: '#388E3C',
    primaryDark: '#1B5E20',
    primaryLight: '#66BB6A',
    primaryFaint: '#F1F8E9',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#eeeeee',
    danger: '#e53e3e',
    success: '#16a34a',
    warning: '#d97706',
    white: '#ffffff',
  },
  greenJade: {
    primary: '#00796B',
    primaryDark: '#004D40',
    primaryLight: '#26A69A',
    primaryFaint: '#E0F2F1',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#eeeeee',
    danger: '#e53e3e',
    success: '#16a34a',
    warning: '#d97706',
    white: '#ffffff',
  },
  red: {
    primary: '#c0392b',
    primaryDark: '#922b21',
    primaryLight: '#e74c3c',
    primaryFaint: '#fff5f5',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#eeeeee',
    danger: '#e53e3e',
    success: '#16a34a',
    warning: '#d97706',
    white: '#ffffff',
  },
  blue: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#93c5fd',
    primaryFaint: '#eff6ff',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#eeeeee',
    danger: '#e53e3e',
    success: '#16a34a',
    warning: '#d97706',
    white: '#ffffff',
  },
  orange: {
    primary: '#f97316',
    primaryDark: '#c2410c',
    primaryLight: '#fb923c',
    primaryFaint: '#fff7ed',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#888888',
    border: '#eeeeee',
    danger: '#e53e3e',
    success: '#16a34a',
    warning: '#d97706',
    white: '#ffffff',
  },
}

export type ThemeName = keyof typeof themes
