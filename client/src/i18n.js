import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Agri-Tech',
      nav: { home: 'Home', dashboard: 'Dashboard', farms: 'Farms', crops: 'Crops', weather: 'Weather', alerts: 'Alerts', resources: 'Buy Resources', orders: 'Orders', forum: 'Forum', experts: 'Experts', admin: 'Admin', login: 'Login', register: 'Register', logout: 'Logout' },
      home: {
        title: 'Smart farming for every farmer',
        subtitle: 'Weather forecasts, soil health, pest alerts and expert advice in one place.',
        cta: 'Get started',
        features: 'What you can do',
      },
      common: { save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', add: 'Add', loading: 'Loading...', none: 'Nothing here yet.', confirmDelete: 'Are you sure you want to delete this?' },
    },
  },
  hi: {
    translation: {
      appName: 'एग्री-टेक',
      nav: { home: 'होम', dashboard: 'डैशबोर्ड', farms: 'खेत', crops: 'फसलें', weather: 'मौसम', alerts: 'चेतावनी', resources: 'सामग्री खरीदें', orders: 'ऑर्डर', forum: 'मंच', experts: 'विशेषज्ञ', admin: 'एडमिन', login: 'लॉगिन', register: 'रजिस्टर', logout: 'लॉगआउट' },
      home: {
        title: 'हर किसान के लिए स्मार्ट खेती',
        subtitle: 'मौसम पूर्वानुमान, मिट्टी की सेहत, कीट चेतावनी और विशेषज्ञ सलाह एक ही जगह।',
        cta: 'शुरू करें',
        features: 'आप क्या कर सकते हैं',
      },
      common: { save: 'सहेजें', cancel: 'रद्द करें', edit: 'संपादित करें', delete: 'हटाएं', add: 'जोड़ें', loading: 'लोड हो रहा है...', none: 'अभी कुछ नहीं है।', confirmDelete: 'क्या आप इसे हटाना चाहते हैं?' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (l) => localStorage.setItem('lang', l));

export default i18n;
