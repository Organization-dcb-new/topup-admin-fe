import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '@/locales/en/common.json'
import idCommon from '@/locales/id/common.json'

const STORAGE_KEY = 'i18n_lang'

function getStoredLng(): 'en' | 'id' {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'id') return v
  } catch {
    /* ignore */
  }
  return 'id'
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
  fallbackLng: 'id',
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
