const translations = {
  en: {
    "tab.home": "Home",
    "tab.venue": "Venue",
    "tab.itinerary": "Itinerary",
    "tab.events": "Events",
    "tab.gallery": "Gallery",
    "tab.travel": "Travel & Stay",
    "tab.language": "🇧🇷 Português",
    "title.venue": "Venue",
    "title.itinerary": "Itinerary",
    "title.events": "Events",
    "date.short": "2026.Sep.12",
    "details.title": "We're celebrating 10 years together,",
    "details.subtitle": "a decade of love, laughter and adventure!",
  },
  pt: {
    "tab.home": "Home",
    "tab.venue": "Local",
    "tab.itinerary": "Itinerário",
    "tab.events": "Eventos",
    "tab.gallery": "Galeria",
    "tab.travel": "Viajar & Ficar",
    "tab.language": "🇺🇸 English",
    "title.venue": "Local do Casamento",
    "title.events": "Eventos",
    "title.itinerary": "Itinerário",
    "date.short": "2026.Set.12",
    // TODO translate
    "details.title": "Estamos celebrando 10 anos juntos,",
    // TODO translate
    "details.subtitle": "uma decada de amor, risadas e aventuras!",
  },
};

function applyTranslations(lang) {
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  elementsToTranslate.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (!(lang in translations)) {
      console.error(`Language ${lang} not found in translations.`);
      return;
    }
    if (!(key in translations[lang])) {
      console.error(`Key ${key} not found in translations for language ${lang}.`);
      return;
    }
    element.textContent = translations[lang][key];
  });

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('lang', lang);
  window.history.pushState(null, '', newUrl.toString());
  document.documentElement.lang = lang;
}

function getCurentLanguage() {
  return new URLSearchParams(window.location.search).get('lang') || 'en';
}

// Initial load with default language
document.addEventListener('DOMContentLoaded', () => {
  // Change to currently selected language
  applyTranslations(getCurentLanguage());
});

function toggleLanguage() {
  const nextLang = getCurentLanguage() === 'en' ? 'pt' : 'en';
  console.log(`Changing language to ${nextLang}`);
  applyTranslations(nextLang);
}
