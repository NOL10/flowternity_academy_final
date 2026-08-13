'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS, LEADERSHIP_METRICS } from '@/lib/flowternity/config';
import { Save, User as UserIcon, Trophy, Shield, Zap } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSport, setSelectedSport] = useState('basketball');

  // Only collect account-level info: name, phone, email (read-only)
  const [form, setForm] = useState({ full_name: '', phone: '' });

  const load = async () => {
    const res = await fetch('/api/profile/full', { credentials: 'include' });
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setForm({
        full_name: d.user.full_name || '',
        phone: d.user.phone || '',
      });
    }
  };

  const loadMetrics = async () => {
    if (!user) return;
    const res = await fetch(`/api/leadership-metrics?user_id=${user.id}&sport_id=${selectedSport}`, { credentials: 'include' });
    if (res.ok) {
      const d = await res.json();
      setMetrics(d);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/auth?mode=login&next=/profile');
    if (user) load();
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadMetrics();
    // Poll for new metrics every 3 seconds
    const interval = setInterval(() => {
      if (user) loadMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, [user, selectedSport]);

  // Also reload when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && user) {
        loadMetrics();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, selectedSport]);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (res.ok) { toast.success('Profile saved'); refresh(); load(); }
    else toast.error('Failed to save');
    setSaving(false);
  };

  if (loading || !data) return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-20">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-1/3 bg-secondary rounded" />
          <div className="h-32 bg-secondary rounded-2xl" />
        </div>
      </div>
    </div>
  );

  const athletes = data.children || [];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-10 md:py-14 max-w-5xl">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Profile</p>
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Your account</h1>

        {/* Header card */}
        <Card className="p-6 md:p-8 rounded-3xl mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow">
              <AvatarFallback className="bg-accent text-black font-black text-2xl">
                {user.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-2xl md:text-3xl">{user.full_name}</h2>
                {user.role === 'admin' && <Badge className="bg-accent text-black hover:bg-accent">Admin</Badge>}
              </div>
              <p className="text-muted-foreground mt-1">{user.email} · {user.phone || 'No phone'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Left: account + athletes */}
          <div className="md:col-span-2 space-y-6">

            {/* Account details — minimal */}
            <Card className="p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="w-5 h-5" />
                <h3 className="font-display font-bold text-xl">Account details</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input className="h-11 mt-1" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input className="h-11 mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Email (read-only)</Label>
                  <Input className="h-11 mt-1" value={user.email} readOnly disabled />
                </div>
              </div>
              <Button onClick={save} disabled={saving} className="mt-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </Card>

            {/* Athlete profiles */}
            <Card className="p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" />
                <h3 className="font-display font-bold text-xl">Athlete Profiles</h3>
              </div>
              {athletes.length === 0 ? (
                <div className="p-6 rounded-xl border-dashed border text-center text-muted-foreground">
                  No athlete profiles yet. Purchase a membership to add one.
                  <div className="mt-3">
                    <Link href="/memberships">
                      <Button className="h-10 bg-primary text-primary-foreground hover:bg-primary/90">Browse Memberships</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {athletes.map(athlete => {
                    const name = athlete.athlete_name || athlete.child_name || '?';
                    return (
                      <div key={athlete.id} className="p-4 rounded-xl border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-black text-black">
                            {name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{name}</div>
                            <div className="text-xs text-muted-foreground">
                              DOB {new Date(athlete.dob).toLocaleDateString('en-IN')} · {athlete.gender || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(athlete.selected_sports || []).map(sid => {
                            const s = SPORTS.find(x => x.id === sid);
                            return <Badge key={sid} variant="secondary">{s?.name || sid}</Badge>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Leadership Metrics */}
            {metrics && (
              <Card className="p-6 md:p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <h3 className="font-display font-bold text-xl">Leadership Board</h3>
                  </div>
                  <select
                    value={selectedSport}
                    onChange={e => setSelectedSport(e.target.value)}
                    className="px-3 py-1 rounded-lg border text-sm bg-secondary border-primary/20"
                  >
                    {SPORTS.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {metrics.metrics && metrics.metrics.length > 0 ? (
                  <div className="space-y-3">
                    {/* Overall Score + latest coach note */}
                    {metrics.metrics.some(m => m.average > 0) && (
                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-2xl font-bold mt-1">
                              {(metrics.metrics.reduce((sum, m) => sum + (m.average || 0), 0) / metrics.metrics.length).toFixed(1)} <span className="text-lg text-muted-foreground">/10</span>
                            </p>
                          </div>
                          <div className="text-4xl">👑</div>
                        </div>
                        {/* Latest coach note */}
                        {metrics.all_records?.[0]?.notes && (
                          <div className="mt-3 pt-3 border-t border-accent/20">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Coach's Note</p>
                            <p className="text-sm italic">"{metrics.all_records[0].notes}"</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(metrics.all_records[0].recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metric breakdown */}
                    <div className="grid grid-cols-1 gap-3">
                      {metrics.metrics.map(metric => {
                        const latestRecord = metrics.all_records?.find(r => r.metric_id === metric.id);
                        return (
                          <div key={metric.id} className="space-y-2">
                            <div className="p-3 rounded-lg border bg-secondary/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-2xl">{metric.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">{metric.name}</p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                  <p className="text-xl font-bold text-accent">{metric.average || '—'}</p>
                                  <p className="text-xs text-muted-foreground">/10</p>
                                </div>
                              </div>
                              {/* Measures/Description */}
                              {metric.description && (
                                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{metric.description}</p>
                              )}
                              {/* Progress bar */}
                              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${metric.color} rounded-full transition-all`}
                                  style={{ width: `${(metric.average || 0) * 10}%` }}
                                />
                              </div>
                            </div>
                            {/* Separate note box */}
                            {latestRecord?.notes && (
                              <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/20 ml-1">
                                <p className="text-xs italic text-muted-foreground">"{latestRecord.notes}"</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No leadership metrics recorded yet.</p>
                )}
              </Card>
            )}
          </div>

          {/* Right: memberships + security */}
          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4" />
                <h3 className="font-display font-bold">Memberships</h3>
              </div>
              {data.memberships?.length ? (
                <div className="space-y-2">
                  {data.memberships.slice(0, 5).map(m => {
                    const sport = SPORTS.find(s => s.id === m.sport_id || s.id === m.membership_snapshot?.sport_id);
                    return (
                      <div key={m.id} className="p-3 rounded-lg bg-secondary">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-sm">
                            {sport?.name || m.membership_snapshot?.name} · {m.membership_snapshot?.duration_months}M
                          </span>
                          <Badge
                            variant={m.status === 'active' ? 'default' : 'secondary'}
                            className={m.status === 'active' ? 'bg-accent text-black hover:bg-accent flex-shrink-0' : 'flex-shrink-0'}
                          >
                            {m.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expires {new Date(m.expiry_date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No memberships yet.</p>
              )}
              <Link href="/memberships" className="block mt-3">
                <Button variant="outline" className="w-full h-9 text-sm">+ Add sport</Button>
              </Link>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" />
                <h3 className="font-display font-bold">Security</h3>
              </div>
              <Link href="/forgot">
                <Button variant="outline" className="w-full h-10">Change password</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
