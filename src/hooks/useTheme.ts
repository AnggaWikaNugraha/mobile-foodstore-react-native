import useThemeStore from '../store/themeStore'

export function useTheme() {
  return useThemeStore((state) => state.theme)
}

export function useThemeName() {
  return useThemeStore((state) => state.themeName)
}

export function useSetTheme() {
  return useThemeStore((state) => state.setTheme)
}
