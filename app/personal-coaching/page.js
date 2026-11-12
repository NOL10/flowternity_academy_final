'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';

export default function PersonalCoachingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const benefits = [
    { title: 'Personalized Training Programmes', description: 'Customized workouts designed specifically for your goals and abilities' },
    { title: 'Performance Assessments & Tracking', description: 'Continuous monitoring of your progress with detailed analytics' },
    { title: 'Form Correction & Technique Mastery', description: 'Expert guidance on proper technique to maximize results and prevent injury' },
    { title: 'Progressive Training Design', description: 'Scientifically structured progression that evolves with your abilities' },
    { title: 'Flexible Scheduling', description: 'Sessions timed to fit your lifestyle and availability' },
    { title: 'Elite Trainer Assignment', description: 'Work with our most experienced coaches dedicated to your success' },
  ];

  const process = [
    {
      num: '01',
      title: 'Consultation & Assessment',
      description: 'We understand your goals, fitness level, and specific needs to build your perfect programme.'
    },
    {
      num: '02',
      title: 'Customized Programme Design',
      description: 'Our elite trainers create a personalized training plan tailored to your objectives.'
    },
    {
      num: '03',
      title: 'Intensive Training Sessions',
      description: 'One-on-one sessions with undivided attention, form correction, and real-time adjustments.'
    },
    {
      num: '04',
      title: 'Progress Tracking & Adjustments',
      description: 'Regular assessments and programme modifications to keep you progressing toward your goals.'
    },
  ];

  const whyChooseUs = [
    {
      title: 'Elite Trainers',
      description: 'Our coaches are among the best in the sport with years of competitive and coaching experience.'
    },
    {
      title: 'Personalized Approach',
      description: 'Every session is designed around you—your body, your pace, your goals.'
    },
    {
      title: 'Results-Focused Methodology',
      description: 'We don\'t just train; we transform. Every session moves you closer to your objectives.'
    },
    {
      title: 'Professional Facilities',
      description: 'Access to world-class equipment and a dedicated space designed for optimal training.'
    },
  ];

  const faqs = [
    {
      q: 'What should I bring to my first session?',
      a: 'Bring water, a towel, and comfortable workout clothes. We\'ll provide everything else you need. Come ready to work.'
    },
    {
      q: 'How long is each session?',
      a: 'Standard sessions are 60 minutes, though we can customize duration based on your needs and goals.'
    },
    {
      q: 'How often should I train one-on-one?',
      a: 'This depends on your goals. We recommend 2-3 sessions per week for optimal progress, but we work with your schedule.'
    },
    {
      q: 'Can I combine one-on-one with group classes?',
      a: 'Absolutely. Many of our clients do both—personal coaching for specialized work and group classes for community and variety.'
    },
    {
      q: 'What if I\'m a complete beginner?',
      a: 'Perfect. Our trainers specialize in working with all levels, from complete beginners to advanced athletes. We scale everything to your current fitness level.'
    },
    {
      q: 'How do I book a session?',
      a: 'Contact us through the form or WhatsApp and we\'ll get you scheduled with the right trainer for your goals.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <SiteNav />

      {/* ────── HERO ────── */}
      <section className="relative min-h-[80vh] flex items-end pb-20 overflow-hidden">
        {/* Background: Basketball court imagery */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-transparent to-[#080808]/60" />
        </div>

        <div className="relative z-10 container pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <Badge className="bg-accent text-black hover:bg-accent mb-6 font-semibold tracking-wide">
              PERSONAL COACHING
            </Badge>
            <h1
              className="font-display font-black text-white leading-[0.92] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
            >
              One-on-One<br />
              Elite Training.<br />
              <span className="text-accent">Your Results.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Work with elite trainers who understand your body, your goals, and your potential. Every session is crafted specifically for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#enquiry">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-bold">
                  Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#process">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
                  How It Works <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 right-8 text-white/30 text-xs uppercase tracking-widest flex flex-col items-center gap-2"
        >
          <span>Scroll</span>
          <div className="w-px h-10 bg-white/20" />
        </motion.div>
      </section>

      {/* ────── WHAT YOU GET ────── */}
      <section className="py-24 md:py-32 bg-[#101010]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: '#D9FF38' }}>
              What You Get
            </p>
            <h2 className="font-display font-black text-5xl md:text-6xl leading-tight text-white">
              Tailored Training.<br />
              <span style={{ color: '#D9FF38' }}>Elite Results.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── THE PROCESS ────── */}
      <section id="process" className="py-24 md:py-32 bg-[#080808]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: '#D9FF38' }}>
              Our Process
            </p>
            <h2 className="font-display font-black text-5xl md:text-6xl leading-tight text-white">
              Your Journey<br />
              to <span style={{ color: '#D9FF38' }}>Excellence</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 h-full flex flex-col">
                  <div className="mb-4">
                    <span className="font-mono font-bold text-4xl" style={{ color: '#D9FF38' }}>
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Connector line */}
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-accent/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── WHY CHOOSE US ────── */}
      <section className="py-24 md:py-32 bg-[#101010]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: '#D9FF38' }}>
              Why Choose Us
            </p>
            <h2 className="font-display font-black text-5xl md:text-6xl leading-tight text-white">
              The Flowternity<br />
              <span style={{ color: '#D9FF38' }}>Difference</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded-full border-2 border-accent" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── PRICING & CTA ────── */}
      <section className="py-24 md:py-32 bg-[#080808]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: '#D9FF38' }}>
              Investment
            </p>
            <h2 className="font-display font-black text-5xl md:text-6xl leading-tight text-white mb-6">
              <span style={{ color: '#D9FF38' }}>Starts from</span> ₹1,200<br />
              <span className="text-2xl md:text-3xl text-white/60">per session</span>
            </h2>
            <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Your investment in personal coaching is an investment in your potential. Let's unlock it together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#enquiry">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-bold">
                  Enquire Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/919110427144" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Message on WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────── FAQ ────── */}
      <section id="faq" className="py-24 md:py-32 bg-[#101010]">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: '#D9FF38' }}>
              Common Questions
            </p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white">
              Frequently Asked <span style={{ color: '#D9FF38' }}>Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition text-left"
                >
                  <span className="font-display font-bold text-white text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/50 flex-shrink-0 transition duration-300 ${
                      openFaqIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === i && (
                  <div className="px-6 pb-6 text-white/70 leading-relaxed border-t border-white/10">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── ENQUIRY CTA ────── */}
      <section id="enquiry" className="py-20 md:py-24 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-40 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-6">
              Ready to <span style={{ color: '#D9FF38' }}>transform</span> your training?
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Get in touch with our team to discuss your goals and get started with elite personal coaching.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-bold">
                  Contact Us <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/919110427144" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 h-14 px-8 text-base font-bold">
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
