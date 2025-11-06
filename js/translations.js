const translations = {
  en: {
    "tab.home": "Home",
    "tab.events": "Events",
    "tab.gallery": "Gallery",
    "tab.travel": "Travel & Stay",
    "tab.language": "🇧🇷 Português",
    "title.events": "Events",
  },
  pt: {
    "tab.home": "Home",
    "tab.events": "Eventos",
    "tab.gallery": "Galeria",
    "tab.travel": "Viajar & Ficar",
    "tab.language": "🇺🇸 English",
    "title.events": "Eventos",
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
  // return false;
}
