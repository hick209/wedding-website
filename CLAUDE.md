# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Nivaldo & Roberta's 10-year celebration, which took
place on **September 12, 2026**. The event has passed, so the site is now a
keepsake page: a hero banner, a thank-you message to the guests, and the
"Our Story" photo timeline, with bilingual support (English/Portuguese).

It is built on a free HTML5/Bootstrap template from freehtml5.co.

Website URL: https://www.nivaldo-roberta.com/
Domain: www.nivaldo-roberta.com

### Project History

**Milestone 1: "Save the Date" Website** (Complete, since removed)
- Countdown timer, calendar integration, venue map, FAQ, Travel & Stay

**Milestone 2: RSVP Functionality** (Complete, since removed)
- Dialog modal with form → loading → success states
- Google Apps Script backend; submissions live in the linked Google Sheet

**Milestone 3: Our Story Timeline** (Complete, still live)
- Photo-centric vertical timeline with 8 milestone events (2016-2026)
- Auto-scrolling photo carousels (3-second intervals, 49 photos total)
- Lazy loading with Intersection Observer (images load 200px before viewport)
- 2018 card: proposal video + photo carousel stacked
- Bilingual support (EN/PT) with scroll animations
- Images optimized: 168MB → 6MB (96% reduction)

**Milestone 4: Post-event cleanup** (Complete, 2026-09-25)
- Removed everything that only made sense before the event: countdown clock,
  "Save the date" buttons and calendar dialog, RSVP dialog, venue map, FAQ,
  Travel & Stay
- Removed the two sections that were never finished and had been hidden behind
  a `.wip` class: Itinerary (Lorem ipsum) and Gallery (3 placeholder photos)
- Dropped the now-unused libraries: FlipClock (CDN), Magnific Popup,
  Bootstrap JS (Bootstrap CSS stays for the grid)

**Milestone 5: Thank-you copy** (Complete, 2026-09-25)
- Rewrote every remaining string in the past tense (EN + PT)
- Replaced the "Join Us" section with a `#thanks` section addressed to the
  guests; `about.*` keys became `thanks.*`, `.about-description` became
  `.thanks-description`
- Page title and Open Graph description no longer say "Save the date"

**Milestone 6: Event video and photos** (Planned)
- A section with video and photos from the celebration itself

See `TODO.md` for detailed task breakdown and progress tracking.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6), jQuery, Bootstrap 3 (CSS only)
- **Styling**: SCSS (compiled to CSS), Bootstrap SASS
- **Key Libraries**:
  - Waypoints - scroll animations
  - Stellar.js - parallax effects
  - jQuery Easing - scroll-to-top easing

## Project Structure

```
/
├── index.html             # Main HTML file (single-page application)
├── js/
│   ├── main.js            # Core functionality (menu, animations, carousels)
│   ├── translations.js    # i18n system for EN/PT
│   └── [vendor libs]      # jQuery, Waypoints, Stellar, Easing, Modernizr
├── apps-script/           # Retired RSVP backend, kept as a record
│   ├── Code.gs            # Google Apps Script that fed the RSVP sheet
│   └── README.md          # Deployment instructions
├── sass/
│   ├── style.scss         # Main stylesheet with variables and mixins
│   ├── bootstrap.scss     # Bootstrap customizations
│   └── bootstrap/         # Bootstrap SASS components
├── css/                   # Compiled CSS files
├── images/                # Photos and graphics
│   └── story/             # "Our Story" timeline images (49 optimized photos)
├── fonts/                 # Custom fonts (icomoon icons, Amsterdam font)
├── fav/                   # Favicon and manifest files
└── save-the-date.ics      # Retired calendar invite, no longer linked
```

Unreferenced leftovers deliberately kept: `save-the-date.ics`, `apps-script/`,
`images/save_the_date.svg`, and the former gallery photos. Nothing links to
them; they are archival.

## Development Commands

### Building Styles
The project uses SCSS for styling. To compile SCSS to CSS:

```bash
# Compile style.scss (main stylesheet)
sass sass/style.scss css/style.css

# Compile Bootstrap customizations
sass sass/bootstrap.scss css/bootstrap.css

# Watch for changes (auto-compile)
sass --watch sass:css
```

Note: Both `style.scss` and `bootstrap.scss` need to be compiled separately as they are independent entry points.

Dart Sass emits a wall of `@import` / `lighten()` deprecation warnings from the
vendored Bootstrap 3 SASS. They are pre-existing and harmless.

### Testing Locally
Since this is a static website, simply open `index.html` in a browser or use any local server:

```bash
# Using Python
python -m http.server 8000 --bind 0.0.0.0

# See the local IP on mac with (this can be used to access the site from other devices within the same network)
ipconfig getifaddr en0
```

## Key Features & Architecture

### Page Structure
Three content blocks, in order: the `<header id="header">` hero (names,
tagline, date, venue link), `<div id="thanks">` (the thank-you message), and
`<div id="story">` (the timeline). The nav has three entries: "Thank You",
"Our Story" and the language toggle.

### Internationalization (i18n)
- Translation system in `js/translations.js` with English/Portuguese support
- Elements marked with `data-i18n` attribute are automatically translated
- Language preference stored in URL query parameter (`?lang=en` or `?lang=pt`)
- Function `toggleLanguage()` switches between languages
- Every `data-i18n` key must exist in both `en` and `pt`, and the fallback text
  in `index.html` must match the `en` string - they drift easily

### Animations & Effects
- Waypoints trigger fade-in animations on scroll
- Parallax background using Stellar.js
- Mobile-responsive menu with offcanvas navigation
- Smooth scroll-to-top functionality
- Timeline carousels auto-advance every 3s, pause on hover, and lazy-load their
  images via Intersection Observer

### Styling System
- SCSS variables in `sass/style.scss` define brand colors and fonts
- Primary font: Work Sans
- Secondary/decorative font: Amsterdam (custom TTF)
- Icon font: icomoon (custom icon set)
- CSS mixins for cross-browser compatibility (transitions, transforms)
- Viewport units use `lvh`, not `vh`/`dvh`, so the parallax hero does not jump
  when mobile browser UI appears or disappears

## Important Files to Know

### `index.html`
- Meta tags, Open Graph tags for social sharing
- Nav, hero header, "Thank You" section, "Our Story" timeline, footer

### `js/main.js`
- `contentWayPoint()`: Scroll-triggered animations
- `offcanvasMenu()` & `burgerMenu()`: Mobile navigation
- `initTimelineCarousels()`: Auto-scrolling photo carousels for "Our Story"

### `js/translations.js`
- `applyTranslations(lang)`: Main translation function
- `toggleLanguage()`: Flips between `en` and `pt` and rewrites the URL param

### `sass/style.scss`
- Lines 1-24: Variables and brand colors
- Lines 28-50: SCSS mixins for browser compatibility
- Color scheme: Primary #646464, Secondary #118DF0
- Timeline and carousel styles live under the "Story Timeline" comment banner

## Common Tasks

### Cache Busting
First-party assets are referenced with a `?v=YYYYMMDD` query string in
`index.html` (`css/style.css`, `css/bootstrap.css`, `js/main.js`,
`js/translations.js`).

**Bump the version on every deploy that changes those files**, otherwise
returning visitors run stale JS against new markup. Vendor libraries are
deliberately left unversioned so they stay cached across deploys.

For a second deploy on the same day, append `-2`, `-3`, etc.
(`?v=20260925-2`) - the token just has to differ from what is already live.

```bash
# bump all at once
sed -i '' 's/?v=[0-9-]*"/?v=20260926"/g' index.html
```

### Adding/Changing Images
- Place images in `/images/` directory
- Story photos go in `/images/story/` using `YYYY-N.jpg` naming, 800px wide
- Add both a `.carousel-slide` (with `data-bg`) and a `.carousel-dot` per photo

### Modifying Translations
- Edit `translations` object in `js/translations.js`
- Add new keys to both `en` and `pt` objects
- Use `data-i18n="key.name"` attribute on HTML elements

### Styling Changes
1. Modify SCSS files in `/sass/` directory
2. Compile using sass command (see Building Styles section)
3. Test changes in browser
4. Commit both SCSS source and compiled CSS files

## Pending Work

See `TODO.md`. Next up is a section with video and photos from the celebration.

The `og:image` is still `images/SaveTheDate_Back.jpg`. Once there are photos
from the event, one of those would make a better link preview.

## Browser Compatibility Notes
- IE 9+ support (conditional comments in HTML)
- Uses vendor prefixes via SCSS mixins
- Modernizr for feature detection
- respond.min.js for IE8 media queries
