'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { SPORTS } from '@/lib/flowternity/config';
import { ArrowRight, Check, Users, Heart, Zap, Trophy, Target, Flame, ChevronDown, Phone } from 'lucide-react';

export default function CorporatePartnershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* SECTION 01 — HERO */}
      <HeroSection />

      {/* SECTION 02 — WHY CORPORATE SPORTS */}
      <WhyCorporateSportsSection />

      {/* SECTION 03 — CORPORATE OFFERINGS */}
      <OfferingsSection />

      {/* SECTION 04 — EXPERIENCES WE CREATE */}
      <ExperiencesSection />

      {/* SECTION 05 — HOW IT WORKS */}
      <HowItWorksSection />

      {/* SECTION 06 — WHY FLOWTERNITY */}
      <WhyFlowternity />

      {/* SECTION 07 — ENQUIRY FORM */}
      <EnquiryFormSection />

      {/* SECTION 08 — FAQ */}
      <FAQSection />

      {/* SECTION 09 — FINAL CTA */}
      <LocationMapSection />
      <FinalCTASection />
    </div>
  );
}

// ========== HERO SECTION ==========
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen bg-black overflow-hidden flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600"
          alt="Corporate team playing sports"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24 lg:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <Badge className="bg-accent/20 text-accent border border-accent/40 mb-6 font-black text-xs px-4 py-2 uppercase tracking-widest">
            Corporate Partnerships
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            Stronger Teams. Better Together.
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/85 mb-6 leading-relaxed max-w-2xl font-light">
            Bring your people together through sport.
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed max-w-2xl">
            Discover engaging corporate sports experiences, employee wellness programmes and professionally organised sporting events with Flowternity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a href="#enquiry" onClick={(e) => {
              e.preventDefault();
              document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-semibold">
                Explore Corporate Partnerships <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="#contact" onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                Talk to Our Team
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== WHY CORPORATE SPORTS ==========
function WhyCorporateSportsSection() {
  const benefits = [
    {
      number: '01',
      title: 'Employee Wellness',
      description: 'Encourage active lifestyles and create opportunities for employees to participate in sports and movement.'
    },
    {
      number: '02',
      title: 'Stronger Team Connections',
      description: 'Bring colleagues together through shared sporting experiences that build genuine connections.'
    },
    {
      number: '03',
      title: 'Employee Engagement',
      description: 'Create memorable activities that drive participation, excitement and meaningful workplace engagement.'
    },
    {
      number: '04',
      title: 'Healthy Competition',
      description: 'Give teams opportunities to challenge themselves and celebrate achievements together.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs md:text-sm uppercase tracking-widest font-black text-accent mb-4">WHY IT MATTERS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight">
            Why Corporate Sports <span className="text-accent">Matter</span>
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Sports bring teams together, build confidence and create lasting connections in the workplace.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-accent mb-6">{benefit.number}</div>
              <h3 className="text-xl font-black text-black mb-3">{benefit.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== CORPORATE OFFERINGS ==========
function OfferingsSection() {
  const offerings = [
    {
      title: 'Corporate Sports Tournaments',
      description: 'Professionally organised inter-department or multi-company tournaments that bring teams together competitively.',
      benefit: 'Build healthy competition and memorable team pride',
      icon: Trophy
    },
    {
      title: 'Employee Wellness Programmes',
      description: 'Structured regular sports sessions and fitness activities designed for employee participation and wellness.',
      benefit: 'Support active, healthy workplace culture',
      icon: Heart
    },
    {
      title: 'Team-Building Activities',
      description: 'Engaging sporting experiences specifically designed to strengthen team connections and collaboration.',
      benefit: 'Create meaningful bonds between colleagues',
      icon: Users
    },
    {
      title: 'Corporate Sports Leagues',
      description: 'Ongoing league formats where company teams or departments compete across a season.',
      benefit: 'Drive sustained engagement and participation',
      icon: Flame
    },
    {
      title: 'One-Day Sporting Events',
      description: 'Customised single-day events featuring multiple sports, activities and celebration experiences.',
      benefit: 'Create stand-out company experiences',
      icon: Zap
    },
    {
      title: 'Sports Coaching & Training',
      description: 'Professional coaching services to develop employee sports skills and confidence.',
      benefit: 'Develop skills while building team culture',
      icon: Target
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">OFFERINGS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Corporate Sports <span className="text-accent">Experiences</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            From wellness programmes to tournaments, we offer sports experiences tailored to your team.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerings.map((offering, i) => {
            const Icon = offering.icon;
            return (
              <motion.div
                key={offering.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-accent/50 transition"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-black mb-3">{offering.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{offering.description}</p>
                <p className="text-xs text-accent font-semibold">{offering.benefit}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ========== EXPERIENCES WE CREATE ==========
function ExperiencesSection() {
  const experiences = [
    {
      title: 'Inter-Department Tournaments',
      description: 'Bring different teams together through competitive but friendly sporting events.',
      image: '/events/event_24.jpeg'
    },
    {
      title: 'Company Sports Days',
      description: 'Full-day events with multiple sports, activities, food and celebration.',
      image: '/events/event_12.jpeg'
    },
    {
      title: 'Team-Building Challenges',
      description: 'Collaborative sporting activities designed to strengthen team bonds.',
      image: '/events/event_03.jpeg'
    },
    {
      title: 'Employee Wellness Sessions',
      description: 'Regular sports and fitness activities for employee health and engagement.',
      image: '/events/event_28.jpeg'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">EXPERIENCES</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight">
            Experiences We <span className="text-accent">Create</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
            >
              <Image
                src={exp.image}
                alt={exp.title}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-black mb-2">{exp.title}</h3>
                <p className="text-sm text-white/80">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== HOW IT WORKS ==========
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Tell Us About Your Team',
      description: 'Share your company size, objectives and what kind of sporting experience excites your people.'
    },
    {
      step: '02',
      title: 'Design Your Experience',
      description: 'Together we identify suitable sports, formats and programme structures for your organisation.'
    },
    {
      step: '03',
      title: 'Plan the Event',
      description: 'We align venue, scheduling, activities, logistics and all operational details.'
    },
    {
      step: '04',
      title: 'Bring Everyone Together',
      description: 'Deliver the agreed sporting experience and create lasting team memories.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">PROCESS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight">
            How It <span className="text-accent">Works</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative"
              >
                {/* Timeline connector */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-4 top-8 hidden lg:block">
                    <div className="w-8 h-1 bg-accent/30" />
                  </div>
                )}

                <div className="bg-black text-white rounded-lg p-8">
                  <div className="text-4xl font-black text-accent mb-4">{item.step}</div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== WHY FLOWTERNITY ==========
function WhyFlowternity() {
  const reasons = [
    {
      title: 'Sports Expertise',
      description: 'We specialise in sports, not generic events. Professional approach to every experience.'
    },
    {
      title: 'Structured Experiences',
      description: 'Carefully planned activities that deliver engagement, fun and genuine team connection.'
    },
    {
      title: 'Professional Organisation',
      description: 'Reliable execution across all logistics, activities, coaching and event management.'
    },
    {
      title: 'Partnership Approach',
      description: 'We work with your team to deliver experiences that align with your culture and objectives.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">PARTNERSHIP</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Why Choose <span className="text-accent">Flowternity</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-black mb-2">{reason.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== ENQUIRY FORM SECTION ==========
function EnquiryFormSection() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    designation: '',
    phone: '',
    email: '',
    city: '',
    employeeCount: '',
    programmeInterest: '',
    eventDate: '',
    requirements: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.contactPerson,
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          employeeCount: formData.employeeCount,
          eventType: formData.programmeInterest,
          date: formData.eventDate,
          message: formData.requirements,
          formType: 'corporate'
        }),
      });
      
      if (res.ok) {
        setSubmitted(true);
        setFormData({
          companyName: '',
          contactPerson: '',
          designation: '',
          phone: '',
          email: '',
          city: '',
          employeeCount: '',
          programmeInterest: '',
          eventDate: '',
          requirements: ''
        });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry" className="py-24 md:py-32 bg-black text-white relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">GET IN TOUCH</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Corporate Partnership Enquiry
          </h2>
          <p className="text-lg text-white/70">
            Tell us about your team and what kind of sporting experience would create value for your organisation.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white/5 border-2 border-white/10 rounded-2xl p-8 md:p-12"
        >
          {submitted && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 rounded-lg">
              <p className="text-sm font-semibold text-green-300">✓ Thank you! We've received your enquiry and will contact you soon.</p>
            </div>
          )}

          {/* Required Fields Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Enter company name"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Your name"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Designation *</label>
              <select
                required
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              >
                <option value="" className="bg-black">Select your role</option>
                <option value="hr_manager" className="bg-black">HR Manager</option>
                <option value="people_culture" className="bg-black">People & Culture</option>
                <option value="founder_ceo" className="bg-black">Founder / CEO</option>
                <option value="admin" className="bg-black">Administrator</option>
                <option value="event_manager" className="bg-black">Event Manager</option>
                <option value="other" className="bg-black">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Your phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="your@company.com"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-black text-white mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="City"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-6 mb-8 pb-8 border-b border-white/10">
            {/* Employee Count */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Approximate Employee Count (Optional)</label>
              <select
                value={formData.employeeCount}
                onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              >
                <option value="" className="bg-black">Select range</option>
                <option value="50-100" className="bg-black">50-100</option>
                <option value="100-250" className="bg-black">100-250</option>
                <option value="250-500" className="bg-black">250-500</option>
                <option value="500-1000" className="bg-black">500-1000</option>
                <option value="1000+" className="bg-black">1000+</option>
              </select>
            </div>

            {/* Programme Interest */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Interested Programme/Event (Optional)</label>
              <select
                value={formData.programmeInterest}
                onChange={(e) => setFormData({...formData, programmeInterest: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              >
                <option value="" className="bg-black">Select programme</option>
                <option value="tournament" className="bg-black">Corporate Tournament</option>
                <option value="wellness" className="bg-black">Wellness Programme</option>
                <option value="team_building" className="bg-black">Team-Building Event</option>
                <option value="sports_day" className="bg-black">Company Sports Day</option>
                <option value="league" className="bg-black">Sports League</option>
                <option value="coaching" className="bg-black">Sports Coaching</option>
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Preferred Event Date (Optional)</label>
              <input
                type="text"
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="e.g., Next quarter, specific date range"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-black text-white mb-2">Additional Requirements (Optional)</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition resize-none"
                rows={4}
                placeholder="Tell us about your team, objectives or specific questions..."
              />
            </div>
          </div>

          {/* Privacy & CTA */}
          <div className="space-y-4">
            <p className="text-xs text-white/50">
              By submitting this form, you agree that Flowternity may contact you regarding your corporate partnership enquiry.
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black hover:bg-accent/90 h-12 font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Discuss Your Corporate Partnership'} {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

// ========== FAQ SECTION ==========
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What corporate sports experiences does Flowternity offer?',
      a: 'We offer a range of experiences including corporate tournaments, employee wellness programmes, team-building activities, corporate sports leagues, one-day sporting events and professional sports coaching. Each can be customised to suit your organisation\'s size, culture and objectives.'
    },
    {
      q: 'Can programmes be customised for our company?',
      a: 'Yes. We work with each organisation to understand your specific needs, team size, objectives and preferences. All our programmes are designed collaboratively with the client to ensure they align with your culture and goals.'
    },
    {
      q: 'Can we organise tournaments for multiple departments?',
      a: 'Absolutely. Inter-department competitions are a popular and effective way to build team connections while creating healthy competition. We can structure these as single-day events or ongoing league formats across your organisation.'
    },
    {
      q: 'Are one-day sporting events available?',
      a: 'Yes. We design and deliver customised one-day company sporting events that can include multiple sports, activities, food and celebration experiences. These are ideal for creating memorable team experiences.'
    },
    {
      q: 'Can companies enquire about regular employee sports programmes?',
      a: 'Yes. We offer regular wellness and sports programmes specifically designed for employee participation. These can run weekly, bi-weekly or monthly depending on your organisation\'s preferences.'
    },
    {
      q: 'How do we initiate a corporate partnership?',
      a: 'Simply fill out the partnership enquiry form above or contact our team directly on the phone. We\'ll schedule an initial conversation to understand your vision, discuss options and explore the right fit for your organisation.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container relative z-10 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4 leading-tight">
            Frequently Asked <span className="text-accent">Questions</span>
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
              className="border border-black/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-6 hover:bg-black/3 transition text-left"
              >
                <span className="font-black text-black">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-black/50 flex-shrink-0 transition duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 text-sm text-black/70 leading-relaxed border-t border-black/10">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== LOCATION MAP SECTION ==========
function LocationMapSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Visit us</p>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-8">
              World-class facility in Bangalore.
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Horamavu–Kalkere, Bengaluru</h4>
                  <p className="text-muted-foreground">Near Green Gardenia Restaurant, Bengaluru 560043</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Get in Touch</h4>
                  <p className="text-muted-foreground">
                    <a href="tel:+919110427144" className="hover:text-accent transition">+91 91104 27144</a>
                    {' '}· WhatsApp available
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Hours</h4>
                  <p className="text-muted-foreground">
                    Mon–Sun: 6:00 AM – 10:00 PM<br />
                    <span className="text-xs">Sessions available throughout the day</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Easy Access</h4>
                  <p className="text-muted-foreground">
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
                <Button className="bg-accent text-black hover:bg-accent/90 h-12 px-6">
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
  );
}

// ========== FINAL CTA SECTION ==========
function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Make Room for Something <span className="text-accent">Better</span>
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Bring your team together through sport. Start a conversation with Flowternity about your next corporate sporting experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a href="#enquiry" onClick={(e) => {
              e.preventDefault();
              document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-semibold">
                Start a Corporate Partnership <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a id="contact" href="tel:+919886696155">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
                <Phone className="w-5 h-5 mr-2" /> Talk to Our Team
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
