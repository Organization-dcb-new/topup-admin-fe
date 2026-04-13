import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '@/locales/en/common.json'
import idCommon from '@/locales/id/common.json'

/** Bumped so a prior default of `id` under the old key does not override project default `en`. */
const STORAGE_KEY = 'pg_admin_locale'

function getStoredLng(): 'en' | 'id' {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'id') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

function syncHtmlLang(lng: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng === 'en' ? 'en' : 'id'
}

syncHtmlLang(getStoredLng())

void i18n.use(initReactI18next).init({
  resources: {
    id: { common: idCommon },
    en: { common: enCommon },
  },
  lng: getStoredLng(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'id'],
  /** Use `en` / `id` only (no `en-US` etc.) so UI state matches `changeLanguage`. */
  load: 'languageOnly',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  syncHtmlLang(lng)
  try {
    if (lng === 'en' || lng === 'id') localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
})

export default i18n
