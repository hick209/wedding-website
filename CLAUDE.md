# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static wedding website for Nivaldo & Roberta's 10-year celebration (September 12, 2026). The website is built on a free HTML5/Bootstrap template from freehtml5.co, featuring a countdown timer, bilingual support (English/Portuguese), venue information, itinerary, photo gallery, and calendar integration.

Website URL: https://www.nivaldo-roberta.com/
Domain: www.nivaldo-roberta.com

### Project Goals

**Milestone 1: "Save the Date" Website** (Current Phase)
- Provide basic event information to guests
- Enable calendar integration for date saving
- Offer bilingual support (EN/PT) for international guests
- Display venue location and basic details

**Milestone 2: RSVP Functionality** (Future)
- Allow guests to confirm attendance
- Complete detailed itinerary
- Implement backend/database for RSVP storage

See `TODO.md` for detailed task breakdown and progress tracking.

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
- **Mobile centering**: Handled by `css/responsive-clock.css` with flexbox layout. The wrapper uses `display: inline-block` and `width: auto` to override FlipClock's default `width: 100%`, allowing proper centering while maintaining the library's internal float-based layout for correct element ordering.

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
- **Lines 869-1190: FlipClock countdown timer responsive styles**
  - Uses Bootstrap screen variables (`$screen-xs`, `$screen-sm`, `$screen-md`, etc.)
  - Multiple media query breakpoints: 991px, 767px, 568px, 480px, 360px, 320px
  - **Critical centering rules**:
    - `.flip-clock-wrapper`: Uses `display: inline-block`, `width: auto`, and `margin: auto` to enable centering
    - `.flipTimebox`: Flexbox container with `justify-content: center` to center the clock
    - Negative margins neutralized (set to 0) to prevent left-alignment
  - **Important**: Do NOT modify the `float: left` behavior on clock internal elements - FlipClock.js requires this for proper element ordering
  - **768-991px fix**: Media query added to prevent wrapping on tablet landscape/small laptops

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

## Pending Work

See `TODO.md` for comprehensive task list. Key priorities for **Milestone 1** completion:

### High Priority (Blockers for "Save the Date" launch)
1. **FAQ Section** - Answer common questions (daily attendance, dress code, etc.)
2. **Travel Guidance** - Information for international guests (airports, transportation, visas)
3. **Link Preview Fix** - OG image not displaying on social media ([known issue](https://stackoverflow.com/q/21636503/1848826))
4. **Date Size** - Make date more prominent on desktop

### Medium Priority
5. **CSS Mobile Improvements** - Address "looks off" issues on mobile
6. **Parallax Fix** - Background "jumping" issue

### Lower Priority (Future Enhancement)
7. **Video Popup** (`index.html:270-276`) - Optional venue video
8. **Itinerary Content** - Currently Lorem ipsum, needed for Milestone 2

### Completed Milestone 1 Items
- ✅ Event Context/Info - "Join Us" section added explaining 3-day celebration
- ✅ GitHub Footer - Added with modern semantic HTML and styling
- ✅ Flip Clock Mobile Centering - Fixed left-alignment issue on mobile devices (width ≤ 767px)
- ✅ Flip Clock Wrapping - Fixed wrapping at 768-991px (tablet landscape) by adding media query with constrained element sizes
- ✅ Code Consolidation - Merged `css/responsive-clock.css` into `sass/style.scss` using Bootstrap variables for better maintainability

### Milestone 2 (Future)
- RSVP functionality with database backend
- Complete event itinerary details

## Browser Compatibility Notes
- IE 9+ support (conditional comments in HTML)
- Uses vendor prefixes via SCSS mixins
- Modernizr for feature detection
- respond.min.js for IE8 media queries
