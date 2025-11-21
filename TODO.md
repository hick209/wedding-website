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

#### Remaining Blockers
- [ ] Add info about what is going on / why we are doing the party
- [ ] Make date bigger (at least for desktop)
- [ ] Add FAQ section - answer "do I need to be there everyday?"
- [ ] Add travel guidance for people from outside of Brazil
- [ ] Fix link preview image bug ([reference](https://stackoverflow.com/q/21636503/1848826))

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

### 2. GitHub Footer Link
**Location:** `index.html:333-337`
**Status:** Commented out
**Priority:** Low

**Current State:**
- Footer link to GitHub repository is commented out
- References `images/github-logo.png` (file exists in repo)
- Currently points to original template repo URL

**What Needs to be Done:**
1. Update GitHub URL to your repository: `https://github.com/hick209/wedding-website`
2. Verify `images/github-logo.png` exists and looks good
3. Consider styling/placement - currently uses deprecated `<center>` tag
4. Uncomment when ready

### 3. Event Information / Context
**Status:** Not started
**Priority:** High (Milestone 1 blocker)

**What Needs to be Done:**
- Add explanation of why you're celebrating (10-year anniversary)
- Explain the multi-day format (Sept 11-13, 2026)
- Set expectations about attendance requirements

**Suggested Location:** Add a new section between header and venue, or enhance the landing page description

### 4. FAQ Section
**Status:** Not started
**Priority:** High (Milestone 1 blocker)

**Common Questions to Address:**
- Do I need to be there every day?
- What should I wear?
- Is accommodation included?
- Can I bring guests/children?
- What's the weather like in September?

### 5. Travel Guidance
**Status:** Not started
**Priority:** High (Milestone 1 blocker)

**Reference:** [Example travel section](https://wedding-invitation-website.vercel.app/#stay)

**Information to Include:**
- Airport information (GRU - São Paulo International)
- Transportation to Atibaia
- Visa requirements for international guests
- Currency exchange tips
- Accommodation options near venue

### 6. Link Preview Image Fix
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
- [ ] Make date bigger on desktop
- [ ] Adjust CSS for mobile (currently "looks off")
- [ ] Fix background parallax "jumping" issue
- [ ] Improve CSS for landscape orientation on mobile (partially addressed)

### Content Enhancements
- [ ] Add more venue information
- [ ] Add more photos to gallery section
- [ ] Add venue video (see [Instagram example](https://www.instagram.com/p/DK2O9RcgGdO/))
- [ ] Add social media sharing buttons

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
