'use client';
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS, MEMBERSHIPS as MEMBERSHIPS_LOCAL, LEADERSHIP_METRICS, METRIC_SCORES } from '@/lib/flowternity/config';
import {
  Trash2, Plus, Users, Calendar, Activity, Sparkles, Search, CreditCard,
  Megaphone, UserCog, ClipboardList, CheckCircle2, XCircle, Save, Flame,
  LayoutDashboard, ArrowLeft, LogOut, ChevronRight, Home, TrendingUp, Gift, CalendarPlus, RotateCcw,
  BarChart2, FileText, TrendingDown, Percent, BookOpen, Printer, Download
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';

// ---- Friendly time selector (30-min slots) + manual entry toggle ----
function TimeSelect({ value, onChange, placeholder = 'Pick time', className = '' }) {
  const [manual, setManual] = useState(false);

  const slots = [];
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const val = `${hh}:${mm}`;
      const ampm = h < 12 ? 'AM' : 'PM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${h12}:${mm} ${ampm}`;
      slots.push({ val, label });
    }
  }

  // Check if current value is not in the 30-min slots (i.e. it's a custom time)
  const isCustom = value && !slots.find(s => s.val === value);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setManual(m => !m)}
          className="text-[10px] text-slate-500 hover:text-lime-400 transition"
        >
          {manual || isCustom ? '↩ Use dropdown' : '✎ Type manually'}
        </button>
      </div>
      {manual || isCustom ? (
        <input
          type="time"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-slate-950 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-lime-400"
        />
      ) : (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-slate-950 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-lime-400"
        >
          <option value="" disabled>{placeholder}</option>
          {slots.map(s => (
            <option key={s.val} value={s.val}>{s.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

// ---- Quick date picker with shortcuts ----
function QuickDateInput({ value, onChange, label, required = false }) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const in2 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const in3 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const shortcuts = [
    { label: 'Today', val: today },
    { label: 'Tomorrow', val: tomorrow },
    { label: `+2d`, val: in2 },
    { label: `+3d`, val: in3 },
  ];
  const fmt = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '';
  return (
    <div>
      {label && <Label className="text-slate-300 text-xs uppercase tracking-widest">{label}</Label>}
      <div className="flex flex-wrap gap-1.5 mt-1 mb-1">
        {shortcuts.map(s => (
          <button
            key={s.val} type="button"
            onClick={() => onChange(s.val)}
            className={`px-2 py-1 rounded text-xs border transition ${value === s.val ? 'bg-lime-400 text-slate-900 border-lime-400 font-semibold' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}
          >{s.label}</button>
        ))}
      </div>
      <Input
        type="date"
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 mt-0 text-slate-100"
      />
      {value && <p className="text-[10px] text-slate-500 mt-0.5">{fmt(value)}</p>}
    </div>
  );
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'classes', label: 'Classes', icon: ClipboardList },
  { id: 'games', label: 'Games', icon: Flame },
  { id: 'game-bookings', label: 'Game Bookings', icon: Flame },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'jerseys', label: 'Jerseys', icon: Gift },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'trials', label: 'Free Trials', icon: Sparkles },
  { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'coaches', label: 'Coaches', icon: UserCog },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Activity },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth?mode=login&next=/admin'); return; }
      if (user.role !== 'admin' && user.role !== 'coach') { toast.error('Admin/Coach only'); router.push('/dashboard'); return; }
      fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json()).then(setStats);
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'admin' && user.role !== 'coach')) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  const isAdmin = user.role === 'admin';
  const isCoach = user.role === 'coach';

  // Filter nav based on role
  const visibleNav = isAdmin ? NAV : NAV.filter(n => ['overview', 'classes', 'games', 'performance', 'trials', 'attendance', 'reports', 'announcements'].includes(n.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 admin-scope">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(v => !v)}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${mobileNav ? 'rotate-90' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-lime-400 text-slate-900 flex items-center justify-center font-black text-sm">F</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight">Flowternity</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-widest font-semibold">{isAdmin ? 'Admin' : 'Coach'}</span>
              </div>
            </div>
            <span className="hidden md:inline text-slate-600">/</span>
            <span className="hidden md:inline text-sm text-slate-300">{visibleNav.find(n => n.id === tab)?.label || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 px-2 py-1 rounded hover:bg-slate-800">
              <Home className="w-3.5 h-3.5" /> Member site
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-lime-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="font-medium leading-tight">{user.full_name}</div>
                <div className="text-slate-500 leading-tight">{user.email}</div>
              </div>
            </div>
            <button onClick={logout} className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileNav ? 'block' : 'hidden'} md:block fixed md:sticky top-14 z-20 md:z-0 h-[calc(100vh-3.5rem)] w-64 border-r border-slate-800 bg-slate-950 overflow-y-auto`}>
          <nav className="p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 px-3 py-2">{isAdmin ? 'Console' : 'Coach Tools'}</p>
            {visibleNav.map(n => {
              const active = tab === n.id;
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => { setTab(n.id); setMobileNav(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                    active
                      ? 'bg-lime-400/10 text-lime-400 font-medium'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{n.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              );
            })}
          </nav>
          <div className="p-3 mt-4 border-t border-slate-800">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
              <p className="text-xs text-slate-400 mb-2">Quick stats</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Users</span><span className="font-mono font-semibold">{stats?.total_users ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Active</span><span className="font-mono font-semibold text-lime-400">{stats?.active_memberships ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Today</span><span className="font-mono font-semibold">{stats?.today_classes ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Bookings</span><span className="font-mono font-semibold">{stats?.active_bookings ?? '—'}</span></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-3.5rem)]">
          <div className="p-4 md:p-8 max-w-[1400px]">
            {tab === 'overview' && <OverviewSection stats={stats} />}
            {tab === 'classes' && <ClassesSection />}
            {tab === 'games' && <GamesSection />}
            {tab === 'game-bookings' && <GameBookingsSection />}
            {tab === 'members' && <MembersSection />}
            {isAdmin && tab === 'jerseys' && <JerseysSection />}
            {tab === 'performance' && <PerformanceSection />}
            {tab === 'trials' && <TrialsSection />}
            {tab === 'attendance' && <AttendanceSection />}
            {tab === 'reports' && <ReportsSection />}
            {tab === 'announcements' && <AnnouncementsSection />}
            {isAdmin && tab === 'payments' && <PaymentsSection />}
            {isAdmin && tab === 'coaches' && <CoachesSection />}
            {isAdmin && tab === 'settings' && <SettingsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

// -------- Reusable section header --------
function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-900 border-slate-800',
    accent: 'bg-lime-400/5 border-lime-400/20',
  };
  return (
    <Card className={`p-5 rounded-lg border ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">{label}</span>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="mt-3 font-mono font-semibold text-3xl text-slate-50 tabular-nums">{value ?? '—'}</div>
      {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
    </Card>
  );
}

// ===================== OVERVIEW =====================
function OverviewSection({ stats }) {
  const [recent, setRecent] = useState({ members: [], classes: [], payments: [] });
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/members', { credentials: 'include' }).then(r => r.json()).catch(() => ({ members: [] })),
      fetch('/api/admin/classes', { credentials: 'include' }).then(r => r.json()).catch(() => ({ classes: [] })),
      fetch('/api/admin/payments', { credentials: 'include' }).then(r => r.json()).catch(() => ({ payments: [] })),
    ]).then(([m, c, p]) => setRecent({
      members: (m.members || []).slice(0, 5),
      classes: (c.classes || []).slice(0, 5),
      payments: (p.payments || []).slice(0, 5),
    }));
  }, []);

  return (
    <>
      <SectionHeader
        title="Overview"
        description="At-a-glance view of the academy's operations."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users} tone="accent" />
        <StatCard icon={Sparkles} label="Active Memberships" value={stats?.active_memberships} />
        <StatCard icon={Calendar} label="Today's Classes" value={stats?.today_classes} />
        <StatCard icon={Activity} label="Active Bookings" value={stats?.active_bookings} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="p-5 rounded-lg bg-slate-900 border-slate-800 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-lime-400" /> Recent members</h3>
          {recent.members.length === 0 ? (
            <p className="text-xs text-slate-500">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.members.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">{m.full_name?.[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-slate-100">{m.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{m.email}</div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-0 text-[10px] capitalize">{m.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5 rounded-lg bg-slate-900 border-slate-800 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-lime-400" /> Upcoming classes</h3>
          {recent.classes.length === 0 ? (
            <p className="text-xs text-slate-500">No classes scheduled.</p>
          ) : (
            <div className="space-y-2">
              {recent.classes.map(c => {
                const sport = SPORTS.find(s => s.id === c.sport_id);
                return (
                  <div key={c.id} className="flex items-center gap-2 text-sm">
                    <div className="w-9 h-9 rounded bg-slate-800 flex flex-col items-center justify-center leading-none">
                      <span className="text-[9px] uppercase text-slate-500">{new Date(c.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                      <span className="text-xs font-bold text-slate-100">{new Date(c.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-slate-100">{sport?.name}</div>
                      <div className="text-xs text-slate-500 truncate">{c.start_time}–{c.end_time} · {c.coach_name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="p-5 rounded-lg bg-slate-900 border-slate-800 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-lime-400" /> Recent payments</h3>
          {recent.payments.length === 0 ? (
            <p className="text-xs text-slate-500">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.payments.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center"><CreditCard className="w-3.5 h-3.5 text-slate-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-slate-100">{p.user_name}</div>
                    <div className="text-xs text-slate-500 truncate">{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-100">₹{p.amount.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// ===================== CLASSES =====================
function ClassesSection() {
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const emptyForm = { sport_id: 'basketball', coach_name: '', date: '', start_time: '', end_time: '', capacity: 12 };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Bulk / Recurring mode state
  const [mode, setMode] = useState('single'); // 'single' | 'recurring'
  const emptyBulk = {
    sport_id: 'basketball',
    coach_name: '',
    capacity: 12,
    start_date: '',
    end_date: '',
    weekdays: [1, 3, 5], // Mon Wed Fri default
    slots: [{ start_time: '17:00', end_time: '18:00' }],
  };
  const [bulk, setBulk] = useState(emptyBulk);

  const load = async () => {
    const c = await fetch('/api/admin/classes', { credentials: 'include' }).then(r => r.json());
    setClasses(c.classes || []);
    setSelectedIds([]);
  };
  useEffect(() => { load(); }, []);

  const create = async (e, keepOpen) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/classes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(d.error || 'Failed to schedule'); return; }
    toast.success('Class scheduled');
    load();
    if (keepOpen) {
      setForm(f => ({ ...f, date: '', start_time: '', end_time: '' }));
    } else {
      setForm(emptyForm);
      setOpen(false);
    }
  };

  const bulkCreate = async (e) => {
    e.preventDefault();
    if (!bulk.start_date || !bulk.end_date) { toast.error('Pick a date range'); return; }
    if (bulk.weekdays.length === 0) { toast.error('Pick at least one weekday'); return; }
    if (!bulk.slots.length || bulk.slots.some(s => !s.start_time || !s.end_time)) { toast.error('Fill all time slots'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/classes/bulk', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(bulk),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(d.error || 'Bulk schedule failed'); return; }
    toast.success(`Created ${d.count} classes`);
    load();
    setBulk(emptyBulk);
    setOpen(false);
    setMode('single');
  };

  const remove = async (id) => {
    if (!confirm('Delete this class? All bookings will be cancelled.')) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { toast.success('Deleted'); load(); }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} class(es)? All bookings will be cancelled.`)) return;
    const res = await fetch('/api/admin/classes/bulk-delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ids: selectedIds }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error || 'Failed'); return; }
    toast.success(`Deleted ${d.deleted} classes`);
    load();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return classes;
    return classes.filter(c => c.sport_id === filter);
  }, [classes, filter]);

  const toggleWeekday = (d) => {
    setBulk(b => ({ ...b, weekdays: b.weekdays.includes(d) ? b.weekdays.filter(x => x !== d) : [...b.weekdays, d].sort() }));
  };
  const addSlot = () => setBulk(b => ({ ...b, slots: [...b.slots, { start_time: '', end_time: '' }] }));
  const removeSlot = (i) => setBulk(b => ({ ...b, slots: b.slots.filter((_, idx) => idx !== i) }));
  const updateSlot = (i, k, v) => setBulk(b => ({ ...b, slots: b.slots.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));

  // Estimate count preview
  const bulkPreview = useMemo(() => {
    if (!bulk.start_date || !bulk.end_date) return 0;
    const s = new Date(bulk.start_date), e = new Date(bulk.end_date);
    if (isNaN(s) || isNaN(e) || s > e) return 0;
    const wk = new Set(bulk.weekdays);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (wk.has(d.getDay())) count += bulk.slots.length;
    }
    return count;
  }, [bulk]);

  const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <SectionHeader
        title="Classes"
        description={`${classes.length} scheduled · single or recurring.`}
        action={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button onClick={bulkDelete} variant="outline" className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete {selectedIds.length}
              </Button>
            )}
            <Button onClick={() => setOpen(true)} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
              <Plus className="w-4 h-4 mr-1.5" /> Schedule Class
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 uppercase tracking-widest">Filter</span>
        <button onClick={() => setFilter('all')} className={`text-xs px-2.5 py-1 rounded-full border ${filter === 'all' ? 'bg-slate-100 text-slate-900 border-slate-100' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>All</button>
        {SPORTS.filter(s => s.status === 'active').map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`text-xs px-2.5 py-1 rounded-full border ${filter === s.id ? 'bg-slate-100 text-slate-900 border-slate-100' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>{s.name}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No classes yet" cta="Schedule your first class" onClick={() => setOpen(true)} />
      ) : (
        <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
            <div className="col-span-1"><Checkbox checked={filtered.length > 0 && selectedIds.length === filtered.length} onCheckedChange={(v) => setSelectedIds(v ? filtered.map(c => c.id) : [])} /></div>
            <div className="col-span-1">Date</div>
            <div className="col-span-3">Sport</div>
            <div className="col-span-2">Coach</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Capacity</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {filtered.map(c => {
            const sport = SPORTS.find(s => s.id === c.sport_id);
            const sel = selectedIds.includes(c.id);
            return (
              <div key={c.id} className={`grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors ${sel ? 'bg-lime-400/5' : ''}`}>
                <div className="col-span-1"><Checkbox checked={sel} onCheckedChange={() => toggleSelect(c.id)} /></div>
                <div className="col-span-3 md:col-span-1 flex items-center gap-2">
                  <div className="w-10 h-10 rounded bg-slate-800 flex flex-col items-center justify-center leading-none">
                    <span className="text-[9px] uppercase text-slate-500">{new Date(c.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span className="text-sm font-bold text-slate-100">{new Date(c.date).getDate()}</span>
                  </div>
                </div>
                <div className="col-span-7 md:col-span-3 font-medium text-slate-100">{sport?.name}{c.batch_tag && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 uppercase tracking-widest">bulk</span>}</div>
                <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{c.coach_name}</div>
                <div className="col-span-6 md:col-span-2 font-mono text-sm text-slate-300">{c.start_time}–{c.end_time}</div>
                <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{c.capacity} slots</div>
                <div className="col-span-6 md:col-span-1 flex justify-end">
                  <button onClick={() => remove(c.id)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-slate-50">Schedule classes</DialogTitle>
            <DialogDescription className="text-slate-400">Create one class, or a whole recurring batch in one go.</DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 mb-2 p-1 bg-slate-800 rounded-lg w-fit flex-shrink-0">
            <button type="button" onClick={() => setMode('single')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'single' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-100'}`}>
              Single class
            </button>
            <button type="button" onClick={() => setMode('recurring')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'recurring' ? 'bg-lime-400 text-slate-900' : 'text-slate-400 hover:text-slate-100'}`}>
              <CalendarPlus className="w-3.5 h-3.5 inline mr-1" /> Recurring batch
            </button>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 pr-1">
          {mode === 'single' ? (
            <form onSubmit={(e) => create(e, false)} className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Sport</Label>
                <Select value={form.sport_id} onValueChange={v => setForm({ ...form, sport_id: v })}>
                  <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SPORTS.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Coach name</Label>
                <Input required className="h-11 mt-1" value={form.coach_name} onChange={e => setForm({ ...form, coach_name: e.target.value })} placeholder="Coach Ravi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <QuickDateInput label="Date" required value={form.date} onChange={v => setForm({ ...form, date: v })} />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Capacity</Label>
                  <Input type="number" min="1" required className="h-11 mt-1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">Start time</Label>
                    <TimeSelect value={form.start_time} onChange={v => setForm({ ...form, start_time: v })} placeholder="Start time" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">End time</Label>
                    <TimeSelect value={form.end_time} onChange={v => setForm({ ...form, end_time: v })} placeholder="End time" />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">Cancel</Button>
                <Button type="button" disabled={saving} onClick={(e) => create(e, true)} variant="outline" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">
                  {saving ? '...' : 'Save & add another'}
                </Button>
                <Button type="submit" disabled={saving} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
                  <Plus className="w-4 h-4 mr-1.5" /> {saving ? 'Saving…' : 'Schedule'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={bulkCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Sport</Label>
                  <Select value={bulk.sport_id} onValueChange={v => setBulk({ ...bulk, sport_id: v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{SPORTS.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Capacity</Label>
                  <Input type="number" min="1" required className="h-11 mt-1" value={bulk.capacity} onChange={e => setBulk({ ...bulk, capacity: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Coach name</Label>
                  <Input required className="h-11 mt-1" value={bulk.coach_name} onChange={e => setBulk({ ...bulk, coach_name: e.target.value })} placeholder="Coach Ravi" />
                </div>
                <div className="col-span-2">
                  <QuickDateInput label="Start date" required value={bulk.start_date} onChange={v => setBulk({ ...bulk, start_date: v })} />
                </div>
                <div className="col-span-2">
                  <QuickDateInput label="End date" required value={bulk.end_date} onChange={v => setBulk({ ...bulk, end_date: v })} />
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Repeat on</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WEEKDAY_LABELS.map((lbl, i) => {
                    const on = bulk.weekdays.includes(i);
                    return (
                      <button key={i} type="button" onClick={() => toggleWeekday(i)} className={`w-12 h-10 rounded-md border text-xs font-semibold transition ${on ? 'bg-lime-400 text-slate-900 border-lime-400' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Time slots (per day)</Label>
                  <button type="button" onClick={addSlot} className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add slot</button>
                </div>
                <div className="space-y-2">
                  {bulk.slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TimeSelect value={s.start_time} onChange={v => updateSlot(i, 'start_time', v)} placeholder="Start" className="flex-1" />
                      <span className="text-slate-500 text-xs">to</span>
                      <TimeSelect value={s.end_time} onChange={v => updateSlot(i, 'end_time', v)} placeholder="End" className="flex-1" />
                      {bulk.slots.length > 1 && (
                        <button type="button" onClick={() => removeSlot(i)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><XCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3 text-sm flex items-center justify-between">
                <span className="text-slate-400">Preview</span>
                <span className="text-slate-100 font-mono font-semibold">{bulkPreview} class{bulkPreview === 1 ? '' : 'es'} will be created</span>
              </div>

              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">Cancel</Button>
                <Button type="submit" disabled={saving || bulkPreview === 0} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
                  <CalendarPlus className="w-4 h-4 mr-1.5" /> {saving ? 'Creating…' : `Create ${bulkPreview} classes`}
                </Button>
              </DialogFooter>
            </form>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===================== GAMES =====================
function GamesSection() {
  const [games, setGames] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('single');
  const emptyForm = { sport_id: 'basketball', title: '', description: '', date: '', start_time: '', end_time: '', max_players: 10, host_name: 'Flowternity', skill_level: 'all_levels', is_paid: false, fee: 0 };
  const [form, setForm] = useState(emptyForm);
  const emptyBulk = { sport_id: 'basketball', title: '', description: '', host_name: 'Flowternity', skill_level: 'all_levels', max_players: 10, start_date: '', end_date: '', weekdays: [5, 6], slots: [{ start_time: '18:00', end_time: '19:30' }], is_paid: false, fee: 0 };
  const [bulk, setBulk] = useState(emptyBulk);
  const [saving, setSaving] = useState(false);
  const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toggleWeekday = (d) => setBulk(b => ({ ...b, weekdays: b.weekdays.includes(d) ? b.weekdays.filter(x => x !== d) : [...b.weekdays, d].sort() }));
  const addSlot = () => setBulk(b => ({ ...b, slots: [...b.slots, { start_time: '', end_time: '' }] }));
  const removeSlot = (i) => setBulk(b => ({ ...b, slots: b.slots.filter((_, idx) => idx !== i) }));
  const updateSlot = (i, k, v) => setBulk(b => ({ ...b, slots: b.slots.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));
  const bulkPreview = useMemo(() => {
    if (!bulk.start_date || !bulk.end_date) return 0;
    const s = new Date(bulk.start_date), e = new Date(bulk.end_date);
    if (isNaN(s) || isNaN(e) || s > e) return 0;
    const wk = new Set(bulk.weekdays);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { if (wk.has(d.getDay())) count += bulk.slots.length; }
    return count;
  }, [bulk]);

  const load = async () => {
    const d = await fetch('/api/admin/games', { credentials: 'include' }).then(r => r.json());
    setGames(d.games || []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e, keepOpen) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(d.error || 'Failed'); return; }
    toast.success('Game scheduled');
    load();
    if (keepOpen) setForm(f => ({ ...f, title: '', description: '', date: '', start_time: '', end_time: '' }));
    else { setForm(emptyForm); setOpen(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this game? All players will be removed.')) return;
    const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { toast.success('Deleted'); load(); }
  };

  const bulkCreate = async (e) => {
    e.preventDefault();
    if (!bulk.start_date || !bulk.end_date) { toast.error('Pick a date range'); return; }
    if (bulk.weekdays.length === 0) { toast.error('Pick at least one weekday'); return; }
    if (bulk.slots.some(s => !s.start_time || !s.end_time)) { toast.error('Fill all time slots'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/games/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(bulk) });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(d.error || 'Bulk failed'); return; }
    toast.success(`Created ${d.count} games`);
    load(); setBulk(emptyBulk); setOpen(false); setMode('single');
  };

  return (
    <>
      <SectionHeader
        title="Games"
        description={`${games.length} pickup games · community play sessions.`}
        action={
          <Button onClick={() => setOpen(true)} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Schedule Game
          </Button>
        }
      />

      {games.length === 0 ? (
        <EmptyState icon={Flame} title="No games scheduled" cta="Schedule your first game" onClick={() => setOpen(true)} />
      ) : (
        <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
          <div className="hidden md:grid grid-cols-14 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
            <div className="col-span-1">Date</div>
            <div className="col-span-3">Game</div>
            <div className="col-span-2">Sport</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Players</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {games.map(g => {
            const sport = SPORTS.find(s => s.id === g.sport_id);
            return (
              <div key={g.id} className="grid grid-cols-14 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
                <div className="col-span-4 md:col-span-1">
                  <div className="w-10 h-10 rounded bg-slate-800 flex flex-col items-center justify-center leading-none">
                    <span className="text-[9px] uppercase text-slate-500">{new Date(g.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span className="text-sm font-bold text-slate-100">{new Date(g.date).getDate()}</span>
                  </div>
                </div>
                <div className="col-span-8 md:col-span-3 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{g.title || `${sport?.name} pickup`}</div>
                  <div className="text-xs text-slate-500 truncate">Host: {g.host_name} · {g.skill_level?.replace('_', ' ')}</div>
                </div>
                <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{sport?.name}</div>
                <div className="col-span-6 md:col-span-2 font-mono text-sm text-slate-300">{g.start_time}–{g.end_time}</div>
                <div className="col-span-6 md:col-span-2 text-sm">
                  <span className="font-mono font-semibold text-slate-100">{g.participants_count}</span>
                  <span className="text-slate-500">/{g.max_players}</span>
                </div>
                <div className="col-span-6 md:col-span-2 text-sm">
                  {g.is_paid ? (
                    <span className="inline-block px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-mono">₹{g.fee}</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-mono">Free</span>
                  )}
                </div>
                <div className="col-span-6 md:col-span-2 flex justify-end">
                  <button onClick={() => remove(g.id)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setMode('single'); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Schedule games</DialogTitle>
            <DialogDescription className="text-slate-400">Create one game or a recurring batch.</DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg w-fit">
            <button type="button" onClick={() => setMode('single')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'single' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-100'}`}>
              Single game
            </button>
            <button type="button" onClick={() => setMode('recurring')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'recurring' ? 'bg-lime-400 text-slate-900' : 'text-slate-400 hover:text-slate-100'}`}>
              <CalendarPlus className="w-3.5 h-3.5 inline mr-1" /> Recurring batch
            </button>
          </div>

          {mode === 'single' ? (
            <form onSubmit={(e) => create(e, false)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Sport</Label>
                  <Select value={form.sport_id} onValueChange={v => setForm({ ...form, sport_id: v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{SPORTS.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Skill level</Label>
                  <Select value={form.skill_level} onValueChange={v => setForm({ ...form, skill_level: v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_levels">All levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Title <span className="text-slate-500 normal-case">(optional)</span></Label><Input className="h-11 mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Friday Night Hoops" /></div>
              <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Casual 5v5" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <input type="checkbox" id="is_paid" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} className="w-4 h-4 rounded cursor-pointer" />
                  <Label htmlFor="is_paid" className="text-slate-300 text-xs uppercase tracking-widest cursor-pointer flex-1">Paid Game</Label>
                  {form.is_paid && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">Fee:</span>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        className="h-8 w-20 bg-slate-800 text-white border-slate-700 hover:border-slate-600 focus:border-lime-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        style={{ MozAppearance: 'textfield' }}
                        value={form.fee === 0 ? '' : form.fee} 
                        onChange={e => setForm({ ...form, fee: e.target.value ? parseFloat(e.target.value) : 0 })} 
                        onFocus={e => e.target.select()}
                        placeholder="0.00" 
                      />
                      <span className="text-slate-400 text-xs">₹</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><QuickDateInput label="Date" required value={form.date} onChange={v => setForm({ ...form, date: v })} /></div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">Start</Label>
                  <TimeSelect value={form.start_time} onChange={v => setForm({ ...form, start_time: v })} placeholder="Start time" />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">End</Label>
                  <TimeSelect value={form.end_time} onChange={v => setForm({ ...form, end_time: v })} placeholder="End time" />
                </div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Max players</Label><Input type="number" min="2" required className="h-11 mt-1 bg-slate-800 text-white border-slate-700 hover:border-slate-600 focus:border-lime-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" style={{ MozAppearance: 'textfield' }} value={form.max_players} onChange={e => setForm({ ...form, max_players: e.target.value ? parseInt(e.target.value) : '' })} onFocus={e => { e.target.value = ''; setForm({ ...form, max_players: '' }); }} placeholder="10" /></div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Host</Label><Input className="h-11 mt-1" value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} /></div>
              </div>
              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">Cancel</Button>
                <Button type="button" disabled={saving} onClick={(e) => create(e, true)} variant="outline" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">{saving ? '...' : 'Save & add another'}</Button>
                <Button type="submit" disabled={saving} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Plus className="w-4 h-4 mr-1.5" />{saving ? 'Saving…' : 'Schedule'}</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={bulkCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Sport</Label>
                  <Select value={bulk.sport_id} onValueChange={v => setBulk({ ...bulk, sport_id: v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{SPORTS.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Skill level</Label>
                  <Select value={bulk.skill_level} onValueChange={v => setBulk({ ...bulk, skill_level: v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_levels">All levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Max players</Label><Input type="number" min="2" required className="h-11 mt-1 bg-slate-800 text-white border-slate-700 hover:border-slate-600 focus:border-lime-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" style={{ MozAppearance: 'textfield' }} value={bulk.max_players} onChange={e => setBulk({ ...bulk, max_players: e.target.value ? parseInt(e.target.value) : '' })} onFocus={e => { e.target.value = ''; setBulk({ ...bulk, max_players: '' }); }} placeholder="10" /></div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Host</Label><Input className="h-11 mt-1" value={bulk.host_name} onChange={e => setBulk({ ...bulk, host_name: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-slate-300 text-xs uppercase tracking-widest">Title <span className="text-slate-500 normal-case">(optional)</span></Label><Input className="h-11 mt-1" value={bulk.title} onChange={e => setBulk({ ...bulk, title: e.target.value })} placeholder="Friday Night Hoops" /></div>
                <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <input type="checkbox" id="bulk_is_paid" checked={bulk.is_paid} onChange={e => setBulk({ ...bulk, is_paid: e.target.checked })} className="w-4 h-4 rounded cursor-pointer" />
                  <Label htmlFor="bulk_is_paid" className="text-slate-300 text-xs uppercase tracking-widest cursor-pointer flex-1">Paid Games</Label>
                  {bulk.is_paid && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">Fee:</span>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        className="h-8 w-20 bg-slate-800 text-white border-slate-700 hover:border-slate-600 focus:border-lime-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        style={{ MozAppearance: 'textfield' }}
                        value={bulk.fee === 0 ? '' : bulk.fee} 
                        onChange={e => setBulk({ ...bulk, fee: e.target.value ? parseFloat(e.target.value) : 0 })} 
                        onFocus={e => e.target.select()}
                        placeholder="0.00" 
                      />
                      <span className="text-slate-400 text-xs">₹</span>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <QuickDateInput label="Start date" required value={bulk.start_date} onChange={v => setBulk({ ...bulk, start_date: v })} />
                </div>
                <div className="col-span-2">
                  <QuickDateInput label="End date" required value={bulk.end_date} onChange={v => setBulk({ ...bulk, end_date: v })} />
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Repeat on</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WEEKDAY_LABELS.map((lbl, i) => {
                    const on = bulk.weekdays.includes(i);
                    return (
                      <button key={i} type="button" onClick={() => toggleWeekday(i)} className={`w-12 h-10 rounded-md border text-xs font-semibold transition ${on ? 'bg-lime-400 text-slate-900 border-lime-400' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>{lbl}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Time slots (per day)</Label>
                  <button type="button" onClick={addSlot} className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add slot</button>
                </div>
                <div className="space-y-2">
                  {bulk.slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TimeSelect value={s.start_time} onChange={v => updateSlot(i, 'start_time', v)} placeholder="Start" className="flex-1" />
                      <span className="text-slate-500 text-xs">to</span>
                      <TimeSelect value={s.end_time} onChange={v => updateSlot(i, 'end_time', v)} placeholder="End" className="flex-1" />
                      {bulk.slots.length > 1 && (
                        <button type="button" onClick={() => removeSlot(i)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><XCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3 text-sm flex items-center justify-between">
                <span className="text-slate-400">Preview</span>
                <span className="text-slate-100 font-mono font-semibold">{bulkPreview} game{bulkPreview === 1 ? '' : 's'} will be created</span>
              </div>

              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">Cancel</Button>
                <Button type="submit" disabled={saving || bulkPreview === 0} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
                  <CalendarPlus className="w-4 h-4 mr-1.5" />{saving ? 'Creating…' : `Create ${bulkPreview} games`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===================== GAME BOOKINGS =====================
function GameBookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await fetch(`/api/admin/game-bookings?page=${p}&limit=${limit}`, { credentials: 'include' });
    if (res.ok) {
      const d = await res.json();
      setBookings(d.bookings || []);
      setTotal(d.total || 0);
      setPage(p);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const goToPage = (p) => {
    if (p > 0 && p <= Math.ceil(total / limit)) load(p);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SectionHeader
        title="Game Bookings"
        description={`${total} game bookings · tracking player participation and payments`}
      />

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-lg" />)}
        </div>
      ) : total === 0 ? (
        <EmptyState icon={Flame} title="No game bookings yet" cta="Create games to start tracking" />
      ) : (
        <>
          <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Game</div>
              <div className="col-span-2">Sport</div>
              <div className="col-span-2">Player</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Amount</div>
            </div>
            {bookings.map(b => (
              <div key={b.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
                <div className="col-span-4 md:col-span-2">
                  <div className="text-sm font-mono text-slate-300">
                    {new Date(b.game_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-500">{b.game_time}</div>
                </div>
                <div className="col-span-8 md:col-span-3 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{b.game_title}</div>
                  <div className="text-xs text-slate-500">{b.sport_name}</div>
                </div>
                <div className="col-span-6 md:col-span-2 text-sm text-slate-400">{b.sport_name}</div>
                <div className="col-span-6 md:col-span-2 min-w-0">
                  {b.user_name ? (
                    <>
                      <div className="text-sm text-slate-100 truncate">{b.user_name}</div>
                      <div className="text-xs text-slate-500 truncate">{b.user_email}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-slate-100 truncate">{b.guest_name}</div>
                      <div className="text-xs text-slate-500 truncate">{b.guest_email}</div>
                      <div className="text-xs text-slate-600">{b.guest_phone}</div>
                    </>
                  )}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Badge className={b.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-700 text-slate-300'}>
                    {b.status}
                  </Badge>
                </div>
                <div className="col-span-8 md:col-span-1 text-right">
                  <span className="font-mono font-semibold text-slate-100">
                    {b.is_paid ? `₹${b.amount_paid?.toFixed(2) || '0.00'}` : 'Free'}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-lime-400/30 text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lime-400/10"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-2 rounded-lg border font-mono text-sm ${
                    page === p
                      ? 'bg-lime-400 text-slate-900 border-lime-400'
                      : 'border-slate-700 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-lime-400/30 text-lime-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lime-400/10"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ===================== MEMBERS =====================
function MembersSection() {
  const [members, setMembers] = useState([]);
  const [q, setQ] = useState('');
  const [filterMembership, setFilterMembership] = useState('');
  const [filterCoupon, setFilterCoupon] = useState('');
  const [filterExpiring, setFilterExpiring] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const emptyUser = { full_name: '', email: '', phone: '', role: 'member', password: '', membership_id: '', athlete: { athlete_name: '', dob: '', gender: '' } };
  const [newUser, setNewUser] = useState(emptyUser);
  const [createdResult, setCreatedResult] = useState(null);
  // Grant/extend state
  const [grantOpen, setGrantOpen] = useState(false);
  const [granting, setGranting] = useState(false);
  const [grantForm, setGrantForm] = useState({ membership_id: '', note: '', child_profile_id: '', new_athlete_name: '', new_dob: '', new_gender: '', slot_quantity: 1 });
  const [extendTarget, setExtendTarget] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [extendNote, setExtendNote] = useState('');
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  const load = async (p = 1) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (filterMembership) params.append('membership_id', filterMembership);
    if (filterCoupon) params.append('coupon_code', filterCoupon);
    if (filterExpiring === 'expiring') params.append('expiring', 'true');
    params.append('page', p.toString());
    params.append('limit', limit.toString());
    const url = `/api/admin/members?${params.toString()}`;
    const d = await fetch(url, { credentials: 'include' }).then(r => r.json());
    setMembers(d.members || []);
    setTotal(d.total || 0);
    setPage(p);
  };

  useEffect(() => { setPage(1); }, [q, filterMembership, filterCoupon, filterExpiring]);
  useEffect(() => { load(page); }, [page, q, filterMembership, filterCoupon, filterExpiring]);

  const openDetail = async (m) => {
    setSelected(m);
    const d = await fetch(`/api/admin/members/${m.id}/detail`, { credentials: 'include' }).then(r => r.json());
    setDetail(d);
  };

  const refreshDetail = async (uid) => {
    const d = await fetch(`/api/admin/members/${uid}/detail`, { credentials: 'include' }).then(r => r.json());
    setDetail(d);
  };

  const grantMembership = async (e) => {
    e.preventDefault();
    if (!detail || !grantForm.membership_id) return;

    // If no existing profile selected, we need a new athlete name at minimum
    const noExistingProfiles = !detail.children?.length;
    const creatingNew = !grantForm.child_profile_id || grantForm.child_profile_id === '__new__';
    if (creatingNew && !grantForm.new_athlete_name.trim()) {
      toast.error('Athlete name is required'); return;
    }

    setGranting(true);

    // If creating a new athlete profile inline, do that first
    let child_profile_id = grantForm.child_profile_id;
    if (creatingNew) {
      const cr = await fetch(`/api/admin/members/${detail.user.id}/create-athlete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          athlete_name: grantForm.new_athlete_name.trim(),
          dob: grantForm.new_dob || '',
          gender: grantForm.new_gender || '',
        }),
      });
      const cd = await cr.json();
      if (!cr.ok) { toast.error(cd.error || 'Failed to create athlete profile'); setGranting(false); return; }
      child_profile_id = cd.child.id;
    }

    const payload = { membership_id: grantForm.membership_id, child_profile_id, note: grantForm.note, slot_quantity: grantForm.slot_quantity };
    const res = await fetch(`/api/admin/members/${detail.user.id}/grant-membership`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(payload),
    });
    setGranting(false);
    if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed'); return; }
    toast.success('Membership granted');
    setGrantOpen(false);
    setGrantForm({ membership_id: '', note: '', child_profile_id: '', new_athlete_name: '', new_dob: '', new_gender: '', slot_quantity: 1 });
    refreshDetail(detail.user.id); load();
  };

  const extendMembership = async (e) => {
    e.preventDefault();
    if (!extendTarget) return;
    const res = await fetch(`/api/admin/memberships/${extendTarget.id}/extend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ days: parseInt(extendDays), note: extendNote }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed'); return; }
    toast.success(`Extended by ${extendDays} days`);
    setExtendTarget(null); setExtendDays(30); setExtendNote('');
    refreshDetail(detail.user.id);
  };

  const expireMembership = async (mid) => {
    if (!confirm('Expire this membership immediately?')) return;
    const res = await fetch(`/api/admin/memberships/${mid}/expire`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('Membership expired'); refreshDetail(detail.user.id); load(); }
  };

  const save = async () => {
    if (!detail) return;
    const body = { full_name: detail.user.full_name, phone: detail.user.phone, address: detail.user.address, emergency_contact: detail.user.emergency_contact };
    const res = await fetch(`/api/admin/members/${detail.user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
    if (res.ok) { toast.success('Updated'); load(); }
  };

  const deactivate = async () => {
    if (!confirm(`Deactivate ${detail.user.full_name}?`)) return;
    const res = await fetch(`/api/admin/members/${detail.user.id}/deactivate`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('Deactivated'); setSelected(null); setDetail(null); load(); }
  };

  const createMember = async (e) => {
    e.preventDefault();
    setCreating(true);
    const payload = {
      full_name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      password: newUser.password,
      membership_id: newUser.membership_id || undefined,
      athlete: newUser.membership_id ? newUser.athlete : undefined,
    };
    const res = await fetch('/api/admin/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const d = await res.json();
    if (res.ok) {
      toast.success('Member created' + (d.email_sent ? ' — email sent' : ''));
      setCreatedResult(d);
      setNewUser(emptyUser);
      load();
    } else toast.error(d.error || 'Failed');
    setCreating(false);
  };

  return (
    <>
      <SectionHeader
        title="Members"
        description={`${members.length} registered`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Add Member
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search by name, email, phone…" value={q} onChange={e => setQ(e.target.value)} className="h-10 pl-9" />
        </div>
        <Select value={filterMembership || 'all'} onValueChange={v => setFilterMembership(v === 'all' ? '' : v)}>
          <SelectTrigger className="h-10 w-full md:w-48">
            <SelectValue placeholder="Filter by membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All memberships</SelectItem>
            {MEMBERSHIPS_LOCAL.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name} ({m.duration_months}m)</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCoupon || 'all'} onValueChange={v => setFilterCoupon(v === 'all' ? '' : v)}>
          <SelectTrigger className="h-10 w-full md:w-48">
            <SelectValue placeholder="Filter by coupon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="Coach30">Coach30 used</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterExpiring} onValueChange={setFilterExpiring}>
          <SelectTrigger className="h-10 w-full md:w-48">
            <SelectValue placeholder="Expiring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            <SelectItem value="expiring">Expiring soon (≤7 days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No members found" cta="Register first member" onClick={() => setAddOpen(true)} />
      ) : (
        <>
          <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <div className="col-span-4">Member</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Membership</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {members.map(m => (
              <div key={m.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
                <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-sm flex-shrink-0">{m.full_name?.[0]?.toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-100 truncate">{m.full_name}</div>
                    {m.status === 'inactive' && <Badge variant="destructive" className="text-[10px] mt-0.5">Inactive</Badge>}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3 min-w-0 text-xs text-slate-400 truncate">
                  <div className="truncate">{m.email}</div>
                  <div className="truncate">{m.phone || '—'}</div>
                </div>
                <div className="col-span-6 md:col-span-2"><Badge variant="secondary" className="bg-slate-800 text-slate-300 border-0 capitalize">{m.role}</Badge></div>
                <div className="col-span-6 md:col-span-2 text-xs">
                  {m.active_memberships?.length > 0 ? (
                    <div className="space-y-1">
                      {m.active_memberships.map(am => {
                        const sport = SPORTS.find(s => s.id === am.sport_id || s.id === am.membership_snapshot?.sport_id);
                        const daysLeft = Math.max(0, Math.ceil((new Date(am.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)));
                        return (
                          <div key={am.id} className="flex items-center gap-1.5">
                            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${am.status === 'active' ? 'bg-lime-400/20 text-lime-400' : 'bg-amber-400/20 text-amber-400'}`}>{am.status}</div>
                            <span className="text-slate-400">{sport?.name || am.membership_snapshot?.name}</span>
                            {daysLeft <= 7 && daysLeft > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] px-1 py-0 animate-pulse">{daysLeft}d</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  ) : m.latest_membership ? (
                    <div className="flex items-center gap-1.5">
                      <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400`}>{m.latest_membership.status}</div>
                      <span className="text-slate-500 truncate">{m.latest_membership.membership_snapshot?.name}</span>
                    </div>
                  ) : <span className="text-slate-600">None</span>}
                </div>
                <div className="col-span-6 md:col-span-1 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => openDetail(m)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100 h-8">View</Button>
                </div>
              </div>
            ))}
          </Card>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 px-4 py-3 bg-slate-900 rounded-lg border border-slate-800">
            <div className="text-base font-bold text-slate-100">
              <span className="text-lime-300 text-lg">📄 Showing</span> <span className="text-lime-400 text-xl font-black">{(page - 1) * limit + 1}</span>–<span className="text-lime-400 text-xl font-black">{Math.min(page * limit, total)}</span> <span className="text-slate-300">of</span> <span className="text-lime-400 text-xl font-black">{total}</span> <span className="text-slate-300">members</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="h-11 px-5 border-3 border-lime-400 bg-lime-400/30 hover:bg-lime-400/50 text-slate-900 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </Button>
              <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-lg border-2 border-lime-400/50">
                {Array.from({ length: Math.ceil(total / limit) }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === page;
                  const isVisible = Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === Math.ceil(total / limit);
                  if (!isVisible && pageNum !== Math.ceil(total / limit) && pageNum !== 1) return null;
                  if (!isVisible) return <span key={pageNum} className="text-lime-400 font-black text-lg">•••</span>;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      variant={isCurrent ? 'default' : 'outline'}
                      size="sm"
                      className={`h-10 w-10 p-0 font-black text-base rounded-lg ${isCurrent ? 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/60 border-2 border-lime-300' : 'bg-slate-700 border-2 border-lime-400/70 hover:border-lime-400 hover:bg-slate-600 text-lime-300 font-bold'}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))}
                disabled={page >= Math.ceil(total / limit)}
                variant="outline"
                size="sm"
                className="h-11 px-5 border-3 border-lime-400 bg-lime-400/30 hover:bg-lime-400/50 text-slate-900 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setCreatedResult(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle className="text-slate-50">Register a new member</DialogTitle></DialogHeader>
          {createdResult ? (
            <div className="space-y-4">
              <Card className="p-4 rounded-lg bg-lime-400/10 border-lime-400/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-lime-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-100">Account created</h4>
                    <p className="text-sm text-slate-400 mt-1">{createdResult.email_sent ? 'Welcome email with credentials sent.' : `Email delivery failed. Share the credentials manually.`}</p>
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm">
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="font-semibold text-slate-100">{createdResult.user.email}</div>
                      <div className="text-xs text-slate-500 mt-2">Temporary password</div>
                      <div className="font-semibold text-lime-400">{createdResult.temp_password}</div>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCreatedResult(null)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Add another</Button>
                <Button onClick={() => { setCreatedResult(null); setAddOpen(false); }} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={createMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Role</Label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v, membership_id: '' })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Password <span className="text-slate-500 normal-case">(auto if blank)</span></Label>
                  <Input className="h-11 mt-1" placeholder="Auto-generated" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Full name</Label><Input required className="h-11 mt-1" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} /></div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Email</Label><Input required type="email" className="h-11 mt-1" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-slate-300 text-xs uppercase tracking-widest">Phone</Label><Input className="h-11 mt-1" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} /></div>
              </div>

              {newUser.role === 'member' && (
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Attach membership (optional)</Label>
                  <Select value={newUser.membership_id || 'none'} onValueChange={v => setNewUser({ ...newUser, membership_id: v === 'none' ? '' : v })}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="No membership" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No membership</SelectItem>
                      {MEMBERSHIPS_LOCAL.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name} · {m.duration_months}M · ₹{m.price.toLocaleString('en-IN')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {newUser.membership_id && (
                    <Card className="p-4 rounded-lg bg-slate-950 border-slate-800 mt-3">
                      <h4 className="font-semibold mb-3 text-sm text-slate-100">Athlete profile (for this membership)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-slate-300 text-xs uppercase tracking-widest">Athlete name</Label>
                          <Input className="h-11 mt-1" placeholder={newUser.full_name || 'Athlete name'} value={newUser.athlete.athlete_name} onChange={e => setNewUser({ ...newUser, athlete: { ...newUser.athlete, athlete_name: e.target.value } })} />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-xs uppercase tracking-widest">DOB</Label>
                          <Input type="date" className="h-11 mt-1" value={newUser.athlete.dob} onChange={e => setNewUser({ ...newUser, athlete: { ...newUser.athlete, dob: e.target.value } })} />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-xs uppercase tracking-widest">Gender</Label>
                          <Select value={newUser.athlete.gender || 'skip'} onValueChange={v => setNewUser({ ...newUser, athlete: { ...newUser.athlete, gender: v === 'skip' ? '' : v } })}>
                            <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">—</SelectItem>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">{creating ? 'Creating…' : 'Create & Send Email'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) { setSelected(null); setDetail(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle className="text-slate-50">{selected?.full_name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Full name</Label><Input className="h-11 mt-1" value={detail.user.full_name || ''} onChange={e => setDetail({ ...detail, user: { ...detail.user, full_name: e.target.value } })} /></div>
                <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Phone</Label><Input className="h-11 mt-1" value={detail.user.phone || ''} onChange={e => setDetail({ ...detail, user: { ...detail.user, phone: e.target.value } })} /></div>
                <div className="col-span-2"><Label className="text-slate-300 text-xs uppercase tracking-widest">Address</Label><Textarea value={detail.user.address || ''} onChange={e => setDetail({ ...detail, user: { ...detail.user, address: e.target.value } })} /></div>
                <div className="col-span-2"><Label className="text-slate-300 text-xs uppercase tracking-widest">Emergency contact</Label><Input className="h-11 mt-1" value={detail.user.emergency_contact || ''} onChange={e => setDetail({ ...detail, user: { ...detail.user, emergency_contact: e.target.value } })} /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-200">Memberships</h4>
                  <Button size="sm" onClick={() => setGrantOpen(true)} className="h-8 bg-lime-400/20 text-lime-400 hover:bg-lime-400/30 border border-lime-400/30"><Gift className="w-3.5 h-3.5 mr-1.5" /> Grant</Button>
                </div>
                {detail.memberships.length === 0 ? <p className="text-sm text-slate-500">None</p> : (
                  <div className="space-y-2">{detail.memberships.map(m => (
                    <div key={m.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-100 truncate">{m.membership_snapshot?.name} · {m.membership_snapshot?.duration_months}M</div>
                          <div className="text-xs text-slate-500">Expires {new Date(m.expiry_date).toLocaleDateString('en-IN')}</div>
                          {m.extensions?.length > 0 && <div className="text-[10px] text-slate-500 mt-0.5">+{m.extensions.reduce((s, e) => s + e.days, 0)} days added by admin</div>}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${m.status === 'active' ? 'bg-lime-400/20 text-lime-400' : m.status === 'paused' ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{m.status}</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setExtendTarget(m)} className="h-7 text-xs border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200"><CalendarPlus className="w-3 h-3 mr-1" /> Extend</Button>
                        {m.status !== 'expired' && (
                          <Button size="sm" variant="outline" onClick={() => expireMembership(m.id)} className="h-7 text-xs border-slate-700 bg-transparent hover:bg-red-500/10 hover:text-red-400 text-slate-200"><XCircle className="w-3 h-3 mr-1" /> Expire</Button>
                        )}
                      </div>
                    </div>
                  ))}</div>
                )}
              </div>

              {detail.children?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-slate-200">Athlete Profiles</h4>
                  <div className="space-y-2">{detail.children.map(k => (
                    <div key={k.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-sm font-medium text-slate-100">{k.athlete_name || k.child_name}</div>
                      <div className="text-xs text-slate-500">DOB {new Date(k.dob).toLocaleDateString('en-IN')} · Sports: {(k.selected_sports || []).map(sid => SPORTS.find(s => s.id === sid)?.name).join(', ')}</div>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={deactivate}>Deactivate</Button>
            <Button onClick={save} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Save className="w-4 h-4 mr-2" /> Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant membership dialog */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Grant a membership</DialogTitle>
            <DialogDescription className="text-slate-400">
              Attach a membership manually for {detail?.user?.full_name}. This creates a zero-amount payment record marked as admin-granted.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <form onSubmit={grantMembership} className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Plan</Label>
                <Select value={grantForm.membership_id} onValueChange={v => setGrantForm({ ...grantForm, membership_id: v })}>
                  <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Pick a plan" /></SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIPS_LOCAL.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name} · {m.duration_months}M · ₹{m.price.toLocaleString('en-IN')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {grantForm.membership_id && (
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Athlete profile</Label>
                  {detail.children?.length > 0 ? (
                    <>
                      <Select value={grantForm.child_profile_id} onValueChange={v => setGrantForm({ ...grantForm, child_profile_id: v })}>
                        <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Pick an athlete profile" /></SelectTrigger>
                        <SelectContent>
                          {detail.children.map(k => (
                            <SelectItem key={k.id} value={k.id}>{k.athlete_name || k.child_name}</SelectItem>
                          ))}
                          <SelectItem value="__new__">+ Create new athlete profile</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Show new profile form if "create new" is selected */}
                      {grantForm.child_profile_id === '__new__' && (
                        <div className="mt-3 space-y-2 p-3 rounded-lg bg-slate-800 border border-slate-700">
                          <p className="text-xs text-lime-400 font-semibold uppercase tracking-widest">New athlete profile</p>
                          <Input required placeholder="Athlete full name *" value={grantForm.new_athlete_name} onChange={e => setGrantForm({ ...grantForm, new_athlete_name: e.target.value })} className="h-10 bg-slate-950 border-slate-700 text-slate-100" />
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="date" placeholder="Date of birth" value={grantForm.new_dob} onChange={e => setGrantForm({ ...grantForm, new_dob: e.target.value })} className="h-10 bg-slate-950 border-slate-700 text-slate-100" />
                            <Select value={grantForm.new_gender} onValueChange={v => setGrantForm({ ...grantForm, new_gender: v })}>
                              <SelectTrigger className="h-10 bg-slate-950 border-slate-700"><SelectValue placeholder="Gender (optional)" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-2 space-y-2 p-3 rounded-lg bg-slate-800 border border-slate-700">
                      <p className="text-xs text-amber-400 mb-2">No athlete profile yet — create one to continue:</p>
                      <Input required placeholder="Athlete full name *" value={grantForm.new_athlete_name} onChange={e => setGrantForm({ ...grantForm, new_athlete_name: e.target.value })} className="h-10 bg-slate-950 border-slate-700 text-slate-100" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" placeholder="Date of birth" value={grantForm.new_dob} onChange={e => setGrantForm({ ...grantForm, new_dob: e.target.value })} className="h-10 bg-slate-950 border-slate-700 text-slate-100" />
                        <Select value={grantForm.new_gender} onValueChange={v => setGrantForm({ ...grantForm, new_gender: v })}>
                          <SelectTrigger className="h-10 bg-slate-950 border-slate-700"><SelectValue placeholder="Gender (optional)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-widest">Note (optional)</Label>
                <Textarea rows={2} value={grantForm.note} onChange={e => setGrantForm({ ...grantForm, note: e.target.value })} placeholder="Reason: complimentary, promo, etc." />
              </div>

              {grantForm.membership_id && MEMBERSHIPS_LOCAL.find(m => m.id === grantForm.membership_id)?.type === 'slot' && (
                <div>
                  <Label className="text-slate-300 text-xs uppercase tracking-widest">Number of slots</Label>
                  <Input type="number" min="1" max="100" required className="h-11 mt-1 bg-slate-950 border-slate-800 text-slate-100" value={grantForm.slot_quantity} onChange={e => setGrantForm({ ...grantForm, slot_quantity: Math.max(1, parseInt(e.target.value) || 1) })} />
                  <p className="text-xs text-slate-500 mt-1">Each slot = 1 class booking, valid for 30 days.</p>
                </div>
              )}

              <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setGrantOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Cancel</Button>
                <Button type="submit" disabled={granting || !grantForm.membership_id || (!grantForm.child_profile_id && !grantForm.new_athlete_name.trim()) || (grantForm.child_profile_id === '__new__' && !grantForm.new_athlete_name.trim())} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
                  <Gift className="w-4 h-4 mr-1.5" /> {granting ? 'Granting…' : 'Grant membership'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Extend membership dialog */}
      <Dialog open={!!extendTarget} onOpenChange={o => { if (!o) setExtendTarget(null); }}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Extend membership</DialogTitle>
            <DialogDescription className="text-slate-400">
              {extendTarget && (
                <>Currently expires <span className="font-mono text-slate-200">{new Date(extendTarget.expiry_date).toLocaleDateString('en-IN')}</span>. Add days to extend.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={extendMembership} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[7, 15, 30, 60, 90].map(d => (
                <button key={d} type="button" onClick={() => setExtendDays(d)} className={`px-3 py-1.5 rounded text-sm border transition ${extendDays === d ? 'bg-lime-400 text-slate-900 border-lime-400 font-semibold' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'}`}>+{d} days</button>
              ))}
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-widest">Custom days</Label>
              <Input type="number" min="1" max="365" className="h-11 mt-1" value={extendDays} onChange={e => setExtendDays(e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-widest">Note (optional)</Label>
              <Input className="h-11 mt-1" value={extendNote} onChange={e => setExtendNote(e.target.value)} placeholder="Compensation, festival extension, etc." />
            </div>
            <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setExtendTarget(null)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Cancel</Button>
              <Button type="submit" className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><CalendarPlus className="w-4 h-4 mr-1.5" /> Extend</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===================== ATTENDANCE =====================
function AttendanceSection() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [roster, setRoster] = useState([]);
  const [dirty, setDirty] = useState({});
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetch('/api/admin/classes', { credentials: 'include' }).then(r => r.json()).then(d => setClasses(d.classes || []));
    // Load stats
    setStatsLoading(true);
    fetch('/api/admin/attendance/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/admin/classes/${selectedClass}/roster`, { credentials: 'include' }).then(r => r.json()).then(d => { setRoster(d.roster || []); setDirty({}); });
  }, [selectedClass]);

  const toggle = (bid, val) => setDirty(prev => ({ ...prev, [bid]: val }));
  const markAll = (present) => { const d = {}; roster.forEach(r => { d[r.booking_id] = present; }); setDirty(d); };

  const save = async () => {
    const records = roster.map(r => ({ booking_id: r.booking_id, present: dirty[r.booking_id] !== undefined ? dirty[r.booking_id] : !!r.present }));
    const res = await fetch('/api/admin/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ class_id: selectedClass, records }) });
    if (res.ok) { toast.success(`Marked ${records.length} students`); setDirty({}); fetch(`/api/admin/classes/${selectedClass}/roster`, { credentials: 'include' }).then(r => r.json()).then(d => setRoster(d.roster || [])); }
    else toast.error('Failed');
  };

  return (
    <>
      <SectionHeader title="Attendance" description="Mark attendance and view insights." />
      
      {/* Stats Toggle Button */}
      <Button 
        onClick={() => setShowStats(!showStats)} 
        className="mb-6 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        variant="outline"
      >
        <BarChart2 className="w-4 h-4 mr-2" />
        {showStats ? 'Hide Statistics' : 'View Statistics'}
      </Button>

      {/* Stats Dashboard - Collapsible */}
      {showStats && !statsLoading && stats && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={CheckCircle2} label="Overall Rate" value={`${stats.overall.rate}%`} tone="accent" />
            <StatCard icon={Users} label="Total Marked" value={stats.overall.total} />
            <StatCard icon={CheckCircle2} label="Present" value={stats.overall.present} />
            <StatCard icon={XCircle} label="Absent" value={stats.overall.absent} />
          </div>

          {/* By Sport */}
          {stats.bySport && stats.bySport.length > 0 && (
            <Card className="p-6 rounded-lg bg-slate-900 border-slate-800 mb-8">
              <h3 className="font-display font-bold text-lg mb-4">Attendance by Sport</h3>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.bySport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="sport" stroke="#9CA3AF" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                      <Bar dataKey="rate" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats.bySport.map((s, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-100">{s.sport}</div>
                        <div className="font-bold text-2xl text-slate-100">{s.rate}%</div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${s.rate}%` }} />
                      </div>
                      <div className="text-xs text-slate-500 mt-2">{s.present} present, {s.absent} absent</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Trends Chart */}
          {stats.trends && stats.trends.length > 0 && (
            <Card className="p-6 rounded-lg bg-slate-900 border-slate-800 mb-8">
              <h3 className="font-display font-bold text-lg mb-4">Attendance Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                  <Line type="monotone" dataKey="rate" stroke="#60A5FA" strokeWidth={2} dot={{ fill: '#60A5FA', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Top Performers */}
          {stats.topPerformers && stats.topPerformers.length > 0 && (
            <Card className="p-6 rounded-lg bg-slate-900 border-slate-800 mb-8">
              <h3 className="font-display font-bold text-lg mb-4">🔥 Perfect Attendance (Last 30 Days)</h3>
              <div className="space-y-2">
                {stats.topPerformers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-lime-500/30">
                    <div className="flex-1">
                      <div className="font-medium text-slate-100">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.total} classes attended</div>
                    </div>
                    <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/50">100%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* At-Risk Students */}
          {stats.atRisk && stats.atRisk.length > 0 && (
            <Card className="p-6 rounded-lg bg-slate-900 border-slate-800 mb-8">
              <h3 className="font-display font-bold text-lg mb-4">⚠️ At-Risk (Under 50% Attendance)</h3>
              <div className="space-y-2">
                {stats.atRisk.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-red-500/30">
                    <div className="flex-1">
                      <div className="font-medium text-slate-100">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.total} classes attended</div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/50">{s.rate}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Class-wise Stats */}
          {stats.classWiseStats && stats.classWiseStats.length > 0 && (
            <Card className="p-6 rounded-lg bg-slate-900 border-slate-800 mb-8">
              <h3 className="font-display font-bold text-lg mb-4">Last 10 Classes</h3>
              <div className="space-y-1">
                {stats.classWiseStats.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800/40 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-100">{c.sport}</div>
                      <div className="text-xs text-slate-500">{c.date} at {c.time}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-slate-100">{c.rate}%</div>
                      <div className="text-xs text-slate-500">{c.present}/{c.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="border-t border-slate-800 pt-8 mt-8" />
        </>
      )}

      {/* Mark Attendance Section */}
      <div>
        <h3 className="font-display font-bold text-lg mb-4">Mark Attendance</h3>
        <div className="max-w-md mb-6">
          <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">Select class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Pick a class to mark attendance" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => {
                const sport = SPORTS.find(s => s.id === c.sport_id);
                return <SelectItem key={c.id} value={c.id}>{sport?.name} · {c.date} · {c.start_time}–{c.end_time}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedClass && (
          <>
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <Button size="sm" variant="outline" onClick={() => markAll(true)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100"><CheckCircle2 className="w-4 h-4 mr-1 text-lime-400" /> All present</Button>
              <Button size="sm" variant="outline" onClick={() => markAll(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100"><XCircle className="w-4 h-4 mr-1" /> All absent</Button>
              <div className="flex-1" />
              <Button onClick={save} disabled={Object.keys(dirty).length === 0} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold disabled:opacity-40"><Save className="w-4 h-4 mr-1.5" />Save attendance</Button>
            </div>

            {roster.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No bookings for this class" />
            ) : (
              <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
                {roster.map(r => {
                  const cur = dirty[r.booking_id] !== undefined ? dirty[r.booking_id] : r.present;
                  return (
                    <div key={r.booking_id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">{r.name[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-100 truncate">{r.name}</div>
                        <div className="text-xs text-slate-500 truncate">{r.subtitle}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => toggle(r.booking_id, true)} className={cur === true ? 'bg-lime-400 text-slate-900 hover:bg-lime-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}><CheckCircle2 className="w-4 h-4 mr-1" /> Present</Button>
                        <Button size="sm" onClick={() => toggle(r.booking_id, false)} className={cur === false ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}><XCircle className="w-4 h-4 mr-1" /> Absent</Button>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ===================== PAYMENTS =====================
function PaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);
  const [limit] = useState(50);
  const [dateFrom, setDateFrom] = useState(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState(''); // YYYY-MM-DD

  const load = (p = 1) => {
    const params = new URLSearchParams();
    params.set('page', p);
    params.set('limit', limit);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    fetch(`/api/admin/payments?${params.toString()}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setPayments(d.payments || []);
        setTotalCount(d.total || 0);
        setTotalSuccessAmount(d.total_success_amount || 0);
        setPage(p);
      });
  };
  useEffect(() => { load(1); }, [dateFrom, dateTo]);

  // Calculate payment stats (from current page only for refunded)
  const refunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);
  const download = (p) => {
    const html = `<html><body style="font-family:Inter,sans-serif;padding:40px"><h1>Flowternity Invoice</h1><p>Ref: ${p.ref}</p><p>User: ${p.user_name} (${p.user_email})</p><p>Amount: ₹${p.amount.toLocaleString('en-IN')}</p><p>Status: ${p.status}</p><p>Date: ${new Date(p.created_at).toLocaleString('en-IN')}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `invoice-${p.ref}.html`; a.click();
  };

  const refund = async (p) => {
    if (!confirm(`Refund ₹${p.amount.toLocaleString('en-IN')} for ${p.user_name}? This will also expire the linked membership.`)) return;
    const res = await fetch(`/api/admin/payments/${p.id}/refund`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('Refunded'); load(); }
    else { const d = await res.json(); toast.error(d.error || 'Failed'); }
  };

  return (
    <>
      <SectionHeader title="Payments" description="All transactions and invoices." />
      
      {/* Date range filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold block mb-2">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-500 font-semibold block mb-2">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-lime-400 focus:outline-none"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CreditCard} label="Total Collected (Successful)" value={`₹${totalSuccessAmount.toLocaleString('en-IN')}`} tone="accent" />
        <StatCard icon={Activity} label="Transactions" value={payments.length} />
        <StatCard icon={RotateCcw} label="Refunded" value={`₹${refunded.toLocaleString('en-IN')}`} />
        <StatCard icon={TrendingUp} label="Success Rate" value={`${payments.length ? Math.round(100 * payments.filter(p => p.status === 'success').length / payments.length) : 0}%`} />
      </div>
      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" />
      ) : (
        <>
          <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Reference</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {payments.map(p => (
              <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
                <div className="col-span-12 md:col-span-3 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{p.user_name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.user_email}</div>
                </div>
                <div className="col-span-6 md:col-span-3 font-mono text-xs text-slate-400 truncate">
                  {p.ref}
                  {p.method === 'admin_granted' && <span className="ml-1 text-lime-400/80">· granted</span>}
                </div>
                <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                <div className="col-span-6 md:col-span-2">
                  <div className="font-mono font-semibold text-slate-100">₹{p.amount.toLocaleString('en-IN')}</div>
                  <div className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold mt-0.5 ${p.status === 'success' ? 'bg-lime-400/20 text-lime-400' : p.status === 'refunded' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{p.status}</div>
                </div>
                <div className="col-span-6 md:col-span-2 flex justify-end gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => download(p)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100 h-8">Invoice</Button>
                  {p.status === 'success' && p.amount > 0 && (
                    <Button size="sm" variant="outline" onClick={() => refund(p)} className="border-slate-700 bg-transparent hover:bg-red-500/10 hover:text-red-400 text-slate-100 h-8"><RotateCcw className="w-3.5 h-3.5" /></Button>
                  )}
                </div>
              </div>
            ))}
          </Card>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 px-6 py-5 bg-lime-400/20 rounded-xl border-3 border-lime-400 shadow-2xl shadow-lime-400/40">
            <div className="text-sm font-semibold text-slate-100">
              <span className="text-lime-400">Showing</span> <span className="text-lime-300">{(page - 1) * limit + 1}</span>–<span className="text-lime-300">{Math.min(page * limit, totalCount)}</span> <span className="text-slate-400">of</span> <span className="text-lime-300">{totalCount}</span> <span className="text-slate-400">payments</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => load(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="h-9 px-4 border-2 border-lime-400/50 hover:border-lime-400 hover:bg-lime-400/10 text-slate-100 font-semibold disabled:opacity-50"
              >
                ← Previous
              </Button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.ceil(totalCount / limit) }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === page;
                  const isVisible = Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === Math.ceil(totalCount / limit);
                  if (!isVisible && pageNum !== Math.ceil(totalCount / limit) && pageNum !== 1) return null;
                  if (!isVisible) return <span key={pageNum} className="text-slate-500 font-bold">…</span>;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => load(pageNum)}
                      variant={isCurrent ? 'default' : 'outline'}
                      size="sm"
                      className={`h-10 w-10 p-0 font-black text-base rounded-lg ${isCurrent ? 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/60 border-2 border-lime-300' : 'bg-slate-700 border-2 border-lime-400/70 hover:border-lime-400 hover:bg-slate-600 text-lime-300 font-bold'}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() => load(Math.min(Math.ceil(totalCount / limit), page + 1))}
                disabled={page >= Math.ceil(totalCount / limit)}
                variant="outline"
                size="sm"
                className="h-9 px-4 border-2 border-lime-400/50 hover:border-lime-400 hover:bg-lime-400/10 text-slate-100 font-semibold disabled:opacity-50"
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ===================== FREE TRIALS =====================
function TrialsSection() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => fetch('/api/admin/trial-leads', { credentials: 'include' }).then(r => r.json()).then(d => setLeads(d.leads || []));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/trial-leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) });
    if (res.ok) { toast.success(`Marked ${status.replace('_', ' ')}`); load(); }
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const counts = leads.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});

  const statuses = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'attended', label: 'Attended' },
    { id: 'no_show', label: 'No-show' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <SectionHeader
        title="Free Trials"
        description={`${leads.length} lead${leads.length === 1 ? '' : 's'} · convert them into paying members.`}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`text-xs px-2.5 py-1 rounded-full border transition ${filter === s.id ? 'bg-slate-100 text-slate-900 border-slate-100' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>
            {s.label} {s.id !== 'all' && counts[s.id] ? <span className="ml-1 opacity-70">({counts[s.id]})</span> : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Sparkles} title="No trial leads yet" />
      ) : (
        <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
            <div className="col-span-3">Lead</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Sport</div>
            <div className="col-span-2">Slot</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map(l => (
            <div key={l.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
              <div className="col-span-12 md:col-span-3 min-w-0">
                <div className="font-medium text-slate-100 truncate">{l.full_name}</div>
                <div className="text-xs text-slate-500">{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
              </div>
              <div className="col-span-6 md:col-span-3 min-w-0 text-xs text-slate-400">
                <div className="truncate">{l.email}</div>
                <div className="truncate">{l.phone}</div>
              </div>
              <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{l.sport_name}</div>
              <div className="col-span-12 md:col-span-2 text-xs text-slate-400">
                {l.class ? (
                  <>
                    <div className="text-slate-100">{new Date(l.class.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div>{l.class.start_time}–{l.class.end_time}</div>
                  </>
                ) : <span className="text-slate-600">Call to schedule</span>}
              </div>
              <div className="col-span-12 md:col-span-2 flex flex-wrap justify-end gap-1">
                <div className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  l.status === 'attended' ? 'bg-lime-400/20 text-lime-400' :
                  l.status === 'scheduled' ? 'bg-blue-400/20 text-blue-400' :
                  l.status === 'pending' ? 'bg-amber-400/20 text-amber-400' :
                  'bg-slate-800 text-slate-400'
                }`}>{l.status}</div>
                <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                  <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="no_show">No-show</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {l.message && (
                <div className="col-span-12 mt-1 text-xs text-slate-400 italic px-1">&quot;{l.message}&quot;</div>
              )}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

// ===================== JERSEYS =====================
function JerseysSection() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadJerseys();
  }, []);

  const loadJerseys = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/jerseys', { credentials: 'include' });
    if (res.ok) {
      const d = await res.json();
      setJerseys(d.jerseys || []);
    }
    setLoading(false);
  };

  const updateStatus = async (jerseyId, status) => {
    setUpdating(jerseyId);
    const res = await fetch(`/api/admin/jerseys/${jerseyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (res.ok) {
      toast.success(`Jersey marked as ${status}`);
      loadJerseys();
    } else {
      toast.error('Failed to update jersey');
    }
  };

  return (
    <>
      <SectionHeader
        title="Jerseys"
        description={`${jerseys.length} jerseys · manage jersey distribution`}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      ) : jerseys.length === 0 ? (
        <EmptyState icon={Gift} title="No jerseys yet" />
      ) : (
        <Card className="rounded-lg bg-slate-900 border-slate-800 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-1">Number</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-1">Height</div>
            <div className="col-span-1">Weight</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          {jerseys.map(j => (
            <div key={j.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
              <div className="col-span-12 md:col-span-2 min-w-0">
                <div className="font-medium text-slate-100 truncate">{j.user_name}</div>
              </div>
              <div className="col-span-12 md:col-span-2 min-w-0 text-xs text-slate-400 truncate">
                {j.user_email}
              </div>
              <div className="col-span-6 md:col-span-1 text-sm text-slate-100">#{j.number}</div>
              <div className="col-span-6 md:col-span-1">
                <Badge variant="outline" className="text-lime-400 border-lime-400/30 text-xs">{j.size}</Badge>
              </div>
              <div className="col-span-6 md:col-span-1 text-sm text-slate-400">{j.height}cm</div>
              <div className="col-span-6 md:col-span-1 text-sm text-slate-400">{j.weight}kg</div>
              <div className="col-span-6 md:col-span-2">
                <Badge className={`text-xs ${j.status === 'given' ? 'bg-lime-400/20 text-lime-400' : 'bg-amber-400/20 text-amber-400'}`}>
                  {j.status === 'given' ? '✓ Given' : '○ Not Given'}
                </Badge>
              </div>
              <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                <Select value={j.status || 'not_given'} onValueChange={(v) => updateStatus(j.id, v)} disabled={updating === j.id}>
                  <SelectTrigger className="h-8 w-32 text-xs bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_given">Not Given</SelectItem>
                    <SelectItem value="given">Given</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

// ===================== COACHES =====================
function CoachesSection() {
  const [coaches, setCoaches] = useState([]);
  const [open, setOpen] = useState(false);
  const emptyForm = { full_name: '', email: '', phone: '', sports: [], bio: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/admin/coaches', { credentials: 'include' }).then(r => r.json()).then(d => setCoaches(d.coaches || []));
  useEffect(() => { load(); }, []);

  const toggleSport = (id) => setForm(f => ({ ...f, sports: f.sports.includes(id) ? f.sports.filter(x => x !== id) : [...f.sports, id] }));

  const create = async (e, keepOpen) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/coaches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) { toast.error('Failed'); return; }
    toast.success('Coach added');
    load();
    if (keepOpen) setForm(emptyForm);
    else { setForm(emptyForm); setOpen(false); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this coach?')) return;
    await fetch(`/api/admin/coaches/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  return (
    <>
      <SectionHeader
        title="Coaches"
        description={`${coaches.length} coaches on the roster`}
        action={<Button onClick={() => setOpen(true)} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Plus className="w-4 h-4 mr-1.5" /> Add Coach</Button>}
      />

      {coaches.length === 0 ? (
        <EmptyState icon={UserCog} title="No coaches yet" cta="Add your first coach" onClick={() => setOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coaches.map(c => (
            <Card key={c.id} className="p-4 rounded-lg bg-slate-900 border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold flex-shrink-0">{c.full_name[0]?.toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-100 truncate">{c.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.email}</div>
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {c.sports?.map(sid => <Badge key={sid} variant="secondary" className="bg-slate-800 text-slate-300 border-0 text-[10px]">{SPORTS.find(s => s.id === sid)?.name || sid}</Badge>)}
              </div>
              {c.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{c.bio}</p>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle className="text-slate-50">Add coach</DialogTitle></DialogHeader>
          <form onSubmit={(e) => create(e, false)} className="space-y-3">
            <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Full name</Label><Input required className="h-11 mt-1" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Email</Label><Input type="email" required className="h-11 mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Phone</Label><Input className="h-11 mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-widest mb-1 block">Assigned sports</Label>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS.filter(s => s.status === 'active').map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded border border-slate-700 bg-slate-950 cursor-pointer hover:border-slate-600">
                    <Checkbox checked={form.sports.includes(s.id)} onCheckedChange={() => toggleSport(s.id)} />
                    <span className="text-sm text-slate-200">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Bio</Label><Textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="One-liner about the coach" /></div>
            <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Plus className="w-4 h-4 mr-1.5" /> {saving ? 'Adding…' : 'Add coach'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===================== ANNOUNCEMENTS =====================
function AnnouncementsSection() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const emptyForm = { title: '', message: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/admin/announcements', { credentials: 'include' }).then(r => r.json()).then(d => setList(d.announcements || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { toast.success('Posted'); setForm(emptyForm); setOpen(false); load(); }
    else toast.error('Failed');
  };

  const remove = async (id) => {
    if (!confirm('Delete announcement?')) return;
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  return (
    <>
      <SectionHeader
        title="Announcements"
        description={`${list.length} published · shown on every member's dashboard`}
        action={<Button onClick={() => setOpen(true)} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Plus className="w-4 h-4 mr-1.5" /> New Announcement</Button>}
      />

      {list.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" cta="Post your first announcement" onClick={() => setOpen(true)} />
      ) : (
        <div className="space-y-3">
          {list.map(a => (
            <Card key={a.id} className="p-4 rounded-lg bg-slate-900 border-slate-800 border-l-4 border-l-lime-400">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-100">{a.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{a.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{new Date(a.created_at).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => remove(a.id)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle className="text-slate-50">New announcement</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Title</Label><Input required className="h-11 mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Holiday closure notice" /></div>
            <div><Label className="text-slate-300 text-xs uppercase tracking-widest">Message</Label><Textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Details for members…" /></div>
            <DialogFooter className="pt-3 flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"><Megaphone className="w-4 h-4 mr-1.5" /> {saving ? 'Posting…' : 'Post'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------- Empty state --------
function EmptyState({ icon: Icon, title, cta, onClick }) {
  return (
    <Card className="p-12 rounded-lg bg-slate-900 border-slate-800 border-dashed text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-slate-300 font-medium">{title}</p>
      {cta && (
        <Button onClick={onClick} className="mt-4 bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> {cta}
        </Button>
      )}
    </Card>
  );
}


// ===================== PERFORMANCE (metrics + kids levels) =====================
function PerformanceSection() {
  const [q, setQ] = useState('');
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSport, setActiveSport] = useState(null);
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);
  const [metricsTab, setMetricsTab] = useState('performance');
  const [leadershipScores, setLeadershipScores] = useState({});
  const [leadershipNotes, setLeadershipNotes] = useState('');
  const [recentLeadership, setRecentLeadership] = useState([]);
  const [sortOrder, setSortOrder] = useState(null); // null | 'high-to-low' | 'low-to-high'
  const [memberScores, setMemberScores] = useState({});
  const [sortLoading, setSortLoading] = useState(false);
  const [athleteTag, setAthleteTag] = useState(null); // null | 'sub_junior' | 'junior' | 'senior'
  const [savingTag, setSavingTag] = useState(false);
  // Leadership dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardLoadingMore, setDashboardLoadingMore] = useState(false);
  const [dashboardSport, setDashboardSport] = useState('basketball');
  const [dashboardPage, setDashboardPage] = useState(1);
  const [dashboardHasMore, setDashboardHasMore] = useState(false);
  const DASHBOARD_LIMIT = 100;
  const [dashboardTagFilter, setDashboardTagFilter] = useState(null); // null | 'sub_junior' | 'junior' | 'senior'
  // Search members
  useEffect(() => {
    const t = setTimeout(async () => {
      setPage(1);
      const r = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}&page=1&limit=20`, { credentials: 'include' });
      const d = await r.json();
      const membersList = d.members || [];
      setMembers(membersList);
      setHasMore((d.members?.length || 0) >= 20);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // When sort is activated, calculate scores for all visible members
  const activateSort = async (order) => {
    if (sortOrder === order) { setSortOrder(null); return; }
    setSortOrder(order);
    setSortLoading(true);
    // Fire off score calculations for all members not yet scored
    await Promise.all(members.map(m => memberScores[m.id] ? Promise.resolve() : calculateCombinedScore(m.id)));
    setSortLoading(false);
  };

  // Load more members
  const loadMoreMembers = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const r = await fetch(`/api/admin/members?q=${encodeURIComponent(q)}&page=${nextPage}&limit=20`, { credentials: 'include' });
    const d = await r.json();
    const newMembers = d.members || [];
    setMembers(prev => [...prev, ...newMembers]);
    setPage(nextPage);
    setHasMore(newMembers.length >= 20);
    // Calculate scores for new members if sort is active
    if (sortOrder) {
      await Promise.all(newMembers.map(m => memberScores[m.id] ? Promise.resolve() : calculateCombinedScore(m.id)));
    }
    setLoadingMore(false);
  };

  // Load the leadership dashboard
  const loadDashboard = async (sport, tag) => {
    setDashboardLoading(true);
    const s = sport || dashboardSport;
    const t = tag !== undefined ? tag : dashboardTagFilter;
    setDashboardPage(1);
    const url = new URL('/api/admin/leaderboard', window.location.origin);
    url.searchParams.set('sport_id', s);
    url.searchParams.set('limit', DASHBOARD_LIMIT);
    url.searchParams.set('skip', 0);
    if (t) url.searchParams.set('tag', t);
    const r = await fetch(url.toString(), { credentials: 'include' });
    const d = await r.json();
    const rows = d.leaderboard || [];
    setDashboardData(rows);
    setDashboardHasMore(rows.length === DASHBOARD_LIMIT);
    setDashboardLoading(false);
  };

  const loadMoreDashboard = async () => {
    setDashboardLoadingMore(true);
    const nextPage = dashboardPage + 1;
    const skip = (nextPage - 1) * DASHBOARD_LIMIT;
    const url = new URL('/api/admin/leaderboard', window.location.origin);
    url.searchParams.set('sport_id', dashboardSport);
    url.searchParams.set('limit', DASHBOARD_LIMIT);
    url.searchParams.set('skip', skip);
    if (dashboardTagFilter) url.searchParams.set('tag', dashboardTagFilter);
    const r = await fetch(url.toString(), { credentials: 'include' });
    const d = await r.json();
    const rows = d.leaderboard || [];
    setDashboardData(prev => [...prev, ...rows]);
    setDashboardPage(nextPage);
    setDashboardHasMore(rows.length === DASHBOARD_LIMIT);
    setDashboardLoadingMore(false);
  };

  const switchDashboardTag = (newTag) => {
    const tag = dashboardTagFilter === newTag ? null : newTag; // toggle off if already selected
    setDashboardTagFilter(tag);
    setDashboardPage(1);
    // Reload with new tag (will reset page to 1)
    loadDashboard(undefined, tag);
  };

  // Build subject list (user + their child_profiles)
  const openMember = async (m) => {
    setLoading(true);
    setSelectedMemberId(m.id); // Store parent member ID
    // Fetch member detail to get children
    const dr = await fetch(`/api/admin/members/${m.id}/detail`, { credentials: 'include' });
    const dd = await dr.json();
    const children = dd.children || [];
    const subs = [];
    for (const c of children) {
      subs.push({ id: c.id, label: c.athlete_name || c.child_name || 'Member', type: 'child' });
    }
    // If no athlete profiles exist yet, fall back to the user account
    if (subs.length === 0) subs.push({ id: m.id, label: m.full_name, type: 'user' });
    setSubjects(subs);
    // Auto-select first
    await pickSubject(subs[0]);
    setLoading(false);
  };

  const pickSubject = async (s) => {
    if (!s) return;
    setSelected(s);
    setDirty({});
    setLeadershipScores({});
    setLeadershipNotes('');
    const r = await fetch(`/api/admin/athletes/${s.id}/performance`, { credentials: 'include' });
    const d = await r.json();
    setData(d);
    setAthleteTag(d.subject?.athlete_tag || null);
    const sport = d.sports?.[0]?.sport_id || null;
    setActiveSport(sport);
    if (sport) loadRecentLeadership(s.id, sport);
  };

  const currentSportData = data?.sports?.find(s => s.sport_id === activeSport);

  // Get the parent member name from the search (if available)
  const currentParent = members.find(m => subjects.some(s => s.id === m.id || (selected?.type === 'child' && subjects.some(subj => subj.id === selected.id))));

  const scoreValue = (mkey) => {
    if (dirty[mkey] !== undefined) return dirty[mkey];
    return currentSportData?.scores?.[mkey] ?? '';
  };

  const setScore = (mkey, v) => {
    if (v === '' || v === null) { setDirty(d => { const nd = { ...d }; delete nd[mkey]; return nd; }); return; }
    const num = Math.max(0, Math.min(10, Number(v)));
    setDirty(d => ({ ...d, [mkey]: num }));
  };

  const saveScores = async () => {
    if (!selected || !activeSport) return;
    if (Object.keys(dirty).length === 0) { toast.info('No changes'); return; }
    setSaving(true);
    const r = await fetch(`/api/admin/athletes/${selected.id}/metrics`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ sport_id: activeSport, scores: dirty }),
    });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) { toast.error(d.error || 'Save failed'); return; }
    toast.success('Scores saved');
    setDirty({});
    await pickSubject(selected);
  };

  const loadRecentLeadership = async (userId, sportId) => {
    if (!userId || !sportId) return;
    const r = await fetch(`/api/leadership-metrics?user_id=${userId}&sport_id=${sportId}`, { credentials: 'include' });
    const d = await r.json();
    if (d.metrics) {
      // Convert metrics array (with averages) to a format for display
      setRecentLeadership(d.metrics);
    }
  };

  const saveLeadershipMetrics = async () => {
    if (!selected || !activeSport) { toast.error('Select a member first'); return; }
    if (Object.keys(leadershipScores).length === 0) { toast.error('Score at least one metric'); return; }
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(leadershipScores).map(([metricId, score]) =>
          fetch('/api/leadership-metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              user_id: selected.id,
              sport_id: activeSport,
              metric_id: metricId,
              score: parseInt(score),
              notes: leadershipNotes || '',
            }),
          }).then(r => r.json())
        )
      );
      toast.success(`${Object.keys(leadershipScores).length} metric${Object.keys(leadershipScores).length > 1 ? 's' : ''} saved`);
      setLeadershipScores({});
      setLeadershipNotes('');
      loadRecentLeadership(selected.id, activeSport);
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const ATHLETE_TAGS = [
    { id: 'sub_junior', label: 'Sub Junior', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30' },
    { id: 'junior',     label: 'Junior',     color: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30' },
    { id: 'senior',     label: 'Senior',     color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' },
  ];

  const saveAthleteTag = async (newTag) => {
    if (!selected) return;
    setSavingTag(true);
    const tag = athleteTag === newTag ? null : newTag; // toggle off if already selected
    const r = await fetch(`/api/admin/athletes/${selected.id}/tag`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ tag }),
    });
    if (r.ok) {
      setAthleteTag(tag);
      toast.success(tag ? `Tagged as ${ATHLETE_TAGS.find(t => t.id === tag)?.label}` : 'Tag removed');
    } else {
      toast.error('Failed to save tag');
    }
    setSavingTag(false);
  };

  // Calculate combined score (performance + leadership average) for a member
  const calculateCombinedScore = async (memberId) => {
    try {
      const [perfRes, leadRes] = await Promise.all([
        fetch(`/api/admin/athletes/${memberId}/performance`, { credentials: 'include' }),
        fetch(`/api/leadership-metrics?user_id=${memberId}&sport_id=${activeSport || 'basketball'}`, { credentials: 'include' }),
      ]);

      let perfAvg = 0;
      let leadAvg = 0;

      if (perfRes.ok) {
        const perfData = await perfRes.json();
        const currentSport = perfData.sports?.find(s => s.sport_id === (activeSport || 'basketball'));
        if (currentSport?.scores) {
          const scores = Object.values(currentSport.scores).filter(s => s > 0);
          if (scores.length > 0) {
            perfAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
          }
        }
      }

      if (leadRes.ok) {
        const leadData = await leadRes.json();
        const metrics = leadData.metrics || [];
        const validMetrics = metrics.filter(m => m.average > 0);
        if (validMetrics.length > 0) {
          leadAvg = validMetrics.reduce((sum, m) => sum + m.average, 0) / validMetrics.length;
        }
      }

      const combined = (perfAvg + leadAvg) / 2;
      setMemberScores(prev => ({
        ...prev,
        [memberId]: { performance: perfAvg, leadership: leadAvg, combined }
      }));
      return combined;
    } catch (e) {
      console.error('Error calculating score:', e);
      return 0;
    }
  };

  return (
    <>
      <SectionHeader
        title="Performance & Leadership"
        description="Score athletes on performance metrics or record leadership dimensions."
      />

      {/* Leadership Dashboard - collapsible */}
      <div className="mb-6">
        <Button
          onClick={() => { setShowDashboard(v => { const next = !v; if (next && dashboardData.length === 0) loadDashboard(); return next; }); }}
          variant="outline"
          className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100 gap-2"
        >
          <TrendingUp className="w-4 h-4 text-lime-400" />
          {showDashboard ? 'Hide' : 'View'} Leaderboard Dashboard
        </Button>

        {showDashboard && (
          <Card className="mt-4 rounded-xl bg-slate-900 border-slate-800 overflow-hidden">
            {/* Dashboard header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
              <div>
                <p className="font-display font-bold text-lg text-slate-100">Combined Leaderboard</p>
                <p className="text-xs text-slate-500 mt-0.5">Ranked by Performance + Leadership average score</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {SPORTS.filter(s => s.status === 'active').map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setDashboardSport(s.id); loadDashboard(s.id); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${dashboardSport === s.id ? 'bg-lime-400 text-slate-900 border-lime-400' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}
                    >{s.name}</button>
                  ))}
                  <button onClick={() => loadDashboard()} className="text-xs text-slate-500 hover:text-lime-400 transition ml-1">↻ Refresh</button>
                </div>
                {/* Tag filter buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Filter:</span>
                  {ATHLETE_TAGS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => switchDashboardTag(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${dashboardTagFilter === t.id ? t.color + ' scale-105 shadow-md' : 'bg-slate-800/60 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                  {dashboardTagFilter && (
                    <button
                      onClick={() => switchDashboardTag(null)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            {dashboardLoading ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">Loading leaderboard…</div>
            ) : dashboardData.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">No scored athletes yet for this sport.</div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Athlete</div>
                  <div className="col-span-2 text-center">Performance</div>
                  <div className="col-span-2 text-center">Leadership</div>
                  <div className="col-span-3 text-center">Combined</div>
                </div>
                {dashboardData.map((row, i) => {
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                  const combinedColor = row.combined >= 7 ? 'text-lime-400' : row.combined >= 4 ? 'text-yellow-400' : 'text-red-400';
                  return (
                    <div key={row.athlete_id} className={`grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-800/60 last:border-0 items-center hover:bg-slate-800/30 transition ${i < 3 ? 'bg-slate-800/20' : ''}`}>
                      <div className="col-span-1 text-sm font-bold text-slate-400">{medal || `${i + 1}`}</div>
                      <div className="col-span-4 min-w-0">
                        <p className="font-semibold text-slate-100 truncate text-sm">{row.name}</p>
                        {row.parent_name !== row.name && <p className="text-[10px] text-slate-500 truncate">{row.parent_name}</p>}
                      </div>
                      <div className="col-span-2 text-center">
                        {row.has_performance ? (
                          <span className={`font-bold text-sm ${row.performance >= 7 ? 'text-lime-400' : row.performance >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>{row.performance.toFixed(1)}</span>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </div>
                      <div className="col-span-2 text-center">
                        {row.has_leadership ? (
                          <span className={`font-bold text-sm ${row.leadership >= 7 ? 'text-lime-400' : row.leadership >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>{row.leadership.toFixed(1)}</span>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </div>
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                          <div className={`h-full rounded-full ${row.combined >= 7 ? 'bg-lime-400' : row.combined >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${(row.combined / 10) * 100}%` }} />
                        </div>
                        <span className={`font-black text-base ${combinedColor}`}>{row.combined.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
                {/* Load More */}
                {dashboardHasMore && (
                  <div className="px-5 py-4 border-t border-slate-800">
                    <button
                      onClick={loadMoreDashboard}
                      disabled={dashboardLoadingMore}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
                    >
                      {dashboardLoadingMore ? 'Loading…' : `Load More (showing ${dashboardData.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </div>

      {/* Metrics tab selector + Sort buttons */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setMetricsTab('performance')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${metricsTab === 'performance' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600'}`}
          >📊 Performance</button>
          <button
            onClick={() => setMetricsTab('leadership')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${metricsTab === 'leadership' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600'}`}
          >👑 Leadership</button>
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2 ml-auto items-center">
          {sortLoading && <span className="text-xs text-slate-500 animate-pulse">Calculating scores…</span>}
          <button
            onClick={() => activateSort('high-to-low')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${sortOrder === 'high-to-low' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600'}`}
          >↓ High → Low</button>
          <button
            onClick={() => activateSort('low-to-high')}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${sortOrder === 'low-to-high' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-600'}`}
          >↑ Low → High</button>
          {sortOrder && <button onClick={() => setSortOrder(null)} className="text-xs text-slate-500 hover:text-slate-300 transition">✕ Clear</button>}
        </div>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        {/* Left: member search */}
        <Card className="rounded-lg bg-slate-900 border-slate-800 p-3 h-fit sticky top-16">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input value={q} onChange={e => setQ(e.target.value)} className="h-10 pl-9 bg-slate-950 border-slate-800" placeholder="Search by name / email / phone" />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-xs text-slate-500 px-3 py-4">No members found</p>
            ) : (
              <>
                {sortOrder && (
                  <div className="sticky top-0 bg-slate-900 px-3 py-2 border-b border-slate-800 mb-1 z-10 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500 font-semibold">Combined score (P+L)</p>
                    {sortLoading && <span className="text-[10px] text-lime-400 animate-pulse">loading…</span>}
                  </div>
                )}
                {members
                  .map(m => ({ ...m, scores: memberScores[m.id] || null, combinedScore: memberScores[m.id]?.combined || 0 }))
                  .sort((a, b) => {
                    if (!sortOrder) return 0;
                    return sortOrder === 'high-to-low' ? b.combinedScore - a.combinedScore : a.combinedScore - b.combinedScore;
                  })
                  .map(m => {
                    const isSelected = subjects.some(s => s.id === m.id) || subjects[0]?.id === m.id;
                    return (
                      <button key={m.id} onClick={() => openMember(m)} className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition ${isSelected ? 'bg-lime-400/10 text-lime-300' : 'hover:bg-slate-800 text-slate-300'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{m.full_name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{m.email} · {m.role}</div>
                          </div>
                          {m.scores && m.combinedScore > 0 ? (
                            <div className="text-right flex-shrink-0">
                              <p className={`text-xs font-black ${m.combinedScore >= 7 ? 'text-lime-400' : m.combinedScore >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>{m.combinedScore.toFixed(1)}</p>
                              <p className="text-[9px] text-slate-600">P:{m.scores.performance.toFixed(1)} L:{m.scores.leadership.toFixed(1)}</p>
                            </div>
                          ) : sortOrder ? (
                            <span className="text-[10px] text-slate-600 animate-pulse flex-shrink-0">…</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                {hasMore && (
                  <div className="px-3 py-3 border-t border-slate-800 mt-2">
                    <button
                      onClick={loadMoreMembers}
                      disabled={loadingMore}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading...' : `Load More (showing ${members.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Right: metrics editor */}
        <div>
          {loading && <p className="text-slate-500">Loading…</p>}
          {!loading && !selected && (
            <EmptyState icon={TrendingUp} title="Pick a member to view / edit performance" />
          )}
          {!loading && selected && data && (
            <div className="space-y-4">
              {/* Member/Athlete highlight banner */}
              <div className="rounded-2xl bg-gradient-to-r from-lime-400/20 via-lime-400/10 to-transparent border border-lime-400/40 p-4 md:p-6">
                <p className="text-xs uppercase tracking-widest text-lime-400 font-semibold mb-1">Currently editing</p>
                <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
                  <div className="flex-1">
                    {currentParent && (
                      <>
                        <p className="text-sm text-slate-400">Parent / Member</p>
                        <p className="font-display font-black text-2xl text-slate-100">{currentParent.full_name}</p>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">Athlete Profile</p>
                    <p className="font-display font-black text-2xl text-lime-300">{selected.label}</p>
                  </div>
                  {activeSport && (
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">Sport</p>
                      <p className="font-display font-black text-2xl text-slate-100">{data.sports.find(s => s.sport_id === activeSport)?.sport_name}</p>
                    </div>
                  )}
                  {/* Athlete Tag selector */}
                  <div className="flex-shrink-0">
                    <p className="text-sm text-slate-400 mb-1.5">Category</p>
                    <div className="flex gap-1.5">
                      {ATHLETE_TAGS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => saveAthleteTag(t.id)}
                          disabled={savingTag}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${athleteTag === t.id ? t.color + ' scale-105 shadow-md' : 'bg-slate-800/60 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject switcher (user + kids) */}
              {subjects.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 uppercase tracking-widest mr-1">Switch Athlete</span>
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => pickSubject(s)} className={`text-xs px-3 py-1.5 rounded-full border transition ${selected.id === s.id ? 'bg-lime-400 text-slate-900 border-lime-400 font-semibold' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Sport tabs */}
              {data.sports.length === 0 ? (
                <Card className="rounded-lg bg-slate-900 border-slate-800 p-8 text-center">
                  <p className="text-slate-400">No sports enrolled yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Grant them a membership first (Members tab).</p>
                </Card>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-800">
                    {data.sports.map(sp => (
                      <button key={sp.sport_id} onClick={() => { setActiveSport(sp.sport_id); setDirty({}); loadRecentLeadership(selected.id, sp.sport_id); }} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeSport === sp.sport_id ? 'border-lime-400 text-lime-400' : 'border-transparent text-slate-400 hover:text-slate-100'}`}>
                        {sp.sport_name}
                      </button>
                    ))}
                  </div>

                  {currentSportData && (
                    <>
                      {/* Kids level card - only for performance tab */}
                      {metricsTab === 'performance' && selected.type === 'child' && (
                        <Card className="rounded-lg bg-gradient-to-br from-lime-400/10 to-transparent border-lime-400/20 p-5">
                          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-lime-400 mb-1">Progression level</p>
                              <div className="flex items-baseline gap-3">
                                <span className="font-display font-black text-3xl text-slate-100">L{currentSportData.level || 1}</span>
                                <span className="font-semibold text-lg text-slate-100">{(currentSportData.level_info?.name) || 'SPARK'}</span>
                              </div>
                              <p className="text-xs text-slate-400 italic mt-1">&ldquo;{(currentSportData.level_info?.quote) || 'Every champion starts with a spark.'}&rdquo;</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(data.levels_catalog || []).map(l => {
                                const active = (currentSportData.level || 1) === l.level;
                                return (
                                  <button key={l.level} onClick={() => setLevel(l.level)} className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${active ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'}`} title={l.quote}>
                                    L{l.level} {l.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* PERFORMANCE METRICS TAB */}
                      {metricsTab === 'performance' && (
                        <Card className="rounded-lg bg-slate-900 border-slate-800 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-slate-100">{currentSportData.sport_name} metrics</h3>
                              <p className="text-xs text-slate-500">Score each metric 0–10 (decimals allowed).</p>
                            </div>
                            <Button onClick={saveScores} disabled={saving || Object.keys(dirty).length === 0} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
                              <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving…' : `Save${Object.keys(dirty).length ? ` (${Object.keys(dirty).length})` : ''}`}
                            </Button>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(currentSportData.metrics_catalog || []).map(m => {
                              const v = scoreValue(m.key);
                              const isDirty = dirty[m.key] !== undefined;
                              return (
                                <label key={m.key} className={`block px-3 py-2.5 rounded-md border transition ${isDirty ? 'bg-lime-400/5 border-lime-400/40' : 'bg-slate-950/50 border-slate-800'}`}>
                                  <span className="text-xs text-slate-300 block mb-1.5">{m.label}</span>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number" min="0" max="10" step="0.1"
                                      value={v}
                                      onChange={e => setScore(m.key, e.target.value)}
                                      className="w-16 h-9 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-lime-400"
                                      placeholder="—"
                                    />
                                    <span className="text-slate-500 text-xs">/ 10</span>
                                    {v !== '' && (
                                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${Number(v) >= 7 ? 'bg-lime-400' : Number(v) >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Number(v) * 10}%` }} />
                                      </div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </Card>
                      )}

      {/* LEADERSHIP METRICS TAB — redesigned */}
                      {metricsTab === 'leadership' && (
                        <div className="space-y-4">
                          {/* Score grid card */}
                          <Card className="rounded-xl bg-slate-900 border-slate-800 overflow-hidden">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                              <div>
                                <p className="font-semibold text-slate-100 text-sm">Leadership Metrics</p>
                                <p className="text-xs text-slate-500 mt-0.5">Tap a number to score each dimension</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {Object.keys(leadershipScores).length > 0 && (
                                  <button
                                    onClick={() => setLeadershipScores({})}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition"
                                  >
                                    Clear
                                  </button>
                                )}
                                <Button
                                  onClick={saveLeadershipMetrics}
                                  disabled={saving || Object.keys(leadershipScores).length === 0}
                                  className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold h-8 px-4 text-xs"
                                >
                                  <Save className="w-3.5 h-3.5 mr-1.5" />
                                  {saving ? 'Saving…' : `Save${Object.keys(leadershipScores).length > 0 ? ` (${Object.keys(leadershipScores).length}/7)` : ''}`}
                                </Button>
                              </div>
                            </div>

                            {/* Metric rows */}
                            <div className="divide-y divide-slate-800">
                              {LEADERSHIP_METRICS.map(metric => {
                                const current = leadershipScores[metric.id];
                                return (
                                  <div key={metric.id} className="px-5 py-3.5 flex items-center gap-4">
                                    {/* Label */}
                                    <div className="flex items-center gap-2.5 w-52 flex-shrink-0">
                                      <span className="text-xl leading-none">{metric.emoji}</span>
                                      <div>
                                        <p className="text-sm font-medium text-slate-200 leading-tight">{metric.name}</p>
                                      </div>
                                    </div>

                                    {/* Score buttons 1–10 */}
                                    <div className="flex gap-1 flex-1 flex-wrap">
                                      {[1,2,3,4,5,6,7,8,9,10].map(n => {
                                        const active = current === n;
                                        const color = n <= 3 ? 'border-red-500/50 text-red-400 data-[active=true]:bg-red-500 data-[active=true]:border-red-500'
                                          : n <= 6 ? 'border-yellow-500/50 text-yellow-400 data-[active=true]:bg-yellow-500 data-[active=true]:border-yellow-500'
                                          : 'border-lime-500/50 text-lime-400 data-[active=true]:bg-lime-400 data-[active=true]:border-lime-400';
                                        return (
                                          <button
                                            key={n}
                                            data-active={active}
                                            onClick={() => setLeadershipScores(s => ({ ...s, [metric.id]: n }))}
                                            className={`w-8 h-8 rounded-md text-xs font-bold border transition-all ${color} ${active ? 'text-slate-900 scale-110 shadow-lg' : 'bg-slate-950 hover:bg-slate-800'}`}
                                          >
                                            {n}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Selected badge or dash */}
                                    <div className="w-10 text-right flex-shrink-0">
                                      {current ? (
                                        <span className={`text-lg font-black ${current <= 3 ? 'text-red-400' : current <= 6 ? 'text-yellow-400' : 'text-lime-400'}`}>
                                          {current}
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 text-sm">—</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Notes + submit footer */}
                            <div className="px-5 py-4 border-t border-slate-800 flex gap-3 items-center">
                              <input
                                type="text"
                                placeholder="Session notes (optional)..."
                                value={leadershipNotes}
                                onChange={e => setLeadershipNotes(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg text-sm bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-lime-400 transition"
                              />
                            </div>
                          </Card>

                          {/* Recent entries for this player */}
                          {recentLeadership.length > 0 && (
                            <Card className="rounded-xl bg-slate-900 border-slate-800 p-4">
                              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Leadership Metrics Averages</p>
                              <div className="space-y-2">
                                {recentLeadership.map((m, i) => {
                                  return (
                                    <div key={m.id || i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base">{m?.emoji || '📊'}</span>
                                        <div>
                                          <p className="text-xs font-medium text-slate-300">{m?.name || 'Unknown'}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className={`text-lg font-black ${m.average <= 3 ? 'text-red-400' : m.average <= 6 ? 'text-yellow-400' : 'text-lime-400'}`}>
                                          {m.average.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-slate-600">/10</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// -------- Reports Section --------
const REPORT_COLORS = ['#a3e635', '#34d399', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa'];

function ReportsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [showDetailedBookings, setShowDetailedBookings] = useState(false);
  const [detailedBookingsData, setDetailedBookingsData] = useState([]);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const load = async (r) => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports/bookings?range=${r}`, { credentials: 'include' });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const loadDetailedBookings = async () => {
    setDetailedLoading(true);
    const res = await fetch(`/api/admin/reports/bookings/detailed?range=${range}`, { credentials: 'include' });
    if (res.ok) {
      const d = await res.json();
      // Sort by date in descending order (newest first)
      const sorted = (d.bookings || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setDetailedBookingsData(sorted);
      setSelectedDate(null); // Reset date filter when loading
    }
    setDetailedLoading(false);
    setShowDetailedBookings(true);
  };

  // Filter bookings by selected date
  const filteredBookings = selectedDate
    ? detailedBookingsData.filter(b => new Date(b.date).toLocaleDateString('en-IN') === new Date(selectedDate).toLocaleDateString('en-IN'))
    : detailedBookingsData;

  // Export to Excel
  const exportToExcel = () => {
    if (filteredBookings.length === 0) {
      alert('No data to export');
      return;
    }

    const data = [
      ['Flowternity Academy - Class Booking Report'],
      [selectedDate ? `Date: ${new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : `Range: Last ${range} days`],
      ['Generated: ' + new Date().toLocaleDateString('en-IN')],
      [],
      ['Date', 'Sport', 'Time', 'Member Name', 'Email', 'Phone', 'Status'],
      ...filteredBookings.map(b => [
        new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
        b.sport,
        `${b.start_time}–${b.end_time}`,
        b.member_name,
        b.email,
        b.phone || '—',
        b.status.toUpperCase(),
      ]),
      [],
      ['SUMMARY'],
      ['Total Bookings', filteredBookings.length],
      ['Booked', filteredBookings.filter(b => b.status === 'booked').length],
      ['Cancelled', filteredBookings.filter(b => b.status === 'cancelled').length],
    ];

    // Create CSV
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN') : `${range}days`}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Print report
  const printReport = () => {
    if (filteredBookings.length === 0) {
      alert('No data to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    const dateStr = selectedDate 
      ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : `Last ${range} days`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Flowternity - Booking Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background: ; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #a3e635; padding-bottom: 20px; }
            .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 5px; }
            .header p { color: #666; font-size: 14px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead { background: #a3e635; color: #1f2937; }
            th { padding: 12px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
            td { padding: 10px 12px; border: 1px solid #ddd; }
            tbody tr:nth-child(even) { background: #f9fafb; }
            .summary { margin-top: 30px; border-top: 2px solid #a3e635; padding-top: 20px; }
            .summary h3 { margin-bottom: 10px; color: #1f2937; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .summary-row span:first-child { font-weight: bold; }
            .summary-row span:last-child { color: #a3e635; font-weight: bold; font-size: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Flowternity Academy</h1>
            <p>Class Booking Report</p>
          </div>
          
          <div class="info">
            <div><strong>Period:</strong> ${dateStr}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sport</th>
                <th>Time</th>
                <th>Member Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings.map(b => `
                <tr>
                  <td>${new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                  <td>${b.sport}</td>
                  <td>${b.start_time}–${b.end_time}</td>
                  <td>${b.member_name}</td>
                  <td>${b.email}</td>
                  <td>${b.phone || '—'}</td>
                  <td><strong>${b.status.toUpperCase()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-row">
              <span>Total Bookings:</span>
              <span>${filteredBookings.length}</span>
            </div>
            <div class="summary-row">
              <span>Booked:</span>
              <span>${filteredBookings.filter(b => b.status === 'booked').length}</span>
            </div>
            <div class="summary-row">
              <span>Cancelled:</span>
              <span>${filteredBookings.filter(b => b.status === 'cancelled').length}</span>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => { load(range); }, [range]);

  const ranges = [
    { label: '7 days', value: '7' },
    { label: '30 days', value: '30' },
    { label: '90 days', value: '90' },
    { label: '1 year', value: '365' },
  ];

  return (
    <>
      <SectionHeader
        title="Reports"
        description="Booking analytics and class fill rates."
        action={
          <div className="flex gap-1.5">
            {ranges.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${range === r.value ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'}`}
              >{r.label}</button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-900 animate-pulse" />)}
        </div>
      ) : !data ? (
        <p className="text-slate-500">Failed to load reports.</p>
      ) : (
        <div className="space-y-6">

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Classes', value: data.summary.total_classes, icon: BookOpen, color: 'text-lime-400' },
              { label: 'Total Bookings', value: data.summary.total_booked, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Cancellations', value: data.summary.total_cancelled, icon: XCircle, color: 'text-red-400' },
              { label: 'Fill Rate', value: `${data.summary.fill_rate}%`, icon: Percent, color: 'text-blue-400' },
            ].map((s, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className={`font-display font-black text-4xl ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-600 mt-1">Last {range} days</div>
              </Card>
            ))}
          </div>

          {/* Daily bookings trend */}
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-lime-400" />
              <h3 className="font-semibold text-slate-100">Daily Bookings Trend</h3>
              <span className="text-xs text-slate-500 ml-auto">Booked vs Cancelled</span>
            </div>
            {data.daily_trend.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No bookings in this period.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.daily_trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false}
                      tickFormatter={d => { const [, m, day] = d.split('-'); return `${day}/${m}`; }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}
                      labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                    <Bar dataKey="booked" name="Booked" fill="#a3e635" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bookings by sport */}
            <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-4 h-4 text-lime-400" />
                <h3 className="font-semibold text-slate-100">Bookings by Sport</h3>
              </div>
              {data.by_sport.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No data.</p>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.by_sport} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="sport" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}
                        labelStyle={{ color: '#94a3b8' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="bookings" name="Bookings" radius={[0, 4, 4, 0]}>
                        {data.by_sport.map((_, i) => <Cell key={i} fill={REPORT_COLORS[i % REPORT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* Fill rate per sport */}
              {data.by_sport.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.by_sport.map((s, i) => {
                    const fill = s.capacity > 0 ? Math.round((s.bookings / s.capacity) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-24 truncate">{s.sport}</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(fill, 100)}%`, backgroundColor: REPORT_COLORS[i % REPORT_COLORS.length] }} />
                        </div>
                        <span className="text-xs font-mono text-slate-400 w-10 text-right">{fill}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Most active members */}
            <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-4 h-4 text-lime-400" />
                <h3 className="font-semibold text-slate-100">Most Active Members</h3>
              </div>
              {data.top_members.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? 'bg-lime-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                        <div className="text-xs text-slate-500 truncate">{m.email}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-black text-lg text-lime-400">{m.bookings}</div>
                        <div className="text-[10px] text-slate-500">bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Top classes table */}
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-lime-400" />
              <h3 className="font-semibold text-slate-100">Top Booked Classes</h3>
            </div>
            {data.top_classes.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No classes booked in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Date', 'Sport', 'Coach', 'Time', 'Booked', 'Capacity', 'Fill'].map(h => (
                        <th key={h} className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_classes.map((c, i) => {
                      const fill = c.capacity > 0 ? Math.round((c.booked / c.capacity) * 100) : 0;
                      return (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                          <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-3 pr-4"><Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 text-xs">{c.sport}</Badge></td>
                          <td className="py-3 pr-4 text-slate-400 truncate max-w-[100px]">{c.coach || '—'}</td>
                          <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{c.start_time}–{c.end_time}</td>
                          <td className="py-3 pr-4 font-display font-black text-lime-400">{c.booked}</td>
                          <td className="py-3 pr-4 text-slate-500">{c.capacity}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${fill >= 80 ? 'bg-lime-400' : fill >= 50 ? 'bg-yellow-400' : 'bg-slate-500'}`} style={{ width: `${fill}%` }} />
                              </div>
                              <span className="text-xs text-slate-400">{fill}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Detailed bookings list button */}
          <div className="flex justify-center">
            <Button onClick={loadDetailedBookings} className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold">
              <FileText className="w-4 h-4 mr-2" /> View Detailed Booking List
            </Button>
          </div>

        </div>
      )}

      {/* Detailed Bookings Dialog */}
      <Dialog open={showDetailedBookings} onOpenChange={setShowDetailedBookings}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-800 text-slate-100 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50">
              All Class Bookings {selectedDate ? `- ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : `- Last ${range} days`}
            </DialogTitle>
            <div className="flex gap-3 items-center mt-4">
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-lime-400"
              />
              <span className="text-xs text-slate-500">
                {selectedDate && `${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''}`}
              </span>
              <div className="flex-1" />
              <Button
                onClick={printReport}
                disabled={filteredBookings.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={filteredBookings.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </div>
          </DialogHeader>
          
          {detailedLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {selectedDate ? 'No bookings found for this date.' : 'No bookings found in this period.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Date</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Sport</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Time</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Member Name</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Email</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Phone</th>
                    <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-semibold pb-3 pr-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td className="py-3 pr-4"><Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 text-xs">{b.sport}</Badge></td>
                      <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{b.start_time}–{b.end_time}</td>
                      <td className="py-3 pr-4 text-slate-100 font-medium truncate">{b.member_name}</td>
                      <td className="py-3 pr-4 text-slate-400 truncate text-xs">{b.email}</td>
                      <td className="py-3 pr-4 text-slate-400 whitespace-nowrap text-xs">{b.phone || '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge className={b.status === 'booked' ? 'bg-lime-400/20 text-lime-400 border-lime-400/20' : 'bg-red-500/20 text-red-400 border-red-500/20 text-xs capitalize'}>
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-4 text-center">Total: {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------- Settings Section --------
function SettingsSection() {
  const [settings, setSettings] = useState({ max_bookings_per_member: 3 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/settings', { credentials: 'include' });
    if (res.ok) setSettings(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) toast.success('Settings saved');
    else {
      const d = await res.json();
      toast.error(d.error || 'Failed to save');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-900 rounded-2xl" />;

  return (
    <>
      <SectionHeader
        title="Settings"
        description="Platform configuration and limits."
      />
      <Card className="rounded-lg bg-slate-900 border-slate-800 p-6 max-w-2xl">
        <h3 className="font-display font-bold text-xl text-slate-50 mb-4">Booking limits</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300 text-sm">Max bookings per member</Label>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              Members can have this many upcoming classes booked at once. They must cancel one to book another.
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="20"
                className="h-11 w-24 bg-slate-950 border-slate-800 text-slate-100"
                value={settings.max_bookings_per_member}
                onChange={e => setSettings({ ...settings, max_bookings_per_member: e.target.value })}
              />
              <span className="text-sm text-slate-400">classes</span>
            </div>
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-lime-400 text-slate-900 hover:bg-lime-300 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </Card>
    </>
  );
}
