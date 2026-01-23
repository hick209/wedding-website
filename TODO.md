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

### Milestone 2: RSVP Functionality
**Goal:** People can confirm whether they will attend

#### Blockers
- [ ] Add RSVP button
- [ ] Complete itinerary details (currently has Lorem ipsum text)
- [ ] Store RSVP info into a database
- [ ] Backend/API for RSVP handling

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
**Status:** Not started
**Priority:** High (Milestone 1 blocker)

**What Needs to be Done:**
- Add explanation of why you're celebrating (10-year anniversary)
- Explain the multi-day format (Sept 11-13, 2026)
- Set expectations about attendance requirements

**Suggested Location:** Add a new section between header and venue, or enhance the landing page description

### 3. FAQ Section
**Status:** ✅ Completed
**Priority:** High (Milestone 1 blocker)

**Implemented Features:**
- Bootstrap accordion with 5 FAQ items
- Bilingual support (EN/PT)
- Questions covered: attendance requirements, dress code, accommodation, guests/children, weather

### 4. Travel Guidance
**Status:** ✅ Completed
**Priority:** High (Milestone 1 blocker)

**Implemented Features:**
- 6 travel info cards with icons
- Topics: Getting Here (GRU airport), Transportation, Where to Stay, Visa Requirements, Currency & Payments, What to Pack
- Bilingual support (EN/PT)
- Responsive grid layout with hover effects

### 5. Link Preview Image Fix
**Status:** Known issue
**Priority:** Medium

**Problem:** Link preview image not displaying correctly on social media
**Reference:** https://stackoverflow.com/q/21636503/1848826
**Debug Tool:** https://developers.facebook.com/tools/debug/

**Current Meta Tag:**
```html
<meta property="og:image" content="images/SaveTheDate_Back.svg" />
```

**Potential Issues:**
- SVG may not be supported by all platforms
- Relative URL might need to be absolute
- Image size requirements (300x190 per current meta tags)

**Suggested Fix:**
- Convert to PNG/JPG format
- Use absolute URL: `https://www.nivaldo-roberta.com/images/...`
- Test with Facebook debugger

## Nice to Have Enhancements

### UX/Design Improvements
- [x] The flipclock wraps between page width 992-1200px.
- [x] The flipclock wraps between page width 361-365px.
- [x] Make date bigger on desktop
- [x] Adjust CSS for mobile (currently "looks off")
- [ ] Fix background parallax "jumping" issue
- [x] Improve CSS for landscape orientation on mobile (partially addressed)

### Content Enhancements
- [ ] Add more venue information
- [ ] Add more photos to gallery section
- [ ] Add venue video (see [Instagram example](https://www.instagram.com/p/DK2O9RcgGdO/))
- [ ] Add social media sharing buttons
- [ ] **"Our Story" page** - A dedicated page telling the couple's journey:
  - Never had a wedding party when married; saved up for this 10-year celebration
  - Timeline: Brazil → USA, buying their home, travels, welcoming their two boys
  - Photo gallery of key moments from the past 10 years
  - Could include a photo timeline or carousel

### Technical Improvements
- [ ] Optimize images for web (compress JPGs, use WebP)
- [ ] Add loading states/animations
- [ ] Performance optimization (lazy loading images, etc.)
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
