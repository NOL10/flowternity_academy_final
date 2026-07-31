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
import { SPORTS, MEMBERSHIPS } from '@/lib/flowternity/config';
import { Calendar, Clock, User, Pause, PlayCircle, RefreshCw, CreditCard, Trophy, Sparkles, X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseTarget, setPauseTarget] = useState(null); // which membership to pause
  const [pauseDays, setPauseDays] = useState(30);
  const [loadingData, setLoadingData] = useState(true);

  const load = async () => {
    setLoadingData(true);
    const res = await fetch('/api/dashboard', { credentials: 'include' });
    if (res.ok) setData(await res.json());
    setLoadingData(false);
  };

  useEffect(() => {
    if (!loading && !user) router.push('/auth?mode=login&next=/dashboard');
    if (user) load();
  }, [user, loading, router]);

  const cancelBooking = async (id) => {
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('Booking cancelled'); load(); } else toast.error('Failed');
  };

  const pauseMembership = async () => {
    if (!pauseTarget) return;
    const res = await fetch('/api/memberships/pause', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ days: pauseDays, membership_id: pauseTarget.id }),
    });
    const d = await res.json();
    if (res.ok) { toast.success('Membership paused'); setPauseOpen(false); load(); } else toast.error(d.error);
  };

  const resume = async (mid) => {
    const res = await fetch('/api/memberships/resume', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ membership_id: mid }),
    });
    if (res.ok) { toast.success('Membership resumed'); load(); } else toast.error('Failed');
  };

  if (loading || loadingData) return (
    <div className="min-h-screen bg-background"><SiteNav /><div className="container py-20"><div className="animate-pulse space-y-4"><div className="h-8 bg-secondary w-1/3 rounded" /><div className="h-40 bg-secondary rounded-2xl" /></div></div></div>
  );

  // All active/paused memberships
  const activeMemberships = (data?.memberships || []).filter(m => m.status === 'active' || m.status === 'paused');

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteNav />
      <div className="container px-4 py-6 md:py-14 max-w-7xl mx-auto">
        {/* Mobile-first header */}
        <div className="mb-6 md:mb-8">
          <p className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h1 className="font-display font-black text-3xl md:text-5xl mt-1 leading-tight">
            Hello, {user?.full_name?.split(' ')[0]} 
            <span className="inline-block ml-1"><Sparkles className="w-6 h-6 md:w-8 md:h-8 inline text-accent" /></span>
          </h1>
          {/* Mobile CTA */}
          <div className="mt-4 md:hidden">
            <Link href="/classes">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold">
                <Calendar className="w-5 h-5 mr-2" /> Book a Class
              </Button>
            </Link>
          </div>
        </div>

        {/* All active memberships */}
        {activeMemberships.length === 0 ? (
          <Card className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-accent border-0">
            <h2 className="font-display font-black text-2xl md:text-3xl text-black">No active membership.</h2>
            <p className="text-black/70 mt-2 text-sm md:text-base">Pick a plan to start booking classes.</p>
            <Link href="/memberships"><Button className="mt-4 w-full md:w-auto bg-black text-white hover:bg-black/90 h-12 md:h-12">Choose Plan</Button></Link>
          </Card>
        ) : (
          <div className={`grid gap-4 ${activeMemberships.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {activeMemberships.map(m => {
              const sport = SPORTS.find(s => s.id === m.sport_id || s.id === m.membership_snapshot?.sport_id);
              const daysLeft = Math.max(0, Math.ceil((new Date(m.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)));
              const totalDays = (m.membership_snapshot?.duration_months || 1) * 30;
              const pct = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
              const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
              const livePlan = MEMBERSHIPS.find(p => p.id === m.membership_id);
              const canPause = (m.membership_snapshot?.pause_days ?? livePlan?.pause_days ?? 0) > 0;
              return (
                <Card key={m.id} className="p-5 md:p-8 rounded-2xl md:rounded-3xl bg-primary text-primary-foreground border-0 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
                  {isExpiringSoon && (
                    <div className="absolute top-3 right-3 md:top-4 md:right-4">
                      <Badge className="bg-orange-500 text-white hover:bg-orange-600 animate-pulse text-xs">
                        <Clock className="w-3 h-3 mr-1" /> {daysLeft}d left
                      </Badge>
                    </div>
                  )}
                  <div className="relative grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                        <span className="text-xs md:text-sm uppercase tracking-widest text-white/60">{sport?.name || m.membership_snapshot?.name}</span>
                        <Badge className={`${m.status === 'active' ? 'bg-accent text-black' : 'bg-white/20 text-white'} hover:bg-accent text-xs`}>{m.status}</Badge>
                      </div>
                      <h2 className="font-display font-black text-2xl md:text-4xl mt-2">
                        {m.membership_snapshot?.type === 'slot' ? (
                          <>Basketball Single Classes</>
                        ) : (
                          <>{m.membership_snapshot?.duration_months} {m.membership_snapshot?.duration_months === 1 ? 'Month' : 'Months'}</>
                        )}
                      </h2>
                      {m.membership_snapshot?.type === 'slot' && (
                        <p className="text-white/80 mt-2 text-sm md:text-base font-semibold">
                          <span className="text-accent text-lg">{m.slots_remaining || 0}</span>
                          <span className="text-white/60"> / {m.slots_total || 0} slots remaining</span>
                        </p>
                      )}
                      <p className="text-white/60 mt-1 text-xs md:text-sm">Expires {new Date(m.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/60 mb-1"><span>{daysLeft} days remaining</span><span>{Math.round(pct)}%</span></div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full ${isExpiringSoon ? 'bg-orange-500' : 'bg-accent'}`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2">
                      {m.status === 'active' && canPause && (
                        <Button onClick={() => { setPauseTarget(m); setPauseOpen(true); }} variant="outline" className="flex-1 md:flex-none bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-11 text-sm font-semibold">
                          <Pause className="w-4 h-4 mr-1.5" /> Pause
                        </Button>
                      )}
                      {m.status === 'paused' && (
                        <Button onClick={() => resume(m.id)} className="flex-1 md:flex-none bg-accent text-black hover:bg-accent/90 h-11 text-sm font-semibold">
                          <PlayCircle className="w-4 h-4 mr-1.5" /> Resume
                        </Button>
                      )}
                      <Link href={`/memberships`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white h-11 text-sm font-semibold">
                          <RefreshCw className="w-4 h-4 mr-1.5" /> Renew
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
          {/* Upcoming classes */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="font-display font-bold text-xl md:text-2xl">Upcoming Classes</h3>
              <Link href="/classes" className="text-xs md:text-sm text-primary underline">Browse all</Link>
            </div>
            {data?.upcoming_classes?.length ? (
              <div className="space-y-3">
                {data.upcoming_classes.map(uc => (
                  <Card key={uc.booking_id} className="p-4 md:p-5 rounded-2xl flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-secondary flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] md:text-xs text-muted-foreground uppercase">{new Date(uc.class.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                      <span className="font-display font-black text-lg md:text-xl">{new Date(uc.class.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base">{uc.sport_name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{uc.class.start_time} – {uc.class.end_time}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{uc.class.coach_name}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => cancelBooking(uc.booking_id)} className="h-10 w-10 md:h-9 md:w-9 p-0 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 md:p-8 rounded-2xl text-center border-dashed">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm md:text-base text-muted-foreground">No upcoming classes.</p>
                <Link href="/classes"><Button className="mt-4 w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-11">Book Your First Class</Button></Link>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl md:text-2xl mb-3 md:mb-4">Recent Payments</h3>
              {data?.payments?.length ? (
                <Card className="rounded-2xl divide-y">
                  {data.payments.map(p => (
                    <div key={p.id} className="p-3 md:p-4 flex items-center gap-3">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><CreditCard className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs md:text-sm font-medium truncate">{p.ref}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm md:text-base font-semibold">₹{p.amount.toLocaleString('en-IN')}</div>
                        <Badge variant="secondary" className="text-[10px] md:text-xs">{p.status}</Badge>
                      </div>
                    </div>
                  ))}
                </Card>
              ) : <Card className="p-4 text-sm text-muted-foreground rounded-2xl">No payments yet.</Card>}
            </div>

            {data?.announcements?.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xl md:text-2xl mb-3 md:mb-4">Announcements</h3>
                <div className="space-y-3">
                  {data.announcements.map(a => (
                    <Card key={a.id} className="p-3 md:p-4 rounded-2xl border-l-4 border-l-accent">
                      <div className="font-semibold">{a.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance panel */}
        <PerformancePanel user={user} />
      </div>

      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pause membership</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Your expiry will be extended by the paused duration. Max 30 days, one pause per membership.</p>
          <div>
            <Label>Pause duration (days, max 30)</Label>
            <Input type="number" min="1" max="30" value={pauseDays} onChange={e => setPauseDays(e.target.value)} className="mt-1 h-12" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseOpen(false)}>Cancel</Button>
            <Button onClick={pauseMembership} className="bg-primary text-primary-foreground hover:bg-primary/90">Pause</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================
// Performance panel (view-only)
// ============================
function PerformancePanel({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [monthlyHistory, setMonthlyHistory] = useState(null);
  const [activeSport, setActiveSport] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const list = [];
      const r = await fetch('/api/children', { credentials: 'include' });
      const d = await r.json();
      const children = d.children || [];
      if (children.length > 0) {
        // Always show exactly one entry — pick the profile with the most sports
        // (or just the first one if equal). Label it with the athlete's actual name.
        const best = children.reduce((b, c) =>
          (c.selected_sports?.length || 0) >= (b.selected_sports?.length || 0) ? c : b
        , children[0]);
        list.push({
          id: best.id,
          label: best.athlete_name || best.child_name || user.full_name,
          type: 'athlete',
        });
      } else {
        list.push({ id: user.id, label: user.full_name, type: 'user' });
      }
      setSubjects(list);
      if (list[0]) loadPerf(list[0]);
    })();
  }, [user]);

  const loadPerf = async (s) => {
    setSelected(s);
    setData(null);
    setMonthlyHistory(null);
    
    const r = await fetch(`/api/athletes/${s.id}/performance?history=true`, { credentials: 'include' });
    if (!r.ok) { setData({ sports: [] }); return; }
    const d = await r.json();
    setData(d);
    setMonthlyHistory(d.monthly_history || {});
    setActiveSport(d.sports?.[0]?.sport_id || null);
  };

  if (!user || !subjects.length) return null;

  const current = data?.sports?.find(s => s.sport_id === activeSport);
  const currentMonthlyData = monthlyHistory ? monthlyHistory[activeSport] : null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-2xl">Performance</h3>
      </div>

      {!data ? (
        <div className="h-32 bg-secondary animate-pulse rounded-2xl" />
      ) : data.sports?.length === 0 ? (
        <Card className="p-8 rounded-2xl border-dashed text-center">
          <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No performance data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Your coach will start scoring after your first few sessions.</p>
        </Card>
      ) : (
        <>
          {/* Sport tabs */}
          <div className="flex items-center gap-1 border-b overflow-x-auto mb-4">
            {data.sports.map(sp => (
              <button key={sp.sport_id} onClick={() => setActiveSport(sp.sport_id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeSport === sp.sport_id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {sp.sport_name}
              </button>
            ))}
          </div>

          {current && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {current.level && (
                  <Card className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border-accent/30 md:col-span-1">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Current level · {current.sport_name}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display font-black text-4xl">L{current.level || 1}</span>
                      <span className="font-display font-bold text-xl">{current.level_info?.name || 'SPARK'}</span>
                    </div>
                    <p className="text-sm italic text-muted-foreground mt-2">&ldquo;{current.level_info?.quote || 'Every champion starts with a spark.'}&rdquo;</p>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {(data.levels_catalog || []).map(l => {
                        const at = (current.level || 1) >= l.level;
                        return (
                          <div key={l.level} title={`L${l.level} ${l.name}`}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${at ? 'bg-accent text-black' : 'bg-secondary text-muted-foreground'}`}>
                            {l.level}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                <Card className={`p-6 rounded-2xl ${current.level ? 'md:col-span-2' : 'md:col-span-3'}`}>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{current.sport_name} · Metrics</h4>
                      <p className="text-xs text-muted-foreground">Scored by your coach · 0–10 scale.</p>
                    </div>
                    {Object.keys(current.scores || {}).length > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">Avg</div>
                        <div className="font-display font-black text-2xl">
                          {(() => {
                            const vals = Object.values(current.scores || {});
                            return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                  {Object.keys(current.scores || {}).length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Your coach hasn&apos;t recorded metrics yet.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(current.metrics_catalog || []).map(m => {
                        const v = current.scores?.[m.key];
                        if (v === undefined) return null;
                        return (
                          <div key={m.key} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{m.label}</div>
                              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                                <div className={`h-full ${v >= 7 ? 'bg-primary' : v >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${v * 10}%` }} />
                              </div>
                            </div>
                            <div className="font-mono font-semibold w-12 text-right">{v}<span className="text-muted-foreground text-xs">/10</span></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* Monthly trend chart */}
              {currentMonthlyData && currentMonthlyData.length > 0 && (
                <PerformanceTrendChart 
                  monthlyData={currentMonthlyData}
                  metrics={current.metrics_catalog || []}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Monthly performance trend component - Overall Graph Only
function PerformanceTrendChart({ monthlyData, metrics, selectedMetric, onMetricSelect }) {
  const chartData = monthlyData.map(m => ({
    month: m.month,
    avg: m.metrics && Object.keys(m.metrics).length > 0 
      ? Object.values(m.metrics).reduce((a, b) => a + b, 0) / Object.keys(m.metrics).length 
      : 0,
    count: m.recordCount,
  }));

  const trend = chartData.length > 1 
    ? ((chartData[chartData.length - 1].avg - chartData[0].avg) / chartData[0].avg * 100).toFixed(1)
    : 0;

  const isPositive = trend >= 0;
  const currentScore = chartData.length > 0 ? chartData[chartData.length - 1].avg : 0;
  const lowestScore = Math.min(...chartData.map(d => d.avg));
  const highestScore = Math.max(...chartData.map(d => d.avg));

  return (
    <Card className="p-6 md:p-8 rounded-3xl border border-border bg-gradient-to-br from-background via-background to-secondary/5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h4 className="font-display font-bold text-2xl md:text-3xl mb-1">Performance Progress</h4>
          <p className="text-sm text-muted-foreground">Month-on-month average scores over the last 12 months</p>
        </div>
        
        {/* Stats Box */}
        <div className="flex gap-6">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Current</span>
            <span className="font-display font-black text-3xl">{currentScore.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
          
          <div className={`flex flex-col items-center md:items-end p-3 rounded-2xl ${isPositive ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Trend</span>
            <span className={`font-display font-black text-3xl flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72 md:h-96 -mx-2 md:-mx-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}/10`, 'Avg Score']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Line 
              type="monotone" 
              dataKey="avg" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#ffffff' }} 
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-2xl bg-secondary/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Highest</p>
          <p className="font-display font-black text-2xl">{highestScore.toFixed(1)}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-secondary/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Data Points</p>
          <p className="font-display font-black text-2xl">{chartData.length}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-secondary/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Lowest</p>
          <p className="font-display font-black text-2xl">{lowestScore.toFixed(1)}</p>
        </div>
      </div>
    </Card>
  );
}
