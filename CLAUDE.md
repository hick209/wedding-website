# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static wedding website for Nivaldo & Roberta's 10-year celebration (September 12, 2026). The website is built on a free HTML5/Bootstrap template from freehtml5.co, featuring a countdown timer, bilingual support (English/Portuguese), venue information, itinerary, photo gallery, and calendar integration.

Website URL: https://www.nivaldo-roberta.com/
Domain: www.nivaldo-roberta.com

### Project Goals

**Milestone 1: "Save the Date" Website** (Complete)
- Provide basic event information to guests
- Enable calendar integration for date saving
- Offer bilingual support (EN/PT) for international guests
- Display venue location and basic details

**Milestone 2: RSVP Functionality** (Complete)
- Allow guests to confirm attendance via dialog modal
- Three-state dialog: form → loading → success
- Google Apps Script backend for storing submissions

**Milestone 3: Our Story Timeline** (Complete)
- Photo-centric vertical timeline with 8 milestone events (2016-2026)
- Auto-scrolling photo carousels (3-second intervals, 49 photos total)
- 2018 card: proposal video + photo carousel stacked
- Bilingual support (EN/PT) with scroll animations
- Images optimized: 168MB → 6MB (96% reduction)

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
│   ├── rsvp.js            # RSVP form handling and submission
│   ├── translations.js    # i18n system for EN/PT
│   └── [vendor libs]      # Third-party libraries
├── apps-script/
│   ├── Code.gs            # Google Apps Script backend for RSVP
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
python -m http.server 8000 --bind 0.0.0.0

# See the local IP on mac with (this can be used to access the site from other devices within the same network)
ipconfig getifaddr en0
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
- **Mobile centering**: Handled by `sass/style.scss` with flexbox layout. The wrapper uses `display: inline-block` and `width: auto` to override FlipClock's default `width: 100%`, allowing proper centering while maintaining the library's internal float-based layout for correct element ordering.

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
- `initTimelineCarousels()`: Auto-scrolling photo carousels for "Our Story" timeline

### `js/rsvp.js`
- RSVP dialog with three states: form, loading, success
- `handleSubmit()`: Validates form and POSTs to Google Apps Script
- `openRsvpDialog()` / `closeRsvpDialog()`: Dialog state management
- Contact validation: requires email OR phone (with format validation)

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

See `TODO.md` for comprehensive task list.

### Lower Priority (Future Enhancement)
- **Video Popup** (`index.html:270-276`) - Optional venue video
- **Itinerary Content** - Currently Lorem ipsum, needed for Milestone 2

### Completed Milestone 3 Items
- ✅ "Our Story" Timeline - Photo-centric vertical timeline with 8 milestone events (2016-2026)
- ✅ Auto-scrolling Carousels - 49 photos across all cards with 3-second intervals, pause-on-hover
- ✅ 2018 Card Enhancement - Stacked video + photo carousel
- ✅ Story Image Optimization - 168MB → 6MB (96% reduction), 800px width for retina

### Completed Milestone 1 Items
- ✅ FAQ Section - Bootstrap accordion with 5 questions (emojis for visual scanning), covering attendance, dress code, accommodation, guests/children, weather (EN/PT)
- ✅ Travel & Stay Section - 6 info cards with corrected visa info (UK/EU visa-free, US/Canada need visa): Getting Here, Transportation, Where to Stay, Visa Requirements, Currency & Payments, What to Pack (EN/PT)
- ✅ Parallax Fix - Changed viewport units from dvh/vh to lvh to prevent jumping when mobile browser UI appears/disappears
- ✅ Clean Section IDs - Removed 'fh5co-' prefix from section IDs for cleaner URLs (e.g., #venue instead of #fh5co-venue)
- ✅ Attendance Clarifications - Updated content to explain 3-day event is for hotel guests only, ceremony-only option (after 3pm) for others, venue exclusively booked
- ✅ Personal Story - Added about.story with couple's 10-year journey (moving countries, home, two boys)
- ✅ Event Context/Info - "Join Us" section added explaining celebration
- ✅ GitHub Footer - Added with modern semantic HTML and styling
- ✅ Link Preview Fix - Converted OG image from SVG to PNG for social media compatibility
- ✅ Flip Clock Mobile Centering - Fixed left-alignment issue on mobile devices (width ≤ 767px)
- ✅ Flip Clock Wrapping - Fixed wrapping at all viewport ranges (992-1200px, 768-991px, 361-365px)
- ✅ Code Consolidation - Merged `css/responsive-clock.css` into `sass/style.scss` using Bootstrap variables
- ✅ Date Size - Made date (2026.Sep.12) 3x bigger on desktop (60px) with responsive scaling
- ✅ Image Optimization - Reduced actively used images from ~8MB to ~2.5MB (69% reduction), archived unused images for future "Our Story" page
- ✅ Story Image Optimization - Reduced 48 timeline photos from 168MB to 6MB (96% reduction), resized to 800px for retina

### Milestone 2 (Complete)
- ✅ RSVP functionality with Google Apps Script backend
- ✅ Dialog modal with three states: form, loading, success
- ✅ Bilingual support (EN/PT) for all RSVP text
- Complete event itinerary details (pending)

## Browser Compatibility Notes
- IE 9+ support (conditional comments in HTML)
- Uses vendor prefixes via SCSS mixins
- Modernizr for feature detection
- respond.min.js for IE8 media queries

## Milestone 3: "Our Story" Section (Complete)
**Goal:** Photo-centric vertical timeline telling the couple's 10-year journey

### Architecture
- Section in `index.html` (at bottom, before footer)
- `<div id="story">` with "Our Story" nav link
- Same CSS/JS - no new file includes needed

### Design
- Vertical timeline with alternating left/right photo cards
- Each card: photo carousel (1-10 images per card), year badge, title, description
- Auto-scrolling carousels with 3-second intervals and pause-on-hover
- Blue vertical line connecting all events (#118DF0)
- Key milestones (2016, 2018, 2021, 2023) have expanded descriptions
- 2018 card: stacked layout with YouTube video + photo carousel below
- Mobile: single column, full-width cards (<768px)
- Animations: fade-in on scroll (Waypoints)
- Styling: h3 line-height 2.0, p line-height 1.7, margin 15px between title/description

### Timeline Events (8 cards)

| Year | Title (EN) | Title (PT) | Special |
|------|------------|------------|---------|
| 2016 | The Beginning | O Começo | **Expanded** - Met, moved in quickly, Chile trip |
| 2017 | A Bold Move | Uma Grande Mudança | **Expanded** - Facebook offer, distance risk, leap of faith |
| 2018 | Getting Married | O Casamento | **Expanded + Video** - Proposal, Roberta's brave move to US |
| 2019 | Exploring the World | Explorando o Mundo | **Expanded** - No wedding party, Paris photos, honeymoon Venice/Rome |
| 2020 | Putting Down Roots | Criando Raízes | Brief - First house, expecting |
| 2021 | Welcome Levy | Bem-vindo Levy | **Expanded** - First son born |
| 2023 | Welcome Leo | Bem-vindo Leo | **Expanded** - Second son, family complete |
| 2026 | Celebrating 10 Years | Celebrando 10 Anos | Brief - The celebration, "hope to see you there" |

### Reference Media
- Proposal video: https://www.youtube.com/watch?v=kd2htsyJSbU (embedded in 2018 card)

### Files to Modify
- `index.html` - Add "Our Story" nav link + story section at bottom
- `sass/style.scss` - Add timeline + carousel component styles (~80 lines)
- `js/main.js` - Add `initTimelineCarousels()` for auto-scroll functionality
- `js/translations.js` - Add story translations (EN + PT, ~40 keys)
- `images/story/` - 49 optimized photos (YYYY-N.jpg naming, 800px width for retina)

### Raw Event Notes (for reference)
<details>
<summary>Full relationship timeline (click to expand)</summary>

**2016**: Met in São Paulo, moved in together, first international trip to Chile

**2017**: Facebook offer, visited Foz do Iguaçu/Campos do Jordão/Monte Belo/Ilhabela, Nivaldo moved to US

**2018**: Proposal, wedding, Roberta moved to US, first car, Lake Tahoe/Sequoia/Monterey/Seattle, first Halloween party tradition

**2019**: Visited Switzerland/India/Germany/NYC/London/Paris/Italy, first electric car, Paris photo shoot

**2020**: Bought first house, pregnant with Levy

**2021**: Levy born

**2022**: Moved to Georgia

**2023**: Leo born

**2024**: Built a pool

**2025**: Levy started preschool

**2026**: 10 years together - celebration!
</details>
