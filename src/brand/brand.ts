export const THEMES = {
  dark:  { background: '#0A0A0A', text: '#F5F5F0', accent: '#FFFFFF' },
  light: { background: '#F5F5F0', text: '#0A0A0A', accent: '#0A0A0A' },
  alert: { background: '#CC0000', text: '#FFFFFF',  accent: '#FFFF00' },
} as const;

export type ThemeName = keyof typeof THEMES;

export const BRAND = {
  colors: {
    black: '#080808',
    white: '#F5F5F0',
    accent: '#E63946',
    positive: '#22C55E',
    negative: '#E63946',
    yellow: '#FACC15',
    blue: '#3B82F6',
    accentAlt: '#AAAAAA',
    gray: '#1E1E1E',
    grayMid: '#2A2A2A',
    grayLight: '#888888',
    red: '#E63946',
    green: '#22C55E',
  },
  fonts: {
    heading: 'Inter',
    mono: 'JetBrains Mono',
  },
  fps: 30,
  width: 1080,
  height: 1080,
  widthVertical: 1080,
  heightVertical: 1920,
}
