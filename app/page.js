'use client';

import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Users, Calendar, Trophy, Sparkles, CalendarCheck2 } from 'lucide-react';
import { SPORTS, MEMBERSHIPS } from '@/lib/flowternity/config';
import { useAuth } from '@/app/providers';

const HERO_IMG = 'https://images.stockcake.com/public/1/b/f/1bfadcea-7ec1-49e5-94d3-ad24ada973ff_large/basketball-court-drama-stockcake.jpg';

function App() {
  const { user, activeMembership } = useAuth();
  const basketballPlans = MEMBERSHIPS.filter(m => m.sport_id === 'basketball');

  // Check if user has an active membership
  const hasActiveMembership = !!activeMembership;

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <div className="relative min-h-screen bg-black overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO_IMG} alt="Flowternity" fill priority className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative z-10">
          <SiteNav dark />
          <div className="container pt-20 md:pt-28 pb-32">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="bg-accent text-black hover:bg-accent mb-6 font-medium">
                <Zap className="w-3 h-3 mr-1" /> Multi-Sport Facility · Now Booking
              </Badge>
              <h1 className="font-display font-black text-white text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-balance">
                TRAIN WITH<br />
                <span className="text-accent">PURPOSE.</span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mt-8 max-w-xl">
                Two international basketball courts. Futsal, pickleball, and more. One membership. Book your first class in under 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href="/memberships">
                  <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-semibold">
                    Get Membership <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                {!hasActiveMembership && (
                  <Link href="/trial">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                      <Sparkles className="w-4 h-4 mr-2" /> Book a Free Class
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl border-t border-white/10 pt-10">
                {[
                  { n: '7+', l: 'Sports' },
                  { n: '2', l: 'Intl. Courts' },
                  { n: '60s', l: 'To Book' },
                  { n: '24/7', l: 'App Access' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-display font-black text-white text-4xl md:text-5xl">{s.n}</div>
                    <div className="text-white/50 text-sm mt-1 uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FREE TRIAL STRIP */}
      {!hasActiveMembership && (
        <section className="relative -mt-16 md:-mt-20 z-20">
          <div className="container">
            <div className="rounded-3xl bg-accent p-6 md:p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-black/5" />
              <div className="absolute -left-4 -bottom-8 w-32 h-32 rounded-full bg-black/5" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                    <CalendarCheck2 className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-black/60 font-semibold mb-1">First class on us</p>
                    <h3 className="font-display font-black text-2xl md:text-3xl text-black leading-tight">Try any sport free. No card, no account needed.</h3>
                    <p className="text-black/70 text-sm md:text-base mt-1">Pick a sport, pick a slot, show up. That&apos;s it.</p>
                  </div>
                </div>
                <Link href="/trial" className="flex-shrink-0">
                  <Button size="lg" className="bg-black text-white hover:bg-black/90 h-14 px-8 text-base font-semibold w-full md:w-auto">
                    <Sparkles className="w-5 h-5 mr-2" /> Book a Free Class
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SPORTS GRID */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Our Programs</p>
              <h2 className="font-display font-black text-5xl md:text-7xl tracking-tight">Pick your sport.</h2>
            </div>
            <p className="text-muted-foreground max-w-md text-lg">World-class facilities across every sport we offer. All included in a single membership.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPORTS.map((sport, i) => {
              const isActive = sport.status === 'active';
              const card = (
                <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary cursor-pointer">
                  <Image src={sport.image} alt={sport.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="400px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  {sport.status === 'coming_soon' && (
                    <Badge className="absolute top-4 right-4 bg-white/20 text-white backdrop-blur-md border-white/20">Coming Soon</Badge>
                  )}
                  {isActive && (
                    <Badge className="absolute top-4 right-4 bg-accent text-black hover:bg-accent"><Sparkles className="w-3 h-3 mr-1" /> Free trial</Badge>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="font-display font-black text-3xl mb-1">{sport.name}</h3>
                    <p className="text-sm text-white/70 mb-3">{sport.tagline}</p>
                    <p className="text-sm text-white/60 line-clamp-2">{sport.description}</p>
                  </div>
                </div>
              );
              return (
                <motion.div key={sport.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  {isActive ? (
                    <Link href={`/trial?sport=${sport.id}`} aria-label={`Book free ${sport.name} class`}>{card}</Link>
                  ) : card}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEMBERSHIPS */}
      <section id="memberships" className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-white/50 mb-3">Membership</p>
            <h2 className="font-display font-black text-5xl md:text-7xl tracking-tight">One card. One sport.</h2>
            <p className="text-white/60 mt-4 max-w-xl mx-auto">Buy a membership per sport. Train in multiple sports with multiple memberships.</p>
          </div>

          {/* Basketball tiers */}
          <div className="max-w-4xl mx-auto">
            <p className="text-white/50 text-sm uppercase tracking-widest mb-6 text-center">Basketball · 3 plans</p>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {basketballPlans.map(p => (
                <div key={p.id} className={`bg-white/5 border rounded-2xl p-6 relative ${p.popular ? 'border-accent shadow-lg shadow-accent/20' : 'border-white/10'}`}>
                  {p.popular && <Badge className="absolute -top-3 left-6 bg-accent text-black hover:bg-accent">Popular</Badge>}
                  <div className="font-display font-black text-4xl">{p.duration_months}<span className="text-white/40 text-lg font-normal ml-1">{p.duration_months === 1 ? 'mo' : 'mo'}</span></div>
                  <div className="font-display font-black text-2xl mt-1">₹{p.price.toLocaleString('en-IN')}</div>
                  <div className="text-white/40 text-xs">₹{Math.round(p.price / p.duration_months).toLocaleString('en-IN')}/month</div>
                  {p.savings && <Badge className="mt-2 bg-white/10 text-white text-xs">{p.savings}</Badge>}
                  <Link href={`/checkout?plan=${p.id}`}>
                    <Button className="w-full mt-4 bg-accent text-black hover:bg-accent/90 h-10 text-sm">Get Started</Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Other sports */}
            <p className="text-white/50 text-sm uppercase tracking-widest mb-4 text-center">Other Sports · ₹2,000 / month each</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MEMBERSHIPS.filter(m => m.sport_id !== 'basketball').map(p => (
                <Link key={p.id} href={`/checkout?plan=${p.id}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-white/40 text-xs mt-1">1 month · ₹{p.price.toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/memberships">
              <Button className="bg-accent text-black hover:bg-accent/90 h-12 px-8">See all plans <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Calendar, t: 'Book instantly', d: 'See availability, pick a slot, done.' },
              { icon: Zap, t: 'Pause anytime', d: 'Life happens. Pause your membership when you need.' },
              { icon: Check, t: 'No hidden fees', d: 'One transparent price. All facilities.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold">{f.t}</h4>
                  <p className="text-white/60 text-sm mt-1">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Card className="p-12 md:p-20 bg-accent border-0 rounded-3xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display font-black text-5xl md:text-7xl leading-[0.95] text-black">Ready to move?</h2>
              <p className="text-black/70 text-lg mt-4">Two paths in. Try a free class or grab a membership — either way, first booking is 60 seconds away.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/memberships"><Button size="lg" className="bg-black text-white hover:bg-black/90 h-14 px-8">Get Membership <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
                <Link href="/trial"><Button size="lg" variant="outline" className="h-14 px-8 border-black/20 bg-transparent text-black hover:bg-black/10"><Sparkles className="w-4 h-4 mr-2" /> Book Free Class</Button></Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="container flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Zap className="w-5 h-5 text-black" strokeWidth={2.5} /></div>
            <span className="font-display font-extrabold text-xl">FLOWTERNITY</span>
          </div>
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Flowternity. Train with purpose.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
