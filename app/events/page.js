'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Check, X, ChevronLeft, ChevronRight,
  Camera, Users, Calendar, MapPin, Phone, Mail
} from 'lucide-react';

// ─── DATA ──────────────────────────────────────────────────────────────────────

// All 37 event images + 4 videos used as a pure gallery (no forced category mapping)
const ALL_PHOTOS = [
  ...Array.from({ length: 37 }, (_, i) => ({
    id: i + 1,
    src: `/events/event_${String(i + 1).padStart(2, '0')}.jpeg`,
    type: 'image',
  })),
  { id: 38, src: '/events/event_video_01.mp4', type: 'video' },
  { id: 39, src: '/events/event_video_02.mp4', type: 'video' },
  { id: 40, src: '/events/event_video_03.mp4', type: 'video' },
  { id: 41, src: '/events/event_video_04.mp4', type: 'video' },
];

// Event types — editorial list (no emoji, no images)
const EVENT_TYPES = [
  { num: '01', title: 'BIRTHDAY PARTIES',   tagline: 'Make a little noise. Make a lot of memories.' },
  { num: '02', title: 'SPORTS TOURNAMENTS', tagline: 'Bring the competition.' },
  { num: '03', title: 'SKATE JAMS',         tagline: 'Find your flow.' },
  { num: '04', title: 'KARAOKE NIGHTS',     tagline: 'Sing like nobody\'s watching.' },
  { num: '05', title: 'FASHION SHOWS',      tagline: 'Own the runway.' },
  { num: '06', title: 'BEATBOX BATTLES',    tagline: 'Feel every beat.' },
  { num: '07', title: 'WORKSHOPS & CAMPS',  tagline: 'Learn something. Become something.' },
  { num: '08', title: 'COMMUNITY EVENTS',   tagline: 'Good people. Great energy.' },
  { num: '09', title: 'PRIVATE FUNCTIONS',  tagline: 'Make it yours.' },
  { num: '10', title: 'CUSTOM EXPERIENCES', tagline: 'If you can imagine it, let\'s explore it.' },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Tell Us Your Vision',
    body: 'Share the event type, expected headcount, preferred date, and any special requirements.',
  },
  {
    num: '02',
    title: "We Build the Plan",
    body: 'Our team customises the space, coordinates logistics, and handles every detail.',
  },
  {
    num: '03',
    title: 'Show Up & Enjoy',
    body: 'On the day, we run the show so you can focus entirely on the experience.',
  },
];

// ─── LIGHTBOX ──────────────────────────────────────────────────────────────────

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/97 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white z-50"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Image */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-5xl w-full mx-16 md:mx-24"
          onClick={(e) => e.stopPropagation()}
        >
          {photos[index].type === 'video' ? (
            <video
              src={photos[index].src}
              autoPlay
              controls
              playsInline
              className="w-full h-auto max-h-[82vh] rounded-xl"
            />
          ) : (
            <Image
              src={photos[index].src}
              alt={`Event photo ${index + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
              priority
            />
          )}
        </motion.div>

        {/* Next */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white z-50"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
          {index + 1} / {photos.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(18);
  const [activeEvent, setActiveEvent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventType: '', attendees: '', date: '', details: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error

  const openLightbox = useCallback((i) => {
    setLightboxIndex(i);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((p) => (p - 1 + ALL_PHOTOS.length) % ALL_PHOTOS.length);
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((p) => (p + 1) % ALL_PHOTOS.length);
  }, []);

  const handleForm = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Event Enquiry: ${form.eventType}`,
          message: `Type: ${form.eventType}\nAttendees: ${form.attendees}\nDate: ${form.date}\n\n${form.details}`,
        }),
      });
      if (res.ok) {
        setFormStatus('success');
        setForm({ name: '', email: '', phone: '', eventType: '', attendees: '', date: '', details: '' });
        setTimeout(() => setFormStatus('idle'), 6000);
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <SiteNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        {/* Background collage: 3 stacked images behind a dark gradient */}
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          {[ALL_PHOTOS[0], ALL_PHOTOS[14], ALL_PHOTOS[28]].map((p, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image src={p.src} alt="" fill className="object-cover" priority={i === 0} />
            </div>
          ))}
        </div>
        {/* Heavy dark overlay so text is fully legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-transparent to-[#080808]/60" />

        <div className="relative z-10 container pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <Badge className="bg-accent text-black hover:bg-accent mb-6 font-semibold tracking-wide">
              <Zap className="w-3 h-3 mr-1.5" /> Events & Experiences
            </Badge>
            <h1 className="font-display font-black text-white leading-[0.92] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
              Your Event.<br />
              Your People.<br />
              <span className="text-accent">Your Rules.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Birthdays, tournaments, karaoke nights, skate jams, fashion shows — whatever you're imagining, we have the space, the crew, and the energy to make it unforgettable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#gallery">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-bold">
                  See What We've Done <Camera className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#enquiry">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Plan Your Event <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* ── WHAT WE HOST ─────────────────────────────────────────────────── */}
      <section
        id="categories"
        aria-label="What We Host"
        style={{ background: '#101010' }}
        className="py-24 md:py-36 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="container">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.35em] mb-6"
            style={{ color: '#D9FF38' }}
          >
            What We Host
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-display font-black leading-[0.9] tracking-tight mb-20 md:mb-28"
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', color: '#FFFFFF' }}
          >
            One Space.<br />
            <span style={{ color: '#D9FF38' }}>Endless</span> Possibilities.
          </motion.h2>
        </div>

        {/* ── Editorial event list ── */}
        <ol className="container" aria-label="Event types">
          {EVENT_TYPES.map((event, i) => (
            <motion.li
              key={event.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.055, ease: [0.25, 0.1, 0.25, 1] }}
              onMouseEnter={() => setActiveEvent(event.num)}
              onMouseLeave={() => setActiveEvent(null)}
              onFocus={() => setActiveEvent(event.num)}
              onBlur={() => setActiveEvent(null)}
              className="group relative select-none"
              style={{
                /* prefers-reduced-motion: skip translate on hover */
              }}
            >
              {/* Divider */}
              <div
                className="w-full transition-colors duration-300"
                style={{
                  height: '1px',
                  background: activeEvent === event.num ? '#D9FF38' : '#333333',
                  opacity: activeEvent === event.num ? 0.6 : 1,
                }}
              />

              {/* Row */}
              <div
                className="flex items-center gap-4 md:gap-8 py-6 md:py-8 cursor-default transition-all duration-300"
                style={{
                  paddingLeft: activeEvent === event.num ? '0.75rem' : '0',
                }}
              >
                {/* Number */}
                <span
                  className="font-mono font-bold shrink-0 tabular-nums transition-colors duration-300"
                  style={{
                    fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)',
                    color: activeEvent === event.num ? '#D9FF38' : '#D9FF38',
                    opacity: activeEvent === event.num ? 1 : 0.6,
                    minWidth: '2.5ch',
                  }}
                  aria-hidden="true"
                >
                  {event.num}
                </span>

                {/* Title */}
                <motion.span
                  className="font-display font-black leading-none tracking-tight flex-1"
                  style={{
                    fontSize: 'clamp(2rem, 6vw, 5.5rem)',
                    color: activeEvent === event.num ? '#FFFFFF' : '#999999',
                    transition: 'color 0.25s ease',
                  }}
                  animate={
                    /* Respect prefers-reduced-motion — framer-motion reads it automatically */
                    activeEvent === event.num
                      ? { x: 8, transition: { duration: 0.2, ease: 'easeOut' } }
                      : { x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
                  }
                >
                  {event.title}
                </motion.span>

                {/* Tagline — hidden until hover */}
                <span
                  className="hidden md:block text-right shrink-0 max-w-[22ch] italic transition-all duration-300"
                  style={{
                    fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)',
                    color: '#999999',
                    opacity: activeEvent === event.num ? 1 : 0,
                    transform: activeEvent === event.num ? 'translateX(0)' : 'translateX(10px)',
                  }}
                  aria-label={event.tagline}
                >
                  "{event.tagline}"
                </span>

                {/* Arrow — appears on hover */}
                <motion.span
                  aria-hidden="true"
                  className="shrink-0 font-bold text-xl md:text-3xl"
                  style={{ color: '#D9FF38' }}
                  animate={
                    activeEvent === event.num
                      ? { opacity: 1, x: 0, transition: { duration: 0.2 } }
                      : { opacity: 0, x: -8, transition: { duration: 0.25 } }
                  }
                >
                  →
                </motion.span>
              </div>
            </motion.li>
          ))}

          {/* Final divider */}
          <div style={{ height: '1px', background: '#333333' }} />
        </ol>

        {/* ── Closing statement ── */}
        <div className="container mt-28 md:mt-40">
          {/* Oversized closer */}
          <div className="mb-10 md:mb-14">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display font-black leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 10rem)', color: '#FFFFFF' }}
            >
              ANYTHING.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 10rem)', color: '#FFFFFF' }}
            >
              EVERYTHING.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-display font-black leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 10rem)', color: '#D9FF38' }}
            >
              FLOWTERNITY.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10"
          >
            <p
              className="text-base md:text-lg max-w-xs leading-relaxed"
              style={{ color: '#999999' }}
            >
              Whatever you're imagining, let's make it happen.
            </p>

            <Link
              href="#enquiry"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-3 font-bold uppercase tracking-widest text-sm transition-all duration-200"
              style={{ color: '#D9FF38' }}
            >
              <span className="border-b border-current pb-0.5 group-hover:pb-1 transition-all duration-200">
                PLAN YOUR EVENT
              </span>
              <span
                className="text-lg transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-24 md:py-32 bg-[#080808]">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Real Moments</p>
              <h2 className="font-display font-black leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
                We've Made<br />Memories Here.
              </h2>
            </div>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed md:text-right">
              Real events, real people, real energy — captured at Flowternity.
            </p>
          </div>

          {/* ── HERO BENTO (first 7 images, fixed grid) ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Large hero — spans 2×2 */}
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => openLightbox(0)}
              className="group relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden"
              style={{ aspectRatio: '1 / 1' }}
            >
              <Image src={ALL_PHOTOS[0].src} alt="Event highlight" fill className="object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
            </motion.button>

            {/* 4 smaller tiles on the right */}
            {[1, 2, 3, 4].map((idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden"
                style={{ aspectRatio: '1 / 1' }}
              >
                <Image src={ALL_PHOTOS[idx].src} alt="Event moment" fill className="object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
              </motion.button>
            ))}
          </div>

          {/* ── WIDE CINEMATIC STRIP ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {[5, 6, 7].map((idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx - 5) * 0.07 }}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden"
                style={{ aspectRatio: '4 / 3' }}
              >
                <Image src={ALL_PHOTOS[idx].src} alt="Event moment" fill className="object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              </motion.button>
            ))}
          </div>

          {/* ── MASONRY GRID (remaining photos + videos) ── */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {ALL_PHOTOS.slice(8, visibleCount).map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.04 }}
                onClick={() => openLightbox(i + 8)}
                className="group relative block w-full rounded-xl overflow-hidden break-inside-avoid"
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      src={item.src}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      className="w-full h-auto object-cover"
                      style={{ aspectRatio: '9/16', maxHeight: '480px', objectFit: 'cover' }}
                    />
                    {/* Play icon badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent/80 group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5 text-white group-hover:text-black translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Video label */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Video
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300" />
                  </>
                ) : (
                  <>
                    <Image
                      src={item.src}
                      alt="Event moment"
                      width={400}
                      height={i % 3 === 1 ? 500 : i % 3 === 2 ? 300 : 400}
                      className="w-full h-auto object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300" />
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < ALL_PHOTOS.length && (
            <div className="flex justify-center mt-14">
              <button
                onClick={() => setVisibleCount((v) => Math.min(v + 12, ALL_PHOTOS.length))}
                className="group flex items-center gap-3 border border-white/15 hover:border-accent/60 text-white/60 hover:text-white px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-accent/5"
              >
                Load more photos
                <span className="text-white/30 group-hover:text-accent transition-colors">
                  ({ALL_PHOTOS.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#0d0d0d]">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">How It Works</p>
            <h2 className="font-display font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
              Three Steps to<br />Something Unforgettable.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative border border-white/8 rounded-3xl p-8 hover:border-accent/30 transition-colors"
              >
                <div className="font-display font-black text-7xl text-white/5 leading-none mb-6 select-none">
                  {step.num}
                </div>
                <div className="w-8 h-px bg-accent mb-6" />
                <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENQUIRY FORM ─────────────────────────────────────────────────── */}
      <section id="enquiry" className="py-24 md:py-32 bg-[#080808]">
        <div className="container max-w-3xl">
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Get in Touch</p>
            <h2 className="font-display font-black leading-none tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
              Got Something<br />in Mind?
            </h2>
            <p className="text-white/50 text-base max-w-md leading-relaxed">
              Tell us about your idea and we'll put together something you'll never forget.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1 */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Full Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleForm} required
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleForm} required
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Phone</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleForm} required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Event Type</label>
                <select
                  name="eventType" value={form.eventType} onChange={handleForm} required
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 text-white rounded-xl px-5 py-3.5 outline-none transition text-sm appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#111]">Select type…</option>
                  {EVENT_TYPES.map((et) => (
                    <option key={et.title} value={et.title} className="bg-[#111]">{et.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Attendees</label>
                <input
                  type="number" name="attendees" value={form.attendees} onChange={handleForm} required
                  placeholder="Expected headcount"
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Preferred Date</label>
                <input
                  type="date" name="date" value={form.date} onChange={handleForm} required
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Tell Us More</label>
              <textarea
                name="details" value={form.details} onChange={handleForm} rows={5}
                placeholder="Describe your idea, special requirements, or anything else we should know…"
                className="w-full bg-white/5 border border-white/10 focus:border-accent/60 focus:bg-white/8 text-white placeholder:text-white/25 rounded-xl px-5 py-3.5 outline-none transition text-sm resize-none"
              />
            </div>

            {/* Status */}
            <AnimatePresence>
              {formStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-accent/10 border border-accent/30 text-accent rounded-xl px-5 py-4 text-sm font-medium"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  Enquiry sent! We'll be in touch soon.
                </motion.div>
              )}
              {formStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm"
                >
                  Something went wrong. Please try again or contact us directly.
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={formStatus === 'loading'}
              className="w-full bg-accent text-black font-bold text-base h-14 rounded-xl hover:bg-accent/90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {formStatus === 'loading' ? 'Sending…' : <>Send Enquiry <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </section>

      {/* ── LOCATION & MAP ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#0d0d0d]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Visit Us</p>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white mb-8">
                World-class facility in Bangalore.
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-1">Horamavu–Kalkere, Bengaluru</h4>
                    <p className="text-white/50">Near Green Gardenia Restaurant, Bengaluru 560043</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-1">Get in Touch</h4>
                    <p className="text-white/50">
                      <a href="tel:+919110427144" className="hover:text-accent transition">+91 91104 27144</a>
                      {' '}· WhatsApp available
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-1">Hours</h4>
                    <p className="text-white/50">
                      Mon–Sun: 6:00 AM – 10:00 PM<br />
                      <span className="text-xs">Events available throughout the day</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg mb-1">Easy Access</h4>
                    <p className="text-white/50">
                      Near Hennur, Kalyan Nagar, Banaswadi<br />
                      <span className="text-xs">Ample parking · Public transport nearby</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="https://www.google.com/maps/dir//Flowternity+%7C+Multi+Sport+Facility,+1456+old+flour+mill+road,+dodda+kempaih+layout,+horamavu,+Kalkere,+Bengaluru,+Karnataka+560113/@13.0449408,77.5946517,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae1185e1327d47:0xc21f974f50d32d2a!2m2!1d77.6703963!2d13.0353296?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-accent text-black hover:bg-accent/90 h-12 px-6 font-bold">
                    Get Directions <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <a
                href="https://www.google.com/maps/dir//Flowternity+%7C+Multi+Sport+Facility,+1456+old+flour+mill+road,+dodda+kempaih+layout,+horamavu,+Kalkere,+Bengaluru,+Karnataka+560113/@13.0449408,77.5946517,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae1185e1327d47:0xc21f974f50d32d2a!2m2!1d77.6703963!2d13.0353296?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-3xl overflow-hidden shadow-2xl h-96 md:h-[500px] hover:shadow-3xl transition-shadow cursor-pointer"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5242847236807!2d77.5946517!3d13.0449408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1185e1327d47%3A0xc21f974f50d32d2a!2sFlowternity%20%7C%20Multi%20Sport%20Facility!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flowternity Sports Academy Location"
                />
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#0d0d0d]">
        <div className="container">
          {/* Photo strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-16 rounded-3xl overflow-hidden">
            {[10, 15, 20, 25, 30, 35].map((idx) => (
              <div key={idx} className="relative aspect-square">
                <Image src={ALL_PHOTOS[idx].src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-black leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
              Whatever You Have in Mind, Start Here.
            </h2>
            <p className="text-white/40 text-base mb-10">
              Your next unforgettable experience is one enquiry away.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="#enquiry">
                <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 font-bold">
                  Plan Your Event <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/15 text-white hover:bg-white/8 bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={ALL_PHOTOS}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </div>
  );
}
