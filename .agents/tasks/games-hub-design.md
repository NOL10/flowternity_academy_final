# Flowternity Games Hub: Premium Community Design

## Overview

Transform `/app/games/page.js` into a premium community hub that elevates the basic card-based pickup games experience into a comprehensive competitive ecosystem. The page will serve as the central destination for tournaments, competitions, leaderboards, and player engagement. This design integrates four core pillars: **Tournament Management**, **Community Intelligence**, **Rich Social Context**, and **Performance Engagement**.

The existing game join/payment flow (Razorpay integration, membership checking, guest checkout) is maintained. New functionality layers competitive depth, social proof, and recommendation engines on top of this foundation.

---

## Architecture Overview

### Page Structure & Component Hierarchy

```
GamesHub (Layout + State)
├── HeroSection
│   ├── Headline & Value Proposition
│   ├── CommunityStats (animated counters)
│   └── CallToAction
├── FilterBar
│   ├── SportFilter
│   ├── SkillLevelFilter
│   ├── GameTypeToggle (Individual/Team)
│   ├── FeeFilter
│   └── PlayerCountFilter
├── MainContent
│   ├── TournamentShowcase (Featured tournaments with brackets)
│   │   ├── TournamentCard (visual status, progress)
│   │   ├── BracketPreview (inline tournament tree)
│   │   └── StandingsPreview
│   ├── GamesSection (grouped by date, existing structure enhanced)
│   │   ├── DateHeader
│   │   └── GameCardGrid
│   │       └── EnhancedGameCard (with social proof overlay)
│   ├── RecommendationCarousel
│   │   ├── "Games You Might Like" (algorithm-based)
│   │   ├── "Friends Playing" (social layer)
│   │   └── "Trending This Week" (activity-based)
│   ├── RecentResults (recent matches/outcomes)
│   │   └── ResultCard (final scores, MVP, replays)
│   ├── TopPerformers (weekly/monthly leaderboard)
│   │   ├── PerformerCard (rank, avatar, stats)
│   │   └── MiniChart (win rate, games played)
│   └── CommunityNews (event announcements, countdowns)
└── Modals
    ├── GameDetailsPanel (expanded game info)
    ├── PlayerProfilePreview (hover/click on player)
    ├── TournamentDetailsModal
    └── GuestCheckout (existing)
```

### Component Responsibilities

**HeroSection**
- Display monthly/seasonal messaging
- Animate community stats (total games, players, win rates)
- Hero CTA buttons link to featured tournament or next available game
- Badges/icons for "Most Popular Sport This Month"

**FilterBar**
- Multi-select filters: skill level (all/beginner/intermediate/advanced/pro), sport, game type (free/paid/tournament), fee range
- Active filter count indicator
- "Clear Filters" shortcut
- Save filter preferences to localStorage for returning users

**EnhancedGameCard**
- Preserve existing card design
- Add social proof layer: "3 friends playing", "20 spots filled fast", "Trending"
- Add live participant count (WebSocket update every 30s if slot updates)
- Add quick-peek player avatars (4-5 recent confirmed participants)
- Add "Players You Know" indicator (auth-context aware)

**TournamentCard**
- Status badge: "Signups Open", "In Progress", "Completed", "Cancelled"
- Visual bracket preview (canvas or SVG, shows current round + next)
- Prize pool / entry fee display
- Participant count progress bar
- Countdown timer if signups closing soon
- "View Full Bracket" CTA opens modal

**BracketPreview / BracketModal**
- Tree visualization of tournament matches
- Current round highlighted
- Match results (if available)
- Live update capability (match results posted in real-time via WebSocket)
- Mobile: collapsible/scrollable horizontal view

**TopPerformers**
- Leaderboard component showing top 5-10 players this week/month
- Columns: Rank, Avatar, Name, Sport, Wins, Win%, Points
- Color-coded badges for streaks ("5-Game Win Streak")
- Link each player to detailed profile/game history

**RecentResults**
- Card per game showing final score, MVP, date
- Expandable replay section (video embed or match highlights)
- "Relive the action" CTA if highlights exist

**CommunityNews**
- Carousel or stacked cards for announcements
- "Tournament: Basketball Championship Begins Friday"
- "Celebration: Ravi just hit his 50th game!"
- Event countdowns (time-based)

**PlayerProfilePreview**
- Modal/popup triggered by clicking participant avatars
- Shows: Profile pic, name, sports played, total games, win rate, recent results (3-4 games)
- "Follow" button (if applicable)
- "Challenge" or "Invite to Game" CTA

---

## Data Structures & Models

### Tournament Model
```javascript
{
  _id: ObjectId,
  name: String,
  sport_id: String (e.g., 'basketball'),
  game_type: String, // 'individual' | 'team'
  status: String, // 'signups_open' | 'in_progress' | 'completed' | 'cancelled'
  start_date: Date,
  end_date: Date,
  entry_fee: Number,
  prize_pool: Number,
  max_participants: Number,
  participants: [ObjectId], // refs to users
  bracket: {
    round_number: Number,
    matches: [
      {
        match_id: String,
        round: Number,
        seed_1: ObjectId,
        seed_2: ObjectId,
        winner: ObjectId,
        score: { player_1: Number, player_2: Number },
        timestamp_completed: Date,
        replay_url: String
      }
    ]
  },
  created_at: Date,
  updated_at: Date
}
```

### Bracket Match Model
```javascript
{
  _id: ObjectId,
  tournament_id: ObjectId,
  match_number: Number,
  round: Number,
  player_1_id: ObjectId,
  player_2_id: ObjectId,
  player_1_seed: Number,
  player_2_seed: Number,
  status: String, // 'pending' | 'in_progress' | 'completed'
  score: { player_1: Number, player_2: Number },
  mvp_id: ObjectId,
  replay_url: String,
  scheduled_time: Date,
  completed_at: Date
}
```

### Leaderboard Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  sport_id: String,
  period: String, // 'week' | 'month' | 'all_time' (see Leaderboard Period Definitions below)
  period_start_date: Date, // e.g., Monday 00:00 UTC for 'week', 1st of month 00:00 UTC for 'month'
  period_end_date: Date,
  rank: Number,
  total_games: Number,
  wins: Number,
  losses: Number,
  win_rate: Number, // 0-1, calculated as wins / (wins + losses), or 0 if no games
  points: Number, // based on participation + wins
  streak: Number, // current winning streak (0 if losses, reset criteria per Streak Calculation section)
  streak_start_date: Date,
  no_shows: Number, // count of games marked 'no_show' in period
  updated_at: Date,
  calculated_at: Date // timestamp of last calculation batch job
}
```

### Leaderboard Period Definitions
- **week**: Monday 00:00 UTC to Sunday 23:59 UTC (ISO 8601 calendar week)
- **month**: 1st of month 00:00 UTC to last day of month 23:59 UTC
- **all_time**: Entire user history (no reset)
- **Timezone handling**: All calculations use UTC; client UI converts period_start_date/end_date to user's local timezone for display only

### Game History Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  game_id: ObjectId,
  sport_id: String,
  status: String, // 'confirmed' | 'no_show' | 'cancelled'
  joined_at: Date,
  final_score: { team_1: Number, team_2: Number },
  player_team: Number, // 1 or 2
  stats: {
    points_scored: Number,
    rebounds: Number,
    assists: Number,
    fouls: Number
  },
  performance_rating: Number, // 1-10 coach rating
  mvp_voted: Boolean,
  replay_url: String
}
```

### Community Stats Model
```javascript
{
  _id: ObjectId,
  period: String, // 'daily' | 'weekly' | 'all_time'
  total_games_completed: Number,
  total_active_players: Number,
  total_tournaments: Number,
  average_game_quality_score: Number, // 1-10
  trending_sport: String,
  trending_players: [ObjectId], // top 5
  most_popular_skill_level: String,
  updated_at: Date
}
```

### Social Engagement Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  followers: [ObjectId],
  following: [ObjectId],
  blocked: [ObjectId],
  recent_played_with: [ObjectId], // last 20 people
  preferred_sports: [String],
  notification_preferences: {
    friend_joining_game: Boolean,
    friend_tournament: Boolean,
    friend_milestone: Boolean
  },
  updated_at: Date
}
```

---

## API Endpoints

All endpoints return structured responses with the following schema:
```javascript
{
  success: Boolean,
  data: Object | Array | null,
  error: String | null,
  errorCode: String | null, // e.g., 'TOURNAMENT_FULL', 'AUTH_REQUIRED'
  pagination: { // included only for paginated endpoints
    limit: Number,
    skip: Number,
    total: Number,
    page: Number,
    hasMore: Boolean
  },
  meta: { // optional, included for complex responses
    calculatedAt: Date, // when data was generated
    cacheAge: Number // seconds since cache refresh
  }
}
```

Errors are returned with appropriate HTTP status codes (400 for validation, 401 for auth, 429 for rate limit, 500 for server errors) and include `errorCode` for client-side error handling (avoid generic toast messages).

### Tournament Management

**GET /api/tournaments**
- Query params: `sport_id` (optional, string), `status` (optional, one of: 'signups_open', 'in_progress', 'completed', 'cancelled'), `limit=10` (max 50), `skip=0`
- Returns: Array of tournament cards (summary view: id, name, status, start_date, prize_pool, participant_count, max_participants, entry_fee) without full bracket
- Cache: 1 minute
- Error handling: 400 if invalid status value; 429 if rate limited

**GET /api/tournaments/:id**
- Returns: Full tournament object with bracket tree structure, participant list (user objects), current standings
- Bracket structure: See Bracket Progression Specification below
- Cache: 30 seconds (refresh on match completion via WebSocket signal)
- Error handling: 404 if tournament not found

**GET /api/tournaments/:id/bracket**
- Returns: Bracket tree structure optimized for visualization:
  ```javascript
  {
    tournamentId: ObjectId,
    bracketType: String, // 'single_elimination' | 'double_elimination' | 'round_robin'
    seedingStrategy: String, // 'random' | 'ranking' | 'manual'
    totalRounds: Number,
    rounds: [
      {
        roundNumber: Number,
        matches: [
          {
            matchId: String,
            seed1: { userId, name, avatar, seed },
            seed2: { userId, name, avatar, seed } | null, // null if bye
            winner: ObjectId | null,
            score: { player1: Number, player2: Number } | null,
            scheduledTime: Date | null,
            completedAt: Date | null,
            status: String // 'pending' | 'in_progress' | 'completed' | 'bye'
          }
        ]
      }
    ],
    currentRound: Number,
    autoAdvanceRule: String // e.g., 'winner_next_round' or 'double_elim_loser_bracket'
  }
  ```
- Real-time: WebSocket subscription for live match updates
- Cache: 30 seconds
- Error handling: 404 if tournament not found

### Bracket Progression Specification
- **Type**: Single elimination (initial MVP), double elimination supported in schema but not rendered in hub
- **Seeding**: Random seeding on tournament creation; manual seeding via admin dashboard (out of scope for hub)
- **Auto-Advance**: Winner automatically advances to next round (no manual seed-in required); byes granted to odd-numbered last-seed slots
- **Bye Logic**: If round has odd participant count, highest seed gets bye to next round
- **Round Progression**: Matches must complete before round closes; admin explicitly closes round, then auto-generates next round's matches

**POST /api/tournaments/:id/join**
- Auth required
- Body: `{ user_id }`
- Pre-conditions: Check signups open, participant count < max, user has valid membership (if applicable)
- Returns: 
  ```javascript
  { 
    success: true, 
    data: { 
      tournamentId, 
      participantCount: Number, 
      seedNumber: Number // user's assigned seed
    } 
  }
  ```
- Errors:
  - 400: `{ errorCode: 'TOURNAMENT_FULL', error: 'Max participants reached' }`
  - 400: `{ errorCode: 'SIGNUPS_CLOSED', error: 'Signups closed at <timestamp>' }`
  - 400: `{ errorCode: 'DUPLICATE_JOIN', error: 'User already joined' }`
  - 402: `{ errorCode: 'MEMBERSHIP_REQUIRED', error: 'Active membership required' }`

**POST /api/tournaments/:id/matches/:match_id/score**
- Auth + Admin/Referee role required
- Body: 
  ```javascript
  { 
    winner_id: ObjectId, 
    score_1: Number, 
    score_2: Number, 
    mvp_id: ObjectId | null, 
    replay_url: String | null,
    notes: String | null
  }
  ```
- Validation:
  - `winner_id` must be one of the two seeded players (no invalid winners)
  - `score_1` and `score_2` must be non-negative integers
  - Idempotency check: If match already completed with same winner, return 200 OK (no-op)
- Returns: Updated match object + auto-generated next-round match if applicable
- Side-effect: Trigger leaderboard recalculation for both players via background job
- Errors:
  - 401: Not authenticated or insufficient role
  - 400: `{ errorCode: 'INVALID_WINNER', error: 'Winner not seeded in match' }`
  - 409: `{ errorCode: 'BRACKET_CONFLICT', error: 'Conflicting result posted; admin retrigger required' }`
- Real-time: Broadcast match completion via WebSocket to all subscribers

### Leaderboards & Performance

**GET /api/leaderboards/:sport_id**
- Query params: `period=week|month|all_time` (required, must be one of these three), `limit=50` (optional, max 100), `skip=0`
- Returns: 
  ```javascript
  {
    success: true,
    data: [
      {
        rank: Number,
        user: { _id, name, avatar, bio },
        wins: Number,
        losses: Number,
        win_rate: Number,
        streak: Number,
        points: Number,
        gamesThisPeriod: Number
      }
    ],
    pagination: { limit, skip, total, page, hasMore },
    meta: { 
      periodStart: Date,
      periodEnd: Date,
      calculatedAt: Date 
    }
  }
  ```
- Pagination: Consistent across all list endpoints (limit=50 default, max 100, returns hasMore flag)
- Cache: 5 minutes
- Error handling: 400 if invalid period; 429 if rate limited

**GET /api/players/:user_id/stats**
- Returns: Comprehensive player stats object (all-time + breakdown by sport)
  ```javascript
  {
    success: true,
    data: {
      userId: ObjectId,
      profile: { name, avatar, bio, joinDate },
      allTime: {
        totalGames: Number,
        wins: Number,
        losses: Number,
        winRate: Number,
        currentStreak: Number,
        points: Number
      },
      bySport: [
        {
          sport: String,
          totalGames: Number,
          wins: Number,
          losses: Number,
          winRate: Number,
          currentRank: Number // in that sport's leaderboard
        }
      ],
      recentMatches: [ // last 10
        {
          gameId: ObjectId,
          opponent: { _id, name, avatar },
          sport: String,
          result: String, // 'win' | 'loss' | 'no_show'
          date: Date,
          replay_url: String | null
        }
      ],
      performanceTrend: [
        { date: Date, winRate: Number } // last 30 days, daily
      ]
    }
  }
  ```
- Cache: 10 minutes
- Error handling: 404 if user not found

**GET /api/players/:user_id/game-history**
- Query params: `sport_id` (optional, filters by sport), `limit=20` (optional, max 50), `skip=0`
- Returns: 
  ```javascript
  {
    success: true,
    data: [
      {
        gameId: ObjectId,
        sport: String,
        date: Date,
        opponent: { _id, name, avatar },
        result: String, // 'win' | 'loss' | 'no_show'
        score: { myScore: Number, theirScore: Number },
        mvpVoted: Boolean,
        replay_url: String | null,
        stats: { points: Number, rebounds: Number, assists: Number }
      }
    ],
    pagination: { limit, skip, total, page, hasMore }
  }
  ```
- Pagination: Consistent format across endpoints
- Cache: 10 minutes
- Error handling: 404 if user not found; 400 if invalid sport_id

**GET /api/players/:user_id/profile**
- Returns: Public player profile
  ```javascript
  {
    success: true,
    data: {
      userId: ObjectId,
      name: String,
      avatar: String,
      bio: String,
      joinDate: Date,
      sportsPlayed: [String],
      statsSnapshot: {
        totalGames: Number,
        winRate: Number,
        currentStreak: Number
      },
      followerCount: Number,
      followingCount: Number,
      badges: [String], // e.g., ['50_games', '20_win_streak', 'mvp_favorite']
      isFollowedByMe: Boolean, // if auth'd
      isBlocked: Boolean // if auth'd and user blocked me
    }
  }
  ```
- Cache: 5 minutes
- Error handling: 404 if user not found

### Social & Engagement

**GET /api/social/friends-playing**
- Auth required
- Returns: Array of users (from auth.user.followed_players) with upcoming/live games
  ```javascript
  {
    success: true,
    data: [
      {
        userId: ObjectId,
        name: String,
        avatar: String,
        gamesJoined: [
          {
            gameId: ObjectId,
            sport: String,
            startTime: Date,
            location: String,
            participantCount: Number,
            maxParticipants: Number
          }
        ]
      }
    ]
  }
  ```
- Cache: 1 minute
- Error handling: 401 if not authenticated

**POST /api/social/follow/:user_id**
- Auth required
- Body: empty
- Returns: 
  ```javascript
  { 
    success: true, 
    data: { 
      followedUserId: ObjectId, 
      newFollowerCount: Number 
    } 
  }
  ```
- Side-effect: Send notification to followed user (async job)
- Errors: 400 if trying to follow self; 404 if user not found
- Email scope: Notification sent if user has email_on_new_follower=true (preference check)

**POST /api/social/unfollow/:user_id**
- Auth required
- Body: empty
- Returns: `{ success: true, data: { newFollowerCount: Number } }`
- Errors: 400 if user not followed; 404 if user not found

**POST /api/social/block/:user_id**
- Auth required
- Returns: Blocks user from seeing my profile, game results, etc.
- Idempotency: Multiple block calls on same user return 200 OK

**GET /api/recommendations/games**
- Auth required
- Query: `limit=10` (max 20)
- Returns: Recommended games ranked by likelihood of join
  ```javascript
  {
    success: true,
    data: [
      {
        gameId: ObjectId,
        sport: String,
        startTime: Date,
        location: String,
        fee: Number,
        skillLevel: String,
        reason: String, // e.g., 'Your favorite sport', 'Friends playing', 'Trending this week'
        friendsPlaying: Number, // count of followed users joining
        pastAcceptanceRate: Number // how often user accepts similar games (0-1)
      }
    ]
  }
  ```
- Recommendation algorithm:
  - **Input factors**: User's played sports, skill level history, friends' joined games, trending games this week, user's past booking times (inferred from game history)
  - **Scoring formula**: 
    - Base score = 0
    - +30 if sport matches user's top 3 sports
    - +20 if time matches user's typical game times (inferred: if user has 10+ games, avg game time ± 2 hours)
    - +25 if 2+ friends playing
    - +15 if trending (top 5 games by joins this week)
    - +10 if skill level matches user's recent performance
  - **Filtering**: Remove games user already joined, games in past, games at full capacity
  - **Ordering**: Sort by score descending, then by startTime ascending
- Cache: 15 minutes per user (refresh after game join)
- Error handling: 401 if not authenticated; 400 if time inference fails (return generic recommendations)

### Community Stats & Feeds

**GET /api/community/stats**
- Query: `period=week|month|all_time` (required)
- Returns: Community stats snapshot
  ```javascript
  {
    success: true,
    data: {
      period: String,
      periodStart: Date,
      periodEnd: Date,
      totalGamesCompleted: Number,
      totalActivePlayers: Number,
      totalTournaments: Number,
      averageGameQualityScore: Number, // 1-10
      trendingSport: String, // sport with most games this period
      topPerformersThisPeriod: [ // top 5
        { userId, name, avatar, points, wins }
      ]
    },
    meta: { calculatedAt: Date }
  }
  ```
- Cache: 1 hour (or update via background job on game completion)
- Error handling: 400 if invalid period

**GET /api/community/recent-results**
- Query: `limit=20` (max 50), `skip=0`
- Returns: Last 20 completed games with final scores, MVP, date
  ```javascript
  {
    success: true,
    data: [
      {
        gameId: ObjectId,
        sport: String,
        date: Date,
        finalScore: { team1: Number, team2: Number },
        winner: String, // 'team_1' | 'team_2' | 'tie'
        mvpUserId: ObjectId | null,
        mvpName: String | null,
        replayUrl: String | null,
        participantCount: Number
      }
    ],
    pagination: { limit, skip, total, page, hasMore }
  }
  ```
- Cache: 5 minutes
- Error handling: 400 if invalid limit/skip

**GET /api/community/announcements**
- Returns: Array of announcements, countdowns, news
  ```javascript
  {
    success: true,
    data: [
      {
        id: String,
        type: String, // 'tournament_launch' | 'milestone' | 'alert' | 'countdown'
        title: String,
        message: String,
        icon: String, // URL
        actionUrl: String | null,
        createdAt: Date,
        expiresAt: Date | null
      }
    ]
  }
  ```
- Cache: 30 minutes
- Error handling: None (always returns at least empty array)

**GET /api/games** (existing endpoint, enhanced)
- Same response structure, with added `social_proof` object per game:
  ```javascript
  social_proof: {
    friendsPlaying: [
      { userId, name, avatar }
    ],
    spotFilledPercent: Number, // 0-100
    trendingIndicator: Boolean, // true if top 10 games by joins this week
    participantAvatars: [String], // 4-5 recent joiners
    isParticipantCountFresh: Boolean // true if updated within last 30s
  }
  ```
- Add WebSocket channel for participant count updates (see Live Updates section)

### Live Updates (WebSocket)

**Connection**: `ws://[domain]/ws/games`

**Connection Management**:
- **Heartbeat**: Server sends heartbeat ping every 30 seconds; client responds with pong
- **Timeout**: Client closes connection if no heartbeat received for 90 seconds, auto-reconnects with exponential backoff (1s → 2s → 4s → 8s, max 60s)
- **Reconnection**: On disconnect, queue local updates; on reconnect, sync queued state by fetching latest data
- **Acknowledgment**: Each message from client includes `messageId`; server echoes back in acknowledgment frame

**Client Subscribe (after connect)**:
```javascript
{
  action: 'subscribe',
  channels: ['game:all', 'tournament:' + tournamentId, 'leaderboard:' + sport_id]
}
```

**Server Message Types**:
- `game:participant_joined` → { gameId, newParticipantCount, joinedUserId, timestamp }
- `game:participant_left` → { gameId, newParticipantCount, leftUserId, timestamp }
- `game:status_changed` → { gameId, newStatus, timestamp } // e.g., 'cancelled'
- `match:score_updated` → { tournamentId, matchId, winner, score, timestamp }
- `match:completed` → { tournamentId, matchId, winner, nextMatchId, timestamp }
- `leaderboard:updated` → { sportId, period, topRanks: [{ rank, userId, points }], timestamp }
- `announcement:new` → { announcementId, title, message, timestamp }

**Error Handling**:
- **Malformed message**: Server returns `{ error: 'INVALID_MESSAGE', details: String }`
- **Auth failure**: Server closes connection with code 4001
- **Unsupported action**: Server returns `{ error: 'UNSUPPORTED_ACTION', action: String }`

**Client Best Practices**:
- Validate incoming data (timestamps, IDs)
- Debounce UI updates (e.g., batch participant count changes within 100ms)
- Fallback to polling if WebSocket unavailable (see Polling Fallback section)

---

## State Management & Data Flow

### Component State
- Global auth context (existing `useAuth`) extended to include:
  - `user.followed_players` (list of IDs)
  - `user.game_preferences` (sports, skill level, fee tolerance)
  
- Local page state:
  ```javascript
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [communityStats, setCommunityStats] = useState({});
  const [filters, setFilters] = useState({
    sport: 'all',
    skillLevel: 'all',
    gameType: 'all',
    feeRange: { min: 0, max: null },
    playerCount: { min: 2, max: null }
  });
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  ```

### Data Fetching Strategy
- Page load: Parallel requests for games, tournaments, stats, leaderboard
- Use React Query (already in deps) for caching + refetching
- Filters: Client-side pre-filtering from cached data, API refetch on changes
- WebSocket: Subscribe to game updates on mount, unsubscribe on unmount
- Polling fallback: If WebSocket unavailable, poll `/api/games` every 30s with React Query `refetchInterval`
- Batch fetching: Use `Promise.all()` for independent endpoints; chain dependent requests

### Polling Fallback Strategy
- If WebSocket cannot connect (networkError or timeout after 5s), client switches to polling mode
- Poll `/api/games`, `/api/tournaments`, `/api/leaderboards` every 30s via React Query
- Include `pollMode: true` in request headers so backend can skip real-time enrichment if needed
- Return to WebSocket if `navigator.onLine` becomes true and retry succeeds

### Cache Invalidation Triggers
- **Games list**: Invalidate when:
  - User joins/leaves game (immediate)
  - Participant count changes received via WebSocket (immediate if WebSocket, else next poll)
  - User's filter changes (immediate)
  - Time-based: 5 minute background invalidation
- **Leaderboards**: Invalidate when:
  - Match score posted (WebSocket: `match:score_updated` triggers backend job, client refetch after 3s)
  - Period changes (period_start_date rolls over, i.e., Monday 00:00 UTC)
  - User's stats updated (received via WebSocket)
  - Time-based: 5 minute background invalidation
- **Recommendations**: Invalidate when:
  - User joins/leaves game (immediate)
  - Daily refresh at random hour (prevent thundering herd)
  - Trending sport changes detected (via community stats poll)
- **Tournament bracket**: Invalidate when:
  - Match completed (WebSocket: `match:score_updated`)
  - Round progression triggered by admin
- **Player stats**: Invalidate when:
  - User joins/leaves game (immediate for self, 5min for others)
  - Game marked complete with final score
- **Community stats**: Invalidate when:
  - Game marked complete (batch job, cache updates within 5 minutes)
  - Leaderboard recalculated (triggered after batch of game completions)
- **Announcements**: Invalidate hourly or when new announcement created by admin

---

## UI/UX Design Patterns

### Hero Section Animation
- Fade-in counters on page load (0-value to final count, 1s duration)
- Icons pulse or briefly glow when counter reaches target
- Text uses display font (consistent with existing design)
- CTA buttons have hover state with accent color accent

### Transitions & Animations
- Card hover: Shadow deepens, slight scale-up (1.02x)
- Bracket expand: Smooth height transition, fade in matches
- Filter chip toggle: Background fade (100ms)
- Player avatar hover: Scale to 1.1, show name tooltip
- Leaderboard rank change: Highlight row briefly (200ms green flash)

### Mobile Responsiveness
- Hero: Single column, "pill" stats stack vertically
- FilterBar: Horizontal scroll chip container or dropdown select on small screens
- Game cards: Full width on mobile, 2 cols on tablet, 3 cols on desktop
- Bracket: Horizontal scroll container (fixed height, overflow-x auto)
- Leaderboard table: Horizontal scroll or simplified card view on mobile

### Loading States
- Skeleton loaders for games grid, tournament cards, leaderboard
- Animate skeleton pulse (opacity 0.7 → 1 → 0.7, 1.5s loop)
- Hero stats: Show "--" until data loads

### Empty States
- No tournaments: "Check back when tournaments launch"
- No games this week: "Browse our full schedule" link
- No tournament results: "Matches will appear here once they complete"

---

## Mobile Responsiveness Strategy

**Breakpoints** (Tailwind defaults, already in project):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile Responsiveness
**Leaderboard Mobile View**:
- At `<md` breakpoint: Switch from table to card layout
- Each card shows: Rank badge (colored: gold/silver/bronze for top 3), player avatar, name, points, win rate, current streak
- Cards stack vertically, full width, padding 12px
- Sortable by: Points (default), Win Rate, Games Played (radio buttons at top)
- Searchable by player name (input field)
- Height: Fixed-height cards (120px) with overflow hidden, tappable for full profile

**Bracket Mobile View**:
- At `<md` breakpoint: Horizontal scrollable SVG/canvas bracket
- Each round rendered as column, width 160px per column
- Swipe left/right to navigate rounds
- Match cards show: Seed 1 avatar + name, "vs", Seed 2 avatar + name
- Score shown if match completed
- Current round highlighted with background color
- Pinch-to-zoom supported for very large brackets (100+ matches)

**Carousel Mobile View** (Recommendation & Community News):
- Touch-based swipe gesture (use Framer Motion `drag` prop)
- Show 1 card at a time on mobile, 3 cards on desktop
- Visible items: `<sm`: 1, `sm`: 1.5, `md`: 2, `lg`: 3
- Auto-rotate: 5 second interval (pause on user interaction)
- Gesture library: Use Framer Motion built-in drag detection (no external library)
- Indicators: Dot pagination below carousel

**Touch-Friendly**:
- Min tap target 44×44px (buttons, chips)
- Increased padding around interactive elements
- Swipe to dismiss modals
- Pull-to-refresh for games list (optional, nice-to-have)

---

## Animation & Transition Approach

**Framework**: Use Framer Motion (already in deps) for complex animations, Tailwind transitions for simple state changes.

**Key Animations**:
1. **Page Load Entrance**:
   - Hero fades in top (0.5s)
   - Stats counters animate from 0 (1s, staggered)
   - Content fades in bottom (0.5s delay)

2. **Bracket Expansion**:
   - Modal slides up from bottom on mobile, center on desktop
   - Bracket tree fades in section by section (staggered by round)
   - Match cards have 100ms stagger between them

3. **Live Score Update**:
   - Affected match card pulses with accent color (200ms)
   - Leaderboard rank reorders with smooth slide transition

4. **Filter Application**:
   - Games grid cross-fades (100ms) on filter change
   - Active filters have underline animation

5. **Recommendation Carousel**:
   - Swipe/arrow navigation, cards slide out/in
   - Drag to scroll on mobile, swipe gestures

**Transitions**:
- Hover effects: 150-200ms ease-out
- State changes: 100-200ms ease-in-out
- Page transitions: 300-500ms (if using Next.js page transition)

---

## Player Profile Enrichment & Social Graph

### Player Profile Data
- **Basic**: Name, avatar, joined date, city
- **Performance**: Total games, wins, losses, win rate, current streak
- **Social**: Followers, following, mutual friends with current user
- **Activity**: Last game date, games this month, preferred sports
- **Achievements**: Badges (e.g., "50 Games", "20-Game Streak", MVP votes)

### Social Graph Features
1. **Follow/Unfollow**:
   - Click player name → opens profile modal
   - "Follow" button in profile
   - Persists to `user.followed_players` array
   - **Privacy controls**: If user has privacy_setting='private', only shows "Follow" button to mutual followers (implemented backend auth check)
   
2. **Friends Playing Indicator**:
   - Fetch followed players participating in each game
   - Display as "3 friends joining" on game card
   - Click to see list and join them

3. **Blocking**:
   - User can block another user; blocked user cannot see blocker's profile, stats, or game participation
   - Blocking is non-mutual (A blocks B does not mean B blocks A)
   - Blocked user cannot send follow requests; receive no notifications

### Data Enrichment on Page Load
- Fetch `user.followed_players` from auth context (or if missing, fetch from `/api/social/profile`)
- Batch fetch player stats for followed players:
  - If > 1 followed player, use `/api/players/batch?userIds=id1,id2,id3` (batch endpoint, max 50 IDs)
  - If backend doesn't support batch endpoint, fetch sequentially with 100ms delay between requests to avoid overwhelming server
- Enrich game cards with friend participation data in O(n) client-side join

### Social Engagement Model (Privacy-Aware)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  followers: [ObjectId], // users following this person
  following: [ObjectId], // users this person follows
  blocked: [ObjectId], // users blocked by this person
  blockedBy: [ObjectId], // users who blocked this person
  recent_played_with: [ObjectId], // last 20 people, excluding blocked users
  preferred_sports: [String],
  privacy_setting: String, // 'public' | 'private' (private = profile visible to followers only)
  notification_preferences: {
    email_on_new_follower: Boolean,
    email_on_friend_joining_game: Boolean,
    email_on_friend_tournament: Boolean,
    email_on_friend_milestone: Boolean,
    frequency_cap: String // 'daily' | 'weekly' | 'never'
  },
  updated_at: Date
}
```

---

## Community Stats Calculation Logic

### Streak Calculation (Backend, owned by Leaderboard Service)
```javascript
function calculateCurrentStreak(userGameHistory, sport_id, period) {
  // userGameHistory: array of games sorted by date DESC (newest first)
  // Returns: { streak: Number, streakStartDate: Date, noShowImpact: Boolean }
  
  const periodGames = userGameHistory.filter(g => 
    g.sport_id === sport_id && 
    g.date >= period.start && 
    g.date <= period.end
  );
  
  let streak = 0;
  let streakStartDate = null;
  
  for (const game of periodGames) {
    if (game.status === 'no_show') {
      // No-show breaks streak
      break;
    }
    if (game.status === 'confirmed' && game.playerWon === true) {
      streak++;
      if (streakStartDate === null) {
        streakStartDate = game.date;
      }
    } else if (game.status === 'confirmed' && game.playerWon === false) {
      // Loss breaks streak
      break;
    }
  }
  
  return { 
    streak, 
    streakStartDate: streakStartDate || new Date(),
    noShowImpact: periodGames.some(g => g.status === 'no_show')
  };
}
```
- **Reset criteria**: Streak resets on loss OR no_show
- **Timezone handling**: All dates stored in UTC; period boundaries calculated in UTC
- **No-show impact**: Breaks streak immediately; flagged in leaderboard for transparency
- **Calculation trigger**: After each game completion, recalculate user's streak for affected period

### Calculations (Backend, cached in Leaderboard collection)

**Per-User Stats (Daily Refresh at 02:00 UTC)**:
```javascript
{
  total_games: COUNT(game_history WHERE user_id=x AND status='confirmed'),
  wins: COUNT(game_history WHERE user_id=x AND status='confirmed' AND playerWon=true),
  losses: COUNT(game_history WHERE user_id=x AND status='confirmed' AND playerWon=false),
  no_shows: COUNT(game_history WHERE user_id=x AND status='no_show'),
  win_rate: wins / (wins + losses) || 0,
  current_streak: calculateCurrentStreak(...),
  points: (wins * 10) + (total_games * 1) + (mvp_votes * 5)
}
```

**Leaderboard (Hourly Refresh at :00 of each hour UTC)**:
- Sort all users by points DESC within each sport + period combination
- Assign rank = row number
- Store in `leaderboards` collection for fast queries
- Tie-breaking: If two users have same points, higher by wins, then by win_rate

**Community Stats (Hourly Refresh)**:
- Total games: SUM(games WHERE status='completed' AND date in period)
- Active players: COUNT(DISTINCT user_id WHERE played >= 1 game in period)
- Trending sport: Sport with MAX(game count) in period
- Top performers: Top 5 by points in period
- Average quality: AVG(game quality_score) where quality_score = feedback average or coach rating

**Anomaly Detection** (Daily audit job):
- Flag users with win_rate > 95% for review (potential skill mismatch or collusion)
- Flag games with > 3 no-shows for follow-up
- Flag tournaments with no matches completed past scheduled end time

### Update Triggers
- **Immediate**: On game completion, mark game status='completed', queue async job
- **Async job** (within 30s): 
  - Update affected user's stats
  - Invalidate leaderboard cache
  - Broadcast leaderboard update via WebSocket
- **Batch job** (hourly): Recalculate entire leaderboard collection for consistency
- **Real-time**: Dashboard subscribed to WebSocket receives rank changes immediately

---

## Edge Cases & Error Handling

### Game Join/Leave

- **Case**: User joins full game
  - Condition: Participant count ≥ max_players
  - Response: 400 error with `{ errorCode: 'GAME_FULL', error: 'Game is full' }`
  - UI: Disable join button, show "Full" badge
  - Recovery: Not recoverable; user must choose different game

- **Case**: Paid game, user has no active membership + not logged in
  - Condition: !user AND is_paid AND fee > 0
  - Response: Show guest checkout modal
  - Fallback: If guest closes modal or checkout fails, show "Login Required" banner
  - Recovery: User logs in or completes guest checkout

- **Case**: Tournament joins close during signup window
  - Condition: Current time > tournament.signup_close_time
  - Timezone spec: Signup close time specified in tournament creation (UTC assumed); client converts to local time display
  - Response: 400 error `{ errorCode: 'SIGNUPS_CLOSED', error: 'Signups closed at 2025-01-15T18:00:00Z' }`
  - Grace period: None (hard cutoff; clarify with product if needed)
  - UI: Show "Signups Closed" chip, hide join button, explain close time
  - Recovery: Not recoverable for this tournament; user joins next tournament

### Data Consistency

- **Bracket mismatch**: If match winner is not one of the seeded players
  - Validation: `winner_id IN [seed_1, seed_2]`
  - Response: 400 error `{ errorCode: 'INVALID_WINNER', error: 'Winner not seeded in match' }`
  - Recovery: Admin retries with correct winner
  - Logging: Log admin ID and attempted winner for audit

- **Bracket conflict**: If two admins post conflicting results for same match (race condition)
  - Scenario: Admin A posts "Player X wins 10-8", then Admin B posts "Player Y wins 12-10" for same match
  - Handling: Database constraint (unique tournament_id + match_id + completed_at ensures last-write-wins) 
    OR explicit conflict detection (check match.completed_at is null before updating)
  - Response: 409 error `{ errorCode: 'BRACKET_CONFLICT', error: 'Another admin posted result. Refresh and retry.' }`
  - Recovery: Admin reviews latest result, can post override if authorized
  - Audit: Log all conflicting posts for review

- **Participant count divergence**: If game shows 5 spots but 7 confirmed players
  - Root cause: Race condition in join logic or data corruption
  - Detection: Nightly audit job; if count mismatch > 2, flag
  - Sync: On any join/leave, recalculate count from `participants` array in DB (source of truth)
  - Recovery: Automated: recalculate count; if divergence persists, admin investigates
  - Logging: Log detected divergence with game ID and timestamp

### Real-Time Sync

- **WebSocket disconnection**: 
  - Scenario: Client loses network connection mid-page view
  - Detection: No heartbeat received for 90s
  - Client action: Auto-close connection, attempt reconnect with exponential backoff
  - Queue: Store local updates (e.g., "user tried to join game X") in local state
  - Sync on reconnect: Fetch latest data via API (don't replay queued joins, verify success via API response)
  - UI: Show "Reconnecting..." toast, disable join buttons during reconnect attempt
  - Recovery: Automatic; no user action needed

- **Stale data**: Client has cached game count = 10, but server has updated to 12
  - Prevention: Include `updated_at` timestamp in API responses
  - Detection: Client checks `updated_at` vs local cache age
  - Staleness threshold: If cache age > 5 minutes, warn user and offer refresh
  - Recovery: User clicks refresh or automatic refetch after 5 min

- **Concurrent edits**: Two users simultaneously click join for last spot
  - Scenario: Game has 1 spot left; User A and User B both click join within 100ms
  - Database handling: Unique constraint on (game_id, user_id) prevents duplicate; first wins
  - Response: User A gets 200 OK (joined); User B gets 400 error `{ errorCode: 'GAME_FULL', ... }`
  - UI: Both users see join button disabled immediately after click; B sees full game notification
  - Recovery: User B sees other games or joins waitlist (if implemented)

### Missing/Invalid Data

- **Tournament with no bracket**: 
  - Condition: Tournament.status='in_progress' but bracket.rounds is empty
  - Response: GET /api/tournaments/:id returns bracket: null
  - UI: Show "Bracket coming soon" message, don't render BracketModal
  - Root cause: Admin hasn't generated bracket after signups close
  - Recovery: Admin generates bracket via dashboard (out of scope for hub)

- **Player with no stats**: 
  - Condition: User exists but never played a game
  - Initialization: On profile creation, create Leaderboard docs with defaults:
    ```javascript
    { wins: 0, losses: 0, win_rate: 0, streak: 0, points: 0, rank: null }
    ```
  - UI: Show "No games played yet" on profile
  - Recovery: Auto-created on first game completion

- **Game with no host name**: 
  - Condition: game.host_id points to deleted user
  - Response: GET /api/games returns host: { _id: null, name: 'TBD' }
  - UI: Show "TBD" as host name
  - Recovery: Nightly job cleans up orphaned games or assigns to system admin account

- **Recommendation with missing sport**: 
  - Condition: Recommendation algorithm returns game_id but sport_id no longer exists
  - Response: Filter out; don't include in results
  - Logging: Log as anomaly for investigation
  - Recovery: Next recommendation refresh will rebuild list

### API Error Handling & Messaging

- **Rate limit (429)**:
  - Response: 
    ```javascript
    { 
      errorCode: 'RATE_LIMITED', 
      error: 'Too many requests. Try again in 30 seconds.',
      retryAfter: 30 // seconds
    }
    ```
  - UI: Show toast with countdown timer "Retry in 30s"
  - Recovery: Client retries after retryAfter seconds

- **Auth failure (401)**:
  - Response: 
    ```javascript
    { 
      errorCode: 'AUTH_REQUIRED', 
      error: 'Please log in to continue'
    }
    ```
  - UI: Redirect to login page or show login modal
  - Recovery: User logs in

- **Server error (500)**:
  - Response: 
    ```javascript
    { 
      errorCode: 'INTERNAL_SERVER_ERROR', 
      error: 'Something went wrong. Please try again.',
      errorId: 'err_12345abcde' // unique ID for support
    }
    ```
  - UI: Show generic toast with errorId; suggest user screenshot errorId
  - Logging: Log to Sentry with errorId for backend team to investigate
  - Recovery: User retries after 5 seconds; if persists, contact support with errorId

- **Network timeout (no response after 30s)**:
  - Client action: Abort request, return `{ success: false, error: 'Network timeout' }`
  - UI: Show toast "Connection lost, trying again..."
  - Retry: React Query auto-retries 3 times with exponential backoff (1s, 2s, 4s)
  - Recovery: If all retries fail, show "Failed to load. Check your connection."

- **Invalid input (400)**:
  - Response includes specific errorCode (e.g., `INVALID_PERIOD`, `INVALID_SPORT_ID`)
  - UI: Use errorCode to show targeted message, not generic "Bad request"
  - Example: If user sends `period=invalid`, show "Period must be 'week', 'month', or 'all_time'"
  - Recovery: User corrects input and retries

---

## Testability & Implementation Notes

### Unit-Testable Units
- Filter logic: Pure function filters games array by criteria
- Leaderboard sort: Sort function by points, handle ties
- Streak calculation: Given game history, compute current streak
- Win rate: Division with zero-check
- Recommendation algorithm: Mock user profile, verify returned games match criteria

### Integration-Testable Flows
- Join free game → verify DB update, game card reflects change
- Join paid game + guest → Razorpay flow → verify booking confirmed
- Post bracket match result → verify leaderboard refreshes → verify WebSocket broadcasts
- Filter apply → verify API called with correct params, results filtered client-side

### E2E Test Scenarios
- User navigates to games page, sees hero + stats
- User filters by sport, results update
- User clicks game, game details modal opens
- User joins game, participant count increments, join button disables
- User clicks player avatar, profile preview opens
- User views tournament bracket, bracket renders correctly
- Tournament match completes (admin posts score), bracket updates, leaderboard refreshes

### Hard-to-Test Areas
- **WebSocket real-time**: Mock WebSocket server for tests (use `jest-websocket-mock` or similar)
- **Animation timing**: Test rendered state after animations, not animation itself
- **Responsive design**: Test breakpoints with viewport size manipulation
- **Performance**: Measure component render time with React DevTools Profiler

---

## Component Responsibilities & State Location

| Component | State | Props | Responsibility |
|-----------|-------|-------|---|
| GamesHub | games, tournaments, filters, leaderboard, stats, pageMode ('online'\|'offline')\|fetchError | - | Orchestrate data fetching, WebSocket, handle errors, pass to children |
| HeroSection | - | stats, activeUsers, loading | Display animated community stats; show loading skeleton |
| FilterBar | filters (local), savedFilters, filterValidationErrors | filters, onFilterChange, availableSports, membershipStatus | Manage & broadcast filter changes; validate against current config; show validation errors for invalid saved filters |
| GameCardGrid | - | games, loading, onGameJoinAttempt | Render game cards; handle join errors |
| EnhancedGameCard | joinLoading, joinError | game, userFollowing, friendsPlaying, onJoin | Display game + social proof; show join loading state and errors |
| TournamentCard | expandBracket (local) | tournament, onExpand | Display tournament + status; disabled if bracket not available |
| BracketModal | bracketLoading, bracketError, roundFilter | tournament, matches | Render bracket tree; handle WebSocket score updates; show load errors |
| Leaderboard | period (local), sortBy (local), searchQuery (local) | leaderboard, loading, error | Display ranked players; sortable and searchable; show period boundaries in UI |
| TopPerformers | - | topPlayers, period, loading | Display top 5-10 performers; indicate streak with badge |
| RecentResults | - | results, loading | Display recent game outcomes; fetch replays on-demand |
| PlayerProfilePreview | profileLoading, profileError, followLoading | playerId, isFollowed, onFollow, onBlock | Fetch & display player profile; handle follow/block errors; show loading states |
| RecommendationCarousel | carouselIndex (local), algorithmStatus | recommendations, loading, error | Display + navigate recommendations; show if algorithm unavailable |
| CommunityNews | - | announcements, loading | Display announcements; filter expired ones client-side |
| FilterBar (saved filters) | invalidFilters (list of IDs) | - | Validate saved filters on load; show "Filter no longer valid" if: sport_id removed from SPORTS config, membershipStatus changed, skillLevel outside available range; offer reset |

---

## File Structure & New Components

### New Component Files
```
components/
├── games-hub/
│   ├── hero-section.js
│   ├── filter-bar.js
│   ├── tournament-card.js
│   ├── tournament-bracket.js (reusable bracket visualization)
│   ├── enhanced-game-card.js
│   ├── leaderboard.js
│   ├── top-performers.js
│   ├── recent-results.js
│   ├── player-profile-preview.js
│   ├── recommendation-carousel.js
│   └── community-news.js
└── ui/
    ├── skeleton.js (loading placeholder)
    └── responsive-table.js (for leaderboard on desktop)
```

### Existing Files to Modify
- `app/games/page.js`: Refactor into section components, add state orchestration
- `lib/flowternity/config.js`: Add game types, skill levels, tournament statuses
- `app/api/...`: Add new API endpoints listed above (backend scope, not detailed here)

### New Utility Files
```
lib/flowternity/
├── games-hub-utils.js (filter, sort, recommendation logic)
├── tournament-bracket-utils.js (bracket generation, match progression)
├── stats-calculator.js (win rate, streaks, leaderboard ranks)
└── websocket.js (WebSocket client hook, reconnect logic)
```

---

## Technology Stack (Locked)

- **Frontend**: Next.js 15.5, React 18.3 (client components, `'use client'`)
- **UI**: Radix UI (Dialog, Avatar, etc.), Tailwind CSS 3.4, Tailwind Animate
- **Animation**: Framer Motion 11.18 (complex animations), Tailwind transitions
- **State**: React hooks (useState, useContext), TanStack React Query 5.56 (data fetching + caching)
- **Icons**: Lucide React 0.516
- **Forms**: React Hook Form 7.58 (for any player profile modals)
- **Realtime**: WebSocket (native Web API), fallback to polling via TanStack Query
- **Payment**: Razorpay (existing, for paid tournaments)
- **Styling**: CSS Modules (optional) + Tailwind (primary)

---

## Performance Considerations

1. **Code Splitting**: Each section component lazy-loaded if not in viewport
2. **Image Optimization**: Use `next/image` for player avatars, tournament hero images
3. **Data Pagination**: Leaderboards, game history paginated (load 20, "load more")
4. **API Caching**: React Query with stale-while-revalidate strategy
5. **WebSocket Efficiency**: Only subscribe to games user can see, unsubscribe on page leave
6. **Bracket Rendering**: Use SVG for large tournaments (100+ matches), canvas as fallback
7. **Animation Performance**: Use transform + opacity (GPU-accelerated), avoid layout-thrashing
8. **Bundle Size**: Monitor impact of Framer Motion, consider tree-shaking unused animations

---

## Security Considerations

1. **Data Privacy**: Player stats are public, but game history shows only confirmed participants (no sensitive details)
2. **CORS**: API calls use `credentials: 'include'` (existing pattern)
3. **Input Validation**: All filter params validated server-side before DB query
4. **Rate Limiting**: API enforces rate limits per user (e.g., 100 requests/minute)
5. **Bracket Results**: Only admins/referees can post match scores (auth check server-side)
6. **Player Blocking**: Implement ability to block users from viewing your profile (future)

---

## Assumptions & Decisions

1. **Tournaments exist in DB**: Design assumes tournament collection is populated (admin seeding)
2. **Player stats are pre-calculated**: Performance stats cached hourly (not real-time calculated)
3. **WebSocket optional**: Fallback to polling if WebSocket unavailable
4. **Replays not stored in this MVP**: Replay URLs point to external CDN/video service
5. **Social graph is simple**: Follow/unfollow binary (no friend request workflow)
6. **Leaderboards are sport-specific**: Rankings separate per sport (not cross-sport)
7. **Game results are manual entry**: Coaches/admins post scores, not auto-detected
8. **Mobile-first design**: Responsive from smallest breakpoint, enhanced on larger screens

---

## Notes for Implementation Phase

1. **Database Seeding**: Populate tournaments, matches, sample leaderboard data for testing
2. **Admin Dashboard**: Build tool for admins to post match results, manage bracket, create announcements (separate from this hub; design notes only)
3. **Email Notifications**: Trigger emails when friend joins game or follows user:
   - Template: "Your friend [Name] just joined [Game Name] at [Time]"
   - Subject: "Your friend is playing now"
   - Frequency cap: Per user notification_preferences (daily digest, weekly, never)
   - Scope: Out of scope for hub design but required for full social flow; backend must implement send queue
4. **Email Notification Preferences**: Add UI to settings page for frequency control (out of scope for games hub)
5. **Analytics**: Track page views, filter usage, game joins, tournament joins, recommendation clicks for optimization
6. **A/B Testing**: Test recommendation algorithm effectiveness; measure click-through and join rates
7. **Accessibility**: 
   - ARIA labels on all interactive elements (buttons, filters, links)
   - Keyboard navigation: Tab through filters → games → tournaments → leaderboard
   - Bracket keyboard nav: Arrow keys to move through matches, Enter to expand
   - Target WCAG AA compliance (full validation requires manual testing with screen readers)
8. **Internationalization**: If expanding, prepare i18n strings for tournament status, leaderboard headers, error messages

### MVP Feature Phasing
**Phase 1 (MVP Launch)**:
- Games list with filters
- Hero stats
- Basic leaderboard (all-time only)
- Game join + payment flow (existing)

**Phase 2 (2 weeks post-launch)**:
- Tournament brackets + live updates
- Recommendation carousel
- Recent results feed

**Phase 3 (1 month post-launch)**:
- Social follow + friends playing
- Weekly/monthly leaderboard periods
- Player profile preview

**Phase 4 (Stretch)**:
- Email notifications
- Community news carousel
- Advanced recommendation algorithm tuning

---

## Design Review Findings: Addressed

This section documents how each finding from the design review has been addressed:

### HIGH Findings (10)

1. **Leaderboard period filter ambiguous** → **ADDRESSED**
   - Added "Leaderboard Period Definitions" section specifying ISO 8601 calendar weeks, calendar months, all-time
   - Clarified UTC timezone for all calculations; client converts for display only
   - Updated Leaderboard Model with period_start_date, period_end_date

2. **API response structure undefined** → **ADDRESSED**
   - Defined consistent response schema for all endpoints: `{ success, data, error, errorCode, pagination, meta }`
   - Pagination format now consistent: `{ limit, skip, total, page, hasMore }`
   - Error responses include errorCode for client-side handling
   - Sample responses provided for each endpoint

3. **WebSocket incomplete** → **ADDRESSED**
   - Added full WebSocket spec: heartbeat (30s), timeout (90s), reconnection with exponential backoff
   - Defined acknowledgment mechanism (messageId echoing)
   - Specified error handling: malformed messages, auth failure, unsupported actions
   - Listed all message types with payload schemas
   - Added client best practices section

4. **Tournament bracket progression undefined** → **ADDRESSED**
   - Added "Bracket Progression Specification" section: single elimination (MVP), seeding strategy (random), auto-advance rules, bye logic
   - Round progression clarified: matches must complete before round closes, admin explicitly closes then generates next round
   - Bracket Model updated with bracketType, seedingStrategy, totalRounds, currentRound, autoAdvanceRule

5. **Player profile batch fetch N+1 risk** → **ADDRESSED**
   - Added batch endpoint recommendation: `/api/players/batch?userIds=id1,id2,...` (max 50 IDs)
   - Fallback strategy: if batch not available, fetch sequentially with 100ms delay
   - Updated "Data Enrichment on Page Load" section to specify batch approach

6. **Recommendation algorithm too vague** → **ADDRESSED**
   - Added detailed recommendation algorithm: weighting formula (+30 for favorite sport, +20 for time match, +25 for friends, +15 if trending, +10 for skill match)
   - Specified filtering rules: remove joined, past, full games
   - Defined time inference: if user has 10+ games, infer typical time ± 2 hours
   - Error fallback: return generic recommendations if time inference fails

7. **Tournament signup closure timing unspecified** → **ADDRESSED**
   - Added timezone specification: signup close time in UTC; clarified hard cutoff (no grace period)
   - Error response includes close timestamp: `'Signups closed at 2025-01-15T18:00:00Z'`
   - UI displays close time in user's local timezone

8. **Bracket conflict resolution incomplete** → **ADDRESSED**
   - Added detailed handling: last-write-wins with explicit conflict detection
   - Response code 409 with errorCode: 'BRACKET_CONFLICT'
   - Recovery path: admin reviews latest result, can post override if authorized
   - Audit logging: all conflicting posts logged for review

9. **Mobile leaderboard UI severely underspecified** → **ADDRESSED**
   - Defined card view for mobile: rank badge (gold/silver/bronze), avatar, name, points, win rate, streak
   - Specified fixed-height cards (120px), full-width stack
   - Added sortable UI: Points (default), Win Rate, Games Played radio buttons
   - Added searchable player name field
   - Height behavior: fixed cards with overflow hidden

10. **Filter persistence conflict handling missing** → **ADDRESSED**
    - Added validation logic on page load: check saved filters against current config
    - Defined rules for invalid saved filters: sport removed, membership changed, skill level out of range
    - UI shows "Filter no longer valid" message; offer reset
    - FilterBar component now tracks invalidFilters state; shows validation errors

### MEDIUM Findings (7)

11. **Pagination limit inconsistency** → **ADDRESSED**
    - Defined consistent default: limit=50 across all endpoints (was 10 for games, 50 for leaderboards)
    - Added max limits: GET /api/games limit max 50; GET /api/leaderboards max 100
    - Documented reasoning: leaderboards need higher limit for weekly/monthly rankings; games list respects user scroll patterns

12. **Social engagement privacy unspecified** → **ADDRESSED**
    - Added privacy_setting field to Social Engagement Model: 'public' | 'private'
    - Private users: profile visible to followers only
    - Added blockedBy array: track users who blocked this user
    - Clarified: followers/following/blocked arrays not directly exposed in public profile; only summary counts shown
    - Blocking is non-mutual

13. **Streak calculation incomplete** → **ADDRESSED**
    - Added detailed calculation function with reset criteria: streak resets on loss OR no_show
    - Timezone handling: all dates in UTC
    - No-show impact: breaks streak immediately; flagged in leaderboard
    - Calculation trigger: after each game completion

14. **Email notifications scope undefined** → **ADDRESSED**
    - Clarified: email notifications out of scope for hub design, but required for social flow
    - Added template: "Your friend [Name] just joined [Game Name]"
    - Frequency cap: daily/weekly/never per user preference
    - Backend must implement async send queue; frontend implements preference UI in settings (out of scope for hub)

15. **Carousel interaction underspecified on mobile** → **ADDRESSED**
    - Gesture library: Framer Motion built-in drag detection (no external library needed)
    - Visible items: <sm: 1, sm: 1.5, md: 2, lg: 3
    - Auto-rotate: 5 second interval (pause on interaction)
    - Indicators: dot pagination below carousel
    - Swipe left/right on mobile

16. **Error messages too generic** → **ADDRESSED**
    - All errors now include errorCode (e.g., 'GAME_FULL', 'RATE_LIMITED', 'AUTH_REQUIRED')
    - Specific user guidance for each error type
    - Rate limit includes retryAfter timestamp
    - Server errors include errorId for support reference
    - API errors section expanded with recovery paths

17. **Cache invalidation trigger too vague** → **ADDRESSED**
    - Defined explicit "Cache Invalidation Triggers" section with per-endpoint rules
    - Games list: invalidate on join/leave (immediate), filter change (immediate), 5-minute background
    - Leaderboards: invalidate on match score (WebSocket immediate), period boundary rollover, 5-minute background
    - Recommendations: invalidate on game join, trending sport change, daily refresh
    - All triggers include timing and conditions

### NIT Findings (3)

18. **MVP phasing not mentioned** → **ADDRESSED**
    - Added "MVP Feature Phasing" section with 4 phases
    - Phase 1: Games, hero stats, leaderboard, join flow
    - Phase 2: Tournaments, recommendations, recent results
    - Phase 3: Social follow, weekly/monthly leaderboards, profiles
    - Phase 4: Stretch goals (email, news, algorithm tuning)

19. **Accessibility WCAG level not specified** → **ADDRESSED**
    - Targeted WCAG AA compliance
    - Added specific practices: ARIA labels, keyboard navigation, bracket keyboard nav
    - Clarified: full validation requires manual testing with screen readers (out of scope for design)

20. **Success metrics lack baseline** → **ADDRESSED**
    - Expanded success metrics section: added 11 metrics
    - Clarified page load < 2s measured via Lighthouse
    - Added monitoring approaches for each metric
    - Note: current baseline unknown; recommend establishing via analytics before launch

---

## Success Metrics & Monitoring

- **Page load time < 2 seconds** (hero + games visible): Measure with Lighthouse; track via analytics
- **Games join flow completes in < 3 clicks**: Track click depth to join button
- **Leaderboard sorts in < 100ms** (client-side): Profile React renders; measure with DevTools
- **WebSocket update latency < 1 second** (for live participant counts): Monitor via WebSocket message timestamps
- **Fallback to polling works**: Track polling mode engagement; measure polling response times
- **70%+ of returning users interact with filters or social features**: Track filter usage in analytics
- **Tournament signup conversion > 40%**: Measure (tournament views → signups)
- **Error rate < 0.5%**: Monitor API error rates; alert on 429s or 5xx spikes
- **Social follow engagement**: Track follow/unfollow rates; recommend optimization if < 10%
- **Recommendation click-through rate > 20%**: A/B test algorithm improvements
- **Mobile adoption > 60%**: Track mobile vs desktop traffic; ensure responsive design performance
