'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS } from '@/lib/flowternity/config';
import { Search, X, Calendar, MapPin, Users, Zap, Filter, ChevronRight, Clock, ArrowRight, Grid3X3, Play, Flame, TrendingUp, BarChart3, ChevronLeft, Sparkles } from 'lucide-react';

// ========== PREMIUM ANIMATIONS ==========
const premiumStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(212, 255, 36, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(212, 255, 36, 0);
    }
  }

  /* Premium Primary Button Animations */
  @keyframes buttonArrowSlide {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(6px);
    }
    100% {
      transform: translateX(6px);
    }
  }

  @keyframes buttonLimeGlow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(164, 232, 44, 0.4), 0 12px 24px rgba(0, 0, 0, 0.25);
    }
    50% {
      box-shadow: 0 0 0 12px rgba(164, 232, 44, 0), 0 12px 24px rgba(0, 0, 0, 0.35);
    }
  }

  @keyframes buttonPress {
    0% {
      transform: scale(1) translateY(0);
    }
    50% {
      transform: scale(0.98) translateY(2px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  /* Premium Secondary Button Fill Animation */
  @keyframes secondaryFill {
    0% {
      background-color: transparent;
      color: #A4E82C;
    }
    100% {
      background-color: #A4E82C;
      color: #000000;
    }
  }

  @keyframes secondaryTextFill {
    0% {
      color: #A4E82C;
    }
    100% {
      color: #000000;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s infinite;
  }

  .premium-hover {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .premium-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
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
`;

// ========== HERO SECTION – CINEMATIC NIKE STYLE ==========
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black text-white min-h-screen flex items-center">
      {/* Premium background with gradient + subtle animation */}
      <div className="absolute inset-0">
        {/* Dark gradient overlay - increased darkness */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-black opacity-95" />
        
        {/* Hero image with overlay - darker */}
        <div className="absolute inset-0">
          <img
            src="/flogames.png"
  
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Accent glow (lime only where critical) */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-32 lg:py-40">
        <div className="max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Premium badge */}
          <div className="mb-8 flex items-center gap-2">
            <div className="w-1 h-6 bg-lime-400" />
            <span className="text-xs tracking-widest font-black text-lime-400 uppercase">Elite Community</span>
          </div>

          {/* Hero copy – larger, bolder, breathing room */}
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black leading-tight mb-8 tracking-tight">
            Play.
            <br />
            <span className="text-lime-400 relative inline-block">
              Compete.
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-lime-400/20" />
            </span>
            <br />
            Dominate.
          </h1>

          <p className="text-xl lg:text-2xl text-slate-300 mb-12 leading-relaxed font-light max-w-xl">
            Join the elite sporting community. Discover pickup games, organised sessions, and world-class tournaments. Your moment starts now.
          </p>

          {/* Premium CTAs */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="#events">
              <button className="btn-primary">
                Explore Games
                <ArrowRight className="w-6 h-6 arrow-icon" />
              </button>
            </Link>
            <button className="btn-secondary">
              View Tournaments
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-slate-700/50 flex items-center gap-8">
            <div>
              <p className="text-3xl font-black text-lime-400">500+</p>
              <p className="text-sm text-slate-400 tracking-wide">Active Players</p>
            </div>
            <div className="w-px h-10 bg-slate-700/50" />
            <div>
              <p className="text-3xl font-black text-lime-400">50+</p>
              <p className="text-sm text-slate-400 tracking-wide">Events Monthly</p>
            </div>
            <div className="w-px h-10 bg-slate-700/50" />
            <div>
              <p className="text-3xl font-black text-lime-400">12</p>
              <p className="text-sm text-slate-400 tracking-wide">Sports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-slate-400 text-xs tracking-widest uppercase mb-2">Scroll</div>
        <ChevronRight className="w-5 h-5 text-lime-400 transform rotate-90 mx-auto" />
      </div>
    </section>
  );
}

// ========== COUNTDOWN TIMER UTILITY ==========
function getCountdownText(date, startTime) {
  const eventDate = new Date(`${date}T${startTime || '00:00'}`);
  const now = new Date();
  const diff = eventDate - now;

  if (diff < 0) return null; // Event passed

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0 && minutes < 60) {
    return { text: `${minutes}m left`, urgent: true };
  }
  if (hours < 24) {
    return { text: `${hours}h ${minutes}m`, urgent: false };
  }
  if (hours < 72) {
    return { text: `${Math.floor(hours / 24)}d left`, urgent: false };
  }
  return null;
}

// ========== FEATURED SHOWCASE – PREMIUM GRID ==========
function FeaturedCarousel({ games }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (games.length === 0) return null;

  // Get top 6 trending (by participant count & recency)
  const trending = games
    .filter(g => !g.is_tournament) // Exclude tournaments from featured
    .sort((a, b) => b.participants_count - a.participants_count)
    .slice(0, 6);

  if (trending.length === 0) return null;

  // Show 3 at a time
  const displayCards = [
    trending[activeIndex % trending.length],
    trending[(activeIndex + 1) % trending.length],
    trending[(activeIndex + 2) % trending.length]
  ];

  return (
    <section className="bg-black border-t border-b border-slate-800 py-20">
      <div className="container">
        {/* Header with premium styling */}
        <div className="flex items-center justify-between mb-16 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-7 h-7 text-lime-400" />
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Trending Now</h2>
            </div>
            <p className="text-slate-400 text-lg">The most sought-after games this week</p>
          </div>

          {/* Nav controls */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => setActiveIndex((activeIndex - 1 + trending.length) % trending.length)}
              className="p-3 bg-slate-900 hover:bg-slate-800 rounded-full transition-all premium-hover"
            >
              <ChevronLeft className="w-6 h-6 text-lime-400" />
            </button>
            <button
              onClick={() => setActiveIndex((activeIndex + 1) % trending.length)}
              className="p-3 bg-slate-900 hover:bg-slate-800 rounded-full transition-all premium-hover"
            >
              <ChevronRight className="w-6 h-6 text-lime-400" />
            </button>
          </div>
        </div>

        {/* 3-card grid with premium styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {displayCards.map((game, idx) => {
            const countdown = getCountdownText(game.date, game.start_time);
            const spotsLeft = Math.max(0, game.max_players - game.participants_count);

            return (
              <div
                key={`${game.id}-${idx}`}
                className="premium-hover"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Card className="overflow-hidden bg-slate-900 border-slate-800 group h-full flex flex-col">
                  {/* Premium image with overlay text */}
                  <div className="relative h-56 bg-slate-800 overflow-hidden flex-shrink-0">
                    <img
                      src={SPORTS.find(s => s.id === game.sport_id)?.image || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=500'}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Floating badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-lime-400 text-black font-black border-0 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Hot
                      </Badge>
                    </div>

                    {/* Countdown badge */}
                    {countdown && (
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                        countdown.urgent
                          ? 'bg-red-500 text-white animate-pulse-glow'
                          : 'bg-blue-500/80 text-white'
                      }`}>
                        {countdown.urgent && <Zap className="w-3 h-3" />}
                        {countdown.text}
                      </div>
                    )}

                    {/* Floating title + stat on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-black text-white mb-2 line-clamp-2">{game.title}</h3>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-black/60 text-lime-400 border border-lime-400/50 font-black text-xs">
                          {SPORTS.find(s => s.id === game.sport_id)?.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-white text-sm font-bold">
                          <Users className="w-4 h-4 text-lime-400" />
                          {game.participants_count}/{game.max_players}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium info section */}
                  <div className="p-5 flex-1 flex flex-col bg-slate-900">
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">When</p>
                        <p className="text-sm font-bold text-white mt-1">
                          {new Date(game.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Time</p>
                        <p className="text-sm font-bold text-white mt-1">{game.start_time}</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Spots</p>
                        <p className={`text-sm font-bold mt-1 ${spotsLeft <= 2 ? 'text-red-400' : 'text-lime-400'}`}>
                          {spotsLeft} left
                        </p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Price</p>
                        <p className="text-sm font-bold text-white mt-1">
                          {game.tournament_type === 'age_bracket' && game.categories?.length > 0
                            ? `₹${Math.min(...game.categories.map(c => c.entry_fee)).toLocaleString('en-IN')}+`
                            : game.is_paid ? `₹${game.fee}` : 'Free'
                          }
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/games/${game.id}`} className="mt-auto">
                      <button className="btn-primary-small">
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2">
          {trending.slice(0, Math.min(5, trending.length)).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex % trending.length
                  ? 'bg-lime-400 w-6'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== PREMIUM CATEGORY NAV WITH SORT ==========
function CategoryNav({ activeCategory, onCategoryChange, sortBy, onSortChange }) {
  const categories = [
    { id: 'all', label: 'All Events', description: 'Everything we offer' },
    { id: 'pickup', label: 'Pickup Games', description: 'Free casual play' },
    { id: 'tournament', label: 'Tournaments', description: 'Competitive' }
  ];

  return (
    <div className="bg-black border-b border-slate-800 sticky top-16 z-20">
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-6">
          {/* Categories */}
          <div className="flex gap-0 overflow-x-auto flex-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-6 py-2 font-black text-sm whitespace-nowrap transition-all border-b-2 uppercase tracking-wider ${
                  activeCategory === cat.id
                    ? 'border-lime-400 text-lime-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown – Premium styling */}
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-lime-400/50 rounded-lg text-sm font-bold text-white cursor-pointer transition-all premium-hover"
            >
              <option value="upcoming">Upcoming</option>
              <option value="popular">Most Popular</option>
              <option value="availability">Available Spots</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== PREMIUM SEARCH & FILTER BAR ==========
function SearchFilterBar({ searchQuery, onSearchChange, filters, onFilterOpen }) {
  return (
    <div className="bg-black border-b border-slate-800 py-6">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Premium search input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-lime-400 transition-colors" />
            <Input
              type="text"
              placeholder="Search sports, venues, events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-lime-400 text-white placeholder:text-slate-500 rounded-lg w-full transition-all"
            />
          </div>

          {/* Premium filter button */}
          <button
            onClick={onFilterOpen}
            className="px-6 h-12 bg-slate-900 border-2 border-slate-700 hover:border-lime-400 rounded-lg font-bold text-white hover:text-lime-400 transition-all flex items-center gap-2 whitespace-nowrap premium-hover shadow-md hover:shadow-lg hover:shadow-lime-400/20"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Active filter tags – premium style */}
        {(filters.sport !== 'all' || filters.skillLevels?.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.sport !== 'all' && (
              <Badge className="bg-slate-800 text-lime-400 border border-lime-400/30 font-bold">
                {SPORTS.find(s => s.id === filters.sport)?.name || 'Sport'}
                <X className="ml-1 w-3 h-3 cursor-pointer" />
              </Badge>
            )}
            {filters.skillLevels?.map(level => (
              <Badge key={level} className="bg-slate-800 text-lime-400 border border-lime-400/30 font-bold">
                {level}
                <X className="ml-1 w-3 h-3 cursor-pointer" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== FILTER DRAWER ==========
function FilterDrawer({ isOpen, onClose, filters, onFilterChange, sports }) {
  if (!isOpen) return null;

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
  const priceRanges = ['Free', 'Under ₹500', '₹500–₹1000', 'Over ₹1000'];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto lg:hidden border-t border-slate-800">
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-white uppercase tracking-wider">Filters</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Sport */}
          <div>
            <h4 className="font-black text-xs text-lime-400 mb-4 uppercase tracking-widest">Sport</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sport"
                  checked={filters.sport === 'all'}
                  onChange={() => onFilterChange({ ...filters, sport: 'all' })}
                  className="w-4 h-4 cursor-pointer accent-lime-400"
                />
                <span className="text-slate-300 group-hover:text-white transition">All Sports</span>
              </label>
              {sports.map(s => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="sport"
                    checked={filters.sport === s.id}
                    onChange={() => onFilterChange({ ...filters, sport: s.id })}
                    className="w-4 h-4 cursor-pointer accent-lime-400"
                  />
                  <span className="text-slate-300 group-hover:text-white transition">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <h4 className="font-black text-xs text-lime-400 mb-4 uppercase tracking-widest">Skill Level</h4>
            <div className="space-y-3">
              {skillLevels.map(level => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.skillLevels?.includes(level) || false}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...(filters.skillLevels || []), level]
                        : (filters.skillLevels || []).filter(l => l !== level);
                      onFilterChange({ ...filters, skillLevels: newLevels });
                    }}
                    className="w-4 h-4 cursor-pointer accent-lime-400"
                  />
                  <span className="text-slate-300 group-hover:text-white transition">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h4 className="font-black text-xs text-lime-400 mb-4 uppercase tracking-widest">Price</h4>
            <div className="space-y-3">
              {priceRanges.map(range => (
                <label key={range} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.priceRanges?.includes(range) || false}
                    onChange={(e) => {
                      const newRanges = e.target.checked
                        ? [...(filters.priceRanges || []), range]
                        : (filters.priceRanges || []).filter(r => r !== range);
                      onFilterChange({ ...filters, priceRanges: newRanges });
                    }}
                    className="w-4 h-4 cursor-pointer accent-lime-400"
                  />
                  <span className="text-slate-300 group-hover:text-white transition">{range}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 font-black transition-all duration-300"
              onClick={() => {
                onFilterChange({ sport: 'all', skillLevels: [], priceRanges: [] });
              }}
            >
              Clear Filters
            </Button>
            <Button
              className="flex-1 bg-lime-400 text-black hover:bg-lime-300 font-black shadow-lg hover:shadow-2xl hover:shadow-lime-400/40 transition-all duration-300"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ========== PREMIUM PICKUP GAME CARD ==========
function PickupGameCard({ game, onJoin, onLeave, isBusy, isParent }) {
  const isFull = game.participants_count >= game.max_players;
  const spotsLeft = Math.max(0, game.max_players - game.participants_count);
  const countdown = getCountdownText(game.date, game.start_time);

  return (
    <Card className="overflow-hidden bg-slate-900 border border-slate-800 hover:border-lime-400/30 group h-full flex flex-col premium-hover">
      {/* Premium image with overlay */}
      <div className="relative h-48 bg-slate-800 overflow-hidden flex-shrink-0">
        <Link href={`/academy/${game.sport_id}`}>
          <img
            src={SPORTS.find(s => s.id === game.sport_id)?.image || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=500'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
          />
        </Link>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Status badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {game.i_joined && (
            <Badge className="bg-lime-400 text-black font-black border-0">✓ Joined</Badge>
          )}
          {countdown && (
            <Badge className={`border-0 font-black flex items-center gap-1 ${
              countdown.urgent
                ? 'bg-red-500 text-white animate-pulse-glow'
                : 'bg-blue-500 text-white'
            }`}>
              {countdown.urgent && <Zap className="w-3 h-3" />}
              {countdown.text}
            </Badge>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <Badge className={game.is_paid || game.tournament_type === 'age_bracket' ? 'bg-amber-500/90 text-white font-black' : 'bg-green-500/90 text-white font-black'}>
            {game.tournament_type === 'age_bracket' && game.categories?.length > 0
              ? `₹${Math.min(...game.categories.map(c => c.entry_fee)).toLocaleString('en-IN')}+`
              : game.is_paid ? `₹${game.fee}` : 'Free'
            }
          </Badge>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-black text-xl text-white mb-2">{game.title}</h3>
        
        <div className="flex items-center gap-2 mb-4">
          {SPORTS.find(s => s.id === game.sport_id) && (
            <Badge className="bg-slate-800 text-lime-400 border border-lime-400/30 font-bold text-xs uppercase tracking-wider">
              {SPORTS.find(s => s.id === game.sport_id).name}
            </Badge>
          )}
          {game.skill_level && (
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs uppercase tracking-wider">
              {game.skill_level.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Premium info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Date</p>
            <div className="flex items-center gap-2 text-white font-semibold">
              <Calendar className="w-4 h-4 text-lime-400" />
              {new Date(game.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Time</p>
            <div className="flex items-center gap-2 text-white font-semibold">
              <Clock className="w-4 h-4 text-lime-400" />
              {game.start_time}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 col-span-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Location</p>
            <div className="flex items-center gap-2 text-white font-semibold">
              <MapPin className="w-4 h-4 text-lime-400" />
              {game.host_name}
            </div>
          </div>
          {game.prize_pool && (
            <div className="bg-gradient-to-r from-green-500/10 to-lime-400/10 rounded-lg p-3 border border-green-500/30 col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Prize Pool</p>
              <p className="font-black text-green-400">₹{game.prize_pool}</p>
            </div>
          )}
        </div>

        {/* Premium capacity bar */}
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-400" />
              <span className="text-white font-bold">{game.participants_count}/{game.max_players}</span>
            </div>
            <span className={`text-sm font-black ${spotsLeft <= 2 ? 'text-red-400' : 'text-lime-400'}`}>
              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isFull ? 'bg-red-500' : 'bg-lime-400'}`}
              style={{ width: `${(game.participants_count / game.max_players) * 100}%` }}
            />
          </div>
        </div>

        {/* Premium CTA */}
        {game.i_joined ? (
          <div className="flex gap-2 mt-auto">
            {game.is_paid ? (
              <Button disabled className="flex-1 bg-slate-700 text-slate-400 font-black cursor-not-allowed">✓ Booked</Button>
            ) : (
              <>
                <Button disabled className="flex-1 bg-slate-700 text-slate-400 font-black cursor-not-allowed">✓ Joined</Button>
                <Button
                  onClick={() => onLeave(game.id)}
                  disabled={isBusy === game.id}
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-black border border-red-500/50"
                >
                  Leave
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button
            onClick={() => game.is_paid ? window.location.href = `#pay-${game.id}` : onJoin(game.id)}
            disabled={isBusy === game.id || isFull || isParent}
            className="w-full mt-auto bg-lime-400 text-black hover:bg-lime-300 font-black py-3 rounded-lg disabled:bg-slate-700 disabled:text-slate-500 premium-hover shadow-lg hover:shadow-2xl hover:shadow-lime-400/40 transition-all duration-300 uppercase tracking-wider disabled:shadow-none"
          >
            {isBusy === game.id ? 'Processing...' : isFull ? 'Full' : isParent ? 'Adults Only' : game.is_paid ? `Pay ₹${game.fee}` : 'Join Free'}
          </Button>
        )}
      </div>
    </Card>
  );
}

function TournamentCard({ game }) {
  const countdown = getCountdownText(game.date, game.start_time);

  return (
    <Card className="overflow-hidden bg-slate-900 border border-slate-800 hover:border-lime-400/30 group h-full flex flex-col premium-hover">
      {/* Premium image */}
      <div className="relative h-56 bg-slate-800 overflow-hidden flex-shrink-0">
        <Link href={`/academy/${game.sport_id}`}>
          <img
            src={SPORTS.find(s => s.id === game.sport_id)?.image || 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&q=80&w=500'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        
        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge className="bg-purple-500 text-white font-black border-0">Tournament</Badge>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${
            countdown.urgent
              ? 'bg-red-500 text-white animate-pulse-glow'
              : 'bg-blue-500/80 text-white'
          }`}>
            {countdown.urgent && <Zap className="w-3 h-3" />}
            {countdown.text}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-black text-xl text-white mb-2">{game.title}</h3>
        <p className="text-sm text-slate-400 mb-6 uppercase tracking-wide font-bold">{SPORTS.find(s => s.id === game.sport_id)?.name}</p>

        {/* Premium info grid */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Status</p>
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/50 font-black">Registration Open</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Deadline</p>
              <p className="font-black text-white">{new Date(game.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Entry Fee</p>
              <p className="font-black text-amber-400">₹{game.fee || 'TBD'}</p>
            </div>
          </div>

          {game.prize_pool && (
            <div className="bg-gradient-to-r from-green-500/10 to-lime-400/10 rounded-lg p-4 border border-green-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Prize Pool</p>
              <p className="font-black text-green-400">₹{game.prize_pool}</p>
            </div>
          )}
        </div>

        <Link href={`/games/${game.id}`}>
          <button className="btn-primary-small">
            View Tournament <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </Card>
  );
}

// ========== EMPTY STATE ==========
function EmptyState({ category }) {
  const messages = {
    pickup: {
      heading: 'No pickup games right now',
      description: 'Check back soon! New casual games are added throughout the week.',
      cta: 'View Tournaments',
      icon: '🎮'
    },
    paid: {
      heading: 'No paid sessions available',
      description: 'Explore pickup games or tournaments while we prepare new sessions.',
      cta: 'Explore Pickup Games',
      icon: '⏳'
    },
    tournament: {
      heading: 'No tournaments scheduled',
      description: 'Tournaments are coming soon! Sign up for pickup games in the meantime.',
      cta: 'Join Pickup Games',
      icon: '🏆'
    },
    all: {
      heading: 'No events available',
      description: 'Check back soon for new games and tournaments.',
      cta: 'Return Home',
      icon: '🔍'
    }
  };

  const msg = messages[category] || messages.all;

  return (
    <div className="py-24 px-6 text-center">
      <div className="w-24 h-24 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
        {msg.icon}
      </div>
      <h3 className="text-3xl lg:text-4xl font-black text-white mb-3">{msg.heading}</h3>
      <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">{msg.description}</p>
      <Link href="/games">
        <button className="btn-primary">
          {msg.cta}
        </button>
      </Link>
    </div>
  );
}

// ========== LOADING SKELETON ==========
function SkeletonCard() {
  return (
    <Card className="overflow-hidden bg-slate-900 border-slate-800">
      <div className="h-48 bg-slate-800 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-800 rounded w-24 animate-pulse" />
        <div className="h-6 bg-slate-800 rounded w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-slate-800 rounded w-5/6 animate-pulse" />
        </div>
        <div className="h-10 bg-slate-800 rounded animate-pulse" />
      </div>
    </Card>
  );
}

// ========== SORTING UTILITY ==========
function applySorting(games, sortBy) {
  const sorted = [...games];

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.participants_count - a.participants_count);
    case 'availability':
      return sorted.sort((a, b) => {
        const spotsA = Math.max(0, a.max_players - a.participants_count);
        const spotsB = Math.max(0, b.max_players - b.participants_count);
        return spotsB - spotsA;
      });
    case 'price-low':
      return sorted.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.fee || 0) - (a.fee || 0));
    case 'upcoming':
    default:
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

// ========== MAIN PAGE ==========
export default function GamesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestGameId, setGuestGameId] = useState(null);
  const [guestGameFee, setGuestGameFee] = useState(null);
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sport: 'all', skillLevels: [], priceRanges: [] });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeSports = SPORTS.filter(s => s.status === 'active');

  // Load games
  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      try {
        const url = filters.sport === 'all' ? '/api/games' : `/api/games?sport=${filters.sport}`;
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (e) {
        console.error('Error loading games:', e);
      }
      setPageLoading(false);
    };

    load();
  }, [filters.sport]);

  // Filter games
  const filteredGames = games.filter(g => {
    // By category
    if (activeCategory === 'pickup' && g.is_tournament) return false;
    if (activeCategory === 'tournament' && !g.is_tournament) return false;

    // By search
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Apply sorting
  const sortedGames = applySorting(filteredGames, sortBy);

  // Group by category
  const pickupGames = sortedGames.filter(g => !g.is_tournament); // All non-tournament games (free + paid)
  const tournaments = sortedGames.filter(g => g.is_tournament);

  // Join game
  const join = async (gameId) => {
    if (!user) {
      router.push(`/auth?mode=login&next=/games`);
      return;
    }
    if (!user.has_active_membership) {
      toast.error('Active membership required');
      router.push('/memberships');
      return;
    }
    setBusy(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}/join`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        toast.success('✓ You joined!');
        const gamesRes = await fetch('/api/games', { credentials: 'include' });
        if (gamesRes.ok) setGames((await gamesRes.json()).games || []);
      } else {
        toast.error((await res.json()).error || 'Failed to join');
      }
    } catch (e) {
      toast.error('Error joining game');
    }
    setBusy(null);
  };

  // Leave game
  const leave = async (gameId) => {
    setBusy(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}/leave`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        toast.success('✓ You left');
        const gamesRes = await fetch('/api/games', { credentials: 'include' });
        if (gamesRes.ok) setGames((await gamesRes.json()).games || []);
      }
    } catch (e) {
      toast.error('Error leaving');
    }
    setBusy(null);
  };

  // Pay to play
  const payToPlay = async (gameId, fee) => {
    if (!user) {
      setGuestGameId(gameId);
      setGuestGameFee(fee);
      setGuestModalOpen(true);
      return;
    }
    setBusy(gameId);
    try {
      const orderRes = await fetch(`/api/games/${gameId}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: fee })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error);
        setBusy(null);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Flowternity',
          description: `Game Booking - ₹${fee}`,
          order_id: orderData.id,
          prefill: { name: user.full_name, email: user.email, contact: user.phone },
          handler: async (response) => {
            const verifyRes = await fetch(`/api/games/${gameId}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ ...response, amount: fee })
            });
            if (verifyRes.ok) {
              toast.success('✓ Booked!');
              const gamesRes = await fetch('/api/games', { credentials: 'include' });
              if (gamesRes.ok) setGames((await gamesRes.json()).games || []);
            } else {
              toast.error('Booking failed');
            }
            setBusy(null);
          },
          theme: { color: '#D4FF24' }
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      toast.error('Payment error');
      setBusy(null);
    }
  };

  // Guest checkout
  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      toast.error('All fields required');
      return;
    }
    setGuestSubmitting(true);
    try {
      const orderRes = await fetch(`/api/games/${guestGameId}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: guestGameFee, guest_details: guestDetails })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error);
        setGuestSubmitting(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Flowternity',
          description: `Game Booking - ₹${guestGameFee}`,
          order_id: orderData.id,
          prefill: { name: guestDetails.name, email: guestDetails.email, contact: guestDetails.phone },
          handler: async (response) => {
            const verifyRes = await fetch(`/api/games/${guestGameId}/verify-guest-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ ...response, amount: guestGameFee, guest_details: guestDetails })
            });
            if (verifyRes.ok) {
              toast.success('✓ Booked!');
              setGuestModalOpen(false);
              setGuestDetails({ name: '', email: '', phone: '' });
              const gamesRes = await fetch('/api/games', { credentials: 'include' });
              if (gamesRes.ok) setGames((await gamesRes.json()).games || []);
            } else {
              toast.error('Booking failed');
            }
            setGuestSubmitting(false);
          },
          theme: { color: '#D4FF24' }
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      toast.error('Payment error');
      setGuestSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <div className="container py-20"><div className="h-32 bg-slate-100 rounded-lg animate-pulse" /></div>
    </div>
  );

  const isParent = user?.role === 'parent';
  const displayCategory = activeCategory === 'all' ? 'all' : activeCategory;

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{premiumStyles}</style>
      <SiteNav />

      {/* Hero */}
      <HeroSection />

      {/* Category Nav */}
      <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} sortBy={sortBy} onSortChange={setSortBy} />

      {/* Featured Carousel - REMOVED */}
      {/* <FeaturedCarousel games={games} /> */}

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterOpen={() => setFilterDrawerOpen(true)}
      />

      {/* Main Content */}
      <main id="events" className="container py-12">
        {displayCategory === 'all' && (
          <div className="space-y-16">
            {/* Pickup Games Section (includes free + paid) */}
            {pickupGames.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-950 mb-2">Pickup Games</h2>
                <p className="text-slate-600 mb-8">Free and paid casual games. Jump in anytime.</p>
                {pageLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pickupGames.slice(0, 6).map(game => (
                      <PickupGameCard
                        key={game.id}
                        game={game}
                        onJoin={game.is_paid ? () => payToPlay(game.id, game.fee) : join}
                        onLeave={leave}
                        isBusy={busy}
                        isParent={isParent}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Tournaments Section */}
            {tournaments.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-950 mb-2">Tournaments</h2>
                <p className="text-slate-600 mb-8">Compete with your community.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournaments.slice(0, 6).map(game => (
                    <TournamentCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
            )}

            {pickupGames.length === 0 && tournaments.length === 0 && (
              <EmptyState category="all" />
            )}
          </div>
        )}

        {displayCategory === 'pickup' && (
          <div>
            {pageLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : pickupGames.length === 0 ? (
              <EmptyState category="pickup" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pickupGames.map(game => (
                  <PickupGameCard
                    key={game.id}
                    game={game}
                    onJoin={game.is_paid ? () => payToPlay(game.id, game.fee) : join}
                    onLeave={leave}
                    isBusy={busy}
                    isParent={isParent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {displayCategory === 'tournament' && (
          <div>
            {tournaments.length === 0 ? (
              <EmptyState category="tournament" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(game => (
                  <TournamentCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        sports={activeSports}
      />

      {/* Guest Checkout Modal */}
      <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-black">Complete Your Booking</DialogTitle>
            <DialogDescription className="text-slate-400">Enter your details to proceed</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuestCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Full Name *</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={guestDetails.name}
                onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-lime-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email *</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-lime-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Phone *</label>
              <Input
                type="tel"
                placeholder="+91 9999999999"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-lime-400"
              />
            </div>
            <Button
              type="submit"
              disabled={guestSubmitting}
              className="w-full bg-lime-400 text-black hover:bg-lime-300 font-black py-3 h-auto mt-6 rounded-lg premium-hover shadow-lg hover:shadow-2xl hover:shadow-lime-400/40 transition-all duration-300 uppercase tracking-wider disabled:shadow-none disabled:bg-slate-700 disabled:text-slate-500"
            >
              {guestSubmitting ? 'Processing...' : `Pay ₹${guestGameFee} & Book`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
