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
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">From 1 August 2026</p>
            <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight">Frequently asked questions.</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Everything you need to know about the new membership and class-booking system.</p>
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
      { q: 'When will the new membership system begin?', a: 'The new membership and class-booking system is effective from 1 August 2026. From this date, students must have an active membership and book classes in advance before attending.' },
      { q: 'Why is Flowternity changing the current batch system?', a: 'The current system limits most students to two fixed classes per week. The new system provides more weekly training opportunities, greater flexibility for families, better class organisation, more focused coaching, level-specific training, and an improved player development pathway.' },
      { q: 'Is this only a change in fees?', a: 'No. This is a complete upgrade to how coaching classes are organised and delivered — including flexible booking, access to multiple sessions per week, level-based coaching categories, better capacity management, and a clearer player development pathway.' },
      { q: 'Will the old fixed batches continue after 1 August 2026?', a: 'The academy will transition away from fixed batches. Students will book suitable classes from the timetable based on their active membership, assigned development category, the class schedule, and available capacity.' },
    ],
  },
  {
    group: 'Basketball Memberships',
    items: [
      { q: 'What are the new basketball membership plans?', a: 'Annual Basketball Pass — ₹24,708 (₹2,059/month). Half-Yearly Basketball Pass — ₹16,704 (₹2,784/month). Monthly Basketball Pass — ₹3,102 (approximately ₹129 per class when attending six classes per week).' },
      { q: 'How is the Annual Pass calculated at ₹2,059 per month?', a: '₹24,708 ÷ 12 months = ₹2,059 per month. The annual plan provides the best monthly value among all basketball memberships.' },
      { q: 'How is the Half-Yearly Pass calculated at ₹2,784 per month?', a: '₹16,704 ÷ 6 months = ₹2,784 per month.' },
      { q: 'How does the Monthly Pass work out to ₹129 per class?', a: '₹3,102 ÷ 24 classes (six per week × four weeks) = approximately ₹129 per class. The actual effective cost depends on how many eligible classes you book and attend.' },
      { q: 'Does the Monthly Pass guarantee six classes every week?', a: 'No. Six classes per week demonstrates the potential value. Actual availability depends on the published timetable, your assigned category, advance booking, available capacity, and academy guidelines.' },
      { q: 'Can basketball students attend more than two classes per week?', a: 'Yes — this is one of the major benefits of the new system. Students may book multiple eligible classes during the week, subject to their active membership, correct category, advance booking, slot availability, and academy guidelines.' },
      { q: 'Must students attend the same class every week?', a: 'No. Students may select suitable classes from the available schedule. This provides flexibility around school timings, exams, travel, and family commitments. Regular and consistent attendance is strongly recommended for steady progress.' },
      { q: 'Can a student attend any basketball category?', a: 'No. Students must attend classes assigned to their development category. Categories are planned according to skill level, basketball understanding, physical readiness, age where relevant, and training requirements.' },
    ],
  },
  {
    group: 'Class Categories',
    items: [
      { q: 'What does "one category per class hour" mean?', a: 'Each coaching hour is assigned to one specific player category. A session may be for beginners, intermediate players, intermediate-advanced, or advanced players. Different categories will not be unnecessarily combined in the same session.' },
      { q: 'Why is category-based coaching better?', a: 'Coaches can plan drills for one specific level, provide more relevant corrections, maintain appropriate intensity, give greater individual attention, introduce skills at the correct stage, and track progress more accurately.' },
      { q: "How will my child's category be decided?", a: 'The coaching team considers current basketball skill, movement ability, game understanding, training experience, confidence, physical readiness, ability to follow the session, and coachability. Age may be considered but placement will not be based on age alone.' },
      { q: "Can parents choose their child's category?", a: "Parents may discuss development with the coaching team, but the final placement decision is made by Flowternity Sports — to place each student in the environment that best supports their safety, confidence, and long-term progress." },
      { q: 'Can a student move to a higher category?', a: 'Yes, when the coaching team believes they are ready. Progression depends on technical ability, basketball understanding, attendance, effort, coachability, behaviour, physical readiness, and performance. Promotion is not automatic based on age or time enrolled.' },
      { q: 'What happens if a student books the wrong category?', a: 'The student may be asked to move to the appropriate session or may not be permitted to participate. Contact the Flowternity team if you are unsure about the correct category.' },
    ],
  },
  {
    group: 'Booking',
    items: [
      { q: 'Is advance booking compulsory?', a: 'Yes. From 1 August 2026, every class must be booked in advance through the Flowternity Sports website. Students should not arrive for a class without a confirmed booking.' },
      { q: 'Where should classes be booked?', a: 'Classes must be booked at www.flowternity.com. You can view the available schedule and select eligible sessions through the website.' },
      { q: 'Why is advance booking necessary?', a: 'Advance booking helps control class sizes, avoid overcrowding, maintain coach-to-student ratios, allocate coaches correctly, prepare equipment, and plan drills based on expected attendance.' },
      { q: 'Can a student attend without booking?', a: 'No. Entry depends on an active membership, correct category selection, advance booking, and available capacity. This keeps sessions organised and fair for all members.' },
      { q: 'What happens if a class is full?', a: 'Additional bookings may not be accepted once capacity is reached. Select another eligible session from the timetable. Book preferred classes early to avoid disappointment.' },
      { q: 'What should I do if my child cannot attend a booked class?', a: 'Cancel the booking through the website as early as possible so the slot becomes available to another student. Repeatedly booking and not attending may affect other members.' },
      { q: 'Can I book several classes in advance?', a: 'Yes, subject to membership validity, category eligibility, published schedules, available capacity, and academy booking rules.' },
      { q: 'Will the class timetable remain the same every week?', a: 'The academy may update schedules due to events, tournaments, holidays, coach availability, facility requirements, or operational changes. Always check the website before booking.' },
    ],
  },
  {
    group: 'Attendance & Progress',
    items: [
      { q: 'Is it compulsory to attend many classes every week?', a: 'No, but consistency is key. Regular attendance improves fundamentals, fitness, confidence, decision-making, game understanding, and teamwork.' },
      { q: 'Will my child fall behind attending only twice a week?', a: 'Students can still benefit from twice-weekly attendance if consistent and practising appropriately. The new system simply allows motivated students to train more frequently.' },
      { q: 'Will attending more classes guarantee faster promotion?', a: 'Not automatically. Progression also depends on skill improvement, basketball understanding, effort, coachability, physical readiness, behaviour, and ability to apply learning. Quality and consistency matter more than attendance numbers alone.' },
      { q: 'Will students get more individual attention?', a: 'Category-based sessions are designed to improve the quality of attention each student receives. Because each class focuses on one category, coaches can deliver more relevant instruction.' },
      { q: 'Will student progress be assessed?', a: 'Yes. Coaches observe technical ability, game understanding, physical readiness, attendance, effort, coachability, behaviour, and teamwork to determine category placement and progression.' },
    ],
  },
  {
    group: 'Other Sports',
    items: [
      { q: 'What are the monthly fees for other sports?', a: 'Skateboarding — ₹5,000/month. Skating — ₹2,000/month. Futsal — ₹2,000/month. Karate — ₹2,000/month.' },
      { q: 'Are other sports included in the Basketball Pass?', a: 'No. The Basketball Pass is specifically for eligible basketball sessions. Skateboarding, Skating, Futsal, and Karate have separate monthly memberships.' },
      { q: 'Can a student join basketball and another sport?', a: 'Yes. A student may enrol in basketball and another sport by taking the applicable memberships separately, subject to schedules, level requirements, advance booking, and available capacity.' },
      { q: 'Do other sports also need to be booked online?', a: 'Class-booking requirements will be communicated for each sport through the website and official Flowternity communication.' },
    ],
  },
  {
    group: 'Membership & Payments',
    items: [
      { q: 'When does the membership period begin?', a: 'The membership period begins on the activation date shown at the time of registration or purchase. Review the membership details before completing payment.' },
      { q: 'Can the Annual or Half-Yearly Pass be paid monthly?', a: 'The ₹2,059/month and ₹2,784/month figures represent the effective monthly cost over the full membership duration — not a monthly instalment plan. Payment terms shown during registration apply.' },
      { q: 'Can memberships be transferred to another student?', a: 'No. Memberships are issued to the registered student and cannot be transferred, exchanged, or shared.' },
      { q: 'Can memberships be paused or extended?', a: 'Any pause, extension, or special request is handled according to official Flowternity Sports membership terms. Contact the management team for exceptional circumstances.' },
      { q: 'Will missed classes be refunded?', a: 'Missing a booked or available class does not normally create an automatic refund or extension. Exceptional cases are considered according to the applicable membership policy.' },
      { q: 'Are membership fees refundable?', a: 'Refunds and cancellations are governed by the membership terms accepted at the time of purchase. Review the applicable terms carefully before completing payment.' },
    ],
  },
  {
    group: 'Transition',
    items: [
      { q: 'What happens to students who are already enrolled?', a: 'Existing students will be guided through the transition. Flowternity Sports will communicate membership options, the new timetable, the student\'s category, the website login process, and booking instructions.' },
      { q: 'Will existing students retain their previous batch timings?', a: 'Previous batch timings may change as the academy moves to the category-based schedule. Students will view and book eligible classes from the updated timetable.' },
      { q: 'What if the new timings are not convenient?', a: 'The new system provides more choices than the previous fixed-batch model. Parents can review available sessions and select classes that suit their schedule, subject to availability.' },
      { q: 'What if parents find the online system difficult to use?', a: 'The Flowternity team will support parents during transition — with help logging in, selecting a membership, identifying the correct category, viewing the timetable, booking, and cancelling.' },
      { q: 'Who should I contact if my question is not answered here?', a: 'Contact Flowternity Sports at www.flowternity.com or call 9886696155. Our team will assist with membership selection, category placement, bookings, and transition questions.' },
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
