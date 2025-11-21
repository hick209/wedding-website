# TODO List

This document tracks pending tasks and future improvements for the wedding website.

## Pending Features

### 1. Video Popup Configuration
**Location:** `index.html:270-276` (Highlights section)
**Status:** Placeholder exists, needs configuration
**Priority:** Medium

**Current State:**
- Video popup UI exists with placeholder background image
- Link currently points to `#` (non-functional)
- Uses Magnific Popup library with `popup-vimeo` class

**What Needs to be Done:**
1. Upload/select wedding highlight video to Vimeo or YouTube
2. Replace `href="#"` with actual video URL (e.g., `https://vimeo.com/XXXXXXX` or `https://www.youtube.com/watch?v=XXXXXXX`)
3. Test popup functionality
4. Optional: Update background image if needed

**Example:**
```html
<a href="https://vimeo.com/123456789" class="popup-vimeo"><i class="icon-video2"></i></a>
```

### 2. GitHub Footer Link
**Location:** `index.html:333-337`
**Status:** Commented out
**Priority:** Low

**Current State:**
- Footer link to GitHub repository is commented out
- References `images/github-logo.png` (file exists in repo)
- Currently points to original template repo URL

**What Needs to be Done:**
1. Update GitHub URL to your repository (if you want to share the code)
   - Current URL: `https://github.com/hick209/wedding-website`
   - Update to: Your actual repository URL
2. Verify `images/github-logo.png` exists and looks good
3. Consider styling/placement - currently uses deprecated `<center>` tag
4. Uncomment when ready

**Alternatives to Consider:**
- Remove entirely if you don't want to share the code
- Replace with different footer content (e.g., copyright, credits)
- Update to modern semantic HTML instead of `<center>`

## Future Enhancements

### Image Cleanup
**Status:** Deferred for manual review
**Priority:** Low

Several images in `/images/` directory are currently unused but kept for potential future use:
- `DSC_6310.jpg`, `NR-191021-113.jpg`, `NR-191021-126.jpg`, `NR-191021-148.jpg`
- `NR-191021-78.jpg`, `NR-191021-86.jpg`, `NR-191021-94.jpg`
- `SaveTheDate_Front.svg`, `bg.webp`, `fprint.png`, `og.jpg`, `loc.png`

**Action:** Review and delete images that won't be used to reduce repository size.

### Potential Improvements
- [ ] Add loading states/animations
- [ ] Optimize images for web (compress JPGs, use WebP)
- [ ] Add more photos to gallery section
- [ ] Complete itinerary details (currently has Lorem ipsum text)
- [ ] Consider adding RSVP functionality
- [ ] Add social media sharing buttons
- [ ] Performance optimization (lazy loading images, etc.)

## Completed Cleanup
- ✅ Removed unused Owl Carousel library
- ✅ Removed unused FlexSlider library
- ✅ Removed google_map.js (replaced with iframe embed)
- ✅ Removed jquery.countTo.js (unused)
- ✅ Created .gitignore for CSS source maps
- ✅ Updated CLAUDE.md documentation
