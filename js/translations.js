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
}

// Initial load with default language
document.addEventListener('DOMContentLoaded', () => {
  const selectedLang = new URLSearchParams(window.location.search).get('lang') || 'en';
  console.log(`selectedLang: ${selectedLang}`);
  const langToggle = document.getElementById('lang-toggle');
  const nextLang = selectedLang === 'en' ? 'pt' : 'en';
  console.log(`nextLang: ${nextLang}`);
  langToggle.href = `?lang=${nextLang}`;
  langToggle.addEventListener('click', () => {
    const newUrl = new URL(window.location.href).searchParams.set('lang', nextLang);
    console.log("newUrl:");
    console.log(newUrl.toString());
    console.log("newUrl.search:");
    console.log(newUrl.search.toString());
    window.location.search = newUrl.search;
    window.location.href = newUrl.toString();
  });
  // Apply translations for initial load
  applyTranslations(selectedLang);
});
