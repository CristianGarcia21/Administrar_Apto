import { useEffect } from 'react'
import { useUiStore } from '../store/uiStore.js'

export default function useTheme() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    const applyTheme = () => {
      const isLight = theme === 'light'
      document.documentElement.classList.toggle('theme-light', isLight)
    }

    applyTheme()

    return () => undefined
  }, [theme])
}
