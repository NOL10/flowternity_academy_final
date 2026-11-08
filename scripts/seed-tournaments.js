#!/usr/bin/env node

/**
 * Tournament & Games Hub Seed Script
 * Populates initial data for tournaments, bracket matches, leaderboards, and community stats
 * Usage: node scripts/seed-tournaments.js
 */

import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'flowternity';

async function seedData() {
  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('🌱 Starting seed process...');

    // Create indexes
    console.log('📑 Creating indexes...');
    await db.collection('tournaments').createIndex({ sport_id: 1, status: 1, created_at: -1 });
    await db.collection('bracket_matches').createIndex({ tournament_id: 1, round: 1 });
    await db.collection('leaderboards').createIndex({ sport_id: 1, period: 1, rank: 1 });
    await db.collection('player_social').createIndex({ user_id: 1 });
    await db.collection('game_history').createIndex({ user_id: 1, game_id: 1, date: -1 });
    await db.collection('community_stats').createIndex({ sport_id: 1, period_start: -1 });
    console.log('✅ Indexes created');

    // Clear existing seed data (optional - comment out to preserve data)
    console.log('🗑️  Clearing existing tournament data...');
    await db.collection('tournaments').deleteMany({});
    await db.collection('bracket_matches').deleteMany({});
    await db.collection('leaderboards').deleteMany({});
    await db.collection('player_social').deleteMany({});
    await db.collection('game_history').deleteMany({});
    await db.collection('community_stats').deleteMany({});
    console.log('✅ Cleared existing data');

    // Sample tournament data
    const tournaments = [
      {
        _id: uuidv4(),
        sport_id: 'basketball',
        name: 'Spring Championship 2024',
        description: 'Annual spring championship for all skill levels',
        status: 'completed',
        format: 'single_elimination',
        max_participants: 16,
        current_participants: 16,
        registration_start: new Date('2024-01-01'),
        registration_end: new Date('2024-02-01'),
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-03-15'),
        prize_pool: 50000,
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-03-15'),
        created_by: 'admin',
        rules: 'Standard basketball rules apply. Best of 3 matches in finals.',
        location: 'Court #1',
      },
      {
        _id: uuidv4(),
        sport_id: 'basketball',
        name: 'Summer League 2024',
        description: 'Competitive summer league with weekly matches',
        status: 'ongoing',
        format: 'round_robin',
        max_participants: 24,
        current_participants: 20,
        registration_start: new Date('2024-05-01'),
        registration_end: new Date('2024-06-15'),
        start_date: new Date('2024-06-20'),
        end_date: new Date('2024-08-30'),
        prize_pool: 100000,
        created_at: new Date('2024-05-10'),
        updated_at: new Date('2024-07-20'),
        created_by: 'admin',
        rules: 'Round-robin format with playoffs. Top 4 teams advance.',
        location: 'Court #1 & #2',
      },
      {
        _id: uuidv4(),
        sport_id: 'skating',
        name: 'Roller Racing Series',
        description: 'Speed and agility competition',
        status: 'upcoming',
        format: 'ladder',
        max_participants: 12,
        current_participants: 8,
        registration_start: new Date('2024-09-01'),
        registration_end: new Date('2024-10-15'),
        start_date: new Date('2024-11-01'),
        end_date: new Date('2024-12-31'),
        prize_pool: 30000,
        created_at: new Date('2024-08-20'),
        updated_at: new Date('2024-09-05'),
        created_by: 'admin',
        rules: 'Ladder tournament - players ranked by wins and times.',
        location: 'Skating Rink',
      },
      {
        _id: uuidv4(),
        sport_id: 'skateboarding',
        name: 'Trick Masters 2024',
        description: 'Showcase your best tricks and combinations',
        status: 'upcoming',
        format: 'single_elimination',
        max_participants: 32,
        current_participants: 18,
        registration_start: new Date('2024-08-15'),
        registration_end: new Date('2024-09-30'),
        start_date: new Date('2024-10-15'),
        end_date: new Date('2024-10-20'),
        prize_pool: 75000,
        created_at: new Date('2024-07-30'),
        updated_at: new Date('2024-09-10'),
        created_by: 'admin',
        rules: 'Single elimination - judges score tricks on difficulty and execution.',
        location: 'Skate Park',
      },
      {
        _id: uuidv4(),
        sport_id: 'futsal',
        name: 'Futsal Pro Cup',
        description: 'Professional 5-a-side tournament',
        status: 'cancelled',
        format: 'double_elimination',
        max_participants: 20,
        current_participants: 15,
        registration_start: new Date('2024-04-01'),
        registration_end: new Date('2024-05-01'),
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-06-15'),
        prize_pool: 60000,
        created_at: new Date('2024-03-20'),
        updated_at: new Date('2024-05-25'),
        created_by: 'admin',
        rules: 'Double elimination format for futsal. Each match is 40 minutes.',
        location: 'Outdoor Court',
      },
    ];

    console.log('📝 Inserting tournaments...');
    const tournamentsResult = await db.collection('tournaments').insertMany(tournaments);
    console.log(`✅ Inserted ${tournamentsResult.insertedCount} tournaments`);

    // Sample bracket matches (20+ matches across tournaments)
    const matches = [];
    const tourIds = tournaments.map(t => t._id);

    // Basketball Spring Championship matches (Round 1: 8 matches, Round 2: 4 matches, Finals: 2 matches = 14 total)
    for (let i = 0; i < 8; i++) {
      matches.push({
        _id: uuidv4(),
        tournament_id: tourIds[0],
        round: 1,
        match_number: i + 1,
        player1_id: `player_${Math.floor(i * 2)}`,
        player2_id: `player_${Math.floor(i * 2) + 1}`,
        player1_name: `Player ${Math.floor(i * 2) + 1}`,
        player2_name: `Player ${Math.floor(i * 2) + 2}`,
        winner_id: Math.random() > 0.5 ? `player_${Math.floor(i * 2)}` : `player_${Math.floor(i * 2) + 1}`,
        score_player1: Math.floor(Math.random() * 30) + 10,
        score_player2: Math.floor(Math.random() * 30) + 10,
        status: 'completed',
        scheduled_date: new Date('2024-03-01'),
        played_date: new Date('2024-03-01'),
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-01'),
      });
    }

    // Round 2 matches
    for (let i = 0; i < 4; i++) {
      matches.push({
        _id: uuidv4(),
        tournament_id: tourIds[0],
        round: 2,
        match_number: i + 1,
        player1_id: `player_${i * 2}`,
        player2_id: `player_${i * 2 + 1}`,
        player1_name: `Player ${i * 2 + 1}`,
        player2_name: `Player ${i * 2 + 2}`,
        winner_id: Math.random() > 0.5 ? `player_${i * 2}` : `player_${i * 2 + 1}`,
        score_player1: Math.floor(Math.random() * 30) + 10,
        score_player2: Math.floor(Math.random() * 30) + 10,
        status: 'completed',
        scheduled_date: new Date('2024-03-08'),
        played_date: new Date('2024-03-08'),
        created_at: new Date('2024-03-08'),
        updated_at: new Date('2024-03-08'),
      });
    }

    // Finals
    matches.push({
      _id: uuidv4(),
      tournament_id: tourIds[0],
      round: 3,
      match_number: 1,
      player1_id: 'player_0',
      player2_id: 'player_2',
      player1_name: 'Player 1',
      player2_name: 'Player 3',
      winner_id: 'player_0',
      score_player1: 25,
      score_player2: 18,
      status: 'completed',
      scheduled_date: new Date('2024-03-15'),
      played_date: new Date('2024-03-15'),
      created_at: new Date('2024-03-15'),
      updated_at: new Date('2024-03-15'),
    });

    // Summer league matches (6+ ongoing matches)
    for (let i = 0; i < 6; i++) {
      matches.push({
        _id: uuidv4(),
        tournament_id: tourIds[1],
        round: 1,
        match_number: i + 1,
        player1_id: `player_${i}`,
        player2_id: `player_${i + 1}`,
        player1_name: `Player ${i + 1}`,
        player2_name: `Player ${i + 2}`,
        winner_id: null,
        status: 'ongoing',
        scheduled_date: new Date('2024-07-25'),
        created_at: new Date('2024-07-25'),
        updated_at: new Date('2024-07-25'),
      });
    }

    console.log('📝 Inserting bracket matches...');
    const matchesResult = await db.collection('bracket_matches').insertMany(matches);
    console.log(`✅ Inserted ${matchesResult.insertedCount} bracket matches`);

    // Sample leaderboard entries
    const leaderboards = [];
    for (const sport of ['basketball', 'skating', 'skateboarding']) {
      const tourSportId = tourIds.find(id => {
        const t = tournaments.find(t => t._id === id);
        return t && t.sport_id === sport;
      });

      for (let rank = 1; rank <= 10; rank++) {
        const wins = 15 - rank;
        const losses = rank - 1;
        leaderboards.push({
          _id: uuidv4(),
          sport_id: sport,
          period: 'monthly',
          rank: rank,
          user_id: `player_${rank}`,
          user_name: `Top Player ${rank}`,
          points: (wins * 10) + (losses * 5),
          wins: wins,
          losses: losses,
          tournaments_played: Math.min(rank + 1, 5),
          win_rate: Math.round((wins / (wins + losses)) * 100),
          last_updated: new Date(),
          start_period: new Date('2024-07-01'),
          end_period: new Date('2024-07-31'),
        });
      }
    }

    console.log('📝 Inserting leaderboard entries...');
    const leaderboardsResult = await db.collection('leaderboards').insertMany(leaderboards);
    console.log(`✅ Inserted ${leaderboardsResult.insertedCount} leaderboard entries`);

    // Sample player social data
    const playerSocial = [];
    for (let i = 1; i <= 5; i++) {
      playerSocial.push({
        _id: uuidv4(),
        user_id: `player_${i}`,
        friends: [`player_${(i + 1) % 5 + 1}`, `player_${(i + 2) % 5 + 1}`],
        followers: [`player_${(i + 1) % 5 + 1}`, `player_${(i + 2) % 5 + 1}`, `player_${(i + 3) % 5 + 1}`],
        following: [`player_${(i + 1) % 5 + 1}`, `player_${(i + 2) % 5 + 1}`],
        blocked_users: [],
        teams: ['basketball_team_1', 'futsal_squad_2'].slice(0, Math.floor(Math.random() * 2) + 1),
        achievements: [
          {
            id: 'first_tournament',
            name: 'Tournament Veteran',
            description: 'Participated in 1st tournament',
            earned_at: new Date('2024-03-15'),
          },
          {
            id: 'winning_streak',
            name: 'On Fire',
            description: '3-match winning streak',
            earned_at: new Date('2024-07-20'),
          },
        ],
        bio: `Passionate ${['basketball', 'skating', 'skateboarding'][i % 3]} player at Flowternity`,
        favorite_sport: ['basketball', 'skating', 'skateboarding'][i % 3],
        profile_image: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date(),
      });
    }

    console.log('📝 Inserting player social data...');
    const socialResult = await db.collection('player_social').insertMany(playerSocial);
    console.log(`✅ Inserted ${socialResult.insertedCount} player social records`);

    // Sample game history
    const gameHistory = [];
    for (let i = 1; i <= 5; i++) {
      for (let j = 0; j < 8; j++) {
        gameHistory.push({
          _id: uuidv4(),
          user_id: `player_${i}`,
          game_id: `game_${i}_${j}`,
          opponent_id: `player_${(i + j) % 5 + 1}`,
          opponent_name: `Player ${(i + j) % 5 + 1}`,
          date: new Date('2024-07-01 + ' + j + ' days'),
          sport_id: ['basketball', 'skating', 'skateboarding'][i % 3],
          tournament_id: tourIds[i % tourIds.length],
          result: ['win', 'loss', 'draw'][Math.floor(Math.random() * 3)],
          score: Math.floor(Math.random() * 30) + 10,
          opponent_score: Math.floor(Math.random() * 30) + 10,
          points_earned: Math.floor(Math.random() * 20) + 5,
          duration_minutes: 45,
          location: ['Court #1', 'Court #2', 'Skating Rink', 'Skate Park'][i % 4],
          notes: 'Good match',
          recorded_at: new Date(),
        });
      }
    }

    console.log('📝 Inserting game history...');
    const historyResult = await db.collection('game_history').insertMany(gameHistory);
    console.log(`✅ Inserted ${historyResult.insertedCount} game history records`);

    // Sample community stats snapshot
    const communityStats = [
      {
        _id: uuidv4(),
        sport_id: 'basketball',
        total_players: 45,
        active_tournaments: 2,
        total_matches: 32,
        total_points_distributed: 2560,
        average_match_duration: 45,
        top_ranked_player_id: 'player_1',
        top_ranked_player_name: 'Top Player 1',
        engagement_rate: 78.5,
        period_start: new Date('2024-07-01'),
        period_end: new Date('2024-07-31'),
        last_updated: new Date(),
        snapshot: {
          created_at: new Date(),
          metrics: {
            new_players_this_period: 8,
            returning_players: 37,
            matches_per_player_avg: 0.71,
          },
        },
      },
      {
        _id: uuidv4(),
        sport_id: 'skating',
        total_players: 28,
        active_tournaments: 1,
        total_matches: 12,
        total_points_distributed: 960,
        average_match_duration: 30,
        top_ranked_player_id: 'player_2',
        top_ranked_player_name: 'Top Player 2',
        engagement_rate: 65.3,
        period_start: new Date('2024-07-01'),
        period_end: new Date('2024-07-31'),
        last_updated: new Date(),
        snapshot: {
          created_at: new Date(),
          metrics: {
            new_players_this_period: 3,
            returning_players: 25,
            matches_per_player_avg: 0.43,
          },
        },
      },
      {
        _id: uuidv4(),
        sport_id: 'skateboarding',
        total_players: 22,
        active_tournaments: 1,
        total_matches: 8,
        total_points_distributed: 640,
        average_match_duration: 50,
        top_ranked_player_id: 'player_3',
        top_ranked_player_name: 'Top Player 3',
        engagement_rate: 72.1,
        period_start: new Date('2024-07-01'),
        period_end: new Date('2024-07-31'),
        last_updated: new Date(),
        snapshot: {
          created_at: new Date(),
          metrics: {
            new_players_this_period: 5,
            returning_players: 17,
            matches_per_player_avg: 0.36,
          },
        },
      },
    ];

    console.log('📝 Inserting community stats...');
    const statsResult = await db.collection('community_stats').insertMany(communityStats);
    console.log(`✅ Inserted ${statsResult.insertedCount} community stats records`);

    // Verify data
    console.log('\n📊 Verification:');
    const tourCount = await db.collection('tournaments').countDocuments();
    const matchCount = await db.collection('bracket_matches').countDocuments();
    const leaderboardCount = await db.collection('leaderboards').countDocuments();
    const socialCount = await db.collection('player_social').countDocuments();
    const historyCount = await db.collection('game_history').countDocuments();
    const statsCount = await db.collection('community_stats').countDocuments();

    console.log(`✅ Tournaments: ${tourCount}`);
    console.log(`✅ Bracket matches: ${matchCount}`);
    console.log(`✅ Leaderboard entries: ${leaderboardCount}`);
    console.log(`✅ Player social records: ${socialCount}`);
    console.log(`✅ Game history records: ${historyCount}`);
    console.log(`✅ Community stats: ${statsCount}`);

    console.log('\n🎉 Seeding complete');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedData();
