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

### Milestone 4: Post-Event Cleanup ✅
**Goal:** The celebration happened on 2026-09-12. Strip everything that only
made sense beforehand and delete the two sections that were never finished.

#### Completed (2026-09-25)
- [x] Removed the countdown clock (markup, `js/clock.js`, FlipClock CDN CSS/JS,
      ~320 lines of responsive clock SCSS, `date.*` translation keys)
- [x] Removed "Save the date" (hero image + button, `.ics` download wiring in
      `main.js`, `#dialog-cal`, `createGoogleCalendarLink()`, `dialog.*` keys)
- [x] Removed RSVP (nav link, hero button, `#dialog-rsvp`, `js/rsvp.js`,
      dialog SCSS, all `rsvp.*` keys)
- [x] Removed the Venue map, FAQ and Travel & Stay sections with their SCSS and
      translation keys
- [x] Deleted the never-shipped `.wip` sections: Itinerary (Lorem ipsum) and
      Gallery (3 placeholder photos), plus the `.wip` helper class
- [x] Dropped libraries left with no callers: Magnific Popup (CSS + JS +
      options) and Bootstrap JS; Bootstrap CSS stays for the grid
- [x] Recompiled `css/style.css` (-862 lines) and bumped cache-busting to
      `?v=20260925`
- [x] Updated CLAUDE.md to describe the post-event site

#### Deliberately Kept
- `save-the-date.ics`, `apps-script/` (RSVP backend + its README),
  `images/save_the_date.svg`, former gallery photos - unreferenced, archival

### Milestone 5: Thank-You Copy ✅
**Goal:** Say thank you to everyone who came, and stop writing in the future
tense about an event that already happened.

#### Completed (2026-09-25)
- [x] Removed the "Join Us" section - it invited people to something that has
      already taken place
- [x] Added a `#thanks` section in its place: three paragraphs thanking guests
      for the flights, the long drives and the days off work, and closing on
      "your presence was the greatest gift"
- [x] Renamed `about.*` keys to `thanks.*` and `.about-description` to
      `.thanks-description`; added a "Thank You" nav link
- [x] Hero tagline is now "Ten years together, celebrated with you." The
      `details.subtitle` line was folded into it and the key deleted
- [x] 2026 timeline card rewritten in the past tense
- [x] Page `<title>`, `meta description` and `og:description` no longer say
      "Save the date"
- [x] Full EN + PT pass; verified all 28 `data-i18n` keys resolve in both
      tables with no orphans and no fallback drift

### Milestone 6: Event Video and Photos 🚧
**Goal:** Share the video and photos from the celebration

#### Completed (2026-09-25)
- [x] `#video` section: one player plus four pills (teaser, short film, longer
      cut, ceremony). Clicking a pill swaps the iframe `src` and the caption,
      so only the chosen cut loads. First layout stacked four players, which
      read as a file dump - replaced
- [x] Titles and one-line descriptions per cut, EN + PT, applied at runtime
- [x] All footage is from September 12th only; copy corrected away from
      "the weekend", including the photos placeholder
- [x] Page went from 5 YouTube iframes to 2
- [x] `#photos` section with a placeholder card explaining the photos are still
      with the photographer
- [x] Nav links and EN/PT copy for both sections
- [x] All embeds moved to `youtube-nocookie.com` - no tracking cookies until
      the visitor presses play
- [x] **Hero background loop shipped.** `video/hero-loop.mp4`, 14s from 16.5s
      into the teaser, 1280x720, no audio track, 1.7MB. Fixed to the viewport
      so the page scrolls over it; Stellar parallax removed

#### Known Broken
- [ ] **Scroll pause/resume on the videos-section player does not work.**
      `initVideoPicker()` in `js/main.js` sends `listening` / `pauseVideo` /
      `playVideo` to the embed over postMessage with `enablejsapi=1`, and the
      player never answers - so `isPlaying` stays false and nothing fires.
      Harmless (the player itself works; it just never auto-pauses), but it is
      dead code until fixed.
      Prime suspect: YouTube's postMessage protocol wants `id` and `channel`
      fields, i.e. `{"event":"listening","id":1,"channel":"widget"}` rather
      than the bare `{"event":"listening"}` being sent now. Second candidate:
      `enablejsapi=1` needs an `origin=<page origin>` parameter alongside it.
      Cannot be tested over `file://` - needs a real origin, so use
      `python -m http.server`.

#### Remaining
- [ ] Swap in the real photos when the photographer delivers, and replace the
      placeholder card
- [ ] Consider swapping `og:image` (still `SaveTheDate_Back.jpg`) for a photo
      from the day

#### Hero Loop - Decisions Made
- **Source clip:** 14 seconds starting at 16:5 into the teaser
  (`Roberta e Henrique - InstaFilm.mp4`, 3840x2160, 41.9s). Scale to 1280 wide,
  drop the audio track, target under ~2MB
- **Not a YouTube embed:** looping needs the IFrame Player API (`loop=1` also
  requires `playlist=<id>`), the player carries branding and end-screen
  overlays, mobile browsers frequently refuse iframe autoplay, and it costs
  ~1MB of player JS
- **Parallax dropped.** Stellar cannot drive a `<video>`; the library and its
  script tag were removed. The fixed-position video is arguably closer to the
  old effect than a scrolling one would have been
- **Shown on mobile too**, not hidden - fixed to the viewport so it holds still
  while content scrolls over it. `heroVideo()` in `js/main.js` pauses it once
  the header leaves the viewport so it does not decode behind the page
- `prefers-reduced-motion` hides the video and shows the poster
- Pick a clip whose first and last frames are close, or the loop seam shows

## Pending Features

### 1. Video Popup Configuration
**Status:** ❌ Dropped in Milestone 4 - the popup markup and Magnific Popup
itself are gone. The only video on the site is the YouTube proposal embed in
the 2018 timeline card.

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
- Bootstrap accordion with 6 FAQ items
- Emojis added to each question for easier visual scanning (📅👗🏨👨‍👩‍👧‍👦☀️🎁)
- Bilingual support (EN/PT)
- Questions covered: attendance requirements, dress code, accommodation, guests/children, weather, gifts

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
- ❌ Add more venue information - dropped, venue section removed in Milestone 4
- ❌ Add more photos to gallery section - dropped, gallery removed in Milestone 4
- ❌ Add venue video - dropped, see Pending Features #1
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
- ✅ FAQ section with Bootstrap accordion (6 questions, EN/PT)
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
