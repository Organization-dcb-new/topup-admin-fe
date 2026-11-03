import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

export const LANGUAGES = ['en', 'id'] as const
export type Language = (typeof LANGUAGES)[number]

/**
 * Switches language inside a view transition so every string crossfades at once instead of
 * swapping in a single frame. While it runs, `data-switching-language` on <html> turns on the
 * per-block `vt-*` transition names in style.css.
 */
export function useLanguageSwitch() {
  const { i18n } = useTranslation()
  const active: Language = i18n.resolvedLanguage === 'id' ? 'id' : 'en'

  const changeLanguage = (lng: Language) => {
    if (lng === active) return
    const apply = () => flushSync(() => void i18n.changeLanguage(lng))
    if (!('startViewTransition' in document)) return apply()

    const root = document.documentElement
    root.dataset.switchingLanguage = ''
    document.startViewTransition(apply).finished.finally(() => {
      delete root.dataset.switchingLanguage
    })
  }

  return { active, changeLanguage }
}
