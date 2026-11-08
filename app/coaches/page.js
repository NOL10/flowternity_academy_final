'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/site-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SPORTS } from '@/lib/flowternity/config';
import { Users, Award, Briefcase, Star } from 'lucide-react';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/coaches')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(d => { 
        console.log('Coaches data:', d.coaches);
        setCoaches(d.coaches || []); 
        setLoading(false); 
      })
      .catch(e => { 
        console.error('Error fetching coaches:', e); 
        setCoaches([]); 
        setLoading(false); 
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-16 md:py-24">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Meet the</p>
        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight">Coaches.</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl">A team of professional athletes and educators, ready to help you level up in every sport.</p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">{[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-secondary rounded-2xl animate-pulse" />)}</div>
        ) : coaches.length === 0 ? (
          <Card className="mt-12 p-12 rounded-3xl border-dashed text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-display font-bold text-2xl mt-4">Coaches coming soon</h3>
            <p className="text-muted-foreground mt-2">Our team is being onboarded. Check back shortly.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {coaches.map(c => (
              <Card key={c.id} className="p-0 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {/* Header background */}
                <div className="h-24 bg-gradient-to-br from-accent/20 to-accent/5" />
                
                {/* Content */}
                <div className="p-6 pt-0">
                  {/* Avatar - positioned over header */}
                  <div className="flex justify-center -mt-12 mb-4">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.full_name} className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent text-black flex items-center justify-center font-black text-2xl border-4 border-background shadow-md">
                        {c.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  {/* Name and Title */}
                  <div className="text-center mb-4">
                    <h3 className="font-display font-bold text-2xl">{c.full_name}</h3>
                    <p className="text-sm text-accent font-semibold mt-1">
                      {c.sports?.length > 0 ? c.sports.map(sid => SPORTS.find(s => s.id === sid)?.name || sid).join(' · ') : 'Coach'}
                    </p>
                  </div>

                  {/* Bio */}
                  {c.bio && (
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {c.bio}
                    </p>
                  )}

                  {/* Experience */}
                  {c.experience_years && (
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg mb-4">
                      <Briefcase className="w-4 h-4 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Experience</p>
                        <p className="font-semibold">{c.experience_years}+ years</p>
                      </div>
                    </div>
                  )}

                  {/* Qualifications */}
                  {c.qualifications && Array.isArray(c.qualifications) && c.qualifications.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-accent" />
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Qualifications</p>
                      </div>
                      <div className="space-y-1">
                        {c.qualifications.map((qual, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {qual}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties */}
                  {c.specialties && Array.isArray(c.specialties) && c.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-accent" />
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Specialties</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sports Badges */}
                  {c.sports && c.sports.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      {c.sports.map(sid => {
                        const sport = SPORTS.find(s => s.id === sid);
                        return (
                          <Badge key={sid} variant="secondary" className="bg-accent/10 text-accent border-0">
                            {sport?.name || sid}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
