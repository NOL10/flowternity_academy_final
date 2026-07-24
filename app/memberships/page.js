'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MEMBERSHIPS, SPORTS } from '@/lib/flowternity/config';
import { Check, ArrowRight } from 'lucide-react';

function MembershipsInner() {
  const router = useRouter();

  const basketballPlans = MEMBERSHIPS.filter(m => m.sport_id === 'basketball');
  const otherPlans = MEMBERSHIPS.filter(m => m.sport_id !== 'basketball');

  const choose = (plan) => {
    router.push(`/checkout?plan=${plan.id}`);
  };

  const sportFor = (id) => SPORTS.find(s => s.id === id);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Memberships</p>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight">Pick your plan.</h1>
          <p className="text-muted-foreground text-lg mt-4 max-w-xl">
            Each membership is for one sport. Hold multiple memberships to train in multiple sports.
          </p>
        </div>

        {/* Basketball — 3 tiers */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              <img src={sportFor('basketball')?.image} alt="Basketball" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl">Basketball</h2>
              <p className="text-sm text-muted-foreground">{sportFor('basketball')?.tagline}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {basketballPlans.map(plan => (
              <Card key={plan.id} className={`p-8 rounded-3xl relative ${plan.popular ? 'border-2 border-primary shadow-xl' : ''}`}>
                {plan.popular && <Badge className="absolute -top-3 left-8 bg-accent text-black hover:bg-accent">Most Popular</Badge>}
                <div className="flex items-baseline gap-2">
                  <div className="font-display font-black text-5xl">{plan.duration_months}</div>
                  <div className="text-muted-foreground">{plan.duration_months === 1 ? 'Month' : 'Months'}</div>
                </div>
                <div className="mt-2">
                  <span className="font-display font-black text-3xl">₹{plan.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ₹{Math.round(plan.price / plan.duration_months).toLocaleString('en-IN')}/month
                </div>
                {plan.savings && <Badge variant="secondary" className="mt-3">{plan.savings}</Badge>}
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Basketball classes</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Unlimited bookings</li>
                  {plan.pause_days > 0 && <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> One free pause (up to {plan.pause_days} days)</li>}
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Access to all coaches</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Progress tracking</li>
                </ul>
                <Button
                  onClick={() => choose(plan)}
                  className={`w-full mt-8 h-12 ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-accent text-black hover:bg-accent/90'}`}
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Other sports — 1 month at ₹2,000 each */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="font-display font-black text-2xl">Other Sports</h2>
            <p className="text-sm text-muted-foreground mt-1">1 month · ₹2,000 per sport. Add as many as you like.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherPlans.map(plan => {
              const sport = sportFor(plan.sport_id);
              return (
                <Card key={plan.id} className="rounded-2xl overflow-hidden group">
                  <div className="h-32 relative overflow-hidden">
                    {sport?.image && (
                      <img
                        src={sport.image}
                        alt={sport.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-display font-black text-white text-xl">{sport?.name}</h3>
                      <p className="text-white/70 text-xs">{sport?.tagline}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="font-display font-black text-2xl">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-muted-foreground text-sm ml-1">/ month</span>
                      </div>
                      <Badge variant="secondary">1 Month</Badge>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> {sport?.name} classes</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Unlimited bookings</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Progress tracking</li>
                    </ul>
                    <Button onClick={() => choose(plan)} className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                      Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming soon sports */}
        {SPORTS.filter(s => s.status === 'coming_soon').length > 0 && (
          <div className="mt-12">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Coming Soon</p>
            <div className="flex flex-wrap gap-2">
              {SPORTS.filter(s => s.status === 'coming_soon').map(s => (
                <Badge key={s.id} variant="outline" className="px-4 py-2 text-sm rounded-full text-muted-foreground">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t pt-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 justify-between">
          <p>Questions? <Link href="/contact" className="underline">Contact us</Link></p>
          <p>All prices in INR. GST included.</p>
        </div>
      </div>
    </div>
  );
}

export default function MembershipsPage() {
  return <Suspense fallback={<div />}><MembershipsInner /></Suspense>;
}
