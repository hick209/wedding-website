const translations = {
  en: {
    "tab.venue": "Venue",
    "tab.itinerary": "Itinerary",
    "tab.events": "Events",
    "tab.gallery": "Gallery",
    "tab.travel": "Travel & Stay",
    "tab.language": "🇺🇸 English",
    "title.venue": "Venue",
    "title.itinerary": "Itinerary",
    "title.events": "Events",
    "landing.date": "2026.Sep.12",
    "landing.location": "Recanto da Paz | Brazil, São Paulo, Atibaia",
    "date.days": "Days",
    "date.hours": "Hours",
    "date.minutes": "Minutes",
    "date.seconds": "Seconds",
    "details.title": "We're celebrating 10 years together,",
    "details.subtitle": "a decade of love, laughter and adventure!",
    "dialog.select-cal": "Which calendar?",
    "dialog.other-cals": "Other calendars (.ics file)",
  },
  pt: {
    "tab.venue": "Local",
    "tab.itinerary": "Itinerário",
    "tab.events": "Eventos",
    "tab.gallery": "Galeria",
    "tab.travel": "Viajar & Ficar",
    "tab.language": "🇧🇷 Português",
    "title.venue": "Local do Casamento",
    "title.events": "Eventos",
    "title.itinerary": "Itinerário",
    "landing.date": "2026.Set.12",
    "landing.location": "Recanto da Paz | São Paulo, Atibaia",
    "date.days": "Dias",
    "date.hours": "Horas",
    "date.minutes": "Minutos",
    "date.seconds": "Segundos",
    "details.title": "Estamos celebrando 10 anos juntos,",
    "details.subtitle": "uma decada de amor, risadas e aventuras!",
    "dialog.select-cal": "Qual calendário?",
    "dialog.other-cals": "Outros calendários (arquivo .ics)",
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

  const gcalLink = createGoogleCalendarLink(lang);
  document.getElementById("gcal-btn").href = gcalLink;
}

function getCurentLanguage() {
  return new URLSearchParams(window.location.search).get('lang') || 'en';
}

// Initial load with default language
document.addEventListener('DOMContentLoaded', () => {
  // Change to currently selected language
  applyTranslations(getCurentLanguage());

  // Setup clock labels
  document.querySelector('.flip-clock-divider.days > .flip-clock-label').setAttribute('data-i18n', 'date.days');
  document.querySelector('.flip-clock-divider.hours > .flip-clock-label').setAttribute('data-i18n', 'date.hours');
  document.querySelector('.flip-clock-divider.minutes > .flip-clock-label').setAttribute('data-i18n', 'date.minutes');
  document.querySelector('.flip-clock-divider.seconds > .flip-clock-label').setAttribute('data-i18n', 'date.seconds');
});

function toggleLanguage() {
  const nextLang = getCurentLanguage() === 'en' ? 'pt' : 'en';
  console.log(`Changing language to ${nextLang}`);
  applyTranslations(nextLang);
}

function createGoogleCalendarLink(lang) {
  const name =
      lang === 'pt' ?
          "Nivaldo ❤️ Roberta – Celebração de 10 anos" :
          "Nivaldo ❤️ Roberta – 10-year celebration";
  const description =
      lang === 'pt' ?
          "<b>Reserve a data</b> para o fim de semana de celebração de <b>10 anos</b> juntos de <b>Nivaldo e Roberta</b>!<br>Os eventos serão realizados de 11 a 13 de setembro de 2026.<br><br>Convite formal e a programação completa serão enviados em breve.<br><br><a href='https://www.nivaldo-roberta.com/?lang=pt'>www.nivaldo-roberta.com</a>" :
          "<b>Save the date</b> for <b>Nivaldo &amp\; Roberta's 10-year</b> celebration weekend!<br>Events will be held from Sept 11-13\, 2026.<br><br>Formal invitation and a full schedule to follow.<br><br><a href='https://www.nivaldo-roberta.com/?lang=en'>www.nivaldo-roberta.com</a>";

  const dates = "20260911/20260914"; // end date is exclusive
  const location = "Recanto da Paz Hotel Fazenda, Estrada Gertrudes Peinado Lara Monteoliva - 300, Atibaia - SP, 12949-268, Brazil";

  const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
          `&text=${encodeURIComponent(name)}` +
          `&dates=${dates}` +
          `&details=${encodeURIComponent(description)}` +
          `&location=${encodeURIComponent(location)}`;

  return url;
}
