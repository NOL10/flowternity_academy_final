# Games Hub Implementation Plan

Based on approved design: `/app/games/page.js` → comprehensive competitive gaming ecosystem with tournaments, leaderboards, player profiles, social engagement, and real-time updates.

**Project Type**: Next.js 15.5 + React 18.3 + MongoDB backend + Razorpay payments  
**Build Command**: `yarn dev` (dev server), `yarn build` (production)  
**Test Command**: Manual testing via dev server (no automated test suite in repo)  
**Deployment**: Next.js 15.5 on Node.js  

---

## Effort Summary by Category

| Category | Tasks | Estimated Hours | Priority |
|----------|-------|-----------------|----------|
| **Backend API Endpoints** | Tournament, bracket, leaderboard, player stats, social, community | 40-50h | P0 |
| **Frontend Components** | Hero, filters, cards, modals, carousels, tables | 30-35h | P0 |
| **Real-Time & Data** | WebSocket setup, React Query caching, polling fallback | 20-25h | P1 |
| **Social & Engagement** | Follow/block, friends playing, player profiles | 15-20h | P1 |
| **Mobile & Animations** | Responsive design, Framer Motion transitions | 15-20h | P1 |
| **Testing & Polish** | Integration testing, bug fixes, performance tuning | 20-25h | P2 |
| **TOTAL** | 13 features across 6 phases | **140-175 hours** | - |

---

## Architecture Overview

### New File Structure

```
components/games-hub/
├── hero-section.js              # Animated stats, CTA
├── filter-bar.js                 # Sport, skill, game type, fee filters
├── tournament-card.js            # Tournament status, entry fee, signup count
├── tournament-bracket.js         # Bracket tree visualization (modal)
├── enhanced-game-card.js         # Existing game card + social proof
├── leaderboard.js                # Ranked player list (desktop table / mobile cards)
├── top-performers.js             # Top 5-10 streak + stats
├── recent-results.js             # Recent completed games, MVP, scores
├── player-profile-preview.js     # Modal: player stats, games, follow/block
├── recommendation-carousel.js    # Swipe carousel: games you might like
└── community-news.js             # Announcements, countdowns

lib/flowternity/
├── games-hub-utils.js            # Filter logic, sort, client-side helpers
├── tournament-bracket-utils.js   # Bracket generation, match progression
├── stats-calculator.js           # Win rate, streaks, leaderboard ranks
└── websocket.js                  # WebSocket client hook, reconnect

app/api/
├── tournaments/
│   ├── route.js                  # GET all, POST create
│   ├── [id]/
│   │   ├── route.js              # GET single tournament
│   │   ├── bracket.js            # GET bracket tree
│   │   ├── join.js               # POST join tournament
│   │   └── matches/[match_id]/score.js # POST match result
├── leaderboards/
│   ├── [sport_id]/
│   │   └── route.js              # GET leaderboard by sport + period
├── players/
│   ├── [user_id]/
│   │   ├── stats.js              # GET player stats + history
│   │   ├── game-history.js       # GET game history paginated
│   │   ├── profile.js            # GET public profile
│   │   └── batch.js              # GET multiple players (batch)
├── social/
│   ├── follow.js                 # POST follow user
│   ├── unfollow.js               # POST unfollow user
│   ├── block.js                  # POST block user
│   ├── friends-playing.js        # GET followed users in games
│   └── profile.js                # GET social engagement data
├── recommendations/
│   └── games.js                  # GET recommended games
├── community/
│   ├── stats.js                  # GET community stats
│   ├── recent-results.js         # GET recent completed games
│   └── announcements.js          # GET announcements
└── games/
    ├── [id]/
    │   └── route.js              # Updated: add social_proof field
```

### Database Collections

New collections (or extensions to existing models):

1. **tournaments** - Tournament metadata, status, participants, prize pool
2. **bracket_matches** - Individual matches within tournaments, scores, winners
3. **leaderboards** - Pre-calculated ranks per sport/period (recalculated hourly)
4. **game_history** - Game outcome records per player (seeded from existing games)
5. **player_social** - Follow, block, social preferences per user
6. **community_stats** - Snapshot of totals, trending, top performers per period

---

## Implementation Plan (13 Features, Sequential)

### FEAT-001: Backend Data Models & Database Setup
**Effort**: 8-10h | **Priority**: P0

Create MongoDB schema migrations and initialize core collections.

**Files**:
- `lib/flowternity/schemas.js` (new) - Zod schemas for validation
- Database seeding script (new) - Populate tournaments, matches, leaderboard snapshots

**Tasks**:
1. Define Zod schemas for Tournament, BracketMatch, Leaderboard, GameHistory, PlayerSocial, CommunityStats models
2. Create database migrations (add new collections and indexes for sport_id, user_id, period, rank)
3. Write seed script to populate 3-5 demo tournaments with random bracket matches, sample leaderboards
4. Verify MongoDB connection and collection creation via dev server

**Verification**:
- Dev server starts without errors: `yarn dev`
- MongoDB collections created: db.tournaments.countDocuments() > 0
- Seed script runs without errors
- Schema validation passes for sample data

---

### FEAT-002: Tournament & Bracket API Endpoints
**Effort**: 12-15h | **Priority**: P0

Implement core tournament and bracket endpoints: list, fetch, join, post results.

**Files**:
- `app/api/tournaments/route.js` (new)
- `app/api/tournaments/[id]/route.js` (new)
- `app/api/tournaments/[id]/bracket.js` (new)
- `app/api/tournaments/[id]/join.js` (new)
- `app/api/tournaments/[id]/matches/[match_id]/score.js` (new)

**Tasks**:
1. GET /api/tournaments - List tournaments with filters (sport_id, status, limit, skip), return summary view (id, name, status, start_date, prize_pool, participant_count/max)
2. GET /api/tournaments/:id - Return full tournament object with bracket tree structure
3. GET /api/tournaments/:id/bracket - Return optimized bracket JSON (rounds, matches, current round, auto-advance rules)
4. POST /api/tournaments/:id/join - Check auth, membership, max participants, add user to participants array, assign seed number
5. POST /api/tournaments/:id/matches/:match_id/score - Auth admin role only, post winner + score, auto-generate next-round match if tournament still in progress
6. Implement proper error handling: 400 (invalid params, tournament full, duplicate join), 404 (tournament/match not found), 409 (bracket conflict)
7. Add response headers: Cache-Control (tournament: 30s, bracket: 30s, leaderboard: 5m)

**Verification**:
- Call GET /api/tournaments → returns array with pagination
- Call GET /api/tournaments/:id → returns tournament with bracket
- Call POST /api/tournaments/:id/join → user added to participants
- Call POST match score → next-round match auto-generated
- Test error cases: join when full, invalid winner, rate limits
- Verify response structure matches design spec

---

### FEAT-003: Leaderboard & Player Stats API Endpoints
**Effort**: 12-15h | **Priority**: P0

Implement leaderboard ranking and player performance endpoints.

**Files**:
- `app/api/leaderboards/[sport_id]/route.js` (new)
- `app/api/players/[user_id]/stats.js` (new)
- `app/api/players/[user_id]/game-history.js` (new)
- `app/api/players/[user_id]/profile.js` (new)
- `app/api/players/batch.js` (new)
- `lib/flowternity/stats-calculator.js` (new)

**Tasks**:
1. GET /api/leaderboards/:sport_id - Query params: period (week|month|all_time), limit, skip. Return ranked players with: rank, user (id, name, avatar, bio), wins, losses, win_rate, streak, points. Cache 5min
2. Implement period logic: 'week' = ISO 8601 calendar week (Mon-Sun UTC), 'month' = calendar month UTC, 'all_time' = entire history
3. Create stats-calculator.js with functions:
   - `calculateWinRate(wins, losses)` - Handle zero division
   - `calculateCurrentStreak(gameHistory, sportId, period)` - Reset on loss or no_show
   - `calculatePoints(wins, totalGames, mvpVotes)` - (wins * 10) + (total_games * 1) + (mvp_votes * 5)
4. GET /api/players/:user_id/stats - Return user's all-time stats + breakdown by sport (total_games, wins, losses, win_rate, current_streak, points) + recent matches (last 10) + performance trend (30 days daily)
5. GET /api/players/:user_id/game-history - Query params: sport_id (optional), limit, skip. Return paginated game records with opponent, result, date, replay_url
6. GET /api/players/:user_id/profile - Return public profile: name, avatar, bio, joinDate, sportsPlayed, statsSnapshot, followerCount, followingCount, badges, isFollowedByMe
7. GET /api/players/batch?userIds=id1,id2,id3 - Return array of player profiles (max 50 IDs) for friends enrichment
8. Implement badge system: '50_games', '20_win_streak', 'mvp_favorite' (awarded based on thresholds)

**Verification**:
- GET /api/leaderboards/basketball?period=week → sorted by points desc, rank assigned correctly
- GET /api/players/:user_id/stats → includes all-time + per-sport breakdown
- GET /api/players/batch?userIds=id1,id2 → returns array of 2 profiles
- Streak calculation: player with 3 wins, then loss → streak resets to 0
- Cache headers respected (5min for leaderboards, 10min for stats)

---

### FEAT-004: Social & Community API Endpoints
**Effort**: 10-12h | **Priority**: P0

Implement follow/block, friends playing, recommendations, and community stats.

**Files**:
- `app/api/social/follow.js` (new)
- `app/api/social/unfollow.js` (new)
- `app/api/social/block.js` (new)
- `app/api/social/friends-playing.js` (new)
- `app/api/recommendations/games.js` (new)
- `app/api/community/stats.js` (new)
- `app/api/community/recent-results.js` (new)
- `app/api/community/announcements.js` (new)

**Tasks**:
1. POST /api/social/follow/:user_id - Auth required, add to followers array, trigger async email notification (if preference set)
2. POST /api/social/unfollow/:user_id - Remove from followers array
3. POST /api/social/block/:user_id - Add to blocked array, prevent blocked user from viewing profile
4. GET /api/social/friends-playing - Return followed users with upcoming/live games (joined games in next 24h)
5. GET /api/recommendations/games - Query: limit (max 20). Return recommended games scored by: favorite sport (+30), time match (+20), friends playing (+25), trending (+15), skill match (+10). Exclude already-joined, past, full games. Cache 15min
6. GET /api/community/stats - Query: period (week|month|all_time). Return: total_games_completed, total_active_players, total_tournaments, average_game_quality_score, trending_sport, top_performers (5), most_popular_skill_level. Cache 1h
7. GET /api/community/recent-results - Query: limit (max 50), skip. Return recent completed games with: game_id, sport, date, final_score, winner, mvp_user, replay_url, participant_count. Pagination
8. GET /api/community/announcements - Return array of announcements (tournament_launch, milestone, alert, countdown). Filter expired ones. Cache 30min

**Verification**:
- POST /api/social/follow/:user_id → user added to followers array
- GET /api/social/friends-playing → returns games with friend avatars
- GET /api/recommendations/games → scoring logic produces expected ranking
- GET /api/community/stats → returns stats object with all fields populated
- Error cases: follow non-existent user (404), rate limits (429)

---

### FEAT-005: Enhanced Games Endpoint with Social Proof
**Effort**: 6-8h | **Priority**: P0

Modify existing GET /api/games to include social_proof field per card.

**Files**:
- `app/api/[[...path]]/route.js` (modify existing /api/games endpoint)
- `lib/flowternity/games-hub-utils.js` (new)

**Tasks**:
1. Update GET /api/games response: add social_proof object per game:
   ```javascript
   social_proof: {
     friendsPlaying: [{ userId, name, avatar }],
     spotFilledPercent: Number (0-100),
     trendingIndicator: Boolean, // top 10 games this week by joins
     participantAvatars: [String], // 4-5 recent joiners
     isParticipantCountFresh: Boolean // true if updated < 30s
   }
   ```
2. Create games-hub-utils.js with helper:
   - `getTrendingGames(period, limit)` - Top 10 by join count
   - `calculateSpotFilled(participants, maxPlayers)` - Returns 0-100
   - `enrichGameWithSocial(game, userId, friendsList)` - Add social fields
3. Implement optional WebSocket channel subscribe for real-time updates (or fallback to polling)

**Verification**:
- GET /api/games → each game includes social_proof object
- social_proof.friendsPlaying shows only followed users
- trending indicator correctly identifies top games
- Test with and without auth (guest view doesn't show friendsPlaying)

---

### FEAT-006: Frontend Hero Section with Stats
**Effort**: 8-10h | **Priority**: P0

Build animated hero section with community stats counters.

**Files**:
- `components/games-hub/hero-section.js` (new)
- Modify `app/games/page.js` (refactor hero section)

**Tasks**:
1. Create HeroSection component: headline "Connect. Compete. Elevate your game." + subheading
2. Render 3 stat counters with Framer Motion:
   - Total games completed (animate 0 → actual count, 1s duration)
   - Total active players
   - Total tournaments
3. Call GET /api/community/stats on mount to fetch counters
4. Add loading skeleton while fetching
5. Include CTA buttons: "Join a Game" → scroll to games list, "View Tournaments" → tournaments section
6. Responsive: full width on mobile, padded container on desktop
7. Use display font for headline, accent color for text highlight

**Verification**:
- HeroSection renders without errors
- Stats animate on page load (0 → target count, 1s)
- Responsive layout verified on mobile (sm) and desktop (lg) viewports
- CTA buttons link correctly

---

### FEAT-007: Filter Bar Component
**Effort**: 10-12h | **Priority**: P0

Build advanced multi-filter UI: sport, skill level, game type, fee range.

**Files**:
- `components/games-hub/filter-bar.js` (new)
- `lib/flowternity/games-hub-utils.js` (enhance)

**Tasks**:
1. Create FilterBar component with inputs:
   - SportFilter (multi-select chips, from SPORTS config)
   - SkillLevelFilter (chips: all/beginner/intermediate/advanced/pro)
   - GameTypeToggle (Free/Paid/Tournament)
   - FeeRangeFilter (slider or input: min-max)
   - PlayerCountFilter (slider: min-max)
2. State: manage filters locally, debounce API calls (300ms)
3. Render active filter count indicator (badge showing number of active filters)
4. Include "Clear Filters" button
5. Save filter preferences to localStorage for returning users
6. Validate saved filters on load: check sport exists in SPORTS config, if not, remove and show toast
7. Responsive: horizontal chip scroll on mobile, grid layout on desktop
8. Import existing SPORTS and MEMBERSHIPS from config

**Verification**:
- All filter chips render correctly
- Changing filter debounces and calls parent onFilterChange
- Clear filters resets to defaults
- Saved filters persist across page reloads
- Invalid saved filter removed with warning toast

---

### FEAT-008: Enhanced Game Card + Recommendation Carousel
**Effort**: 12-15h | **Priority**: P0

Build enhanced game card with social proof, plus recommendation carousel.

**Files**:
- `components/games-hub/enhanced-game-card.js` (new)
- `components/games-hub/recommendation-carousel.js` (new)
- Modify `app/games/page.js` (replace old cards with enhanced)

**Tasks**:
1. Create EnhancedGameCard component:
   - Display existing card layout (time, location, participants, badges)
   - Add social proof overlay: "3 friends playing", "20 spots filled fast", "Trending"
   - Show quick-peek avatars (4-5 recent participants)
   - Show "Players You Know" indicator if user logged in
   - All existing join/leave/payment logic preserved
2. Create RecommendationCarousel component:
   - Fetch games via GET /api/recommendations/games on mount
   - Show 1 card on mobile, 3 cards on desktop (breakpoint-aware)
   - Swipe gesture support (Framer Motion drag)
   - Auto-rotate: 5s interval, pause on user interaction
   - Dot pagination indicators
   - Sections: "Games You Might Like", "Friends Playing", "Trending This Week" (render as separate carousels or unified with reason field)
3. Integrate carousels into main games page layout (render between hero and games list)
4. Error handling: if recommendations fail, render "Check back later" message

**Verification**:
- EnhancedGameCard renders with social proof fields
- Carousel displays correct number of visible cards per breakpoint
- Swipe gesture works on mobile (verify in browser dev tools)
- Auto-rotate pauses and resumes on interaction
- Recommendation algorithm produces expected game order

---

### FEAT-009: Tournament Cards + Bracket Visualization
**Effort**: 15-18h | **Priority**: P1

Build tournament showcase and bracket modal.

**Files**:
- `components/games-hub/tournament-card.js` (new)
- `components/games-hub/tournament-bracket.js` (new)
- Modify `app/games/page.js` (add tournament showcase section)
- `lib/flowternity/tournament-bracket-utils.js` (new)

**Tasks**:
1. Create TournamentCard component:
   - Status badge: "Signups Open", "In Progress", "Completed", "Cancelled"
   - Display entry fee, prize pool, participant count progress bar
   - Countdown timer if signups closing soon
   - "View Full Bracket" CTA opens modal
   - "Join" button if signups open (POST /api/tournaments/:id/join)
2. Create TournamentBracket component (render inside modal):
   - SVG/canvas visualization of bracket tree
   - Show current round highlighted
   - Show match results (seed 1 vs seed 2, score if completed)
   - Mobile: horizontal scroll container (fixed height, overflow-x auto)
   - Desktop: full tree view
   - Live update capability: subscribe to WebSocket for match completions
3. Create tournament-bracket-utils.js:
   - `generateBracketJSON(matches, totalRounds, currentRound)` - Convert API response to tree structure
   - `calculateBracketLayout(rounds)` - Position matches for SVG rendering
4. Add TournamentShowcase section to games page:
   - Grid of 2-3 featured tournaments
   - Fetch via GET /api/tournaments?limit=5&status=signups_open,in_progress
5. Modal: DialogContent with TournamentBracket + details (prize pool, participants, dates)

**Verification**:
- TournamentCard renders with all fields (status, entry fee, progress)
- Click "View Bracket" → modal opens with bracket visualization
- Bracket displays correct match count + current round highlighted
- Responsive: bracket scrollable on mobile, full view on desktop
- Live updates: when match completes (via WebSocket), bracket updates in real-time

---

### FEAT-010: Leaderboard & Top Performers Sections
**Effort**: 12-14h | **Priority**: P1

Build leaderboard tables (desktop) and card view (mobile), plus top performers strip.

**Files**:
- `components/games-hub/leaderboard.js` (new)
- `components/games-hub/top-performers.js` (new)
- `components/ui/responsive-table.js` (new, Radix-based)
- Modify `app/games/page.js` (add sections)

**Tasks**:
1. Create Leaderboard component:
   - Desktop: TanStack Table with columns: Rank, Avatar, Name, Wins, Win%, Streak, Points
   - Mobile (< md breakpoint): Card layout, each card shows rank badge (gold/silver/bronze for top 3), player name, points, win rate
   - Query params: period (default 'week'), limit (20), skip (0)
   - Period selector (radio buttons): Week / Month / All Time
   - Searchable by player name (filter local state)
   - Sortable by: Points (default), Win Rate, Games Played
   - Pagination: "Load More" button or infinite scroll
   - Fetch via GET /api/leaderboards/:sport_id?period=week&limit=50
2. Create TopPerformers component:
   - Grid of 5-10 performer cards
   - Each card: rank badge, avatar, name, sport, wins, win%, current streak
   - Streak indicator: "5-Game Win Streak" badge
   - Link to player profile on name click
   - Update when leaderboard refreshes (WebSocket trigger or poll)
3. Create ResponsiveTable utility component for desktop leaderboard
4. Add responsive class names (grid cols change per breakpoint)
5. Error handling: show "No players yet" if leaderboard empty

**Verification**:
- Leaderboard renders with correct columns on desktop
- Leaderboard renders as cards on mobile (< md breakpoint)
- Period filter changes period param, re-fetches data
- Search filters players by name (client-side)
- Sort by Points works correctly (highest first)
- Pagination loads 20 more players on button click
- TopPerformers updates when leaderboard recalculates

---

### FEAT-011: Player Profile Preview Modal + Social Actions
**Effort**: 10-12h | **Priority**: P1

Build player profile preview modal triggered by clicking avatars, plus follow/block actions.

**Files**:
- `components/games-hub/player-profile-preview.js` (new)
- Modify leaderboard cards and game cards to include avatar clicks

**Tasks**:
1. Create PlayerProfilePreview component:
   - Modal/popup triggered by clicking player avatar or name
   - Fetch profile via GET /api/players/:user_id/profile + GET /api/players/:user_id/stats
   - Display: profile pic, name, sports played, total games, win rate, recent results (3-4 games)
   - Show badges (50_games, 20_win_streak, mvp_favorite)
   - "Follow" button (if not followed) / "Unfollow" button (if followed)
   - "Block" button (privacy control)
   - "Challenge" or "View Full Profile" CTA
   - Loading state: skeleton loaders for stats
   - Error state: "Profile unavailable" message
2. Implement follow/unfollow logic:
   - POST /api/social/follow/:user_id → update button to "Unfollow"
   - POST /api/social/unfollow/:user_id → update button to "Follow"
   - Show toast on success/error
3. Implement block logic:
   - POST /api/social/block/:user_id → user can no longer see target's profile
   - Show confirmation dialog before blocking
4. Add avatar click handlers to:
   - Leaderboard player names
   - Game card "Players You Know" section
   - Recent results MVP
5. Responsive: modal slides up on mobile, centers on desktop

**Verification**:
- Click player avatar → profile modal opens
- Profile displays correct stats (games, wins, win rate)
- Follow button works: POST /api/social/follow, button updates to "Unfollow"
- Block button shows confirmation, POST /api/social/block succeeds
- Recent games list shows last 3-4 matches
- Error handling: blocked user cannot view profile (404 or "Private profile" message)

---

### FEAT-012: Real-Time Updates (WebSocket) + Polling Fallback
**Effort**: 18-20h | **Priority**: P1

Implement WebSocket for real-time bracket, leaderboard, and participant count updates; fallback to polling.

**Files**:
- `lib/flowternity/websocket.js` (new) - WebSocket client hook
- `app/api/ws/route.js` (new) - WebSocket server endpoint (or use external service)
- `app/games/page.js` (enhance with WebSocket integration)

**Tasks**:
1. Create useWebSocket hook (lib/flowternity/websocket.js):
   - Connect to ws://[domain]/ws/games on mount
   - Heartbeat: send ping every 30s, expect pong
   - Timeout: close if no heartbeat for 90s
   - Auto-reconnect with exponential backoff (1s → 2s → 4s → 8s, max 60s)
   - Queue local updates during disconnect, sync on reconnect
   - Subscribe to channels: game:all, tournament:[id], leaderboard:[sport_id]
   - Error handling: log errors, show "Reconnecting..." toast
2. Create WebSocket server endpoint (app/api/ws/route.js):
   - Accept WebSocket upgrades
   - Verify auth token (optional, or allow guest subscriptions)
   - Broadcast message types:
     - game:participant_joined → { gameId, newParticipantCount, timestamp }
     - game:participant_left → { gameId, newParticipantCount, timestamp }
     - match:score_updated → { tournamentId, matchId, winner, score, timestamp }
     - leaderboard:updated → { sportId, period, topRanks, timestamp }
     - announcement:new → { title, message, timestamp }
   - Error handling: invalid JSON, auth failure, unsupported actions
3. Integrate WebSocket into page:
   - Subscribe on mount, unsubscribe on unmount
   - Update game participant counts in real-time
   - Update leaderboard ranks on match completion
   - Update bracket visualization on match completion
   - Debounce UI updates (batch changes within 100ms)
4. Implement polling fallback:
   - If WebSocket unavailable (network error, timeout after 5s), switch to polling
   - Poll /api/games every 30s, /api/tournaments/:id/bracket every 30s, /api/leaderboards/:sport_id every 60s
   - Use React Query's refetchInterval for polling
5. Show UI indicator: "Reconnecting..." toast when offline, "Connected" when online

**Verification**:
- WebSocket connects on page load (verify in browser DevTools Network tab)
- Heartbeat sends every 30s (verify ping frames)
- Participant count updates in real-time when user joins (< 1s latency)
- Match score update broadcasts to all subscribers (verify broadcast logic)
- Leaderboard refreshes after match completion
- Polling fallback activates when WebSocket unavailable
- Reconnect logic works: close connection, verify auto-reconnect

---

### FEAT-013: Mobile Responsiveness + Animations + Integration Testing
**Effort**: 20-25h | **Priority**: P1

Polish mobile UX, add Framer Motion animations, and run full integration testing.

**Files**:
- `components/games-hub/*.js` (enhance all components with responsive design)
- `app/games/page.js` (ensure responsive layout)
- Integration test files (manual testing checklist)

**Tasks**:
1. Mobile responsiveness (target <md breakpoint):
   - Hero: stack stats vertically, pill layout
   - FilterBar: chip horizontal scroll OR dropdown select
   - GameCards: full width, single column
   - Leaderboard: switch to card view (rank badge, name, points, win rate)
   - Bracket: horizontal scroll container (swipe to navigate rounds)
   - Carousels: 1 visible card on mobile, swipe navigation
   - Modals: full-screen on mobile, centered on desktop
   - Use Tailwind's responsive classes (sm:, md:, lg:)
2. Add Framer Motion animations:
   - Page load: hero fades in (0.5s), stats animate 0 → target (1s staggered), content fades in (0.5s delay)
   - Bracket expand: modal slides up from bottom (mobile), center (desktop)
   - Live score update: match card pulses with accent color (200ms)
   - Filter application: games grid cross-fade (100ms)
   - Recommendation carousel: drag-to-swipe, arrow buttons
   - Hover effects: card shadow deepens, slight scale-up (1.02x)
3. Verify touch interactions:
   - Min tap target 44×44px
   - Swipe gestures on carousel (Framer Motion drag)
   - Pull-to-refresh optional enhancement (nice-to-have)
4. Performance optimization:
   - Lazy-load components not in viewport (next/dynamic)
   - Code-split tournament bracket rendering
   - Monitor render performance in React DevTools
5. Manual testing checklist:
   - Page loads without errors (console clean)
   - All sections visible and responsive (test on mobile, tablet, desktop viewports)
   - Game join flow works (free, paid, guest checkout)
   - Filter changes update games list
   - Leaderboard period filter changes data
   - Player profile modal opens and closes
   - Follow/unfollow button works
   - WebSocket updates work (or fallback to polling)
   - Animations play smoothly (no jank)
   - Error toasts display correctly
   - Pagination works (load more games, leaderboard)
6. Browser testing: Chrome, Safari, Firefox (mobile and desktop)
7. Accessibility:
   - ARIA labels on buttons, filters, modals
   - Keyboard navigation: Tab through filters → games → leaderboard
   - Color contrast meets WCAG AA (existing design)
   - Screen reader test: read page structure aloud

**Verification**:
- Page renders correctly on mobile (< sm), tablet (md), desktop (lg)
- All animations play smoothly (60fps, no jank)
- Touch interactions work (tap, swipe, long-press)
- Full manual test suite passes
- Console has no errors or warnings
- Performance metrics acceptable (Largest Contentful Paint < 3s)

---

## Digest: Files & Changes

### New Components Created

1. **components/games-hub/hero-section.js**
   - Block: HeroSection() component
   - Renders: headline, animated stats counters, CTA buttons
   - Test: Visual check on page load, counters animate

2. **components/games-hub/filter-bar.js**
   - Block: FilterBar() component
   - Props: filters, onFilterChange, availableSports
   - State: local filter state, savedFilters from localStorage
   - Test: Filter change triggers onFilterChange callback

3. **components/games-hub/enhanced-game-card.js**
   - Block: EnhancedGameCard() component
   - Extends: existing game card with social_proof overlay
   - Props: game, userFollowing, friendsPlaying, onJoin
   - Test: Renders social proof fields, join button works

4. **components/games-hub/recommendation-carousel.js**
   - Block: RecommendationCarousel() component
   - Features: swipe navigation, auto-rotate, pagination
   - Props: recommendations, loading, error
   - Test: Carousel renders correct number of visible items per breakpoint, swipe works

5. **components/games-hub/tournament-card.js**
   - Block: TournamentCard() component
   - Displays: status badge, entry fee, participant progress, countdown timer
   - Props: tournament, onViewBracket
   - Test: Status badge correct, join button enabled/disabled based on status

6. **components/games-hub/tournament-bracket.js**
   - Block: TournamentBracket() component (modal content)
   - Renders: SVG bracket tree, current round highlighted, match results
   - Props: tournament, matches
   - Test: Bracket displays all matches, current round highlighted

7. **components/games-hub/leaderboard.js**
   - Block: Leaderboard() component
   - Desktop: TanStack Table with rank, name, wins, points
   - Mobile: Card view with rank badge, player name, stats
   - Props: leaderboard, period, onPeriodChange
   - Test: Renders table on desktop, cards on mobile, period filter works

8. **components/games-hub/top-performers.js**
   - Block: TopPerformers() component
   - Grid of performer cards with streak badges
   - Props: topPlayers, period
   - Test: Cards render with correct stats, badges display

9. **components/games-hub/recent-results.js**
   - Block: RecentResults() component
   - Renders: recent game outcomes, scores, MVP
   - Props: results, loading
   - Test: Results display correct scores and MVPs

10. **components/games-hub/player-profile-preview.js**
    - Block: PlayerProfilePreview() modal component
    - Displays: profile, stats, recent games, follow/block buttons
    - Props: playerId, onClose
    - Test: Modal opens, profile data loads, follow/block buttons work

11. **components/games-hub/community-news.js**
    - Block: CommunityNews() component
    - Renders: announcements, countdowns, celebrations
    - Props: announcements, loading
    - Test: Announcements display, expired items filtered

12. **components/ui/responsive-table.js** (Optional, if needed)
    - Block: ResponsiveTable() utility component
    - Adapts Radix UI table for mobile card view
    - Test: Renders as table on desktop, cards on mobile

### New Backend Files

1. **app/api/tournaments/route.js**
   - GET: List tournaments (filters: sport_id, status, limit, skip)
   - Response: Array of tournament summaries with pagination

2. **app/api/tournaments/[id]/route.js**
   - GET: Full tournament with bracket tree structure

3. **app/api/tournaments/[id]/bracket.js**
   - GET: Optimized bracket JSON for visualization

4. **app/api/tournaments/[id]/join.js**
   - POST: User joins tournament (auth required)
   - Validation: membership check, max participants, duplicate join

5. **app/api/tournaments/[id]/matches/[match_id]/score.js**
   - POST: Post match result (admin auth required)
   - Side-effect: Auto-generate next-round match, trigger leaderboard recalc

6. **app/api/leaderboards/[sport_id]/route.js**
   - GET: Leaderboard by sport + period (week|month|all_time)
   - Pagination: limit, skip
   - Caching: 5 minutes

7. **app/api/players/[user_id]/stats.js**
   - GET: Player stats, all-time + per-sport breakdown

8. **app/api/players/[user_id]/game-history.js**
   - GET: Paginated game history for player

9. **app/api/players/[user_id]/profile.js**
   - GET: Public player profile

10. **app/api/players/batch.js**
    - GET: Multiple player profiles (max 50 IDs)

11. **app/api/social/follow.js**
    - POST: Follow user

12. **app/api/social/unfollow.js**
    - POST: Unfollow user

13. **app/api/social/block.js**
    - POST: Block user

14. **app/api/social/friends-playing.js**
    - GET: Friends in upcoming/live games

15. **app/api/recommendations/games.js**
    - GET: Recommended games (scoring algorithm)

16. **app/api/community/stats.js**
    - GET: Community stats snapshot

17. **app/api/community/recent-results.js**
    - GET: Recent completed games

18. **app/api/community/announcements.js**
    - GET: Announcements and countdowns

19. **app/api/ws/route.js** (WebSocket)
    - WebSocket connection handler for real-time updates

### New Utility Files

1. **lib/flowternity/games-hub-utils.js**
   - Functions: filterGames, sortByPoints, calculateSpotFilled, enrichGameWithSocial, getTrendingGames

2. **lib/flowternity/tournament-bracket-utils.js**
   - Functions: generateBracketJSON, calculateBracketLayout, progressMatch

3. **lib/flowternity/stats-calculator.js**
   - Functions: calculateWinRate, calculateCurrentStreak, calculatePoints, assignBadges

4. **lib/flowternity/websocket.js**
   - Hook: useWebSocket for client-side WebSocket management

5. **lib/flowternity/schemas.js**
   - Zod schemas for validation: Tournament, BracketMatch, Leaderboard, GameHistory, PlayerSocial, CommunityStats

### Modified Files

1. **app/games/page.js**
   - Refactor: Move hero section to HeroSection component
   - Refactor: Replace game cards with EnhancedGameCard
   - Add: TournamentShowcase section
   - Add: Recommendation carousels
   - Add: Leaderboard section
   - Add: TopPerformers section
   - Add: RecentResults section
   - Add: CommunityNews section
   - State: Add tournaments, leaderboards, recommendations, communityStats state
   - WebSocket: Initialize useWebSocket hook, subscribe to channels

2. **app/api/[[...path]]/route.js**
   - Modify: GET /api/games endpoint to include social_proof field

3. **lib/flowternity/config.js**
   - Add: SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'pro']
   - Add: GAME_TYPES = ['pickup', 'paid', 'tournament']
   - Add: TOURNAMENT_STATUSES = ['signups_open', 'in_progress', 'completed', 'cancelled']

---

## Build & Test Commands

**Build**: `yarn dev` (development), `yarn build && yarn start` (production)

**Manual Testing**: Open http://localhost:3000/games in browser:
- Load page, verify hero and stats render
- Apply filters, verify games list updates
- Click game, verify card details modal (existing)
- Join/leave game, verify button state changes
- Click tournament "View Bracket", verify modal opens
- Click leaderboard period filter, verify data changes
- Click player avatar, verify profile modal opens
- Resize window, verify responsive layout

**No automated tests**: Project has no test framework configured. All verification done via manual browser testing and API testing via curl/Postman.

---

## Implementation Notes

1. **Phased Delivery**: Features 1-6 are P0 (core functionality); features 7-10 are P1 (secondary); feature 13 is P1 (polish)
2. **Database Seeding**: Run seed script after first API endpoint creation to populate tournaments, leaderboards
3. **Caching Strategy**: Use React Query defaults (stale-while-revalidate), with explicit cache times per endpoint
4. **Error Handling**: All endpoints return structured error responses with errorCode for client-side handling
5. **Rate Limiting**: API should enforce rate limits (noted in design, implementation deferred to infrastructure layer)
6. **Privacy**: Player profiles public by default; block feature hides profile from blocked user
7. **Notifications**: Email notifications out of scope for hub design; backend async job required for follow/milestone emails
8. **Analytics**: Track page views, filter usage, game joins, tournament joins for optimization (future feature)

