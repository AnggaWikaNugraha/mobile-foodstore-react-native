import { create } from 'zustand'
import { themes, Theme, ThemeName } from '../constants/themes'

interface ThemeState {
  themeName: ThemeName
  theme: Theme
  setTheme: (name: ThemeName) => void
}

const useThemeStore = create<ThemeState>((set) => ({
  themeName: 'greenJade',
  theme: themes.greenJade,

  setTheme: (name) => set({ themeName: name, theme: themes[name] }),
}))

export default useThemeStore
