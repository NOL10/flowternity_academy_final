'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { SPORTS, LEADERSHIP_METRICS } from '@/lib/flowternity/config';
import { Trophy, TrendingUp, Users, Search } from 'lucide-react';

export default function LeadershipPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('basketball');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [q, setQ] = useState('');

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/api/leadership-metrics/leaderboard?sport_id=${selectedSport}&limit=50`;
      if (selectedMetric) url += `&metric_id=${selectedMetric}`;

      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setLeaderboard(d.leaderboard || []);
      } else {
        toast.error('Failed to load leaderboard');
      }
    } catch (err) {
      toast.error('Error loading leaderboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedSport, selectedMetric]);

  const filtered = leaderboard?.filter(entry =>
    !q || entry.user?.full_name?.toLowerCase().includes(q.toLowerCase()) || entry.user?.email?.toLowerCase().includes(q.toLowerCase())
  ) || [];

  const getMetricColor = (metricId) => {
    return LEADERSHIP_METRICS.find(m => m.id === metricId)?.color || 'bg-slate-500';
  };

  const getRank = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-10 md:py-14 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Leadership</p>
          <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight mb-3">Flowternity Leadership Board</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Ranked by overall leadership score across 7 dimensions: Discipline, Effort, Skill, Teamwork, Leadership, Community & Consistency.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 rounded-2xl mb-8 bg-secondary/50 border-primary/10">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Sport filter */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Sport</label>
              <select
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border bg-background border-primary/20 text-sm font-medium hover:border-primary/40 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {SPORTS.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Metric filter */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Metric</label>
              <select
                value={selectedMetric || ''}
                onChange={e => setSelectedMetric(e.target.value || null)}
                className="w-full px-4 py-2.5 rounded-lg border bg-background border-primary/20 text-sm font-medium hover:border-primary/40 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Metrics</option>
                {LEADERSHIP_METRICS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Find a player..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background border-primary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 rounded-2xl text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">No results</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const metric = selectedMetric ? LEADERSHIP_METRICS.find(m => m.id === selectedMetric) : null;
              const score = metric
                ? entry.metric_averages[selectedMetric] || 0
                : entry.overall_score;

              return (
                <Card
                  key={i}
                  className="p-4 md:p-6 rounded-xl border-primary/10 hover:border-primary/30 transition bg-secondary/30 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="text-center flex-shrink-0">
                      <p className="text-2xl font-black">{getRank(i)}</p>
                    </div>

                    {/* Player info */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground font-black">
                          {entry.user?.full_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">{entry.user?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground truncate">{entry.user?.email}</p>
                      </div>
                    </div>

                    {/* Metrics breakdown (desktop) */}
                    <div className="hidden lg:grid lg:grid-cols-7 gap-2 flex-shrink-0">
                      {LEADERSHIP_METRICS.map(m => (
                        <div
                          key={m.id}
                          className="text-center p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition"
                          title={m.name}
                        >
                          <p className="text-lg leading-none mb-1">{m.emoji}</p>
                          <p className="text-xs font-semibold text-primary">
                            {entry.metric_averages[m.id]?.toFixed(1) || '—'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Overall/Metric score */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-black text-primary">{score.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        {metric ? 'Score' : 'Overall'}
                      </p>
                    </div>
                  </div>

                  {/* Mobile metric dots */}
                  <div className="mt-3 pt-3 border-t border-primary/10 lg:hidden flex flex-wrap gap-1">
                    {LEADERSHIP_METRICS.map(m => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1 text-xs"
                        title={m.name}
                      >
                        <span>{m.emoji}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {entry.metric_averages[m.id]?.toFixed(1) || '—'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 space-y-6">
          <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">How it works</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coaches and admins record leadership metrics for each player across 7 dimensions on a 1–10 scale. Your overall score is the average of all categories.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Track your progress</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  View your personal metrics in your profile. Improve your discipline, effort, teamwork, and leadership to climb the board.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics explainer */}
          <div className="p-6 rounded-2xl bg-secondary/50 border border-primary/10">
            <h4 className="font-semibold mb-4">7 Leadership Dimensions</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {LEADERSHIP_METRICS.map(m => (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{m.emoji}</span>
                    <p className="font-semibold text-sm">{m.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-8">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
