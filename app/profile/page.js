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
import { SPORTS } from '@/lib/flowternity/config';
import { Save, User as UserIcon, Trophy, Shield, Zap } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!loading && !user) router.push('/auth?mode=login&next=/profile');
    if (user) load();
  }, [user, loading, router]);

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
