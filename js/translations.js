const translations = {
  en: {
    "tab.language": "🇺🇸 English",
    "landing.date": "2026.Sep.12",
    "landing.location": "Recanto da Paz | Brazil, São Paulo, Atibaia",
    "details.title": "Ten years together, celebrated with you.",

    // Thank You Section
    "tab.thanks": "Thank You",
    "thanks.title": "Thank You",
    "thanks.inPerson": "On September 12th we stood in front of the people who have shaped our ten years together and said thank you in person. This is us saying it again.",
    "thanks.travel": "Thank you for the flights, the long drives and the days taken off work. Thank you to everyone who stayed the whole weekend, and to everyone who came just for the ceremony – you all made Recanto da Paz feel like home.",
    "thanks.gift": "After 10 years of adventures – moving countries, building our home, and welcoming Levy and Leo – we got to celebrate with everyone who matters most. Your presence was the greatest gift we could have asked for.",

    // Our Story Section
    "tab.story": "Our Story",
    "story.title": "Our Story",
    "story.subtitle": "10 Years of Love and Adventure",
    "story.2016.title": "The Beginning",
    "story.2016.description": "In São Paulo, two paths crossed and everything changed. We knew right away this was something special - moving in together and taking our first adventure to Chile. Little did we know this was just the beginning of a decade-long journey.",
    "story.2017.title": "A Bold Move",
    "story.2017.description": "A life-changing job offer from Facebook meant moving to another hemisphere. We knew the distance might test our relationship, but we believed in what we had - and took the leap together.",
    "story.2018.title": "Getting Married",
    "story.2018.description": "The year everything became official. A surprise proposal (watch the video!), and then Roberta took the bravest leap - leaving her career, her family, and everything familiar to start over in a new country without knowing the language. Some things are worth the risk.",
    "story.2019.title": "Exploring the World",
    "story.2019.description": "Without a traditional wedding celebration, we decided to create our own memories - a romantic photo shoot in Paris. Our \"honeymoon\" took us through Venice and Rome, and somehow we managed to explore 7 countries that year.",
    "story.2020.title": "Putting Down Roots",
    "story.2020.description": "We bought our first house and discovered we were expecting our first baby.",
    "story.2021.title": "Welcome Levy",
    "story.2021.description": "Our greatest adventure yet - becoming parents. Levy arrived and changed everything, filling our home with joy, laughter, and a whole new kind of love.",
    "story.2023.title": "Welcome Leo",
    "story.2023.description": "Just when we thought our hearts were full, Leo came along and proved there's always room for more love. Our little family was now complete - two boys, endless energy, and twice the joy (and trouble 😅)",
    "story.2026.title": "Celebrating 10 Years",
    "story.2026.description": "Ten years of love, adventures, trips, and two amazing boys - celebrated with everyone we love. Thank you for being there with us.",
  },
  pt: {
    "tab.language": "🇧🇷 Português",
    "landing.date": "2026.Set.12",
    "landing.location": "Recanto da Paz | São Paulo, Atibaia",
    "details.title": "Dez anos juntos, celebrados com vocês.",

    // Obrigado
    "tab.thanks": "Obrigado",
    "thanks.title": "Muito Obrigado",
    "thanks.inPerson": "No dia 12 de setembro, olhamos para as pessoas que construíram conosco esses dez anos e agradecemos pessoalmente. Aqui estamos dizendo de novo.",
    "thanks.travel": "Obrigado pelos voos, pelas viagens longas de carro e pelos dias de folga tirados do trabalho. Obrigado a quem ficou o fim de semana inteiro e a quem veio só para a cerimônia – vocês fizeram do Recanto da Paz a nossa casa.",
    "thanks.gift": "Depois de 10 anos de aventuras – mudando de país, construindo nosso lar e recebendo o Levy e o Leo – pudemos celebrar com todos que mais importam. A presença de vocês foi o maior presente que poderíamos pedir.",

    // Nossa História
    "tab.story": "Nossa História",
    "story.title": "Nossa História",
    "story.subtitle": "10 Anos de Amor e Aventura",
    "story.2016.title": "O Começo",
    "story.2016.description": "Em São Paulo, dois caminhos se cruzaram e tudo mudou. Sabíamos desde o início que era algo especial - morando juntos e fazendo nossa primeira viagem ao Chile. Mal sabíamos que era apenas o início de uma jornada de uma década.",
    "story.2017.title": "Uma Grande Mudança",
    "story.2017.description": "Uma oferta de emprego transformadora do Facebook significou mudar para outro hemisfério. Sabíamos que a distância poderia testar nosso relacionamento, mas acreditávamos no que tínhamos - e demos o salto juntos.",
    "story.2018.title": "O Casamento",
    "story.2018.description": "O ano em que tudo se tornou oficial. Um pedido surpresa (assista ao vídeo!), e então Roberta deu o salto mais corajoso - deixando sua carreira, sua família e tudo que conhecia para recomeçar em um novo país sem falar o idioma. Algumas coisas valem o risco.",
    "story.2019.title": "Explorando o Mundo",
    "story.2019.description": "Sem uma celebração de casamento tradicional, decidimos criar nossas próprias memórias - um ensaio fotográfico romântico em Paris. Nossa \"lua de mel\" nos levou por Veneza e Roma, e de alguma forma conseguimos explorar 7 países naquele ano.",
    "story.2020.title": "Criando Raízes",
    "story.2020.description": "Compramos nossa primeira casa e descobrimos que estávamos esperando nosso primeiro bebê.",
    "story.2021.title": "Bem-vindo Levy",
    "story.2021.description": "Nossa maior aventura até então - nos tornando pais. Levy chegou e mudou tudo, enchendo nossa casa de alegria, risadas e um tipo completamente novo de amor.",
    "story.2023.title": "Bem-vindo Leo",
    "story.2023.description": "Quando pensávamos que nossos corações estavam cheios, Leo chegou e provou que sempre há espaço para mais amor. Nossa pequena família estava agora completa - dois meninos, energia infinita e o dobro de alegria (e trabalho 😅)",
    "story.2026.title": "Celebrando 10 Anos",
    "story.2026.description": "Dez anos de amor, aventuras, viagens e dois meninos incríveis - celebrados com todos que amamos. Obrigado por estarem lá com a gente.",
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
  applyTranslations(getCurentLanguage());
});

function toggleLanguage() {
  const nextLang = getCurentLanguage() === 'en' ? 'pt' : 'en';
  console.log(`Changing language to ${nextLang}`);
  applyTranslations(nextLang);
}

