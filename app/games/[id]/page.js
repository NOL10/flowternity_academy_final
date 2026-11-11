'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { SPORTS } from '@/lib/flowternity/config';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Trophy, Check, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1-5
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
  });
  const [registering, setRegistering] = useState(false);

  const gameId = params.id;

  // Load game details
  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/${gameId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Game not found');
        const data = await res.json();
        setGame(data.game);
      } catch (e) {
        console.error('Error loading game:', e);
        toast.error('Failed to load game details');
      }
      setLoading(false);
    };
    loadGame();
  }, [gameId]);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const age = Math.floor((new Date() - birth) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const isAgeInRange = (age, minAge, maxAge) => {
    return age >= minAge && age <= maxAge;
  };

  // Handle registration flow
  const handleRegisterClick = (category) => {
    if (!user) {
      router.push('/auth?mode=login&next=/games');
      return;
    }
    setSelectedCategory(category);
    setRegistrationStep(1);
    setShowRegistrationModal(true);
  };

  const handleNextStep = () => {
    if (registrationStep === 1) {
      if (!registrationData.name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!registrationData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!registrationData.mobile.trim()) {
        toast.error('Please enter your mobile number');
        return;
      }
    }
    if (registrationStep === 2) {
      if (!registrationData.dob) {
        toast.error('Please enter your date of birth');
        return;
      }
    }
    if (registrationStep === 3) {
      if (!registrationData.gender) {
        toast.error('Please select your gender');
        return;
      }
    }
    setRegistrationStep(registrationStep + 1);
  };

  const handlePrevStep = () => {
    setRegistrationStep(Math.max(1, registrationStep - 1));
  };

  const handleRegisterSubmit = async () => {
    if (!user || !selectedCategory) return;
    
    setRegistering(true);
    try {
      const res = await fetch(`/api/games/${gameId}/categories/${selectedCategory.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: registrationData.name,
          email: registrationData.email,
          mobile: registrationData.mobile,
          dob: registrationData.dob,
          gender: registrationData.gender,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      toast.success('Registered successfully! 🎉');
      setShowRegistrationModal(false);
      setRegistrationData({ name: '', email: '', mobile: '', dob: '', gender: '' });
      
      if (data.payment_required) {
        // TODO: Redirect to payment/checkout
        toast.info('Redirecting to payment...');
      }
    } catch (e) {
      toast.error(e.message);
    }
    setRegistering(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary w-1/3 rounded" />
            <div className="h-40 bg-secondary rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20 text-center">
          <h1 className="font-display font-black text-3xl mb-4">Game not found</h1>
          <Link href="/games">
            <Button className="bg-accent text-black hover:bg-accent/90">Back to games</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sport = SPORTS.find(s => s.id === game.sport_id);
  const isMultiCategory = game.tournament_type === 'age_bracket' && game.categories?.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="container max-w-6xl py-8 md:py-12">
        {/* Back button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to games</span>
        </Link>

        {/* Hero section */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="bg-accent text-black hover:bg-accent">{sport?.name}</Badge>
              {isMultiCategory && (
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
                  Multi-Category Tournament
                </Badge>
              )}
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl mb-4">{game.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{game.description}</p>

            {/* Game details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{new Date(game.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {game.start_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{game.start_time} – {game.end_time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className="space-y-4">
            <Card className="p-6 rounded-2xl bg-primary/10 border-primary/20">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Hosted by</p>
              <p className="font-semibold">{game.host_name}</p>
            </Card>
            <Card className="p-6 rounded-2xl">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Skill Level</p>
              <p className="font-semibold capitalize">{game.skill_level?.replace(/_/g, ' ')}</p>
            </Card>
          </div>
        </div>

        {/* Multi-category tournament section */}
        {isMultiCategory ? (
          <>
            {/* Category cards grid */}
            <div className="mb-12">
              <h2 className="font-display font-bold text-3xl mb-6">Tournament Categories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {game.categories.map((category, idx) => {
                  const spotsRemaining = category.max_participants - category.current_participants;
                  const isFull = spotsRemaining <= 0;
                  const ageFilled = registrationData.dob ? isAgeInRange(calculateAge(registrationData.dob), category.age_min, category.age_max) : null;

                  return (
                    <Card
                      key={category.id}
                      className={`p-6 rounded-2xl cursor-pointer transition ${
                        isFull
                          ? 'bg-slate-900/50 border-slate-800 opacity-60'
                          : 'hover:border-accent/50 border-slate-800'
                      }`}
                      onClick={() => !isFull && handleRegisterClick(category)}
                    >
                      {/* Category header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Age {category.age_min}–{category.age_max}
                          </p>
                        </div>
                        {isFull && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Full</Badge>
                        )}
                      </div>

                      {/* Entry fee */}
                      <div className="mb-4 pb-4 border-b border-slate-800">
                        <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
                        <p className="font-display font-black text-2xl text-accent">₹{category.entry_fee.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-muted-foreground">Spots Available</span>
                        <span className={`font-semibold ${isFull ? 'text-red-400' : 'text-lime-400'}`}>
                          {spotsRemaining}/{category.max_participants}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full transition ${isFull ? 'bg-red-500' : 'bg-lime-400'}`}
                          style={{ width: `${(category.current_participants / category.max_participants) * 100}%` }}
                        />
                      </div>

                      {/* Button */}
                      <Button
                        disabled={isFull}
                        className={`w-full ${isFull ? 'bg-slate-800 text-slate-400' : 'bg-accent text-black hover:bg-accent/90'}`}
                      >
                        {isFull ? 'Category Full' : 'Register Now'} <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Rules section */}
            <div className="mb-12">
              <h2 className="font-display font-bold text-3xl mb-6">Tournament Rules</h2>
              <Card className="p-8 rounded-2xl">
                <Tabs defaultValue={game.categories[0]?.id} className="w-full">
                  <TabsList className="grid w-full gap-2 grid-cols-3 lg:grid-cols-5 mb-6">
                    {game.categories.map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {game.categories.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id}>
                      <div className="space-y-4 text-muted-foreground">
                        {cat.rules ? (
                          <p>{cat.rules}</p>
                        ) : (
                          <p>No specific rules for this category.</p>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>

            {/* Prizes section */}
            <div className="mb-12">
              <h2 className="font-display font-bold text-3xl mb-6">Prize Distribution</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {game.categories.map((cat) => (
                  <Card key={cat.id} className="p-6 rounded-2xl">
                    <h4 className="font-bold text-lg mb-4">{cat.name}</h4>
                    <div className="space-y-3">
                      {cat.prizes?.['1st'] && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span>1st Place</span>
                          </span>
                          <span className="font-bold text-accent">
                            {typeof cat.prizes['1st'] === 'object' 
                              ? cat.prizes['1st'].type === 'cash' 
                                ? `₹${cat.prizes['1st'].value?.toLocaleString('en-IN')}`
                                : cat.prizes['1st'].value || cat.prizes['1st'].type
                              : `₹${cat.prizes['1st'].toLocaleString('en-IN')}`
                            }
                          </span>
                        </div>
                      )}
                      {cat.prizes?.['2nd'] && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-gray-400" />
                            <span>2nd Place</span>
                          </span>
                          <span className="font-bold text-accent">
                            {typeof cat.prizes['2nd'] === 'object' 
                              ? cat.prizes['2nd'].type === 'cash' 
                                ? `₹${cat.prizes['2nd'].value?.toLocaleString('en-IN')}`
                                : cat.prizes['2nd'].value || cat.prizes['2nd'].type
                              : `₹${cat.prizes['2nd'].toLocaleString('en-IN')}`
                            }
                          </span>
                        </div>
                      )}
                      {cat.prizes?.['3rd'] && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-orange-400" />
                            <span>3rd Place</span>
                          </span>
                          <span className="font-bold text-accent">
                            {typeof cat.prizes['3rd'] === 'object' 
                              ? cat.prizes['3rd'].type === 'cash' 
                                ? `₹${cat.prizes['3rd'].value?.toLocaleString('en-IN')}`
                                : cat.prizes['3rd'].value || cat.prizes['3rd'].type
                              : `₹${cat.prizes['3rd'].toLocaleString('en-IN')}`
                            }
                          </span>
                        </div>
                      )}
                      {!cat.prizes || Object.keys(cat.prizes).length === 0 && (
                        <p className="text-sm text-muted-foreground">Prizes to be announced</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Single pool game
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Max Players: <span className="font-bold">{game.max_players}</span>
            </p>
            {game.is_paid && (
              <p className="text-lg text-accent font-bold mb-6">
                Entry Fee: ₹{game.fee}
              </p>
            )}
            <Button className="bg-accent text-black hover:bg-accent/90 h-12 px-8">
              Join Game
            </Button>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Register for {selectedCategory?.name}</DialogTitle>
            <DialogDescription>Step {registrationStep} of 6</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {registrationStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Full Name</Label>
                  <Input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    className="h-12 text-base"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold mb-2 block">Email</Label>
                  <Input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    className="h-12 text-base"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold mb-2 block">Mobile Number</Label>
                  <Input
                    type="tel"
                    value={registrationData.mobile}
                    onChange={(e) => setRegistrationData({ ...registrationData, mobile: e.target.value })}
                    className="h-12 text-base"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Confirm Category */}
            {registrationStep === 2 && (
              <div className="space-y-4">
                <Card className="p-6 bg-accent/10 border-accent/20 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <h3 className="font-display font-black text-2xl">{selectedCategory?.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">Age {selectedCategory?.age_min}–{selectedCategory?.age_max}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">Entry Fee</p>
                  <p className="font-display font-black text-3xl text-accent">₹{selectedCategory?.entry_fee.toLocaleString('en-IN')}</p>
                </Card>
              </div>
            )}

            {/* Step 3: Enter DOB */}
            {registrationStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Date of Birth</Label>
                  <Input
                    type="date"
                    value={registrationData.dob}
                    onChange={(e) => setRegistrationData({ ...registrationData, dob: e.target.value })}
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">We use this to verify you're in the correct age category</p>
                </div>
              </div>
            )}

            {/* Step 4: Gender Selection */}
            {registrationStep === 4 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold mb-3 block">Gender</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((gen) => (
                    <Button
                      key={gen}
                      variant={registrationData.gender === gen ? 'default' : 'outline'}
                      onClick={() => setRegistrationData({ ...registrationData, gender: gen })}
                      className={`h-12 ${
                        registrationData.gender === gen
                          ? 'bg-accent text-black hover:bg-accent/90'
                          : 'border-slate-700'
                      }`}
                    >
                      {gen}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Age Verification */}
            {registrationStep === 5 && (
              <div className="space-y-4">
                <Card className="p-6 rounded-2xl border-lime-400/30 bg-lime-400/5">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Age Verified ✓</h4>
                      <p className="text-sm text-muted-foreground">
                        You're {calculateAge(registrationData.dob)} years old, which matches the {selectedCategory?.name} category (age {selectedCategory?.age_min}–{selectedCategory?.age_max}).
                      </p>
                    </div>
                  </div>
                </Card>
                {selectedCategory?.rules && (
                  <div>
                    <h4 className="font-semibold mb-3">Tournament Rules</h4>
                    <Card className="p-4 bg-slate-900/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{selectedCategory.rules}</p>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review & Payment */}
            {registrationStep === 6 && (
              <div className="space-y-4">
                <Card className="p-6 rounded-2xl border-lime-400/30 bg-lime-400/5">
                  <h4 className="font-semibold mb-4">Registration Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-semibold">{registrationData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-semibold">{registrationData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile</span>
                      <span className="font-semibold">{registrationData.mobile}</span>
                    </div>
                    <div className="border-t border-slate-700 my-3 pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-semibold">{selectedCategory?.name}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-bold text-accent">₹{selectedCategory?.entry_fee.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-blue-500/10 border-blue-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">You'll be redirected to complete payment after confirming registration.</p>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={registrationStep === 1}
              className="border-slate-700"
            >
              Back
            </Button>
            <Button
              onClick={registrationStep === 6 ? handleRegisterSubmit : handleNextStep}
              disabled={registering}
              className="bg-accent text-black hover:bg-accent/90 min-w-32"
            >
              {registering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : registrationStep === 6 ? (
                'Confirm & Pay'
              ) : (
                'Next'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
