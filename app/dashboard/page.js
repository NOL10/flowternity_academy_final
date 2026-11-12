'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS, MEMBERSHIPS, LEADERSHIP_METRICS, KIDS_LEVELS } from '@/lib/flowternity/config';
import { Calendar, Clock, User, Pause, PlayCircle, RefreshCw, CreditCard, Trophy, Sparkles, X, TrendingUp, ChevronDown, ChevronUp, LogOut, Settings, Medal, Target, Zap, Download, Bell, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [activeSport, setActiveSport] = useState('basketball');
  const [performanceData, setPerformanceData] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    leadership: false,
    activity: true, // Activity always open
  });
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);

  // Load children list on mount
  useEffect(() => {
    if (!loading && !user) router.push('/auth?mode=login&next=/dashboard');
    if (user) {
      fetch('/api/children', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          const kids = d.children || [];
          setChildren(kids);
          if (kids.length > 0) setActiveChild(prev => prev || kids[0]);
        });
    }
  }, [user, loading, router]);

  // Fetch dashboard data for active child
  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    const childId = activeChild?.id;
    const queryParam = childId ? `?child_profile_id=${childId}` : '';
    
    // Fetch child-specific dashboard data
    fetch(`/api/dashboard${queryParam}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoadingData(false);
      })
      .catch(() => {
        setData(null);
        setLoadingData(false);
      });
  }, [user, activeChild]);

    // Fetch performance data when sport or active child changes
  useEffect(() => {
    if (!user) return;
    const subject_id = activeChild?.id || user.id;
    fetch(`/api/athletes/${subject_id}/performance?history=true`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setPerformanceData(d);
        if (!activeSport && d.sports?.length > 0) {
          setActiveSport(d.sports[0].sport_id);
        }
      });

    // Leadership: pass the correct user_id — if activeChild exists, the metrics
    // were saved with selected.id (child profile ID) as user_id by the admin panel.
    fetch(`/api/leadership-metrics?user_id=${subject_id}&sport_id=${activeSport}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        // API returns metrics array with { id, average, scores, ... }
        // Normalise to { metric_id, score } shape the UI expects
        if (d.metrics) {
          const normalised = d.metrics.map(m => ({
            ...m,
            metric_id: m.metric_id || m.id,  // grouped by LEADERSHIP_METRICS.id
            score: m.average ?? m.score ?? 0, // use average as the display score
          }));
          setLeadershipData({ ...d, metrics: normalised });
        } else {
          setLeadershipData(null);
        }
      })
      .catch(() => setLeadershipData(null));
  }, [user, activeChild, activeSport]);

  // Export performance data
  const exportPerformance = () => {
    if (!performanceData) return;
    const sport = performanceData.sports.find(s => s.sport_id === activeSport);
    if (!sport) return;

    const csvContent = [
      ['Performance Report', activeSport.toUpperCase()],
      ['Generated', new Date().toLocaleDateString('en-IN')],
      [],
      ['Metric', 'Score', 'Max'],
      ...Object.entries(sport.scores || {}).map(([key, val]) => [key, val, 10]),
      [],
      ['Monthly Data'],
      ['Month', 'Average Score'],
      ...(performanceData.monthly_history?.[activeSport] || []).map(m => [m.month, (Object.values(m.metrics).reduce((a, b) => a + b, 0) / Object.keys(m.metrics).length).toFixed(1)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${activeSport}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Performance data exported');
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-secondary rounded-3xl" />
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const current_perf = performanceData?.sports?.find(s => s.sport_id === activeSport);
  const current_level = current_perf?.level || 1;
  const level_info = KIDS_LEVELS.find(l => l.level === current_level);

  // Combined score = average of performance avg + leadership avg (only scored metrics)
  const combinedScore = (() => {
    const perfVals = Object.values(current_perf?.scores || {});
    const perfAvg = perfVals.length > 0 ? perfVals.reduce((a, b) => a + b, 0) / perfVals.length : 0;
    const leadMetrics = (leadershipData?.metrics || []).filter(m => m.score > 0);
    const leadAvg = leadMetrics.length > 0 ? leadMetrics.reduce((s, m) => s + m.score, 0) / leadMetrics.length : 0;
    if (perfAvg > 0 && leadAvg > 0) return ((perfAvg + leadAvg) / 2).toFixed(1);
    if (perfAvg > 0) return perfAvg.toFixed(1);
    if (leadAvg > 0) return leadAvg.toFixed(1);
    return null;
  })();
  
  // Active memberships with proper validity
  const activeMemberships = (data?.memberships || [])
    .filter(m => m.status === 'active' && new Date(m.expiry_date) > new Date());

  // Filter announcements and allow dismissal
  const visibleAnnouncements = (data?.announcements || []).filter(a => !dismissedAnnouncements.includes(a.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 pb-12">
      <SiteNav />
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        
        {/* ===== STICKY HEADER ===== */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Welcome back</p>
            <h1 className="font-display font-black text-4xl md:text-5xl">
              Hey, {user?.full_name?.split(' ')[0]}! <span className="inline-block animate-bounce" style={{animationDelay: '0.2s'}}>👋</span>
            </h1>
            <p className="text-muted-foreground mt-2">Every session makes you stronger.</p>
          </div>
          <button 
            onClick={() => fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(() => router.push('/auth'))}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* ===== ANNOUNCEMENTS BANNER ===== */}
        {visibleAnnouncements.length > 0 && (
          <div className="mb-8 space-y-3 animate-slide-down">
            {visibleAnnouncements.map(a => (
              <Card key={a.id} className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-l-blue-500 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 flex-1">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">{a.title}</h4>
                    <p className="text-sm text-blue-800 mt-1">{a.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDismissedAnnouncements([...dismissedAnnouncements, a.id])}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* ===== SPORT SELECTOR ===== */}
        {children.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <span className="text-sm text-muted-foreground self-center">Athlete:</span>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChild(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeChild?.id === c.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'border border-border hover:border-primary'
                }`}
              >
                {c.athlete_name || c.child_name}
              </button>
            ))}
          </div>
        )}

        {/* ===== HERO SECTION: ATHLETE PROGRESS ===== */}
        <Card className="mb-8 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-0 relative overflow-hidden shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5 blur-3xl" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-slide-up">
              <p className="text-primary-foreground/60 text-sm uppercase tracking-widest mb-2">Current Level</p>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-display font-black text-7xl animate-pulse">{current_level}</span>
                <span className="font-display font-bold text-3xl">{level_info?.name}</span>
              </div>
              <p className="text-primary-foreground/80 italic mb-6">&ldquo;{level_info?.quote}&rdquo;</p>
              
              {/* Athlete Tag Badge */}
              {activeChild?.athlete_tag && (
                <div className="mb-4">
                  <Badge className={`px-3 py-1.5 text-sm font-bold ${
                    activeChild.athlete_tag === 'juniors' ? 'bg-blue-500 text-white' :
                    activeChild.athlete_tag === 'intermediates' ? 'bg-purple-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {activeChild.athlete_tag === 'juniors' ? '🔵 Juniors' :
                     activeChild.athlete_tag === 'intermediates' ? '🟣 Intermediates' :
                     '🟠 Seniors'}
                  </Badge>
                </div>
              )}
              
              {/* Level progress dots */}
              <div className="flex gap-2 flex-wrap">
                {KIDS_LEVELS.map((l, idx) => (
                  <div
                    key={l.level}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 transform hover:scale-125 ${
                      l.level < current_level
                        ? 'bg-accent text-black'
                        : l.level === current_level
                        ? 'bg-white text-primary ring-2 ring-accent scale-110'
                        : 'bg-white/20 text-white/60'
                    }`}
                    title={l.name}
                    style={{transitionDelay: `${idx * 50}ms`}}
                  >
                    {l.level}
                  </div>
                ))}
              </div>

            </div>

            {/* Performance Score */}
            {current_perf && (
              <div className="flex flex-col items-center md:items-end justify-center animate-slide-up" style={{animationDelay: '0.1s'}}>
                <p className="text-primary-foreground/60 text-sm uppercase tracking-widest mb-4">Overall Score</p>
                <div className="font-display font-black text-7xl text-accent mb-2 animate-bounce">
                  {combinedScore ?? '—'}
                </div>
                <p className="text-primary-foreground/80 text-sm">/10</p>
              </div>
            )}
          </div>
        </Card>

        {/* ===== QUICK STATS ROW ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatsCard icon={Medal} label="Current Level" value={current_level} color="blue" delay={0} />
          <StatsCard 
            icon={Zap} 
            label="Overall Score"
            value={combinedScore ?? '—'}
            color="yellow"
            delay={1}
          />
          <StatsCard 
            icon={Trophy} 
            label="Assessments"
            value={performanceData?.sports?.reduce((sum, s) => sum + Object.keys(s.scores || {}).length, 0) || 0}
            color="green"
            delay={2}
          />
        </div>

        {/* ===== MINI SPORT CARDS ===== */}
        {performanceData?.sports && performanceData.sports.length > 1 && (
          <div className="mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h3 className="font-display font-bold text-lg mb-4">Your Sports</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {performanceData.sports.map((sport, idx) => {
                const isActive = sport.sport_id === activeSport;
                const score = Object.values(sport.scores || {}).length > 0 
                  ? (Object.values(sport.scores).reduce((a, b) => a + b, 0) / Object.keys(sport.scores).length).toFixed(1)
                  : 0;
                const sessionsThisMonth = (performanceData.monthly_history?.[sport.sport_id] || []).length > 0 ? 
                  Object.values(performanceData.monthly_history[sport.sport_id][performanceData.monthly_history[sport.sport_id].length - 1]?.metrics || {}).filter(v => v > 0).length : 0;

                return (
                  <button
                    key={sport.sport_id}
                    onClick={() => setActiveSport(sport.sport_id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 animate-slide-up ${
                      isActive
                        ? 'bg-gradient-to-br from-primary to-primary/80 border-primary text-primary-foreground shadow-lg'
                        : 'bg-gradient-to-br from-secondary/50 to-secondary/30 border-border hover:border-primary/50'
                    }`}
                    style={{animationDelay: `${idx * 50}ms`}}
                  >
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{sport.sport_name}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Level</span>
                          <span className="font-bold">{sport.level}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Score</span>
                          <span className="font-bold">{score}/10</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Sessions</span>
                          <span className="font-bold">{sessionsThisMonth}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== COMBINED PERFORMANCE & LEADERSHIP SCORE ===== */}
        {current_perf && leadershipData && (
          (() => {
            const perfVals = Object.values(current_perf.scores || {});
            const perfScore = perfVals.length > 0 ? perfVals.reduce((a, b) => a + b, 0) / perfVals.length : 0;
            const leadMetrics = (leadershipData?.metrics || []).filter(m => m.score > 0);
            const leadScore = leadMetrics.length > 0
              ? leadMetrics.reduce((sum, m) => sum + m.score, 0) / leadMetrics.length
              : 0;
            const combined = perfScore > 0 && leadScore > 0 ? (perfScore + leadScore) / 2
              : perfScore > 0 ? perfScore
              : leadScore > 0 ? leadScore
              : 0;
            if (perfScore === 0 && leadScore === 0) return null;
            return (
              <Card className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 to-transparent border border-indigo-200 animate-fade-in">
                <h3 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" /> Overall Score
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-white border border-indigo-100">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Performance Avg</p>
                    <p className="font-display font-black text-4xl text-indigo-600 mb-1">
                      {perfScore > 0 ? perfScore.toFixed(1) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">/10</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-indigo-100">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Leadership Avg</p>
                    <p className="font-display font-black text-4xl text-purple-600 mb-1">
                      {leadScore > 0 ? leadScore.toFixed(1) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">/10</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Combined Score</p>
                    <p className="font-display font-black text-4xl text-indigo-700 mb-1">
                      {combined > 0 ? combined.toFixed(1) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">/10</p>
                  </div>
                </div>
              </Card>
            );
          })()
        )}
        {activeMemberships.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h3 className="font-display font-bold text-2xl mb-4">Active Memberships</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {activeMemberships.map((m, idx) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)));
                const totalDays = (m.membership_snapshot?.duration_months || 1) * 30;
                const pct = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
                const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (pct / 100) * circumference;

                return (
                  <Card 
                    key={m.id} 
                    className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-105 transform md:col-span-3"
                    style={{animationDelay: `${idx * 50}ms`}}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Membership</p>
                        <h4 className="font-display font-bold text-lg mt-1">
                          {m.membership_snapshot?.name}
                        </h4>
                      </div>
                      {isExpiringSoon && (
                        <Badge className="bg-orange-500 text-white animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" /> {daysLeft}d
                        </Badge>
                      )}
                      {!isExpiringSoon && <Badge className="bg-green-500 text-white">Active</Badge>}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {/* Progress Ring */}
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 absolute inset-0" viewBox="0 0 100 100" style={{transform: 'rotateZ(-90deg)'}}>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={isExpiringSoon ? '#f97316' : '#3b82f6'}
                              strokeWidth="3"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              className="transition-all duration-1000"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-bold text-lg">{Math.round(pct)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-semibold">{new Date(m.expiry_date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Days Left</span>
                            <span className={`font-bold ${isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>{daysLeft} days</span>
                          </div>
                        </div>

                        {m.membership_snapshot?.type === 'slot' && m.slots_remaining && (
                          <Badge variant="outline" className="text-xs">
                            {m.slots_remaining}/{m.slots_total} slots
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Active Membership Card */}
        {activeMemberships.length === 0 && (
          <div className="mb-8 p-8 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl border-2 border-orange-300 animate-fade-in">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-orange-900">No Active Membership</h3>
                <p className="text-sm text-orange-800 mt-1">Join us today to start your athletic journey and unlock exclusive benefits.</p>
              </div>
              <Link href="/memberships">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0">Browse Memberships</Button>
              </Link>
            </div>
          </div>
        )}

        {/* ===== WEEKLY STATS ===== */}
        <div className="mb-8 grid md:grid-cols-2 gap-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
          {/* Weekly Sessions */}
          <Card className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-200 hover:shadow-lg transition-all hover:scale-105 transform">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">This Week</p>
                <h3 className="font-display font-bold text-3xl text-blue-900 mt-1">{(data?.upcoming_classes || []).filter(c => {
                  const classDate = new Date(c.class.date);
                  const today = new Date();
                  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekEnd.getDate() + 7);
                  return classDate >= weekStart && classDate < weekEnd;
                }).length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-200/50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">Classes scheduled</p>
          </Card>

          {/* Weekly Average Score */}
          <Card className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/30 border border-green-200 hover:shadow-lg transition-all hover:scale-105 transform">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-green-600 font-semibold">Performance</p>
                <h3 className="font-display font-bold text-3xl text-green-900 mt-1">{combinedScore ?? '—'}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-200/50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
  
          </Card>
        </div>

        {/* ===== PERFORMANCE SECTION ===== */}
        <Card className="mb-8 rounded-3xl overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div
            onClick={() => toggleSection('performance')}
            className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-transparent cursor-pointer hover:from-blue-100 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <h2 className="font-display font-bold text-2xl">Your Performance</h2>
            </div>
            <div className={`transition-transform duration-300 ${expandedSections.performance ? 'rotate-180' : ''}`}>
              <ChevronUp className="w-5 h-5" />
            </div>
          </div>

          {expandedSections.performance && (
            <div className="p-6 md:p-8 border-t animate-fade-in">
              {/* Sport tabs */}
              {performanceData?.sports && performanceData.sports.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {performanceData.sports.map(sp => (
                    <button
                      key={sp.sport_id}
                      onClick={() => setActiveSport(sp.sport_id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                        activeSport === sp.sport_id
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {sp.sport_name}
                    </button>
                  ))}
                </div>
              )}

              {/* Export button */}
              {current_perf && (
                <div className="mb-6">
                  <Button 
                    onClick={exportPerformance}
                    className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" /> Export Performance Data
                  </Button>
                </div>
              )}

              {current_perf && (
                <>
                  {/* Strength & Focus Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* All Performance Metrics */}
                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-transparent p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-102">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 animate-fade-in">
                        <span className="text-2xl">📊</span> All Performance Metrics
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {(current_perf.metrics_catalog || [])
                          .map((m, idx) => {
                            const v = current_perf.scores?.[m.key];
                            if (v === undefined) return null;
                            return (
                              <div key={m.key} className="animate-slide-up" style={{animationDelay: `${idx * 50}ms`}}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">{m.label}</span>
                                  <span className="font-bold text-blue-600">{v}/10</span>
                                </div>
                                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${v * 10}%` }} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Monthly trend chart */}
                  {performanceData?.monthly_history?.[activeSport] && (
                    <PerformanceTrendChart monthlyData={performanceData.monthly_history[activeSport]} />
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {/* ===== LEADERSHIP SECTION ===== */}
        <Card className="mb-8 rounded-3xl overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div
            onClick={() => toggleSection('leadership')}
            className="p-6 md:p-8 bg-gradient-to-r from-purple-50 to-transparent cursor-pointer hover:from-purple-100 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <h2 className="font-display font-bold text-2xl">Leadership Profile</h2>
            </div>
            <div className={`transition-transform duration-300 ${expandedSections.leadership ? 'rotate-180' : ''}`}>
              <ChevronUp className="w-5 h-5" />
            </div>
          </div>

          {expandedSections.leadership && (
            <div className="p-6 md:p-8 border-t animate-fade-in">
              {/* Only show empty state if there are truly no scored metrics (all averages = 0) */}
              {!leadershipData || !leadershipData.metrics || leadershipData.metrics.every(m => !m.score || m.score === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto opacity-20 mb-3" />
                  <p>Your coach hasn&apos;t recorded leadership metrics yet.</p>
                  <p className="text-sm mt-1">Complete more sessions to get your first evaluation.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {LEADERSHIP_METRICS.map((category, idx) => {
                    // API returns metric with id = category.id, and score = average
                    const metric = leadershipData.metrics.find(
                      m => m.metric_id === category.id || m.id === category.id
                    );
                    const score = metric?.score ?? 0;
                    return (
                      <LeadershipCard
                        key={category.id}
                        emoji={category.emoji}
                        color={category.color}
                        name={category.name}
                        score={score}
                        description={category.description}
                        delay={idx}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ===== ACTIVITY SECTION (COLLAPSIBLE) ===== */}
        <Card className="rounded-3xl overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow animate-fade-in" style={{animationDelay: '0.5s'}}>
          <div
            onClick={() => toggleSection('activity')}
            className="p-6 md:p-8 bg-gradient-to-r from-indigo-50 to-transparent cursor-pointer hover:from-indigo-100 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <h2 className="font-display font-bold text-2xl">Activity & Schedule</h2>
            </div>
            <div className={`transition-transform duration-300 ${expandedSections.activity ? 'rotate-180' : ''}`}>
              <ChevronUp className="w-5 h-5" />
            </div>
          </div>

          {expandedSections.activity && (
          <div className="p-6 md:p-8 border-t space-y-8 animate-fade-in">
            {/* Upcoming Classes */}
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Upcoming Classes
              </h4>
              {data?.upcoming_classes && data.upcoming_classes.length > 0 ? (
                <div className="space-y-3">
                  {data.upcoming_classes.map((uc, idx) => (
                    <div 
                      key={uc.booking_id} 
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-transparent rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-md transform hover:scale-102 animate-slide-up"
                      style={{animationDelay: `${idx * 50}ms`}}
                    >
                      <div className="text-center flex-shrink-0 bg-indigo-100 rounded-xl p-3">
                        <div className="text-xs text-indigo-600 font-semibold">{new Date(uc.class.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                        <div className="font-display font-black text-2xl text-indigo-700">{new Date(uc.class.date).getDate()}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-indigo-900">{uc.sport_name}</div>
                        <div className="text-sm text-indigo-700 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{uc.class.start_time}–{uc.class.end_time}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{uc.class.coach_name}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-shrink-0 hover:bg-red-100 hover:text-red-600 transition-all" 
                        onClick={() => {
                          fetch(`/api/bookings/${uc.booking_id}/cancel`, { method: 'POST', credentials: 'include' })
                            .then(() => {
                              // Refetch dashboard data
                              const childId = activeChild?.id;
                              const queryParam = childId ? `?child_profile_id=${childId}` : '';
                              return fetch(`/api/dashboard${queryParam}`, { credentials: 'include' }).then(r => r.json()).then(setData);
                            })
                            .then(() => toast.success('Class cancelled'))
                            .catch((e) => toast.error(e.message || 'Failed to cancel'));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/50 rounded-2xl">
                  <Calendar className="w-10 h-10 mx-auto opacity-20 mb-2" />
                  <p>No upcoming classes.</p>
                  <Link href="/classes">
                    <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">Book a Class</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Payments */}
            {data?.payments && data.payments.length > 0 && (
              <div className="border-t pt-8">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Recent Payments
                </h4>
                <div className="space-y-2">
                  {data.payments.slice(0, 5).map((p, idx) => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors animate-slide-up"
                      style={{animationDelay: `${idx * 50}ms`}}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-4 h-4 text-green-700" />
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-green-900">{p.ref}</div>
                          <div className="text-xs text-green-700">{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-900">₹{p.amount.toLocaleString('en-IN')}</div>
                        <Badge className="text-[10px] bg-green-200 text-green-900 hover:bg-green-300">{p.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
        </Card>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .hover\:scale-102:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
}

// ===== COMPONENTS =====

function StatsCard({ icon: Icon, label, value, color }) {
  const bgColor = {
    blue: 'from-blue-50 to-blue-100/50',
    yellow: 'from-yellow-50 to-yellow-100/50',
    green: 'from-green-50 to-green-100/50',
    purple: 'from-purple-50 to-purple-100/50',
  }[color];

  const iconColor = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
  }[color];

  return (
    <Card className={`p-4 md:p-6 rounded-2xl bg-gradient-to-br ${bgColor} border-0 text-center`}>
      <div className={`${iconColor} w-6 h-6 mx-auto mb-3`}>
        <Icon className="w-full h-full" />
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="font-display font-black text-3xl md:text-4xl">{value}</p>
    </Card>
  );
}

function LeadershipCard({ emoji, color, name, score, description }) {
  return (
    <Card className={`p-5 md:p-6 rounded-2xl border-0 ${color.includes('blue') ? 'bg-blue-50 border border-blue-200' : color.includes('red') ? 'bg-red-50 border border-red-200' : color.includes('orange') ? 'bg-orange-50 border border-orange-200' : color.includes('green') ? 'bg-green-50 border border-green-200' : color.includes('purple') ? 'bg-purple-50 border border-purple-200' : color.includes('yellow') ? 'bg-yellow-50 border border-yellow-200' : 'bg-pink-50 border border-pink-200'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-black/30" style={{ width: `${(score / 10) * 100}%` }} />
            </div>
            <span className="font-bold text-sm">{score}/10</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}

function PerformanceTrendChart({ monthlyData }) {
  const chartData = monthlyData.map(m => ({
    month: m.month,
    avg: m.metrics && Object.keys(m.metrics).length > 0
      ? Object.values(m.metrics).reduce((a, b) => a + b, 0) / Object.keys(m.metrics).length
      : 0,
  }));

  const current = chartData[chartData.length - 1]?.avg || 0;
  const highest = Math.max(...chartData.map(d => d.avg));
  const lowest = Math.min(...chartData.map(d => d.avg));

  return (
    <Card className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-transparent border-0">
      <h4 className="font-semibold text-lg mb-4">Performance Trend</h4>
      <div className="h-64 -mx-4 md:-mx-8 px-4 md:px-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 10]} stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip formatter={(v) => v.toFixed(1)} labelFormatter={l => l} />
            <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="text-center p-3 bg-white rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="font-bold">{current.toFixed(1)}/10</p>
        </div>
        <div className="text-center p-3 bg-white rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Highest</p>
          <p className="font-bold">{highest.toFixed(1)}/10</p>
        </div>
        <div className="text-center p-3 bg-white rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Lowest</p>
          <p className="font-bold">{lowest.toFixed(1)}/10</p>
        </div>
      </div>
    </Card>
  );
}


