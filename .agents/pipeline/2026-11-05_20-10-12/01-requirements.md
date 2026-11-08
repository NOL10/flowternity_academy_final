# Nike-Level Premium Redesign of /games Page – Requirements

## Summary

Redesign the `/games` page from its current state to a luxury sports marketplace matching Nike/ESPN/premium brand aesthetics. This is a visual and interaction redesign that preserves all existing functionality (API calls, payments, authentication, game filtering). The core transformation shifts from a functional listing to an immersive, cinematic experience with premium micro-interactions, luxury color treatment, and ultra-large typography. The page must work responsively from 360px to 1440px without any functional regression.

**Key Design Direction (User Confirmed):**
- Color palette: Minimal black/white/lime (Nike-style approach)
- Hero: Full-screen cinematic with image + floating text overlay (not minimal)
- Featured showcase: 3-card grid (not carousel)
- Micro-interactions: Spring animations, hover elevations, pulsing urgency indicators

## Functional Requirements

1. **Hero Section** – Cinematic full-screen hero with video-like feel
   - Full-screen or near-full-screen height (80-100vh) with maximum breathing room
   - Premium background: Pure black (#000000) with charcoal accents
   - Hero image overlay with gradient transparency for text readability
   - Floating text overlay: Large bold headline, subheading, and CTAs
   - Trust indicators (stats: Active Players, Events Monthly, Sports count)
   - Scroll indicator animation (pulsing chevron)

2. **Featured Showcase (Premium Grid)**
   - Display top 6 trending/popular games, show 3 cards at once in grid layout
   - Auto-rotate through featured games with manual nav buttons (left/right chevrons)
   - Each card displays: sport icon/badge, title, date, time, spot availability, price, countdown timer
   - Countdown urgency: Red pulsing animation for games with <60 min until start
   - Floating badges on images: "Hot" badge, countdown timer, price
   - Hover interactions: Image zoom, card elevation, smooth spring animation
   - Grid adapts responsively: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)

3. **Category Navigation**
   - Sticky category tabs: All Events, Pickup Games, Paid Games, Tournaments
   - Premium styling: Lime underline indicator for active category, black/slate background
   - Sort dropdown: Sort by Upcoming, Most Popular, Available Spots, Price (low-to-high, high-to-low)

4. **Search & Filter Bar**
   - Premium search input with icon, focus state lime highlight
   - Filter button opening a bottom-sheet drawer (mobile) or modal (desktop)
   - Active filter tags displayed with lime accents
   - Filters: Sport (single select), Skill Level (multi-select), Price Range (multi-select)

5. **Game Cards (Pickup/Tournament)**
   - Dark slate-900 cards on black background
   - Premium image with gradient overlay for text readability
   - Status badges: "✓ Joined" (lime), "Urgent Countdown" (red pulse), Free/Paid badge
   - Info grid: Date, Time, Location with icons (Calendar, Clock, MapPin in lime)
   - Capacity bar with visual fill (lime when available, red when full)
   - Premium CTAs: "Join Free" (lime), "Pay ₹X", "Leave", or "✓ Joined" (disabled state)
   - All existing game logic preserved: join/leave, payment redirect, auth state

6. **Animations & Micro-Interactions**
   - Fade-in-up on page load (staggered per section)
   - Slide-in-left for sidebar/drawer elements
   - Smooth spring transitions (0.4s, cubic-bezier(0.34, 1.56, 0.64, 1))
   - Hover elevation: Cards translate up 8px, shadow increases
   - Pulsing glow on urgent countdown badges (lime pulse, 2s loop)
   - Image zoom on card hover (110% scale over 700ms)
   - Button hover: Lime accent shift, icon translate on CTAs

7. **All Existing Functionality Preserved**
   - Join/leave game endpoints and state management unchanged
   - Payment flow (Razorpay) intact with redirect logic
   - Authentication checks (parent restrictions, user state)
   - Filter/search queries working with same backend API
   - Sport metadata (SPORTS config) driving images, names, icons
   - Responsive layout adapts to all screen sizes (360px–1440px)

## Non-Functional Requirements

1. **Performance**
   - Build passes with 0 errors and 0 warnings
   - Page loads in <3s on 4G throttled connection
   - Animations run smoothly (60fps) on mobile and desktop
   - No layout shift (CLS) caused by new elements

2. **Responsive Design**
   - Supports viewport widths: 360px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
   - Images and text scale gracefully without truncation or overflow
   - Touch targets (buttons, cards) remain clickable and sized ≥44px on mobile
   - Modal/drawer drawers work on mobile without breaking layout

3. **Accessibility**
   - Semantic HTML structure maintained
   - Color contrast: Lime (#D4FF24) on black passes WCAG AA for text
   - Icons paired with text labels; no icon-only CTAs
   - Keyboard navigation supported: Tab through cards, buttons, filter inputs
   - ARIA labels on interactive elements (carousel buttons, drawer close, etc.)
   - Focus indicators visible (lime underline or border)

4. **Browser Compatibility**
   - Chrome/Edge (latest 2 versions), Safari (latest 2 versions), Firefox (latest 2 versions)
   - CSS transitions and transforms hardware-accelerated
   - Responsive images load correct sizes (srcset or similar)

5. **Code Quality**
   - Maintains existing component structure (Card, Badge, Button, Input, Dialog from /components)
   - No new external dependencies added beyond what's in package.json
   - Animations defined in CSS (Tailwind or <style>) not JavaScript timers
   - Reusable utility classes (e.g., premium-hover, animate-fade-in-up)
   - Comment sections in code: PREMIUM ANIMATIONS, HERO SECTION, FEATURED SHOWCASE, etc.

## Acceptance Criteria

### Visual Design
1. **AC1** – Hero section displays full-screen (min 80vh), black background (#000000), cinematic image overlay with 40% opacity, large bold headline (6xl–8xl), and lime accents only on CTAs
2. **AC2** – Featured 3-card grid auto-rotates through top 6 games with manual nav buttons; grid displays 1 col on mobile, 3 cols on desktop
3. **AC3** – All game cards have slate-900 background, gradient image overlays, lime status badges, and red pulsing countdown for urgent games (<60 min)
4. **AC4** – Category tabs are sticky, styled with lime underline on active, and sort dropdown works without page reload
5. **AC5** – Search input has lime focus border, filter drawer opens/closes smoothly, active filters display as badges with lime accents

### Functionality
6. **AC6** – Join/leave game buttons work without regression; API calls succeed and UI updates immediately
7. **AC7** – Paid games redirect to payment with correct fee (₹X); free games join directly
8. **AC8** – Authentication checks preserved: logged-out users see CTAs, parent accounts see "Adults Only" restriction
9. **AC9** – Filter/search queries apply to game list; clearing filters resets to "All Events"
10. **AC10** – Sport icons and images load from SPORTS config; no hardcoded sport data

### Animations & Interactions
11. **AC11** – Fade-in-up animation on page load, slide-in-left on modals, smooth 0.4s spring transitions on hover
12. **AC12** – Card hover elevates 8px with shadow increase; image zooms to 110% over 700ms
13. **AC13** – Urgent countdown badges (red, <60 min) pulse with lime glow every 2s

### Responsive & Performance
14. **AC14** – Page loads and renders correctly at 360px, 768px, 1024px, 1440px breakpoints
15. **AC15** – Touch targets ≥44px on mobile; no horizontal scroll on any viewport
16. **AC16** – Build passes with 0 errors; no console errors or warnings
17. **AC17** – First Contentful Paint (FCP) <2s on 4G throttle; animations run at 60fps (no jank)

### Accessibility
18. **AC18** – Lime (#D4FF24) text on black passes WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
19. **AC19** – All interactive elements keyboard-navigable (Tab order), focus indicators visible (lime border)
20. **AC20** – Form inputs, buttons, and cards have descriptive aria-labels; carousel buttons labeled "Previous/Next Featured"

## Out of Scope

- Backend changes: API endpoints, database schema, payment processing remain unchanged
- New features: Wishlist, social sharing, live chat, notifications, recommendation engine
- Component library expansion: No new UI components beyond what exists in /components
- SEO optimization: Meta tags, structured data, canonical URLs not modified
- Dark/light mode toggle: Pure black/lime theme only, no theme switching
- Video hero implementation: Static image overlay only (no video embed or autoplay)
- Filtering on tournament-specific criteria: Tournaments remain in "Tournaments" category without advanced filters
- Geographic maps: Venue location remains text-based (MapPin icon + location name)
- Analytics: No new event tracking or GTM integration beyond existing setup

## Assumptions & Notes

1. **Lime Color Accuracy** – Lime accents use Tailwind's `lime-400` (#D4FF24 / rgb(212, 255, 36)). User confirmed this is the exclusive accent color for CTAs and critical UI elements.

2. **Featured Showcase Selection** – Trending games are filtered by participant count and recency; tournaments are excluded from featured showcase. This assumes engagement metrics drive visibility preference.

3. **Responsive Breakpoints** – Design uses Tailwind defaults: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1400px). Mobile-first approach with progressive enhancement.

4. **Micro-Interaction Spec** – Spring animation (cubic-bezier 0.34, 1.56, 0.64, 1) is derived from Nike/ESPN design patterns; assumes this creates "premium feel" per user feedback. Pulsing glow (2s infinite loop) is specific to urgent countdowns only.

5. **Existing Component Usage** – All UI elements use existing Radix UI/shadcn components (Card, Badge, Button, Input, Dialog). No new third-party libraries.

6. **Mobile-First Implementation** – All breakpoint-specific styling uses Tailwind's responsive prefixes (md:, lg:, xl:). Mobile experience optimized first, then enhanced for desktop.

7. **Game Data Freshness** – Featured showcase resets on page load (no real-time auto-rotation during session). Manual rotation via nav buttons works as expected.

8. **Payment Flow** – Paid games redirect to payment page with game ID; free games join directly. Existing Razorpay integration unchanged.

9. **Build & Deploy** – Assumes `npm run build` (or `yarn build`) command succeeds; production deployment unchanged from current setup (Next.js 15).

10. **No Functional Regression** – All existing game filtering, searching, joining, and payment flows remain 100% intact. This is a visual-first redesign.
