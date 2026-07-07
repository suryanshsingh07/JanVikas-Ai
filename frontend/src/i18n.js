import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en/translation.json';
import hiTranslations from './locales/hi/translation.json';
import asTranslations from './locales/as/translation.json';
import bnTranslations from './locales/bn/translation.json';
import brxTranslations from './locales/brx/translation.json';
import doiTranslations from './locales/doi/translation.json';
import guTranslations from './locales/gu/translation.json';
import knTranslations from './locales/kn/translation.json';
import ksTranslations from './locales/ks/translation.json';
import kokTranslations from './locales/kok/translation.json';
import maiTranslations from './locales/mai/translation.json';
import mlTranslations from './locales/ml/translation.json';
import mniTranslations from './locales/mni/translation.json';
import mrTranslations from './locales/mr/translation.json';
import neTranslations from './locales/ne/translation.json';
import orTranslations from './locales/or/translation.json';
import paTranslations from './locales/pa/translation.json';
import saTranslations from './locales/sa/translation.json';
import satTranslations from './locales/sat/translation.json';
import sdTranslations from './locales/sd/translation.json';
import taTranslations from './locales/ta/translation.json';
import teTranslations from './locales/te/translation.json';
import urTranslations from './locales/ur/translation.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  as: { translation: asTranslations },
  bn: { translation: bnTranslations },
  brx: { translation: brxTranslations },
  doi: { translation: doiTranslations },
  gu: { translation: guTranslations },
  kn: { translation: knTranslations },
  ks: { translation: ksTranslations },
  kok: { translation: kokTranslations },
  mai: { translation: maiTranslations },
  ml: { translation: mlTranslations },
  mni: { translation: mniTranslations },
  mr: { translation: mrTranslations },
  ne: { translation: neTranslations },
  or: { translation: orTranslations },
  pa: { translation: paTranslations },
  sa: { translation: saTranslations },
  sat: { translation: satTranslations },
  sd: { translation: sdTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  ur: { translation: urTranslations }
};

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
const initialLanguage = savedLanguage || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

if (typeof window !== 'undefined') {
  const currentLanguage = localStorage.getItem('language');
  if (currentLanguage && currentLanguage !== i18n.language) {
    i18n.changeLanguage(currentLanguage);
  }
}

export default i18n;
