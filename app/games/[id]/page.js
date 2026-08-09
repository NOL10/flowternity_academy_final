'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { ArrowLeft, Clock, Users, MapPin, Calendar as Cal } from 'lucide-react';

export default function GameDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/games/${id}`, { credentials: 'include' });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const join = async () => {
    if (!user) { router.push(`/auth?mode=login&next=/games/${id}`); return; }
    setBusy(true);
    const res = await fetch(`/api/games/${id}/join`, { method: 'POST', credentials: 'include' });
    const d = await res.json();
    if (res.ok) { toast.success('You\'re in!'); load(); } else toast.error(d.error);
    setBusy(false);
  };

  const payToPlay = async (fee) => {
    if (!user) { router.push(`/auth?mode=login&next=/games/${id}`); return; }
    setBusy(true);
    
    try {
      // Create order on backend
      const orderRes = await fetch(`/api/games/${id}/create-order`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ amount: fee }) 
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create payment order');
        setBusy(false);
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
            const verifyRes = await fetch(`/api/games/${id}/verify-payment`, {
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
            setBusy(false);
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
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    const res = await fetch(`/api/games/${id}/leave`, { method: 'POST', credentials: 'include' });
    if (res.ok) { toast.success('You left the game'); load(); }
    setBusy(false);
  };

  if (authLoading || loading || !data) return <div className="min-h-screen bg-background"><SiteNav /><div className="container py-20"><div className="animate-pulse h-40 bg-secondary rounded-2xl" /></div></div>;

  const g = data.game;
  const isFull = data.participants.length >= g.max_players;
  const isParent = user?.role === 'parent';

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-10 md:py-14 max-w-4xl">
        <Link href="/games" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to games</Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{g.sport?.name || g.sport_id}</Badge>
              <Badge variant="outline" className="capitalize">{g.skill_level?.replace('_', ' ')}</Badge>
              {g.is_paid && <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">₹{g.fee}</Badge>}
              {!g.is_paid && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Free</Badge>}
              {data.i_joined && <Badge className="bg-accent text-black hover:bg-accent">You&apos;re in</Badge>}
              {isFull && !data.i_joined && <Badge variant="destructive">Full</Badge>}
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight mt-3">{g.title}</h1>
            {g.description && <p className="text-muted-foreground mt-3 text-lg">{g.description}</p>}

            <Card className="p-6 rounded-2xl mt-8">
              <h3 className="font-semibold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Cal className="w-4 h-4 text-muted-foreground" /><span>{new Date(g.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /><span>{g.start_time} – {g.end_time}</span></div>
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-muted-foreground" /><span>Hosted by {g.host_name}</span></div>
                <div className="flex items-center gap-3"><Users className="w-4 h-4 text-muted-foreground" /><span>{data.participants.length}/{g.max_players} players</span></div>
              </div>
            </Card>

            <div className="mt-6">
              {data.i_joined ? (
                <Button onClick={leave} disabled={busy} variant="outline" size="lg" className="border-destructive text-destructive hover:bg-destructive/10 h-12">Leave Game</Button>
              ) : isParent ? (
                <div className="p-4 rounded-xl bg-secondary border-dashed border text-sm">
                  <p className="font-semibold">Games are for adult members only.</p>
                  <p className="text-muted-foreground mt-1">Your kid can book <Link href="/classes" className="underline">Classes</Link> instead.</p>
                </div>
              ) : g.is_paid ? (
                // Paid game - allow anyone to pay
                <Button 
                  onClick={() => payToPlay(g.fee)} 
                  disabled={busy || isFull} 
                  size="lg" 
                  className="bg-accent text-black hover:bg-accent/90 h-12 px-8"
                >
                  {busy ? 'Processing...' : isFull ? 'Game Full' : `Pay ₹${g.fee} & Play`}
                </Button>
              ) : (
                // Free game - need active membership
                <Button 
                  onClick={join} 
                  disabled={busy || isFull} 
                  size="lg" 
                  className="bg-accent text-black hover:bg-accent/90 h-12 px-8"
                >
                  {busy ? 'Joining...' : isFull ? 'Game Full' : 'Join This Game'}
                </Button>
              )}
            </div>
          </div>

          <div>
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Players</h3><span className="text-muted-foreground text-sm">{data.participants.length}/{g.max_players}</span></div>
              {data.participants.length === 0 ? (
                <p className="text-muted-foreground text-sm">Be the first to join!</p>
              ) : (
                <div className="space-y-2">
                  {data.participants.map(p => (
                    <div key={p.user_id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-black text-black text-sm">{p.name[0]?.toUpperCase()}</div>
                      <div className="text-sm font-medium">{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
