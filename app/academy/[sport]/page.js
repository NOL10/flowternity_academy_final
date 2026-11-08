'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SPORTS, KIDS_LEVELS } from '@/lib/flowternity/config';
import { ChevronRight, Calendar, MapPin, Users, Zap, Clock, Trophy, Play, ShieldCheck, Target, Award, TrendingUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbSchema } from '@/components/structured-data';

const premiumStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
  }

  .premium-hover {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .premium-hover:hover {
    transform: translateY(-8px);
  }

  .image-overlay {
    position: relative;
  }

  .image-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.3) 100%);
  }

  /* PRIMARY BUTTON PREMIUM STYLES */
  .btn-primary {
    background-color: #A4E82C;
    color: #000000;
    border: none;
    border-radius: 12px;
    font-weight: 900;
    font-size: 1rem;
    padding: 14px 32px;
    height: auto;
    min-height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 20px rgba(164, 232, 44, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: inherit;
  }

  .btn-primary:hover {
    background-color: #8FE000;
    box-shadow: 0 12px 32px rgba(164, 232, 44, 0.4), 0 6px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
  }

  .btn-primary:active {
    animation: buttonPress 200ms ease-out;
  }

  .btn-primary:focus {
    outline: 3px solid #A4E82C;
    outline-offset: 2px;
  }

  .btn-primary .arrow-icon {
    width: 24px;
    height: 24px;
    transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-primary:hover .arrow-icon {
    animation: buttonArrowSlide 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* PRIMARY BUTTON DARK (for lime-400 sections) */
  .btn-primary-dark {
    background-color: #000000;
    color: #A4E82C;
    border: none;
    border-radius: 12px;
    font-weight: 900;
    font-size: 1rem;
    padding: 14px 32px;
    height: auto;
    min-height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(164, 232, 44, 0.1);
    font-family: inherit;
  }

  .btn-primary-dark:hover {
    background-color: #1a1a1a;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 6px 16px rgba(164, 232, 44, 0.2);
    transform: translateY(-3px);
  }

  .btn-primary-dark:active {
    animation: buttonPress 200ms ease-out;
  }

  .btn-primary-dark:focus {
    outline: 3px solid #A4E82C;
    outline-offset: 2px;
  }

  .btn-primary-dark .arrow-icon {
    width: 24px;
    height: 24px;
    transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-primary-dark:hover .arrow-icon {
    animation: buttonArrowSlide 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* SECONDARY BUTTON PREMIUM STYLES */
  .btn-secondary {
    background-color: transparent;
    color: #A4E82C;
    border: 2px solid #A4E82C;
    border-radius: 12px;
    font-weight: 900;
    font-size: 1rem;
    padding: 12px 32px;
    height: auto;
    min-height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(164, 232, 44, 0.1);
    font-family: inherit;
  }

  .btn-secondary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: #A4E82C;
    z-index: -1;
    transition: left 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-secondary:hover {
    color: #000000;
    border-color: #8FE000;
    box-shadow: 0 8px 20px rgba(164, 232, 44, 0.3);
    transform: translateY(-3px);
  }

  .btn-secondary:hover::before {
    left: 0;
  }

  .btn-secondary:active {
    animation: buttonPress 200ms ease-out;
  }

  .btn-secondary:focus {
    outline: 3px solid #A4E82C;
    outline-offset: 2px;
  }

  /* SECONDARY BUTTON DARK (for lime-400 sections) */
  .btn-secondary-dark {
    background-color: transparent;
    color: #000000;
    border: 2px solid #000000;
    border-radius: 12px;
    font-weight: 900;
    font-size: 1rem;
    padding: 12px 32px;
    height: auto;
    min-height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-family: inherit;
  }

  .btn-secondary-dark::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: #000000;
    z-index: -1;
    transition: left 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .btn-secondary-dark:hover {
    color: #A4E82C;
    border-color: #1a1a1a;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
  }

  .btn-secondary-dark:hover::before {
    left: 0;
  }

  .btn-secondary-dark:active {
    animation: buttonPress 200ms ease-out;
  }

  .btn-secondary-dark:focus {
    outline: 3px solid #000000;
    outline-offset: 2px;
  }

  /* SMALL VARIANT FOR CARDS */
  .btn-primary-small {
    background-color: #A4E82C;
    color: #000000;
    border: none;
    border-radius: 10px;
    font-weight: 900;
    font-size: 0.875rem;
    padding: 12px 20px;
    height: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 16px rgba(164, 232, 44, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
    font-family: inherit;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-primary-small:hover {
    background-color: #8FE000;
    box-shadow: 0 8px 20px rgba(164, 232, 44, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .btn-primary-small:active {
    transform: scale(0.98) translateY(1px);
  }

  .btn-primary-small:focus {
    outline: 2px solid #A4E82C;
    outline-offset: 2px;
  }

  /* ANIMATION KEYFRAMES */
  @keyframes buttonArrowSlide {
    0% { transform: translateX(0); }
    50% { transform: translateX(6px); }
    100% { transform: translateX(6px); }
  }

  @keyframes buttonPress {
    0% { transform: scale(1) translateY(0); }
    50% { transform: scale(0.98) translateY(2px); }
    100% { transform: scale(1) translateY(0); }
  }
`;

// ========== HERO SECTION ==========
function HeroSection({ sport }) {
  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] md:min-h-screen flex items-center md:items-end">
      {/* Background image with optimized positioning */}
      <div className="absolute inset-0">
        <img
          src={sport.image}
          alt={sport.name}
          className="w-full h-full object-cover object-center md:object-top"
        />
        {/* Sophisticated dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        {/* Subtle accent glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-lime-400/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-lime-400/3 rounded-full blur-3xl" />
      </div>

      {/* Hero content */}
      <div className="container relative z-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-block mb-8 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <Badge className="bg-lime-400/20 text-lime-400 border border-lime-400/40 font-black text-xs px-4 py-2 uppercase tracking-widest backdrop-blur-sm">
              {sport.status === 'coming_soon' ? 'Coming Soon' : 'Elite Training Program'}
            </Badge>
          </div>

          {/* Heading with improved sizing and rhythm */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {sport.name}
            <span className="block text-lime-400 text-5xl sm:text-6xl md:text-7xl">Academy</span>
          </h1>

          {/* Description with better hierarchy */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/85 mb-6 leading-relaxed max-w-2xl font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {sport.description}
          </p>

          {/* Tagline with better emphasis */}
          <p className="text-sm md:text-base text-lime-400/90 font-black uppercase tracking-widest mb-10 animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '0.3s' }}>
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400"></span>
            {sport.tagline}
          </p>

          {/* CTAs with improved spacing */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {sport.status !== 'coming_soon' && (
              <>
                <Link href="/memberships">
                  <button className="btn-primary">
                    Get Membership <ChevronRight className="w-5 h-5 arrow-icon" />
                  </button>
                </Link>
                <Link href="/trial">
                  <button className="btn-secondary">
                    Free Trial Session
                  </button>
                </Link>
              </>
            )}
            {sport.status === 'coming_soon' && (
              <button className="btn-primary" disabled>
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== INTRODUCTION SECTION — PREMIUM EDITORIAL LAYOUT ==========
function IntroductionSection({ sport }) {
  if (sport.status === 'coming_soon') return null;

  return (
    <section className="bg-white border-b border-border py-20 md:py-28 lg:py-32 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-lime-400/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-lime-400/2 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Two-column editorial layout */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-start mb-20">
          {/* LEFT COLUMN: Heading & Eyebrow */}
          <div className="flex flex-col justify-start">
            <p className="text-xs md:text-sm uppercase tracking-widest font-black text-lime-400 mb-6">
              THE GAME STARTS HERE
            </p>
            <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black text-black mb-0 leading-tight tracking-tight">
              Train {sport.name.split(' ')[0]}
              <br />
              <span className="text-lime-400">at Flowternity.</span>
            </h2>
          </div>

          {/* RIGHT COLUMN: Supporting text */}
          <div className="flex flex-col justify-start pt-4 md:pt-0">
            {/* Secondary headline */}
            <h3 className="text-2xl md:text-3xl font-black text-black mb-6 leading-tight">
              Two international-standard {sport.name.toLowerCase()} {sport.name === 'Basketball' ? 'courts' : 'facilities'}. One community driven by progress.
            </h3>

            {/* Description */}
            <p className="text-base md:text-lg text-black/70 leading-relaxed max-w-xl">
              At Flowternity, we bring together world-class facilities, expert coaching and a community built around athletic growth. Whether you're picking up {sport.name.toLowerCase()} for the first time or pushing towards competitive excellence, there's a place for you here.
            </p>
          </div>
        </div>

        {/* THREE FEATURE CARDS — Premium redesign */}
        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1: Skill Levels */}
          <div className="group bg-white border-2 border-black/8 hover:border-lime-400/50 rounded-lg p-8 md:p-10 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-black/50 mb-2">SKILL PROGRESSION</p>
                <div className="text-5xl md:text-6xl font-black text-lime-400 leading-none">07</div>
              </div>
              <Trophy className="w-8 h-8 text-black/30" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-black mb-3 leading-tight">SKILL LEVELS</h3>
            <p className="text-sm md:text-base text-black/70 leading-relaxed">A structured journey from Spark to Legacy.</p>
          </div>

          {/* Card 2: Train Your Way */}
          <div className="group bg-white border-2 border-black/8 hover:border-lime-400/50 rounded-lg p-8 md:p-10 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-black/50 mb-2">FLEXIBILITY</p>
                <div className="text-5xl md:text-6xl font-black text-lime-400 leading-none">∞</div>
              </div>
              <Zap className="w-8 h-8 text-black/30" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-black mb-3 leading-tight">TRAIN YOUR WAY</h3>
            <p className="text-sm md:text-base text-black/70 leading-relaxed">Monthly, seasonal and pay-per-session options that fit your schedule.</p>
          </div>

          {/* Card 3: Built on Community */}
          <div className="group bg-white border-2 border-black/8 hover:border-lime-400/50 rounded-lg p-8 md:p-10 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-black/50 mb-2">COMMUNITY</p>
                <div className="text-5xl md:text-6xl font-black text-lime-400 leading-none">∞</div>
              </div>
              <Users className="w-8 h-8 text-black/30" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-black mb-3 leading-tight">BUILT ON COMMUNITY</h3>
            <p className="text-sm md:text-base text-black/70 leading-relaxed">Train, compete and grow alongside passionate athletes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== UPCOMING GAMES SECTION ==========
function UpcomingGamesSection({ sport }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch(`/api/games?sport=${sport.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Filter for non-tournament games only
          const pickupAndPaid = (data.games || []).filter(g => !g.is_tournament);
          setGames(pickupAndPaid);
        }
      } catch (e) {
        console.error('Error loading games:', e);
      }
      setLoading(false);
    };

    loadGames();
  }, [sport.id]);

  if (sport.status === 'coming_soon' || games.length === 0) return null;

  return (
    <section className="bg-background border-b border-border/50 py-20 md:py-28">
      <div className="container">
        <div className="mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-3">
            Upcoming Sessions
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">Limited availability — register early to secure your spot</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-secondary/50 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {games.slice(0, 3).map((game, idx) => (
                <GameCard key={game.id} game={game} animationDelay={idx * 0.05} />
              ))}
            </div>

            {games.length > 3 && (
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Link href={`/games?sport=${sport.id}`}>
                  <button className="btn-secondary">
                    View All {games.length} Sessions <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ========== GAME CARD COMPONENT ==========
function GameCard({ game, animationDelay }) {
  const spotsLeft = Math.max(0, game.max_players - game.participants_count);
  const isFull = spotsLeft === 0;

  return (
    <Card className="overflow-hidden bg-background border border-border/50 hover:border-lime-400/50 group rounded-2xl animate-fade-in-up premium-hover transition-all duration-300" style={{ animationDelay: `${animationDelay}s` }}>
      {/* Image */}
      <div className="relative h-40 bg-secondary overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400"
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {game.i_joined && (
            <Badge className="bg-lime-400 text-black font-black text-xs px-3 py-1.5">✓ Joined</Badge>
          )}
        </div>
        
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`font-black text-xs px-3 py-1.5 ${game.is_paid ? 'bg-amber-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
            {game.is_paid ? `₹${game.fee}` : 'Free'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-black text-lg text-foreground mb-4 line-clamp-2 leading-tight">{game.title}</h3>

        {/* Details */}
        <div className="space-y-3 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span className="text-foreground/70">{new Date(game.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span className="text-foreground/70 font-medium">{game.start_time}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span className="text-foreground/70">
              <span className="font-black">{game.participants_count}/{game.max_players}</span>
              {spotsLeft <= 2 && spotsLeft > 0 && <span className="text-amber-500 font-bold ml-2">• {spotsLeft} left</span>}
              {isFull && <span className="text-red-500 font-bold ml-2">• Full</span>}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/games/${game.id}`}>
          <button className="btn-primary-small">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </Card>
  );
}

// ========== TOURNAMENTS SECTION ==========
function TournamentsSection({ sport }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const res = await fetch(`/api/games?sport=${sport.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const tourn = (data.games || []).filter(g => g.is_tournament);
          setTournaments(tourn);
        }
      } catch (e) {
        console.error('Error loading tournaments:', e);
      }
      setLoading(false);
    };

    loadTournaments();
  }, [sport.id]);

  if (sport.status === 'coming_soon' || tournaments.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-background to-secondary/10 border-b border-border/50 py-20 md:py-28">
      <div className="container">
        <div className="mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-foreground flex items-center gap-3 tracking-tight mb-3">
            <Trophy className="w-9 h-9 text-lime-400" />
            Tournaments
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">Compete at the highest level and win championships</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-background rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {tournaments.map((tourn, idx) => (
              <TournamentCard key={tourn.id} tournament={tourn} animationDelay={idx * 0.1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ========== TOURNAMENT CARD ==========
function TournamentCard({ tournament, animationDelay }) {
  return (
    <Card className="overflow-hidden bg-background border border-border/50 hover:border-purple-400/50 group rounded-2xl animate-fade-in-up premium-hover transition-all duration-300" style={{ animationDelay: `${animationDelay}s` }}>
      {/* Image */}
      <div className="relative h-48 bg-secondary overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400"
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-purple-500 text-white font-black text-xs px-3 py-1.5">Tournament</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-black text-lg text-foreground mb-4 line-clamp-2 leading-tight">{tournament.title}</h3>

        {/* Details */}
        <div className="space-y-3 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span className="text-foreground/70 font-medium">{new Date(tournament.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span className="text-foreground/70">Entry: <span className="font-black text-amber-600">₹{tournament.fee || 'TBA'}</span></span>
          </div>
          {tournament.prize_pool && (
            <div className="flex items-center gap-3 text-green-600 font-bold">
              <Trophy className="w-4 h-4" />
              <span>Prize Pool: ₹{tournament.prize_pool}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href={`/games/${tournament.id}`}>
          <button className="btn-primary-small">
            Register Now <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </Card>
  );
}

// ========== FLOWTERNITY 7 PROGRESSION SECTION ==========
function ProgressionSection() {
  const progressionLevels = [
    {
      level: '01',
      name: 'SPARK',
      statement: 'Every champion starts with a spark.',
      isFocus: false
    },
    {
      level: '02',
      name: 'FOUNDATION',
      statement: 'Strong fundamentals create great players.',
      isFocus: false
    },
    {
      level: '03',
      name: 'RHYTHM',
      statement: 'Skills become second nature.',
      isFocus: false
    },
    {
      level: '04',
      name: 'FLOW',
      statement: 'Where preparation meets instinct.',
      description: 'This is the level every athlete dreams of reaching.',
      isFocus: true
    },
    {
      level: '05',
      name: 'IMPACT',
      statement: 'Great players influence every possession.',
      isFocus: false
    },
    {
      level: '06',
      name: 'ASCEND',
      statement: 'Compete with purpose. Perform with excellence.',
      isFocus: false
    },
    {
      level: '07',
      name: 'LEGACY',
      statement: 'Become the athlete others aspire to be.',
      isFocus: false
    }
  ];

  return (
    <section className="bg-white border-b border-border pt-24 md:pt-32 lg:pt-40 pb-20 md:pb-28 lg:pb-32 relative overflow-visible">
      {/* Subtle background accents */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-lime-400/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-400/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="mb-24 max-w-4xl">
          <p className="text-xs md:text-sm uppercase tracking-widest font-black text-lime-400 mb-4">
            THE FLOWTERNITY STANDARD
          </p>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-black mb-6 tracking-tight leading-tight">
            FLOWTERNITY 7
          </h2>
          <p className="text-2xl md:text-3xl font-black text-black mb-6 leading-tight">
            Seven levels. One journey. A lifetime of growth.
          </p>
          <p className="text-lg md:text-xl text-black/70 leading-relaxed max-w-2xl">
            Every athlete has a starting point. FLOWTERNITY 7 represents the journey from discovering your potential to becoming an athlete who inspires others.
          </p>
        </div>

        {/* Desktop: Horizontal Progression Journey */}
        <div className="hidden lg:block mb-32">
          {/* Progression container with timeline */}
          <div className="relative pt-20">
            {/* Timeline: Horizontal line */}
            <div className="absolute top-12 left-[6.5%] right-[6.5%] h-1.5 bg-gradient-to-r from-lime-400 via-lime-400 to-lime-400 z-0 rounded-full" />

            {/* Seven levels grid */}
            <div className="grid grid-cols-7 gap-0 relative z-10">
              {progressionLevels.map((item, idx) => {
                const nodePosition = `calc(14.285% * ${idx} + 7.142%)`; // Center of each column
                
                return (
                  <div
                    key={idx}
                    className="group animate-fade-in-up transition-all duration-300 flex flex-col items-center"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {/* Timeline node */}
                    <div className="relative mb-6 w-full flex justify-center">
                      <div className="w-8 h-8 bg-lime-400 rounded-full border-4 border-white shadow-lg shadow-lime-400/40 z-20 group-hover:scale-125 transition-transform duration-300" />
                      
                      {/* Vertical connector line from node to card */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-lime-400/60 to-lime-400/20" />
                    </div>

                    {item.isFocus ? (
                      // FLOW STATE - Special design
                      <div className="w-full px-2">
                        <div className="bg-lime-400 border-2 border-lime-400 rounded-3xl p-8 text-center shadow-lg shadow-lime-400/30 hover:shadow-xl hover:shadow-lime-400/50 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 h-full flex flex-col justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest font-black text-black mb-3">THE FLOW STATE</p>
                            <div className="text-7xl font-black text-black mb-4 leading-none">{item.level}</div>
                            <h3 className="text-2xl font-black text-black mb-4 leading-tight">{item.name}</h3>
                          </div>
                          <div>
                            <p className="text-base font-bold text-black mb-4 leading-snug">{item.statement}</p>
                            <p className="text-sm font-medium text-black/85 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular levels
                      <div className="w-full px-2">
                        <div className="bg-white border-2 border-black/8 hover:border-lime-400/40 rounded-2xl p-7 text-center hover:bg-black/3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 h-full flex flex-col justify-start">
                          <div className="text-5xl font-black text-black mb-4 leading-none">{item.level}</div>
                          <h3 className="text-lg font-black text-black mb-3 leading-snug">{item.name}</h3>
                          <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tablet: 2-Column Layout */}
        <div className="hidden md:block lg:hidden mb-32">
          <div className="space-y-8">
            {/* Row 1: Levels 1-2 */}
            <div className="grid grid-cols-2 gap-8">
              {progressionLevels.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="bg-white border-2 border-black/8 hover:border-lime-400/40 rounded-2xl p-7 text-center hover:bg-black/3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    <div className="text-5xl font-black text-black mb-4 leading-none">{item.level}</div>
                    <h3 className="text-lg font-black text-black mb-3 leading-snug">{item.name}</h3>
                    <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Levels 3-4 */}
            <div className="grid grid-cols-2 gap-8">
              {progressionLevels.slice(2, 4).map((item, idx) => (
                <div
                  key={idx + 2}
                  className={`group animate-fade-in-up ${item.isFocus ? 'col-span-2' : ''}`}
                  style={{ animationDelay: `${(idx + 2) * 0.1}s` }}
                >
                  {item.isFocus ? (
                    <div className="bg-lime-400 border-2 border-lime-400 rounded-3xl p-8 text-center shadow-lg shadow-lime-400/30 hover:shadow-xl hover:shadow-lime-400/50 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                      <p className="text-xs uppercase tracking-widest font-black text-black mb-3">THE FLOW STATE</p>
                      <div className="text-6xl font-black text-black mb-4 leading-none">{item.level}</div>
                      <h3 className="text-2xl font-black text-black mb-4 leading-tight">{item.name}</h3>
                      <p className="text-base font-bold text-black mb-4 leading-snug">{item.statement}</p>
                      <p className="text-sm font-medium text-black/85 leading-relaxed">{item.description}</p>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-black/8 hover:border-lime-400/40 rounded-2xl p-7 text-center hover:bg-black/3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                      <div className="text-5xl font-black text-black mb-4 leading-none">{item.level}</div>
                      <h3 className="text-lg font-black text-black mb-3 leading-snug">{item.name}</h3>
                      <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Row 3: Levels 5-6 */}
            <div className="grid grid-cols-2 gap-8">
              {progressionLevels.slice(4, 6).map((item, idx) => (
                <div
                  key={idx + 4}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${(idx + 4) * 0.1}s` }}
                >
                  <div className="bg-white border-2 border-black/8 hover:border-lime-400/40 rounded-2xl p-7 text-center hover:bg-black/3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    <div className="text-5xl font-black text-black mb-4 leading-none">{item.level}</div>
                    <h3 className="text-lg font-black text-black mb-3 leading-snug">{item.name}</h3>
                    <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 4: Level 7 */}
            <div className="grid grid-cols-2 gap-8">
              {progressionLevels.slice(6, 7).map((item, idx) => (
                <div
                  key={idx + 6}
                  className="group animate-fade-in-up col-span-2"
                  style={{ animationDelay: `${(idx + 6) * 0.1}s` }}
                >
                  <div className="bg-white border-2 border-black/8 hover:border-lime-400/40 rounded-2xl p-7 text-center hover:bg-black/3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    <div className="text-5xl font-black text-black mb-4 leading-none">{item.level}</div>
                    <h3 className="text-lg font-black text-black mb-3 leading-snug">{item.name}</h3>
                    <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden mb-24">
          <div className="relative pl-12">
            {/* Vertical connecting line */}
            <div className="absolute left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-lime-400 to-lime-400 rounded-full" />

            <div className="space-y-8">
              {progressionLevels.map((item, idx) => (
                <div
                  key={idx}
                  className="group animate-fade-in-up relative"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Connection dot */}
                  <div className="absolute -left-9 top-6 w-6 h-6 bg-lime-400 rounded-full border-4 border-white shadow-lg shadow-lime-400/40 z-20" />
                  
                  {/* Horizontal connector from dot to card */}
                  <div className="absolute -left-8 top-9 w-8 h-0.5 bg-gradient-to-r from-lime-400/60 to-lime-400/20" />

                  {item.isFocus ? (
                    // FLOW STATE
                    <div className="bg-lime-400 rounded-2xl p-7 text-left shadow-lg shadow-lime-400/30">
                      <p className="text-xs uppercase tracking-widest font-black text-black mb-3">THE FLOW STATE</p>
                      <div className="text-4xl font-black text-black mb-2 leading-none">{item.level}</div>
                      <h3 className="text-xl font-black text-black mb-3 leading-snug">{item.name}</h3>
                      <p className="font-bold text-black mb-3 leading-snug">{item.statement}</p>
                      <p className="text-sm font-medium text-black/80 leading-relaxed">{item.description}</p>
                    </div>
                  ) : (
                    // Regular level
                    <div className="bg-white border-2 border-black/8 rounded-2xl p-6 text-left hover:border-lime-400/40 hover:bg-black/3 transition-all duration-300">
                      <div className="text-4xl font-black text-black mb-2 leading-none">{item.level}</div>
                      <h3 className="text-lg font-black text-black mb-2 leading-snug">{item.name}</h3>
                      <p className="text-sm font-medium text-black/65 leading-relaxed">{item.statement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <div className="text-center border-t border-black/10 pt-16 md:pt-20">
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            THE GOAL ISN'T JUST TO PLAY.<br />IT'S TO BECOME.
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== FINAL CTA SECTION ==========
function FinalCTASection({ sport }) {
  if (sport.status === 'coming_soon') return null;

  return (
    <section className="bg-lime-400 py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 tracking-tight leading-tight">
            Start Your {sport.name} Journey
          </h2>
          <p className="text-lg md:text-xl text-black/80 mb-10 font-medium leading-relaxed max-w-2xl">
            Join Flowternity and train with dedicated athletes. Our expert coaches, world-class facilities, and supportive community are ready to help you reach your fullest potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link href="/memberships">
              <button className="btn-primary-dark">
                Get Membership <ChevronRight className="w-5 h-5 arrow-icon" />
              </button>
            </Link>
            <Link href="/trial">
              <button className="btn-secondary-dark">
                Try Free Session
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== BASKETBALL EXCELLENCE BOARD — PREMIUM ATHLETE DEVELOPMENT FRAMEWORK ==========
function LeadershipBoardSection({ sport }) {
  if (sport.id !== 'basketball') return null; // Only show for basketball

  const [expandedDimension, setExpandedDimension] = useState(null);

  const dimensions = [
    {
      id: 'discipline',
      number: '01',
      icon: ShieldCheck,
      title: 'Discipline & Professionalism',
      measures: ['On-time attendance', 'Proper dress code', 'Respectful behaviour', 'Timely payments', 'Following rules'],
      why: 'Teaches players to behave like serious athletes.'
    },
    {
      id: 'effort',
      number: '02',
      icon: Zap,
      title: 'Effort & Work Ethic',
      measures: ['Training intensity', 'Hustle in drills', 'Never giving up', 'Energy in practice', 'Extra effort'],
      why: 'Talent grows only with consistent effort.'
    },
    {
      id: 'skill',
      number: '03',
      icon: Target,
      title: 'Skill Development',
      measures: ['Dribbling improvement', 'Ball handling', 'Shooting consistency', 'Defensive skills', 'Game IQ growth'],
      why: 'Rewards improvement, not just natural ability.'
    },
    {
      id: 'teamwork',
      number: '04',
      icon: Users,
      title: 'Team Player Index',
      measures: ['Passing mindset', 'Communication', 'Supporting teammates', 'Positive attitude', 'Unselfish play'],
      why: 'Great teams beat great individuals.'
    },
    {
      id: 'leadership',
      number: '05',
      icon: Award,
      title: 'Leadership & Responsibility',
      measures: ['Helping younger students', 'Taking initiative', 'Leading drills', 'Accountability', 'Setting example'],
      why: 'Builds captains, not just players.'
    },
    {
      id: 'community',
      number: '06',
      icon: Trophy,
      title: 'Community & Sportsmanship',
      measures: ['Respect for authority', 'Encouraging others', 'Facility maintenance', 'Game behaviour', 'Positive rep'],
      why: 'Character is visible off the court too.'
    },
    {
      id: 'consistency',
      number: '07',
      icon: TrendingUp,
      title: 'Consistency Champion',
      measures: ['Weekly attendance', 'Consistent performance', 'Regular improvement', 'Long-term commitment'],
      why: 'Consistency beats occasional excellence.'
    }
  ];

  const renderCard = (dim, animationDelay) => {
    const IconComponent = dim.icon;
    const isExpanded = expandedDimension === dim.id;
    
    return (
      <div
        key={dim.id}
        className="group bg-white border-2 border-black/8 transition-all duration-300 rounded-2xl p-6 md:p-7 animate-fade-in-up hover:shadow-md hover:shadow-black/12 hover:-translate-y-1 hover:border-lime-400/40 h-full flex flex-col"
        style={{ animationDelay: `${animationDelay}s` }}
        onMouseEnter={() => setExpandedDimension(dim.id)}
        onMouseLeave={() => setExpandedDimension(null)}
      >
        {/* Header: Number and Icon */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="text-4xl md:text-5xl font-black text-black/30 leading-none flex-shrink-0">{dim.number}</div>
          <IconComponent className="w-7 h-7 text-black/40 transition-colors duration-300 group-hover:text-lime-400 flex-shrink-0" />
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-black text-black mb-5 leading-snug flex-shrink-0">
          {dim.title}
        </h3>

        {/* Key Measures */}
        <div className={`mb-5 pb-5 border-b border-black/8 flex-grow transition-all duration-300 ${isExpanded ? 'opacity-40' : 'opacity-100'}`}>
          <p className="text-xs uppercase tracking-widest font-black text-black/50 mb-3">Key Measures</p>
          <ul className="space-y-2">
            {dim.measures.map((measure, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-black/30 font-black text-xs mt-0.5 flex-shrink-0">•</span>
                <span className="text-xs text-black/70 leading-snug">{measure}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why This Matters - Show on Hover */}
        <div className="mt-auto pt-2 flex-shrink-0 min-h-12">
          {!isExpanded && (
            <p className="text-xs uppercase tracking-widest font-black text-black/50 transition-opacity duration-300">Why It Matters</p>
          )}
          
          {/* Expanded content on hover */}
          {isExpanded && (
            <div className="animate-fade-in-up">
              <p className="text-xs md:text-sm text-black/75 leading-relaxed font-medium">
                {dim.why}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white border-b border-border py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-lime-400/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/2 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Section Introduction */}
        <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto animate-fade-in-up">
          <p className="text-xs md:text-sm uppercase tracking-widest font-black text-lime-400 mb-4">
            THE FLOWTERNITY STANDARD
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 tracking-tight leading-tight">
            Excellence is More Than <span className="text-lime-400">Performance.</span>
          </h2>
          <p className="text-base md:text-lg text-black/70 leading-relaxed">
            Seven dimensions. One complete athlete. We look beyond points scored and games won. We recognise the discipline, character, teamwork and commitment that shape an athlete both on and off the court.
          </p>
        </div>

        {/* Seven Dimensions Grid */}
        {/* Desktop: 4 + 3 (centred) */}
        <div className="hidden lg:grid lg:gap-6 mb-16 md:mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {/* First row: 4 cards */}
          {dimensions.slice(0, 4).map((dim, idx) => renderCard(dim, idx * 0.08))}
          
          {/* Second row: 3 cards (centred) */}
          {dimensions.slice(4, 5).map((dim, idx) => (
            <div key="spacer" className="hidden" />
          ))}
          {dimensions.slice(4).map((dim, idx) => renderCard(dim, (idx + 4) * 0.08))}
        </div>

        {/* Tablet: 2 columns */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 mb-16 md:mb-20">
          {dimensions.map((dim, idx) => renderCard(dim, idx * 0.08))}
        </div>

        {/* Mobile: 1 column */}
        <div className="md:hidden space-y-6 mb-16">
          {dimensions.map((dim, idx) => renderCard(dim, idx * 0.08))}
        </div>

        {/* Closing Statement */}
        <div className="border-t border-black/10 pt-12 md:pt-16 text-center max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            BUILT ON CHARACTER.<br />
            <span className="text-lime-400">PROVEN THROUGH PERFORMANCE.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== MAIN PAGE ==========
export default function SportDetailPage() {
  const params = useParams();
  const sportId = params.sport;
  const sport = SPORTS.find(s => s.id === sportId);

  if (!sport) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-32 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Sport not found</h1>
          <Link href="/games">
            <button className="btn-primary">
              Back to Games
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{premiumStyles}</style>
      <SiteNav />

      {/* Hero */}
      <HeroSection sport={sport} />

      {/* Introduction */}
      <IntroductionSection sport={sport} />

      {/* Upcoming Games */}
      <UpcomingGamesSection sport={sport} />

      {/* Tournaments */}
      <TournamentsSection sport={sport} />

      {/* Progression */}
      <ProgressionSection />

      {/* Leadership Board (Basketball only) */}
      <LeadershipBoardSection sport={sport} />

      {/* Final CTA */}
      <FinalCTASection sport={sport} />
    </div>
  );
}
