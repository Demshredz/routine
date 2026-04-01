import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "Routine Flow",
      "home_tab": "Today",
      "stats_tab": "Stats",
      "settings_tab": "Settings",
      "streak": "Streak",
      "no_routines": "No routines for today yet. Add one to get started!",
      "add_routine": "Add Routine",
      "completed": "Completed",
      "supplements": "Supplements",
      "morning": "Morning",
      "afternoon": "Afternoon",
      "evening": "Evening"
    }
  },
  de: {
    translation: {
      "app_name": "Routine Flow",
      "home_tab": "Heute",
      "stats_tab": "Statistik",
      "settings_tab": "Einstellungen",
      "streak": "Streak",
      "no_routines": "Noch keine Routinen für heute. Füge eine hinzu!",
      "add_routine": "Routine hinzufügen",
      "completed": "Erledigt",
      "supplements": "Nahrungsergänzung",
      "morning": "Morgen",
      "afternoon": "Nachmittag",
      "evening": "Abend"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
