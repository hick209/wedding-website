# TODO List

This document tracks pending tasks and future improvements for the wedding website.

## Project Milestones

### Milestone 1: Send Website as "Save the Date" ✅
**Goal:** Basic website ready to share
**URL:** https://www.nivaldo-roberta.com

#### Completed Items
- [x] Add location right under the date
- [x] Update or remove video
- [x] Domain setup
- [x] Removed unused CSS/JS libraries
- [x] Created documentation (CLAUDE.md)
- [x] Created .gitignore for CSS source maps
- [x] Add info about what is going on
- [x] Fix link preview image bug ([reference](https://stackoverflow.com/q/21636503/1848826))
- [x] Add info about why we are doing the party
- [x] Make date bigger (at least for desktop)

#### Remaining Blockers
- [x] Add FAQ section - answer "do I need to be there everyday?"
- [x] Add travel guidance for people from outside of Brazil

### Milestone 2: RSVP Functionality ✅
**Goal:** People can confirm whether they will attend

#### Completed
- [x] Add RSVP section to index.html with form
- [x] Add RSVP nav link
- [x] Create js/rsvp.js with form handling logic
- [x] Add RSVP translations (EN + PT) to js/translations.js
- [x] Add RSVP styling to sass/style.scss
- [x] Create apps-script/ directory with Code.gs and README.md (for version control)
- [x] Deploy Google Apps Script and update APPS_SCRIPT_URL in js/rsvp.js
- [x] Convert RSVP from full-page section to dialog modal
  - RSVP button added next to "Save Our Date" in header
  - Nav link opens dialog instead of scrolling to section
  - Uses HTML5 `<dialog>` element with showModal()/close()
- [x] Three-state dialog: form → loading → success
  - Loading state shows spinner while submitting
  - Success state shows confirmation with OK button
- [x] Privacy-friendly approach: submissions append to sheet (no guest list exposure)
- [x] Contact validation: requires email OR phone with format validation

#### Remaining Steps (Manual)
- [x] Add "RSVP Date" column (I) to Google Spreadsheet
- [x] Test end-to-end RSVP flow

### Milestone 3: Our Story Timeline ✅
**Goal:** Add a photo-centric timeline telling the couple's 10-year journey

#### Completed
- [x] Add "Our Story" section to index.html (at bottom, before footer)
- [x] Add "Our Story" nav link
- [x] Create vertical timeline with alternating left/right cards
- [x] Add 8 milestone events (2016-2026)
- [x] Embed proposal video in 2018 card (YouTube)
- [x] Add timeline styles to sass/style.scss (~150 lines)
- [x] Add translations (EN + PT) to js/translations.js (~40 keys)
- [x] Create placeholder images in images/story/
- [x] Responsive design: single column on mobile
- [x] Scroll animations with Waypoints (animate-box)

#### Timeline Events
1. 2016 - The Beginning (expanded)
2. 2017 - A Bold Move (expanded)
3. 2018 - Getting Married (expanded + video)
4. 2019 - Exploring the World (expanded)
5. 2020 - Putting Down Roots (brief)
6. 2021 - Welcome Levy (expanded)
7. 2023 - Welcome Leo (expanded)
8. 2026 - Celebrating 10 Years (brief)

#### Remaining Steps (Manual)
- [ ] Replace placeholder images with actual photos

## Pending Features

### 1. Video Popup Configuration
**Location:** `index.html:270-276` (Highlights section)
**Status:** ✅ Updated to remove video (Milestone 1 requirement)
**Priority:** Low (Optional enhancement)

**Current State:**
- Video popup UI exists with placeholder background image
- Link currently points to `#` (non-functional)
- Uses Magnific Popup library with `popup-vimeo` class

**What Needs to be Done (if adding video later):**
1. Upload wedding highlight video to Vimeo or YouTube
2. Replace `href="#"` with actual video URL
3. Test popup functionality
4. Optional: Update background image

**Example:**
```html
<a href="https://vimeo.com/123456789" class="popup-vimeo"><i class="icon-video2"></i></a>
```

**Alternative:** Consider using venue video from Instagram ([example](https://www.instagram.com/p/DK2O9RcgGdO/))

### 2. Event Information / Context
**Status:** ✅ Completed
**Priority:** High (Milestone 1 blocker)

**Implemented Features:**
- "Join Us" section explains 10-year celebration
- Multi-day format clearly described (Sept 11-13, 2026)
- Attendance requirements clarified: 3-day event for hotel guests, ceremony-only option (after 3pm) for others
- Personal story line added about couple's journey (moving countries, home, two boys)
- Venue exclusively booked messaging included

### 3. FAQ Section
**Status:** ✅ Completed
**Priority:** High (Milestone 1 blocker)

**Implemented Features:**
- Bootstrap accordion with 5 FAQ items
- Emojis added to each question for easier visual scanning (📅👗🏨👨‍👩‍👧‍👦☀️)
- Bilingual support (EN/PT)
- Questions covered: attendance requirements, dress code, accommodation, guests/children, weather

### 4. Travel Guidance
**Status:** ✅ Completed
**Priority:** High (Milestone 1 blocker)

**Implemented Features:**
- 6 travel info cards with icons
- Topics: Getting Here (GRU airport), Transportation, Where to Stay, Visa Requirements, Currency & Payments, What to Pack
- Corrected visa info: UK/EU visa-free, US/Canada need visa
- Bilingual support (EN/PT)
- Responsive grid layout with hover effects

### 5. Link Preview Image Fix
**Status:** ✅ Completed
**Priority:** Medium

**Problem:** Link preview image was not displaying correctly on social media
**Reference:** https://stackoverflow.com/q/21636503/1848826
**Debug Tool:** https://developers.facebook.com/tools/debug/

**Fix Applied:**
- Converted OG image from SVG to PNG format
- Updated to absolute URL: `https://www.nivaldo-roberta.com/images/og-image.png`
- Tested with Facebook debugger

## Nice to Have Enhancements

### UX/Design Improvements
- [x] The flipclock wraps between page width 992-1200px.
- [x] The flipclock wraps between page width 361-365px.
- [x] Make date bigger on desktop
- [x] Adjust CSS for mobile (currently "looks off")
- [x] Fix background parallax "jumping" issue (used lvh instead of dvh/vh)
- [x] Improve CSS for landscape orientation on mobile (partially addressed)

### Content Enhancements
- [ ] Add more venue information
- [ ] Add more photos to gallery section
- [ ] Add venue video (see [Instagram example](https://www.instagram.com/p/DK2O9RcgGdO/))
- [ ] Add social media sharing buttons
- [x] **"Our Story" section** - Photo-centric vertical timeline telling the couple's journey (see Milestone 3)

### Technical Improvements
- [x] **Optimize images for web** ✅ Completed
  - Hero image: 3.4MB → 720KB (79% reduction)
  - Gallery images: ~4.6MB → ~1.8MB combined (60% reduction)
  - Unused images moved to `images/archive/` for future "Our Story" page
  - Original backups in `images/originals/` (gitignored)
- [x] **Optimize story images** ✅ Completed
  - 48 timeline photos: 168MB → 6MB (96% reduction)
  - Resized to 800px width for retina displays
  - Original backups in `images/story/originals/` (gitignored)
- [x] **Clean section IDs** - Removed 'fh5co-' prefix for cleaner URLs (#venue instead of #fh5co-venue)
- [ ] Add loading states/animations
- [x] **Lazy loading images** - Intersection Observer defers story carousel images until near viewport
- [ ] Consider modern CSS framework migration

## Reference Resources

### Inspiration Websites
- https://wedding.rampatra.com/
- https://wedding-invitation-website.vercel.app/#stay

### Tools
- Facebook Link Preview Debugger: https://developers.facebook.com/tools/debug/
- Google PageSpeed Insights (for performance testing)

## Completed Tasks

### Code Cleanup
- ✅ Removed unused Owl Carousel library (CSS + JS)
- ✅ Removed unused FlexSlider library
- ✅ Removed google_map.js (replaced with iframe embed)
- ✅ Removed jquery.countTo.js (unused)
- ✅ Created .gitignore for CSS source maps
- ✅ Updated CLAUDE.md documentation
- ✅ Created TODO.md for task tracking

### Milestone 1 Progress
- ✅ Domain setup (www.nivaldo-roberta.com)
- ✅ Location added under date
- ✅ Video removed (was placeholder)
- ✅ Event context section added ("Join Us")
- ✅ GitHub footer added with modern semantic HTML
- ✅ FAQ section with Bootstrap accordion (5 questions, EN/PT)
- ✅ Travel & Stay section with 6 info cards (EN/PT)
- ✅ Link preview image fix (SVG → PNG, absolute URL)
- ✅ Attendance clarifications (3-day for hotel guests, ceremony-only option after 3pm)
- ✅ Personal story added (about.story - 10-year journey)

### Milestone 3 Progress
- ✅ "Our Story" timeline section with 8 milestone events (2016-2026)
- ✅ Vertical timeline with alternating left/right photo cards
- ✅ Embedded proposal video in 2018 card
- ✅ Bilingual support (EN/PT) with ~40 translation keys
- ✅ Responsive design (single column on mobile)
- ✅ Scroll animations with Waypoints
