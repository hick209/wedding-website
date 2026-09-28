/**
 * Gallery for /photos/.
 *
 * The page ships with no data. Everything is fetched at run time from R2,
 * addressed by a token in the URL fragment:
 *
 *     /photos/#k=<prefix>
 *
 * A fragment is never sent to the server and is not committed to this
 * repository, which is public. No token, no gallery.
 *
 * index.json is compact on purpose - 3,329 photos, so records are arrays and
 * people are referenced by position:
 *
 *     photos: [ [key, width, height, event, [personIndex, ...]], ... ]
 *     people: [ [displayName, photoCount, role], ... ]
 *
 * Names arrive already shortened - "Gabriel", or "Gabriel P" where several
 * Gabriels needed telling apart. Full names are never published; they stay in
 * the labelling data on the machine that produced this.
 */
(function () {
  'use strict';

  var CHUNK = 150;          // cells appended per scroll step
  var state = {
    data: null,
    lang: 'en',
    selected: [],           // person indices
    mode: 'any',            // 'any' | 'all'
    filtered: [],           // photo indices after filtering
    shown: 0,
    lightbox: -1            // position within filtered, -1 when closed
  };

  var T = {
    en: {
      back: '← Home',
      title: 'Photos',
      search: 'Find someone…',
      any: 'Any of them',
      all: 'All of them',
      none: 'No photos match that.',
      download: 'Download',
      lockedTitle: 'This link is incomplete',
      lockedBody: 'Photo links include a code at the end. Use the full link that was shared with you, or ask us for it again.',
      lang: '🇺🇸 English',
      loading: 'Loading photos…',
      groom: 'groom',
      bride: 'bride',
      count: function (n, p) { return n + ' photos · ' + p + ' people'; },
      showing: function (n, total) { return n + ' of ' + total + ' photos'; },
      failed: 'Could not load the photos. The link may have expired.'
    },
    pt: {
      back: '← Início',
      title: 'Fotos',
      search: 'Procurar alguém…',
      any: 'Qualquer um',
      all: 'Todos juntos',
      none: 'Nenhuma foto corresponde.',
      download: 'Baixar',
      lockedTitle: 'Este link está incompleto',
      lockedBody: 'Os links das fotos têm um código no final. Use o link completo que compartilhamos com você, ou peça novamente.',
      lang: '🇧🇷 Português',
      loading: 'Carregando fotos…',
      groom: 'noivo',
      bride: 'noiva',
      count: function (n, p) { return n + ' fotos · ' + p + ' pessoas'; },
      showing: function (n, total) { return n + ' de ' + total + ' fotos'; },
      failed: 'Não foi possível carregar as fotos. O link pode ter expirado.'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var t = function () { return T[state.lang]; };

  // "Gabriel P", or "Roberta (bride)" for the two who get a role. The role is
  // translated here rather than baked into the index, so one index serves
  // both languages.
  function personLabel(i) {
    var p = state.data.people[i];
    var role = p[2] ? ' (' + (t()[p[2]] || p[2]) + ')' : '';
    return p[0] + role;
  }

  /* ------------------------------------------------ url state */

  function readHash() {
    var out = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      out[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1));
    });
    return out;
  }

  function writeHash() {
    var h = readHash();
    var parts = ['k=' + h.k];
    if (state.selected.length) parts.push('people=' + state.selected.join(','));
    if (state.mode !== 'any') parts.push('mode=all');
    if (state.lang !== 'en') parts.push('lang=pt');
    // replaceState so filtering does not fill the back button with noise
    history.replaceState(null, '', '#' + parts.join('&'));
  }

  /* ------------------------------------------------ urls */

  function thumbUrl(p) {
    return state.data.base + '/thumb/' + state.data.prefix + '/' + p[0] + '.webp';
  }
  function displayUrl(p) {
    return state.data.base + '/display/' + state.data.prefix + '/' + p[0] + '.jpg';
  }
  // 2560px, for downloading rather than viewing - the display copy is sized
  // for a screen and prints badly. The 6891x4594 originals are not online.
  function largeUrl(p) {
    return state.data.base + '/large/' + state.data.prefix + '/' + p[0] + '.jpg';
  }

  /* ------------------------------------------------ translation */

  function applyLang() {
    document.documentElement.lang = state.lang;
    var d = t();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (d[k] && typeof d[k] === 'string') el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (d[k]) el.placeholder = d[k];
    });
    $('gx-lang').textContent = d.lang;

    // The home page reads its language from ?lang=, not from a fragment, so
    // the return trip needs a query string rather than the token-bearing hash.
    var home = document.querySelector('.gx-home');
    if (home) home.href = state.lang === 'en' ? '/' : '/?lang=' + state.lang;
  }

  /* ------------------------------------------------ filtering */

  function applyFilter() {
    var sel = state.selected;
    var photos = state.data.photos;
    var out = [];
    for (var i = 0; i < photos.length; i++) {
      var people = photos[i][4];
      if (!sel.length) { out.push(i); continue; }
      var hit;
      if (state.mode === 'all') {
        hit = sel.every(function (s) { return people.indexOf(s) !== -1; });
      } else {
        hit = sel.some(function (s) { return people.indexOf(s) !== -1; });
      }
      if (hit) out.push(i);
    }
    state.filtered = out;
    state.shown = 0;
    $('gx-grid').innerHTML = '';
    $('gx-empty').hidden = out.length > 0;
    appendChunk();
    $('gx-count').textContent = t().showing(out.length, photos.length);
  }

  function appendChunk() {
    var grid = $('gx-grid');
    var end = Math.min(state.shown + CHUNK, state.filtered.length);
    var frag = document.createDocumentFragment();
    for (var i = state.shown; i < end; i++) {
      (function (pos) {
        var p = state.data.photos[state.filtered[pos]];
        var cell = document.createElement('div');
        cell.className = 'gx-cell';
        var img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        img.src = thumbUrl(p);
        img.addEventListener('load', function () { img.classList.add('in'); });
        cell.appendChild(img);
        cell.addEventListener('click', function () { openLightbox(pos); });
        frag.appendChild(cell);
      }(i));
    }
    grid.appendChild(frag);
    state.shown = end;
  }

  /* ------------------------------------------------ people ui */

  function renderChips() {
    var wrap = $('gx-chips');
    wrap.innerHTML = '';
    state.selected.forEach(function (idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gx-chip';
      b.textContent = personLabel(idx);
      b.appendChild(Object.assign(document.createElement('span'), { textContent: '×' }));
      b.addEventListener('click', function () { togglePerson(idx); });
      wrap.appendChild(b);
    });
    $('gx-mode').hidden = state.selected.length < 2;
  }

  function renderPeople(query) {
    var box = $('gx-people');
    var q = (query || '').trim().toLowerCase();
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }

    var matches = [];
    state.data.people.forEach(function (p, i) {
      if (state.selected.indexOf(i) !== -1) return;
      // fold accents so "jose" finds "José"
      var name = p[0].normalize ? p[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '') : p[0];
      if (name.toLowerCase().indexOf(q) !== -1) matches.push([p, i]);
    });

    box.innerHTML = '';
    matches.slice(0, 60).forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gx-person';
      b.textContent = personLabel(m[1]);
      b.appendChild(Object.assign(document.createElement('span'), { textContent: m[0][1] }));
      b.addEventListener('click', function () {
        togglePerson(m[1]);
        $('gx-search').value = '';
        renderPeople('');
      });
      box.appendChild(b);
    });
    box.hidden = matches.length === 0;
  }

  function togglePerson(idx) {
    var at = state.selected.indexOf(idx);
    if (at === -1) state.selected.push(idx);
    else state.selected.splice(at, 1);
    renderChips();
    applyFilter();
    writeHash();
  }

  /* ------------------------------------------------ lightbox */

  function openLightbox(pos) {
    state.lightbox = pos;
    var p = state.data.photos[state.filtered[pos]];
    var full = $('gx-full');

    // Show the thumbnail immediately - it is already in cache from the grid,
    // so the frame changes the instant you press an arrow. Blurred and
    // upscaled until the real image arrives, which reads as loading rather
    // than as a frozen UI.
    resetZoom();
    full.src = thumbUrl(p);
    full.classList.add('loading');
    $('gx-spinner').hidden = false;

    var hi = new Image();
    hi.onload = function () {
      if (state.lightbox !== pos) return;   // moved on already
      full.src = hi.src;
      full.classList.remove('loading');
      $('gx-spinner').hidden = true;
    };
    hi.onerror = function () {
      if (state.lightbox !== pos) return;
      full.classList.remove('loading');
      $('gx-spinner').hidden = true;
    };
    hi.src = displayUrl(p);

    $('gx-download').href = largeUrl(p);
    $('gx-lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    resetZoom();
    $('gx-lightbox').hidden = true;
    state.lightbox = -1;
    document.body.style.overflow = '';
  }

  function stepLightbox(d) {
    if (state.lightbox < 0) return;
    var next = state.lightbox + d;
    if (next < 0 || next >= state.filtered.length) return;
    // keep the grid populated far enough ahead to walk into
    while (next >= state.shown && state.shown < state.filtered.length) appendChunk();
    openLightbox(next);
  }

  function download(e) {
    e.preventDefault();
    var p = state.data.photos[state.filtered[state.lightbox]];
    var url = largeUrl(p);
    // Cross-origin, so the download attribute is ignored. Fetching as a blob
    // gives a real save, but only if the bucket allows this origin via CORS -
    // fall back to opening the image when it does not.
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.blob();
    }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = p[0] + '.jpg';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }).catch(function () {
      window.open(url, '_blank', 'noopener');
    });
  }


  /* ------------------------------------------------ zoom and swipe */

  // One finger: swipe to change photo, or pan when zoomed in.
  // Two fingers: pinch to zoom. Double tap toggles.
  var zoom = { scale: 1, x: 0, y: 0 };
  var touch = { startX: 0, startY: 0, lastTap: 0, panX: 0, panY: 0, dist: 0, pinching: false };

  function applyZoom(animate) {
    var full = $('gx-full');
    full.style.transition = animate ? 'transform .2s ease' : 'none';
    full.style.transform =
      'translate(' + zoom.x + 'px,' + zoom.y + 'px) scale(' + zoom.scale + ')';
    // Let the browser scroll the page again once we are back to 1x
    $('gx-lightbox').classList.toggle('zoomed', zoom.scale > 1.01);
  }

  function resetZoom() {
    zoom.scale = 1; zoom.x = 0; zoom.y = 0;
    applyZoom(false);
  }

  function toggleZoom() {
    zoom.scale = zoom.scale > 1.01 ? 1 : 2.5;
    zoom.x = 0; zoom.y = 0;
    applyZoom(true);
  }

  function clampPan() {
    // keep some of the image on screen at all times
    var full = $('gx-full');
    var limX = (full.clientWidth * (zoom.scale - 1)) / 2;
    var limY = (full.clientHeight * (zoom.scale - 1)) / 2;
    zoom.x = Math.max(-limX, Math.min(limX, zoom.x));
    zoom.y = Math.max(-limY, Math.min(limY, zoom.y));
  }

  function spread(t) {
    var dx = t[0].clientX - t[1].clientX;
    var dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function wireGestures() {
    var box = $('gx-lightbox');

    box.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        touch.pinching = true;
        touch.dist = spread(e.touches);
        return;
      }
      var now = Date.now();
      if (now - touch.lastTap < 300) { toggleZoom(); touch.lastTap = 0; return; }
      touch.lastTap = now;
      touch.startX = e.touches[0].clientX;
      touch.startY = e.touches[0].clientY;
      touch.panX = zoom.x;
      touch.panY = zoom.y;
    }, { passive: true });

    box.addEventListener('touchmove', function (e) {
      if (touch.pinching && e.touches.length === 2) {
        var next = zoom.scale * (spread(e.touches) / touch.dist);
        zoom.scale = Math.max(1, Math.min(5, next));
        touch.dist = spread(e.touches);
        clampPan();
        applyZoom(false);
        e.preventDefault();
        return;
      }
      if (zoom.scale > 1.01 && e.touches.length === 1) {
        zoom.x = touch.panX + (e.touches[0].clientX - touch.startX);
        zoom.y = touch.panY + (e.touches[0].clientY - touch.startY);
        clampPan();
        applyZoom(false);
        e.preventDefault();
      }
    }, { passive: false });

    box.addEventListener('touchend', function (e) {
      if (touch.pinching) {
        touch.pinching = false;
        if (zoom.scale < 1.05) resetZoom();
        return;
      }
      if (zoom.scale > 1.01 || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - touch.startX;
      var dy = e.changedTouches[0].clientY - touch.startY;
      // horizontal, decisive, and not really a vertical scroll
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        stepLightbox(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    // desktop: double click zooms too
    $('gx-full').addEventListener('dblclick', function (e) {
      e.preventDefault();
      toggleZoom();
    });
  }

  /* ------------------------------------------------ boot */

  function wire() {
    $('gx-search').addEventListener('input', function (e) { renderPeople(e.target.value); });

    $('gx-mode').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.mode = b.dataset.mode;
      $('gx-mode').querySelectorAll('button').forEach(function (x) {
        x.className = x.dataset.mode === state.mode ? 'on' : '';
      });
      applyFilter();
      writeHash();
    });

    $('gx-lang').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'pt' : 'en';
      applyLang();
      renderChips();
      $('gx-count').textContent = t().showing(state.filtered.length, state.data.photos.length);
      writeHash();
    });

    $('gx-close').addEventListener('click', closeLightbox);
    $('gx-prev').addEventListener('click', function () { stepLightbox(-1); });
    $('gx-next').addEventListener('click', function () { stepLightbox(1); });
    $('gx-download').addEventListener('click', download);
    $('gx-lightbox').addEventListener('click', function (e) {
      if (e.target === $('gx-lightbox')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (state.lightbox < 0) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && state.shown < state.filtered.length) appendChunk();
      }, { rootMargin: '600px 0px' }).observe($('gx-sentinel'));
    }

    wireStickyHeader();
    wireGestures();
  }

  // Hide the header on the way down, bring it back on the way up. The bar
  // holds the title, counts, search, mode switch and chips, which is too much
  // of a small screen to give up permanently while browsing.
  function wireStickyHeader() {
    var head = $('gx-head');
    var lastY = window.scrollY || 0;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      var delta = y - lastY;

      // Never hide it out from under someone who is typing in the search box,
      // and never while the lightbox owns the screen.
      if (document.activeElement === $('gx-search') || state.lightbox >= 0) {
        lastY = y;
        return;
      }

      if (y < 120) head.classList.remove('hide');
      else if (delta > 4) head.classList.add('hide');
      else if (delta < -4) head.classList.remove('hide');

      // ignore sub-pixel jitter so the bar does not flicker
      if (Math.abs(delta) > 4 || y < 120) lastY = y;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  function start() {
    var h = readHash();
    state.lang = h.lang === 'pt' ? 'pt' : 'en';
    applyLang();

    if (!h.k || !/^[a-z0-9]{6,}$/i.test(h.k)) {
      $('gx-loading').hidden = true;
      $('gx-message').hidden = false;
      return;
    }

    fetch('https://photos.nivaldo-roberta.com/' + h.k + '/index.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        state.data = data;
        $('gx-loading').hidden = true;
        $('gallery-root').hidden = false;

        if (h.people) {
          state.selected = h.people.split(',')
            .map(Number)
            .filter(function (n) { return !isNaN(n) && data.people[n]; });
        }
        if (h.mode === 'all') {
          state.mode = 'all';
          $('gx-mode').querySelectorAll('button').forEach(function (x) {
            x.className = x.dataset.mode === 'all' ? 'on' : '';
          });
        }

        applyLang();
        renderChips();
        applyFilter();
        wire();
      })
      .catch(function () {
        $('gx-loading').hidden = true;
        $('gx-message').hidden = false;
        $('gx-message').querySelector('h1').textContent = t().failed;
        $('gx-message').querySelector('p').textContent = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
