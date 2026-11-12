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
import { ArrowRight, Check, Users, Trophy, Target, Heart, Zap, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';

export default function SchoolsPartnershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* SECTION 01 — HERO */}
      <HeroSection />

      {/* SECTION 02 — TRUST AND INTRODUCTION */}
      <IntroductionSection />

      {/* SECTION 03 — WHY SPORTS MATTER */}
      <SportsMatterSection />

      {/* SECTION 04 — OUR OFFERINGS */}
      <OfferingsSection />

      {/* SECTION 05 — HOW THE PARTNERSHIP WORKS */}
      <HowItWorksSection />

      {/* SECTION 06 — SPORTS AND PROGRAMMES */}
      <SportsSection />

      {/* SECTION 07 — WHY FLOWTERNITY */}
      <WhyFlowternity />

      {/* SECTION 08 — ENQUIRY FORM */}
      <EnquiryFormSection />

      {/* SECTION 09 — FAQ */}
      <FAQSection />

      {/* SECTION 10 — FINAL CTA */}
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
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1600"
          alt="Students playing sports"
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
            School Partnerships
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            Building Stronger Schools Through Sport.
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/85 mb-6 leading-relaxed max-w-2xl font-light">
            Beyond the classroom. Into a world of movement, confidence and competition.
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed max-w-2xl">
            Partner with Flowternity to bring structured sports experiences, professional coaching and meaningful athletic opportunities to your students.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a href="#enquiry" onClick={(e) => {
              e.preventDefault();
              document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-semibold">
                Explore Partnership Opportunities <ArrowRight className="w-5 h-5 ml-2" />
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

// ========== TRUST AND INTRODUCTION ==========
function IntroductionSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-widest font-black text-accent mb-4">PARTNERSHIP</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight tracking-tight">
              Sports as Part of <span className="text-accent">Quality Education</span>
            </h2>
            <p className="text-lg text-black/70 mb-6 leading-relaxed">
              At Flowternity, we believe structured sports experiences are fundamental to holistic student development. We partner with schools to bring professional coaching, meaningful athletic opportunities and a culture of movement and confidence into school communities.
            </p>
            <p className="text-base text-black/60 mb-8 leading-relaxed">
              Our approach combines world-class facilities, experienced coaching and a genuine commitment to student development—whether your students are just discovering sport or competing at high levels.
            </p>
            <div className="flex flex-col gap-3">
              {['Dedicated coaches with extensive experience', 'Structured progressive programmes', 'Flexible scheduling for schools', 'Student-centric approach'].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm md:text-base text-black/70">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600"
              alt="Students in sports training"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ========== WHY SPORTS MATTER ==========
function SportsMatterSection() {
  const benefits = [
    {
      number: '01',
      title: 'Physical Development',
      description: 'Encourage movement, fitness and active lifestyles that build strong, healthy bodies.'
    },
    {
      number: '02',
      title: 'Confidence & Character',
      description: 'Help students develop self-assurance, discipline and resilience through athletic challenge.'
    },
    {
      number: '03',
      title: 'Teamwork & Leadership',
      description: 'Create opportunities for collaboration, communication and emerging leadership.'
    },
    {
      number: '04',
      title: 'Healthy Competition',
      description: 'Encourage students to challenge themselves and grow through participation and competition.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">WHY IT MATTERS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Why Sports Matter in <span className="text-accent">Schools</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Sports develop more than athletic ability—they shape character, confidence and lifelong healthy habits.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-accent/50 transition"
            >
              <div className="text-3xl font-black text-accent mb-4">{benefit.number}</div>
              <h3 className="text-xl font-black mb-3">{benefit.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== OUR OFFERINGS ==========
function OfferingsSection() {
  const offerings = [
    {
      title: 'Professional Sports Coaching',
      description: 'Experienced coaches with proven track records delivering structured, progressive training programmes.',
      icon: Trophy
    },
    {
      title: 'Structured Sports Programmes',
      description: 'Carefully designed curricula that develop students from beginners to competitive levels.',
      icon: Target
    },
    {
      title: 'Physical Education Support',
      description: 'Enhance your school PE curriculum with professional support and structured activities.',
      icon: Zap
    },
    {
      title: 'After-School Sports',
      description: 'Extended opportunities for interested students to develop skills beyond regular hours.',
      icon: Users
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
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">OFFERINGS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight">
            What We Bring to <span className="text-accent">Your School</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((offering, i) => {
            const Icon = offering.icon;
            return (
              <motion.div
                key={offering.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border-2 border-black/8 rounded-xl p-8 hover:border-accent/40 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-black text-black mb-3">{offering.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{offering.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ========== HOW THE PARTNERSHIP WORKS ==========
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Initial Conversation',
      description: 'We understand your school\'s needs, student population and sports objectives.'
    },
    {
      step: '02',
      title: 'Programme Planning',
      description: 'Together we explore suitable sporting activities and programme structure.'
    },
    {
      step: '03',
      title: 'Partnership Setup',
      description: 'We align schedules, responsibilities and operational requirements.'
    },
    {
      step: '04',
      title: 'Programme Delivery',
      description: 'We begin the agreed sports programme and review progress regularly.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">PROCESS</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            How the Partnership <span className="text-accent">Works</span>
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

                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
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

// ========== SPORTS SECTION ==========
function SportsSection() {
  const activeSports = SPORTS.filter(s => s.status === 'active');

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
          <p className="text-xs uppercase tracking-widest font-black text-accent mb-4">PROGRAMMES</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight">
            Sports & <span className="text-accent">Programmes</span>
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            We specialise in multiple sports with dedicated coaching and facilities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSports.map((sport, i) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
            >
              <Image
                src={sport.image}
                alt={sport.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-black mb-2">{sport.name}</h3>
                <p className="text-sm text-white/80">{sport.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== WHY FLOWTERNITY ==========
function WhyFlowternity() {
  const reasons = [
    {
      title: 'Structured Approach',
      description: 'Progressive, carefully planned programmes that develop students systematically.'
    },
    {
      title: 'Student Development Focus',
      description: 'We prioritise holistic growth—skills, confidence, character and resilience.'
    },
    {
      title: 'Professional & Organised',
      description: 'Experienced coaches, reliable schedules and professional programme management.'
    },
    {
      title: 'Partnership Mindset',
      description: 'We work collaboratively with schools to deliver solutions tailored to your needs.'
    }
  ];

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
    schoolName: '',
    contactPerson: '',
    designation: '',
    phone: '',
    email: '',
    city: '',
    studentCount: '',
    sportsInterest: [],
    servicesInterest: [],
    requirements: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulated submission - integrate with actual API endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        schoolName: '',
        contactPerson: '',
        designation: '',
        phone: '',
        email: '',
        city: '',
        studentCount: '',
        sportsInterest: [],
        servicesInterest: [],
        requirements: ''
      });
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry" className="py-24 md:py-32 bg-white relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
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
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4 leading-tight">
            Partnership Enquiry
          </h2>
          <p className="text-lg text-black/70">
            Tell us about your school and sports vision. We'll be in touch shortly to discuss opportunities.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white border-2 border-black/8 rounded-2xl p-8 md:p-12"
        >
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">✓ Thank you! We've received your enquiry and will contact you soon.</p>
            </div>
          )}

          {/* Required Fields Grid */}
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-black text-black mb-2">School Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Enter school name"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Your name"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Designation *</label>
              <select
                required
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              >
                <option value="">Select your role</option>
                <option value="principal">School Principal</option>
                <option value="management">Management</option>
                <option value="pe_coordinator">PE Coordinator</option>
                <option value="sports_director">Sports Director</option>
                <option value="administrator">Administrator</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="Your phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="your@school.edu"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-black text-black mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="City"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-6 mb-8 pb-8 border-b border-black/8">
            {/* Student Count */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Approximate Number of Students (Optional)</label>
              <input
                type="text"
                value={formData.studentCount}
                onChange={(e) => setFormData({...formData, studentCount: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                placeholder="e.g., 500-800"
              />
            </div>

            {/* Sports of Interest */}
            <div>
              <label className="block text-sm font-black text-black mb-3">Sports of Interest (Optional)</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {['Basketball', 'Futsal', 'Skateboarding', 'Karate', 'Skating'].map(sport => (
                  <label key={sport} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sportsInterest.includes(sport)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, sportsInterest: [...formData.sportsInterest, sport]});
                        } else {
                          setFormData({...formData, sportsInterest: formData.sportsInterest.filter(s => s !== sport)});
                        }
                      }}
                      className="w-4 h-4 rounded border-black/30 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-black/70">{sport}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-black text-black mb-2">Additional Requirements (Optional)</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="w-full px-4 py-3 border border-black/8 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition resize-none"
                rows={4}
                placeholder="Tell us about your specific needs, objectives or questions..."
              />
            </div>
          </div>

          {/* Privacy & CTA */}
          <div className="space-y-4">
            <p className="text-xs text-black/50">
              By submitting this form, you agree that Flowternity may contact you regarding your school partnership enquiry.
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black hover:bg-accent/90 h-12 font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request a Partnership Discussion'} {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
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
      q: 'What does a school partnership with Flowternity involve?',
      a: 'Our partnerships bring structured sports programmes, professional coaching and dedicated facilities to your school community. We work with your school to tailor offerings to your students\' needs and your institutional objectives.'
    },
    {
      q: 'Which sports can schools explore?',
      a: 'We specialise in Basketball, Futsal, Skateboarding, Karate and Skating. Each sport has dedicated coaches and structured progressive programmes suitable for different skill levels.'
    },
    {
      q: 'Can programmes be tailored to individual schools?',
      a: 'Yes. We work collaboratively with each school to understand your requirements, student demographics and objectives. Programmes are designed specifically around your school\'s needs.'
    },
    {
      q: 'How can a school initiate a partnership?',
      a: 'Simply fill out the partnership enquiry form above or contact our team directly. We\'ll arrange an initial conversation to understand your vision and explore suitable opportunities.'
    },
    {
      q: 'How is the programme structured?',
      a: 'Programmes typically include regular coaching sessions, skill progression frameworks, regular assessments and opportunities for inter-school competition or special events. Exact structure depends on your school\'s needs.'
    },
    {
      q: 'Can schools enquire about tournaments and sporting events?',
      a: 'Absolutely. We regularly organise inter-school tournaments and special sporting events. We\'ll discuss these opportunities as part of the partnership planning process.'
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
            Let\'s Build a Stronger Sporting <span className="text-accent">Culture</span>
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Start a conversation about bringing meaningful sports experiences to your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a href="#enquiry" onClick={(e) => {
              e.preventDefault();
              document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <Button size="lg" className="bg-accent text-black hover:bg-accent/90 h-14 px-8 text-base font-semibold">
                Start a School Partnership <ArrowRight className="w-5 h-5 ml-2" />
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
