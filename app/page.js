'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Users, Calendar, Trophy, Sparkles, CalendarCheck2, ChevronDown } from 'lucide-react';
import { SPORTS, MEMBERSHIPS } from '@/lib/flowternity/config';
import { useAuth } from '@/app/providers';
import { BreadcrumbSchema } from '@/components/structured-data';

const HERO_IMG = 'https://images.stockcake.com/public/1/b/f/1bfadcea-7ec1-49e5-94d3-ad24ada973ff_large/basketball-court-drama-stockcake.jpg';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
];

function App() {
  const { user, activeMembership } = useAuth();
  const basketballPlans = MEMBERSHIPS.filter(m => m.sport_id === 'basketball');

  // Check if user has an active membership
  const hasActiveMembership = !!activeMembership;

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbItems} />
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
            <p className="text-muted-foreground max-w-md text-lg">World-class facilities across every sport we offer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPORTS.map((sport, i) => {
              const isActive = sport.status === 'active';
              const isDisabled = sport.status === 'disabled';
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
                  {(isActive || isDisabled) ? (
                    <Link href={`/academy/${sport.id}`} aria-label={`View ${sport.name} academy`}>{card}</Link>
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
              {basketballPlans.map(p => {
                const monthlyPrice = Math.round(p.price / p.duration_months);
                // What you'd pay if buying 1-month plan repeatedly
                const payMonthlyTotal = 3102 * p.duration_months;
                const savingVsMonthly = payMonthlyTotal - p.price;
                const savingPct = Math.round((savingVsMonthly / payMonthlyTotal) * 100);
                // Only show discount for multi-month plans
                const showDiscount = p.duration_months > 1;
                // 12m is best value, not 6m
                const isBestValue = p.duration_months === 12;

                return (
                  <div key={p.id} className={`bg-white/5 border rounded-2xl p-6 relative flex flex-col ${isBestValue ? 'border-accent shadow-lg shadow-accent/20' : 'border-white/10'}`}>
                    {isBestValue && <Badge className="absolute -top-3 left-6 bg-accent text-black hover:bg-accent font-bold tracking-wide">BEST VALUE</Badge>}

                    <div className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">ACADEMY</div>
                    <div className="font-display font-black text-xl mb-1">
                      {p.duration_months === 1 ? 'Monthly (1 Month)' : p.duration_months === 6 ? 'Half-year (6 Months)' : 'Annual (12 Months)'}
                    </div>
                    {showDiscount && <div className="text-xs text-accent mb-3">{savingPct}% cheaper than monthly</div>}

                    <ul className="space-y-1.5 mb-4 text-sm">
                      <li className="flex items-center gap-2 text-white/70"><span className="text-accent">●</span> Unlimited classes</li>
                      {p.pause_days > 0 && <li className="flex items-center gap-2 text-white/70"><span className="text-accent">●</span> {p.pause_days} pause days</li>}
                    </ul>

                    {/* Pricing */}
                    <div className="mt-auto">
                      {showDiscount && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/30 line-through text-sm">₹{payMonthlyTotal.toLocaleString('en-IN')}</span>
                          <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-0.5 rounded">{savingPct}% off</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-black text-4xl md:text-5xl">₹{monthlyPrice.toLocaleString('en-IN')}</span>
                        <span className="text-white/40 text-sm">/month</span>
                      </div>
                      <div className="text-white/40 text-xs mt-0.5">₹{p.price.toLocaleString('en-IN')} total</div>
                    </div>

                    <Link href={`/checkout?plan=${p.id}`}>
                      <Button className="w-full mt-5 bg-accent text-black hover:bg-accent/90 h-11 font-semibold">Get Started</Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Other sports */}
            <p className="text-white/50 text-sm uppercase tracking-widest mb-4 text-center">Other Sports · Starting from ₹2,000/month</p>
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

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight">Frequently asked questions.</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Everything you need to know about Flowternity Sports Academy programmes, membership, coaching and facilities.</p>
          </div>
          <FaqSection />
        </div>
      </section>

    </div>
  );
}

const FAQ_GROUPS = [
  {
    group: 'General',
    items: [
      { q: 'What sports and coaching programmes are available at Flowternity Sports?', a: 'Flowternity Sports offers coaching and sporting activities in Basketball, Skating, Skateboarding, Futsal, Yoga and more. We welcome beginners and experienced athletes of different ages and skill levels. Visit our academy website to explore the currently available programmes.' },
      { q: 'What age groups can join Flowternity Sports Academy?', a: 'Our programmes cater to children, teenagers and adults. Students are grouped based on their age, skill level and experience to ensure appropriate coaching and development. Beginners are always welcome!' },
      { q: 'Can I attend a free trial class before joining?', a: 'Yes! We offer a FREE introductory trial class for eligible new students to experience our coaching, meet our coaches and explore the facility before enrolling. Book your trial at https://academy.flowternity.com/' },
      { q: 'What are the coaching days and timings?', a: 'Coaching schedules vary by sport and skill level. Our basketball classes include weekday evening and weekend morning/evening batches. Skating, Skateboarding and Futsal have separate coaching schedules. For the latest days, timings and available slots, visit https://academy.flowternity.com/' },
    ],
  },
  {
    group: 'Memberships & Fees',
    items: [
      { q: 'What are the membership fees and available plans?', a: 'Flowternity offers flexible membership options depending on the sport. Basketball memberships are available on monthly, half-yearly and annual plans. Other sports have their own membership options. Visit our Memberships Page to view current prices, benefits and available plans.' },
      { q: 'How do I enrol and book coaching classes?', a: 'Joining Flowternity is simple! (1) Visit https://academy.flowternity.com/ (2) Create your student or parent account (3) Select your preferred sport and purchase a membership (4) Log in to your dashboard and book your preferred eligible classes. Advance booking is mandatory for all regular coaching classes. An active membership alone does not reserve a class slot.' },
      { q: 'How many classes can I attend with my membership?', a: 'Your membership allows you to book eligible coaching sessions based on your sport, skill level, schedule and class availability. Students can book multiple sessions where permitted by their membership. The number of classes is subject to available slots and the applicable membership terms.' },
      { q: 'Can I join multiple sports with one membership?', a: 'You can participate in multiple sports at Flowternity! However, each sport requires a separate applicable membership or booking. For example, a basketball membership does not automatically include Skating, Skateboarding or Futsal.' },
    ],
  },
  {
    group: 'Performance & Development',
    items: [
      { q: 'How do you track student performance and development?', a: 'Our coaches focus on technical skills, fitness, discipline, teamwork and game intelligence. We use skill assessments, attendance records, performance tracking and development feedback to monitor progress. Students and parents can access available attendance and performance information through their academy dashboard. We also encourage development through tournaments, competitive games and student recognition programmes.' },
      { q: 'What is included in the performance tracking?', a: 'Performance tracking includes attendance rates, classes booked and attended, rank among peers, skill level assessment, performance scores across multiple metrics (speed, technique, consistency, etc.), and overall development progress feedback from coaches.' },
    ],
  },
  {
    group: 'Facilities',
    items: [
      { q: 'What facilities are available at Flowternity Sports?', a: 'Our multi-sport facility features: Two international-standard basketball courts, Dedicated skatepark, Calisthenics training area, Spectator seating, Changing rooms and washrooms, In-house café and refreshments, Ample parking, Floodlighting for evening sessions, and Ice-bath and recovery provision (subject to availability).' },
      { q: 'Do you provide transportation for students?', a: 'Flowternity is developing a pickup and drop-off service for coaching students in nearby areas. Transport availability depends on the student\'s location, coaching schedule and route feasibility. Additional charges may apply. Parents interested in the service can submit a transport enquiry through our website.' },
    ],
  },
  {
    group: 'Contact & Location',
    items: [
      { q: 'Where is Flowternity Sports located, and how can I contact you?', a: 'Flowternity Sports is located in Horamavu–Kalkere, Bengaluru, near Green Gardenia Restaurant. We are conveniently accessible from Hennur, Kalyan Nagar, Banaswadi, Ramamurthy Nagar and surrounding areas. Get Directions on Google Maps. Call / WhatsApp: +91 98866 96155. Academy Website: https://academy.flowternity.com/.' },
      { q: 'How can I stay updated about programmes and schedules?', a: 'Follow us on social media: Instagram: https://www.instagram.com/flowternity_sports/ | Facebook: https://www.facebook.com/flowternitysports | Visit our website https://academy.flowternity.com/ or contact us directly at +91 98866 96155 to stay informed about all updates, schedules, and new programmes.' },
    ],
  },
];

function FaqSection() {
  const [openGroup, setOpenGroup] = useState(0);
  const [openItem, setOpenItem] = useState(null);

  return (
    <div className="space-y-3">
      {FAQ_GROUPS.map((group, gi) => (
        <div key={gi} className="border border-border rounded-2xl overflow-hidden">
          {/* Group header */}
          <button
            onClick={() => { setOpenGroup(openGroup === gi ? null : gi); setOpenItem(null); }}
            className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-secondary/50 transition-colors"
          >
            <span className="font-display font-black text-lg md:text-xl">{group.group}</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0 ml-4">
              <span className="hidden sm:inline">{group.items.length} questions</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openGroup === gi ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {/* Items */}
          {openGroup === gi && (
            <div className="border-t border-border divide-y divide-border">
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const isOpen = openItem === key;
                return (
                  <div key={ii}>
                    <button
                      onClick={() => setOpenItem(isOpen ? null : key)}
                      className="w-full flex items-start justify-between gap-4 px-5 md:px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <span className="text-sm md:text-base font-medium leading-snug">{item.q}</span>
                      <ChevronDown className={`w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 md:px-6 pb-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
