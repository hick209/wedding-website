# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static wedding website for Nivaldo & Roberta's 10-year celebration (September 12, 2026). The website is built on a free HTML5/Bootstrap template from freehtml5.co, featuring a countdown timer, bilingual support (English/Portuguese), venue information, itinerary, photo gallery, and calendar integration.

Website URL: https://www.nivaldo-roberta.com/
Domain: www.nivaldo-roberta.com

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6), jQuery, Bootstrap 3
- **Styling**: SCSS (compiled to CSS), Bootstrap SASS
- **Key Libraries**:
  - FlipClock.js - countdown timer
  - Moment.js with timezone support
  - Magnific Popup - lightbox
  - Waypoints - scroll animations
  - Stellar.js - parallax effects

## Project Structure

```
/
├── index.html             # Main HTML file (single-page application)
├── js/
│   ├── clock.js           # Countdown timer configuration
│   ├── main.js            # Core functionality (menu, animations, calendar)
│   ├── translations.js    # i18n system for EN/PT
│   └── [vendor libs]      # Third-party libraries
├── sass/
│   ├── style.scss         # Main stylesheet with variables and mixins
│   ├── bootstrap.scss     # Bootstrap customizations
│   └── bootstrap/         # Bootstrap SASS components
├── css/                   # Compiled CSS files
├── images/                # Photos and graphics
├── fonts/                 # Custom fonts (icomoon icons, Amsterdam font)
├── fav/                   # Favicon and manifest files
└── save-the-date.ics      # Calendar invite file
```

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

### Testing Locally
Since this is a static website, simply open `index.html` in a browser or use any local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

## Key Features & Architecture

### Internationalization (i18n)
- Translation system in `js/translations.js` with English/Portuguese support
- Elements marked with `data-i18n` attribute are automatically translated
- Language preference stored in URL query parameter (`?lang=en` or `?lang=pt`)
- Function `toggleLanguage()` switches between languages
- Google Calendar links are dynamically generated per language

### Countdown Timer
- Located in `js/clock.js`
- **IMPORTANT**: To change the event date, modify line 8:
  ```javascript
  let targetDate = moment.tz("2026-09-12 12:00", "America/Sao_Paulo");
  ```
- Uses FlipClock.js with DailyCounter face
- Clock labels are translated dynamically after DOM load

### Calendar Integration
- ICS file: `save-the-date.ics` (multi-language VEVENT)
- "Save the date" buttons download the ICS file
- Google Calendar link generated in `translations.js:createGoogleCalendarLink()`
- Modal dialog code exists but is commented out (lines 120-124 in `main.js`)

### Animations & Effects
- Waypoints trigger fade-in animations on scroll
- Parallax background using Stellar.js
- Mobile-responsive menu with offcanvas navigation
- Smooth scroll-to-top functionality

### Styling System
- SCSS variables in `sass/style.scss` define brand colors and fonts
- Primary font: Work Sans
- Secondary/decorative font: Amsterdam (custom TTF)
- Icon font: icomoon (custom icon set)
- CSS mixins for cross-browser compatibility (transitions, transforms)

## Important Files to Know

### `index.html` (lines to note)
- Lines 8-13: Meta tags and event details
- Lines 16-27: Open Graph tags for social sharing
- Lines 82-88: Navigation menu structure
- Lines 112-131: "Save the date" button and countdown
- Lines 285-304: Calendar selection modal (currently unused)

### `js/main.js`
- `saveTheDate()`: Handles calendar file download
- `contentWayPoint()`: Scroll-triggered animations
- `offcanvasMenu()` & `burgerMenu()`: Mobile navigation

### `js/translations.js`
- `applyTranslations(lang)`: Main translation function
- `createGoogleCalendarLink(lang)`: Generates locale-specific calendar URLs
- Event details must be updated here when dates/location change

### `sass/style.scss`
- Lines 1-24: Variables and brand colors
- Lines 28-50: SCSS mixins for browser compatibility
- Color scheme: Primary #646464, Secondary #118DF0

## Common Tasks

### Updating Event Date/Time
1. Edit `js/clock.js` line 8 (countdown timer)
2. Edit event dates in `index.html` itinerary section (lines 167-221)
3. Update `save-the-date.ics` DTSTART/DTEND fields

### Adding/Changing Images
- Place images in `/images/` directory
- Update background images in `index.html` via inline styles or CSS
- Gallery images: modify `#fh5co-gallery-list` structure (lines 241-260)

### Modifying Translations
- Edit `translations` object in `js/translations.js`
- Add new keys to both `en` and `pt` objects
- Use `data-i18n="key.name"` attribute on HTML elements

### Changing Venue/Location
- Update Google Maps embed in `index.html` line 148
- Update location in `js/translations.js` createGoogleCalendarLink()
- Update `save-the-date.ics` LOCATION field

### Styling Changes
1. Modify SCSS files in `/sass/` directory
2. Compile using sass command (see Building Styles section)
3. Test changes in browser
4. Commit both SCSS source and compiled CSS files

## Browser Compatibility Notes
- IE 9+ support (conditional comments in HTML)
- Uses vendor prefixes via SCSS mixins
- Modernizr for feature detection
- respond.min.js for IE8 media queries
