/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/translation.json';
import pt from './pt/translation.json';
import ru from './ru/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    ru: { translation: ru },
  },
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
