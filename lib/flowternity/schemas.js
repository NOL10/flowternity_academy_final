import { z } from 'zod';

// Tournament Schema - Represents a single tournament for a sport
export const TournamentSchema = z.object({
  _id: z.string().optional(),
  sport_id: z.string().min(1, 'Sport ID is required'),
  name: z.string().min(1, 'Tournament name is required'),
  description: z.string().optional().default(''),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  format: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'ladder']).default('single_elimination'),
  max_participants: z.number().int().positive('Max participants must be positive'),
  current_participants: z.number().int().nonnegative().default(0),
  registration_start: z.date().optional(),
  registration_end: z.date().optional(),
  start_date: z.date(),
  end_date: z.date().optional(),
  prize_pool: z.number().nonnegative().default(0),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  created_by: z.string().optional(),
  rules: z.string().optional(),
  location: z.string().optional(),
});

// BracketMatch Schema - Represents individual matches within a tournament
export const BracketMatchSchema = z.object({
  _id: z.string().optional(),
  tournament_id: z.string().min(1, 'Tournament ID is required'),
  round: z.number().int().positive('Round must be positive'),
  match_number: z.number().int().nonnegative().default(0),
  player1_id: z.string().optional(),
  player2_id: z.string().optional(),
  player1_name: z.string().optional(),
  player2_name: z.string().optional(),
  winner_id: z.string().optional(),
  score_player1: z.number().int().nonnegative().optional(),
  score_player2: z.number().int().nonnegative().optional(),
  status: z.enum(['pending', 'ongoing', 'completed', 'cancelled']).default('pending'),
  scheduled_date: z.date().optional(),
  played_date: z.date().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

// Leaderboard Schema - Tracks rankings and scores for a sport over a time period
export const LeaderboardSchema = z.object({
  _id: z.string().optional(),
  sport_id: z.string().min(1, 'Sport ID is required'),
  period: z.enum(['weekly', 'monthly', 'yearly', 'all_time']).default('monthly'),
  rank: z.number().int().positive('Rank must be positive'),
  user_id: z.string().min(1, 'User ID is required'),
  user_name: z.string().optional(),
  points: z.number().nonnegative().default(0),
  wins: z.number().int().nonnegative().default(0),
  losses: z.number().int().nonnegative().default(0),
  tournaments_played: z.number().int().nonnegative().default(0),
  win_rate: z.number().min(0).max(100).default(0),
  last_updated: z.date().default(() => new Date()),
  start_period: z.date(),
  end_period: z.date().optional(),
});

// GameHistory Schema - Records of individual games/matches
export const GameHistorySchema = z.object({
  _id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  game_id: z.string().min(1, 'Game ID is required'),
  opponent_id: z.string().optional(),
  opponent_name: z.string().optional(),
  date: z.date(),
  sport_id: z.string().optional(),
  tournament_id: z.string().optional(),
  result: z.enum(['win', 'loss', 'draw', 'cancelled']).default('draw'),
  score: z.number().int().nonnegative().optional(),
  opponent_score: z.number().int().nonnegative().optional(),
  points_earned: z.number().int().nonnegative().default(0),
  duration_minutes: z.number().nonnegative().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  recorded_at: z.date().default(() => new Date()),
});

// PlayerSocial Schema - Tracks player relationships and social interactions
export const PlayerSocialSchema = z.object({
  _id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  friends: z.array(z.string()).default([]),
  followers: z.array(z.string()).default([]),
  following: z.array(z.string()).default([]),
  blocked_users: z.array(z.string()).default([]),
  teams: z.array(z.string()).default([]),
  achievements: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      earned_at: z.date(),
    })
  ).default([]),
  bio: z.string().optional(),
  favorite_sport: z.string().optional(),
  profile_image: z.string().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

// CommunityStats Schema - Aggregate statistics for community engagement
export const CommunityStatsSchema = z.object({
  _id: z.string().optional(),
  sport_id: z.string().min(1, 'Sport ID is required'),
  total_players: z.number().int().nonnegative().default(0),
  active_tournaments: z.number().int().nonnegative().default(0),
  total_matches: z.number().int().nonnegative().default(0),
  total_points_distributed: z.number().nonnegative().default(0),
  average_match_duration: z.number().nonnegative().optional(),
  top_ranked_player_id: z.string().optional(),
  top_ranked_player_name: z.string().optional(),
  engagement_rate: z.number().min(0).max(100).default(0),
  period_start: z.date(),
  period_end: z.date().optional(),
  last_updated: z.date().default(() => new Date()),
  snapshot: z.object({
    created_at: z.date().default(() => new Date()),
    metrics: z.any().optional(),
  }).optional(),
});

// Export types for TypeScript/JSDoc compatibility
export const Schemas = {
  Tournament: TournamentSchema,
  BracketMatch: BracketMatchSchema,
  Leaderboard: LeaderboardSchema,
  GameHistory: GameHistorySchema,
  PlayerSocial: PlayerSocialSchema,
  CommunityStats: CommunityStatsSchema,
};
