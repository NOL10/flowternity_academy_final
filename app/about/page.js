'use client';

import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Trophy, Users, Target, Zap, ArrowRight, MapPin, Phone, Clock, Wifi, Droplet, Wind } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">About</p>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight leading-[0.95]">
            We built this for<br /><span className="text-muted-foreground">people who move.</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl">
            Flowternity is a multi-sport facility built for athletes who demand excellence. Two international standard basketball courts. Dedicated pickleball, skating, calisthenics and karate spaces. One membership. Zero friction.
          </p>
        </div>
      </section>

      {/* Big image */}
      <section className="relative aspect-[21/9] w-full overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1509027572446-af8401acfdc3?auto=format&fit=crop&q=80&w=2000" alt="Facility" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
      </section>

      {/* Values */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl">
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl">Our mission</h2>
          </div>
          <div className="text-muted-foreground text-lg space-y-4">
            <p>Bring athletes together — to excellence, to passion, to something greater than individual achievement.</p>
            <p>Whether you&apos;re perfecting a jump shot, learning your first ollie, or holding your first handstand, this is where dedication meets opportunity.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Trophy, t: 'World-class', d: 'International-standard facilities' },
            { icon: Users, t: 'Community', d: 'Coaches, athletes, champions' },
            { icon: Target, t: 'Focused', d: 'Every session with purpose' },
            { icon: Zap, t: 'Effortless', d: 'Book in 60 seconds' },
          ].map((v, i) => (
            <Card key={i} className="p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><v.icon className="w-5 h-5 text-black" /></div>
              <h3 className="font-display font-bold text-xl mt-4">{v.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{v.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Facility Location & Details */}
      <section className="container py-16 md:py-24">
        <div className="max-w-5xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Visit us</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mb-12">Our Facility</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-border h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5242847236807!2d77.5946517!3d13.0449408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1185e1327d47%3A0xc21f974f50d32d2a!2sFlowternity%20%7C%20Multi%20Sport%20Facility!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">Address</p>
                    <p className="text-lg mt-1">1456 Old Flour Mill Road<br/>Dodda Kempaih Layout<br/>Horamavu, Kalkere<br/>Bengaluru, Karnataka 560113</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">Contact</p>
                    <a href="tel:+919110427144" className="text-lg hover:text-accent transition">+91 9110427144</a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">Hours</p>
                    <p className="text-lg">Mon - Sun: 6:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full h-12 bg-accent text-black hover:bg-accent/90 mt-4">
                <a href="https://www.google.com/maps/dir//Flowternity+%7C+Multi+Sport+Facility,+1456+old+flour+mill+road,+dodda+kempaih+layout,+horamavu,+Kalkere,+Bengaluru,+Karnataka+560113/@13.0449408,77.5946517,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae1185e1327d47:0xc21f974f50d32d2a!2m2!1d77.6703963!2d13.0353296?entry=ttu" target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </Button>
            </div>
          </div>

          {/* Facility Features */}
          <div>
            <h3 className="font-display font-bold text-2xl mb-6">What we offer</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Trophy, title: 'Basketball Courts', desc: '2 international-standard courts' },
                { icon: Wind, title: 'Pickleball', desc: 'Dedicated outdoor courts' },
                { icon: Zap, title: 'Calisthenics', desc: 'Full outdoor training area' },
                { icon: Target, title: 'Karate', desc: 'Dedicated indoor space' },
                { icon: Wifi, title: 'Skateboarding', desc: 'Professional grade facility' },
                { icon: Droplet, title: 'Amenities', desc: 'Changing rooms, lockers, parking' },
              ].map((feature, i) => (
                <Card key={i} className="p-4 rounded-xl border-border">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                    <feature.icon className="w-4 h-4 text-accent" />
                  </div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Card className="p-12 md:p-16 bg-primary text-primary-foreground border-0 rounded-3xl">
          <h2 className="font-display font-black text-4xl md:text-5xl leading-[0.95]">Come train with us.</h2>
          <p className="text-white/60 mt-3">Membership starts at ₹2,000/month.</p>
          <div className="flex gap-3 mt-8">
            <Link href="/memberships"><Button className="h-12 bg-accent text-black hover:bg-accent/90">See Plans <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/contact"><Button variant="outline" className="h-12 border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white">Visit Us</Button></Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
