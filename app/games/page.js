'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS } from '@/lib/flowternity/config';
import { Users, Clock, MapPin, ArrowRight, Zap, Flame } from 'lucide-react';

export default function GamesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState([]);
  const [sport, setSport] = useState('all');
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestGameId, setGuestGameId] = useState(null);
  const [guestGameFee, setGuestGameFee] = useState(null);
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [guestSubmitting, setGuestSubmitting] = useState(false);

  // Allow non-members to view games, but redirect non-logged-in users for join/payment
  const load = async () => {
    setPageLoading(true);
    const url = sport === 'all' ? '/api/games' : `/api/games?sport=${sport}`;
    const res = await fetch(url, { credentials: 'include' });
    if (res.ok) { const d = await res.json(); setGames(d.games || []); }
    setPageLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sport]);

  const join = async (gameId) => {
    if (!user) { router.push(`/auth?mode=login&next=/games`); return; }
    
    // Check if user has active membership
    if (!user.has_active_membership) {
      toast.error('You need an active membership to join free games');
      router.push('/memberships');
      return;
    }
    
    setBusy(gameId);
    const res = await fetch(`/api/games/${gameId}/join`, { method: 'POST', credentials: 'include' });
    const d = await res.json();
    if (res.ok) { toast.success('You\'re in! See you on the court.'); load(); }
    else toast.error(d.error || 'Failed to join');
    setBusy(null);
  };

  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setGuestSubmitting(true);
    
    try {
      // Create order on backend
      const orderRes = await fetch(`/api/games/${guestGameId}/create-order`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ amount: guestGameFee, guest_details: guestDetails }) 
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create payment order');
        setGuestSubmitting(false);
        return;
      }

      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Flowternity',
          description: `Game Booking - ₹${guestGameFee}`,
          order_id: orderData.id,
          handler: async (response) => {
            // Verify and confirm booking
            const verifyRes = await fetch(`/api/games/${guestGameId}/verify-guest-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: guestGameFee,
                guest_details: guestDetails,
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Payment successful! See you on the court.');
              setGuestModalOpen(false);
              setGuestDetails({ name: '', email: '', phone: '' });
              load();
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
            setGuestSubmitting(false);
          },
          prefill: {
            name: guestDetails.name,
            email: guestDetails.email,
            contact: guestDetails.phone,
          },
          theme: {
            color: '#10b981',
          },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed');
      setGuestSubmitting(false);
    }
  };

  const payToPlay = async (gameId, fee) => {
    if (!user) { 
      // Show guest checkout modal instead of redirecting
      setGuestGameId(gameId);
      setGuestGameFee(fee);
      setGuestModalOpen(true);
      return;
    }
    
    setBusy(gameId);
    
    try {
      // Create order on backend
      const orderRes = await fetch(`/api/games/${gameId}/create-order`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ amount: fee }) 
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create payment order');
        setBusy(null);
        return;
      }

      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Flowternity',
          description: `Game Booking - ₹${fee}`,
          order_id: orderData.id,
          handler: async (response) => {
            // Verify and confirm booking
            const verifyRes = await fetch(`/api/games/${gameId}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: fee,
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Payment successful! See you on the court.');
              load();
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
            setBusy(null);
          },
          prefill: {
            name: user.full_name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: '#10b981',
          },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed');
      setBusy(null);
    }
  };

  const leave = async (gameId) => {
    setBusy(gameId);
    const res = await fetch(`/api/games/${gameId}/leave`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('You left the game'); load(); }
    setBusy(null);
  };

  const activeSports = SPORTS.filter(s => s.status === 'active');
  const groupedByDate = games.reduce((acc, g) => { (acc[g.date] = acc[g.date] || []).push(g); return acc; }, {});

  if (loading) return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-20"><div className="animate-pulse h-32 bg-secondary rounded-2xl" /></div>
    </div>
  );

  const isParent = user?.role === 'parent';

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container">
          <Badge className="bg-accent text-black hover:bg-accent mb-6"><Flame className="w-3 h-3 mr-1" /> Community Games</Badge>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight leading-[0.95]">Join a Game.<br /><span className="text-accent">Meet the crew.</span></h1>
          <p className="text-white/70 text-lg mt-6 max-w-2xl">Show up. Play. Leave with new friends. We handle the equipment, the players, and the court. You just bring the energy.</p>

          <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-3xl">
            {[
              { n: '1', t: 'Pick a slot', d: 'Choose a game that fits your schedule' },
              { n: '2', t: 'We handle setup', d: 'Equipment, players, court — done' },
              { n: '3', t: 'Show up & play', d: 'Meet new players. Have fun.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"><span className="text-black font-black">{s.n}</span></div>
                <div><h3 className="font-semibold">{s.t}</h3><p className="text-white/60 text-sm mt-1">{s.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setSport('all')} className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${sport === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary'}`}>All Sports</button>
          {activeSports.map(s => (
            <button key={s.id} onClick={() => setSport(s.id)} className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${sport === s.id ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary'}`}>{s.name}</button>
          ))}
        </div>

        {pageLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />)}</div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <Card className="p-12 rounded-3xl border-dashed text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-display font-bold text-2xl mt-4">No games scheduled yet</h3>
            <p className="text-muted-foreground mt-2">Check back soon — new pickup games drop every week.</p>
            {user?.role === 'admin' && <Link href="/admin"><Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Schedule a Game (Admin)</Button></Link>}
          </Card>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedByDate).map(([date, list]) => (
              <div key={date}>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="font-display font-black text-3xl">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long' })}</h2>
                  <span className="text-muted-foreground">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map(g => {
                    const isFull = g.participants_count >= g.max_players;
                    return (
                      <Card key={g.id} className={`p-0 rounded-3xl overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${g.i_joined ? 'ring-2 ring-accent' : ''}`}>
                        {/* Card Header with color gradient */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="font-display font-black text-3xl leading-tight">{g.title}</h3>
                              {g.description && <p className="text-sm text-white/70 mt-2">{g.description}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3">
                                <div className="font-display font-black text-2xl">{g.participants_count}</div>
                                <div className="text-xs text-white/80">of {g.max_players}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-accent text-black hover:bg-accent">{g.sport?.name || g.sport_id}</Badge>
                            <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30 capitalize">{g.skill_level?.replace('_', ' ')}</Badge>
                            {g.is_paid && <Badge className="bg-amber-400/30 text-amber-100 border-amber-400/50 hover:bg-amber-400/40">₹{g.fee}</Badge>}
                            {!g.is_paid && <Badge className="bg-green-400/30 text-green-100 border-green-400/50 hover:bg-green-400/40">Free</Badge>}
                            {isFull && <Badge className="bg-red-400/30 text-red-100 border-red-400/50">Full</Badge>}
                            {g.i_joined && <Badge className="bg-white/30 text-white border-white/50">✓ Joined</Badge>}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-6">
                          {/* Time & Location */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                              <div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Time</p>
                                <p className="font-semibold text-foreground">{g.start_time} – {g.end_time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                              <div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hosted by</p>
                                <p className="font-semibold text-foreground">{g.host_name}</p>
                              </div>
                            </div>
                          </div>

                          {/* Player spots indicator */}
                          <div className="bg-secondary/50 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Spots Available</p>
                              <p className="font-bold text-lg text-accent">{Math.max(0, g.max_players - g.participants_count)} left</p>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${isFull ? 'bg-red-500' : 'bg-accent'}`}
                                style={{ width: `${(g.participants_count / g.max_players) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Link href={`/games/${g.id}`} className="flex-1">
                              <Button variant="outline" className="w-full rounded-xl h-11 font-semibold">
                                Details <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                            {g.i_joined ? (
                              g.is_paid ? (
                                <Button disabled variant="outline" className="flex-1 rounded-xl h-11 font-semibold text-muted-foreground">Booked</Button>
                              ) : (
                                <Button 
                                  onClick={() => leave(g.id)} 
                                  disabled={busy === g.id} 
                                  className="flex-1 rounded-xl h-11 font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30"
                                >
                                  Leave
                                </Button>
                              )
                            ) : (
                              (() => {
                                const isFree = !g.is_paid || g.is_paid === false;
                                const buttonText = busy === g.id ? (isFree ? 'Joining...' : 'Processing...') : isFull ? 'Full' : isParent ? 'Adults only' : isFree ? 'Join Free' : `Pay ₹${g.fee || 0}`;
                                return (
                                  <Button 
                                    onClick={() => isFree ? join(g.id) : payToPlay(g.id, g.fee)} 
                                    disabled={busy === g.id || isFull || isParent} 
                                    className="flex-1 rounded-xl h-11 font-semibold bg-accent text-black hover:bg-accent/90"
                                  >
                                    {buttonText}
                                  </Button>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {isParent && (
          <Card className="mt-12 p-8 rounded-3xl bg-secondary border-dashed">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display font-black text-2xl">Games are for adults only</h3>
                <p className="text-muted-foreground mt-1">Your kid can book Classes on the Classes page. Games are pickup matches for adult members.</p>
              </div>
              <Link href="/classes"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">Browse Classes</Button></Link>
            </div>
          </Card>
        )}

        {/* Guest Checkout Modal */}
        <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Your Details</DialogTitle>
              <DialogDescription>
                Complete your booking by entering your information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGuestCheckout} className="space-y-4">
              <div>
                <Label htmlFor="guest-name">Full Name or Team Name *</Label>
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="John Doe / Team Warriors"
                  value={guestDetails.name}
                  onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="guest-email">Email *</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="john@example.com"
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="guest-phone">Phone Number *</Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  placeholder="+91 9999999999"
                  value={guestDetails.phone}
                  onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                disabled={guestSubmitting}
                className="w-full bg-accent text-black hover:bg-accent/90"
              >
                {guestSubmitting ? 'Processing...' : `Pay ₹${guestGameFee || 0} & Continue`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
