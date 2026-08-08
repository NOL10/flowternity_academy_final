'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers';
import { MEMBERSHIPS, SPORTS, COUPONS, JERSEY_SIZES } from '@/lib/flowternity/config';
import { toast } from 'sonner';
import { Check, CreditCard, Loader2, Lock, User, ShieldCheck, Info } from 'lucide-react';

// Load Razorpay script manually — more reliable than Next/Script
function loadRazorpay() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve(false); return; }
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    const timer = setTimeout(() => resolve(false), 8000); // 8s timeout
    s.onload = () => { clearTimeout(timer); resolve(true); };
    s.onerror = () => { clearTimeout(timer); resolve(false); };
    document.body.appendChild(s);
  });
}

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const planId = params.get('plan');
  const plan = MEMBERSHIPS.find(m => m.id === planId);
  const sport = SPORTS.find(s => s.id === plan?.sport_id);

  const [processing, setProcessing] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null); // athlete profile already on account

  // Single unified form
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    dob: '', gender: '',
  });

  // Jersey form for first-time basketball monthly/half-yearly
  const [jerseyForm, setJerseyForm] = useState({
    height: '', weight: '', name: '', number: '', size: '',
  });
  const [showJerseyForm, setShowJerseyForm] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedEnrollmentCoupon, setAppliedEnrollmentCoupon] = useState(null); // Separate for enrollment fee
  const [finalPrice, setFinalPrice] = useState(plan?.price || 0);
  const [slotQuantity, setSlotQuantity] = useState(1); // For slot-type plans
  const [enrollmentFee, setEnrollmentFee] = useState(0); // ₹2000 for first-time basketball

  // Pre-fill from logged-in user + fetch existing athlete profile + check enrollment fee eligibility
  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, full_name: user.full_name || '', email: user.email || '', phone: user.phone || '' }));
      // Fetch existing athlete profile so we can reuse it
      fetch('/api/children', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          const profile = d.children?.[0];
          if (profile) {
            setExistingProfile(profile);
            setForm(f => ({ ...f, dob: profile.dob || '', gender: profile.gender || '' }));
          }
        });
    }
  }, [user]);
  
  // Separate effect for calculating enrollment fee
  useEffect(() => {
    if (!plan) return;
    
    const isBasketball = plan.sport_id === 'basketball';
    const isMonthlyHalfOrYearly = plan.duration_months === 1 || plan.duration_months === 6 || plan.duration_months === 12;
    const chargesEnrollmentFee = plan.duration_months === 1 || plan.duration_months === 6; // Only 1m and 6m
    const notSlotPlan = plan.type !== 'slot';
    
    if (isBasketball && isMonthlyHalfOrYearly && notSlotPlan) {
      if (user) {
        // Check if user already has basketball monthly/half-yearly/yearly membership (not slots)
        fetch('/api/auth/me', { credentials: 'include' })
          .then(r => r.json())
          .then(d => {
            const hasBasketballMonthly = d.active_memberships?.some(m => 
              m.sport_id === 'basketball' && m.membership_snapshot?.type !== 'slot'
            );
            if (!hasBasketballMonthly) {
              setEnrollmentFee(chargesEnrollmentFee ? 2000 : 0);
              setShowJerseyForm(true);
            } else {
              setEnrollmentFee(0);
              setShowJerseyForm(false);
            }
          })
          .catch(() => {
            // If fetch fails, assume first-time (safer)
            setEnrollmentFee(chargesEnrollmentFee ? 2000 : 0);
            setShowJerseyForm(true);
          });
      } else {
        // Guest user — first time, charge enrollment fee only if 1m or 6m
        setEnrollmentFee(chargesEnrollmentFee ? 2000 : 0);
        setShowJerseyForm(true);
      }
    } else {
      setEnrollmentFee(0);
      setShowJerseyForm(false);
    }
  }, [user, plan]);
  
  // Update final price when enrollment fee or slot quantity changes
  useEffect(() => {
    if (plan) {
      const isSlotPlan = plan.type === 'slot';
      const qty = isSlotPlan ? slotQuantity : 1;
      const basePrice = plan.price * qty;
      setFinalPrice(basePrice + enrollmentFee);
    }
  }, [plan, slotQuantity, enrollmentFee]);

  if (!plan || !sport) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20 text-center">
          <h1 className="font-display font-black text-3xl">Plan not found</h1>
          <Link href="/memberships" className="mt-4 inline-block underline">Back to memberships</Link>
        </div>
      </div>
    );
  }

  const applyCoupon = () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    
    // Check if coupon is valid and applicable to this plan
    const coupon = COUPONS.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) { toast.error('Invalid coupon code'); return; }
    
    // Check if it's an enrollment fee coupon
    if (coupon.applicable_to === 'enrollment_fee') {
      // Enrollment fee coupon
      if (!coupon.applicable_plans.includes(plan.id)) { 
        toast.error(`This coupon only applies to: ${coupon.applicable_plans.join(', ')}`); 
        return; 
      }
      if (enrollmentFee === 0) {
        toast.error('This coupon is for enrollment fee only');
        return;
      }
      setAppliedEnrollmentCoupon(coupon);
      setEnrollmentFee(0); // This will trigger the useEffect to recalculate finalPrice
      toast.success(`Coupon applied! ₹${coupon.discount_amount.toLocaleString('en-IN')} enrollment fee waived`);
    } else {
      // Regular membership coupon
      if (!coupon.applicable_plans.includes(plan.id)) { 
        toast.error(`This coupon only applies to: ${coupon.applicable_plans.join(', ')}`); 
        return; 
      }
      setAppliedCoupon(coupon);
      // Calculate final price with membership discount
      const isSlotPlan = plan.type === 'slot';
      const qty = isSlotPlan ? slotQuantity : 1;
      const basePrice = plan.price * qty;
      const newTotal = (basePrice - coupon.discount_amount) + enrollmentFee;
      setFinalPrice(newTotal);
      toast.success(`Coupon applied! ₹${coupon.discount_amount.toLocaleString('en-IN')} off`);
    }
    setCouponCode('');
  };

  const validate = () => {
    if (!user) {
      if (!form.full_name.trim()) return 'Full name is required';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
      if (!form.phone.trim()) return 'Phone number is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirm) return 'Passwords do not match';
    }
    // DOB only required if no existing profile
    if (!existingProfile && !form.dob) return 'Date of birth is required';
    
    // Jersey validation if enrollment fee applies
    if (showJerseyForm) {
      if (!jerseyForm.height.trim()) return 'Student height is required';
      if (!jerseyForm.weight.trim()) return 'Student weight is required';
      if (!jerseyForm.name.trim()) return 'Name for jersey is required';
      if (!jerseyForm.number || jerseyForm.number < 0 || jerseyForm.number > 999) return 'Jersey number must be 0-999';
      if (!jerseyForm.size) return 'Jersey size is required';
    }
    
    return null;
  };

  const pay = async () => {
    const problem = validate();
    if (problem) { toast.error(problem); return; }

    setProcessing(true);
    try {
      // Load Razorpay script if not already loaded
      const rzpAvailable = await loadRazorpay();

      let orderData;
      let child_profile_id = null;
      const athleteName = user?.full_name || form.full_name;

      if (user) {
        // Signed-in: create athlete profile first, then order
        const cres = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            athlete_name: athleteName,
            dob: form.dob,
            gender: form.gender,
            selected_sports: [plan.sport_id],
          }),
        });
        const cdata = await cres.json();
        if (!cres.ok) throw new Error(cdata.error || 'Failed to create athlete profile');
        child_profile_id = cdata.child.id;

        // If Razorpay script failed to load, use mock payment directly
        if (!rzpAvailable || !window.Razorpay) {
          const mres = await fetch('/api/checkout/mock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ membership_id: plan.id, child_profile_id }),
          });
          const mdata = await mres.json();
          if (!mres.ok) throw new Error(mdata.error || 'Payment failed');
          toast.success('Membership activated! Welcome to Flowternity.');
          await refresh();
          router.push('/dashboard?welcome=1');
          return;
        }

        const ores = await fetch('/api/checkout/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            membership_id: plan.id, 
            child_profile_id, 
            coupon_code: (appliedCoupon?.code || appliedEnrollmentCoupon?.code) || null,
            slot_quantity: slotQuantity,
            enrollment_fee: enrollmentFee,
            jersey: showJerseyForm ? jerseyForm : null,
          }),
        });
        orderData = await ores.json();
        if (!ores.ok) throw new Error(orderData.error || 'Failed to create order');
      } else {
        // Guest: register + pay in one step
        // If Razorpay script failed to load, use mock register-and-pay
        if (!rzpAvailable || !window.Razorpay) {
          const mres = await fetch('/api/checkout/register-and-pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              full_name: form.full_name,
              email: form.email,
              phone: form.phone,
              password: form.password,
              membership_id: plan.id,
              child: { athlete_name: form.full_name, dob: form.dob, gender: form.gender },
              enrollment_fee: enrollmentFee,
              jersey: showJerseyForm ? jerseyForm : null,
            }),
          });
          const mdata = await mres.json();
          if (!mres.ok) {
            if (mres.status === 409) {
              toast.error(mdata.error);
              setTimeout(() => router.push(`/auth?mode=login&next=/checkout?plan=${plan.id}`), 800);
              setProcessing(false);
              return;
            }
            throw new Error(mdata.error || 'Registration failed');
          }
          toast.success('Membership activated! Welcome to Flowternity.');
          await refresh();
          router.push('/dashboard?welcome=1');
          return;
        }

        const ores = await fetch('/api/checkout/register-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            membership_id: plan.id,
            child: { athlete_name: form.full_name, dob: form.dob, gender: form.gender },
            coupon_code: (appliedCoupon?.code || appliedEnrollmentCoupon?.code) || null,
            slot_quantity: slotQuantity,
            enrollment_fee: enrollmentFee,
            jersey: showJerseyForm ? jerseyForm : null,
          }),
        });
        orderData = await ores.json();
        if (!ores.ok) {
          if (ores.status === 409) {
            toast.error(orderData.error);
            setTimeout(() => router.push(`/auth?mode=login&next=/checkout?plan=${plan.id}`), 800);
            setProcessing(false);
            return;
          }
          throw new Error(orderData.error || 'Failed to create order');
        }
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Flowternity',
        description: `${sport.name} · ${plan.duration_months}M`,
        order_id: orderData.order_id,
        prefill: {
          name: user?.full_name || form.full_name || '',
          email: user?.email || form.email || '',
          contact: user?.phone || form.phone || '',
        },
        theme: { color: '#000000' },
        handler: async function (response) {
          try {
            const vres = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vdata = await vres.json();
            if (!vres.ok) throw new Error(vdata.error || 'Verification failed');
            toast.success('Payment successful! Welcome to Flowternity.');
            await refresh();
            router.push('/dashboard?welcome=1');
          } catch (e) {
            toast.error(e.message || 'Verification failed');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => { toast.info('Payment cancelled'); setProcessing(false); },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        toast.error('Payment failed: ' + (r.error?.description || 'Unknown error'));
        setProcessing(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(e.message || 'Checkout failed');
      setProcessing(false);
    }
  };

  const perMonth = Math.round(plan.price / plan.duration_months);
  const f = form;
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container py-10 md:py-14 max-w-6xl">
        <div className="mb-8">
          <Link href="/memberships" className="text-sm text-muted-foreground hover:text-foreground transition">← Back to plans</Link>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mt-4 mb-2">Checkout</p>
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">Complete your membership</h1>
          <p className="text-muted-foreground mt-3">
            {user ? `Signed in as ${user.full_name}. Fill in the athlete details & pay.` : 'Create your account and activate your membership in one step.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Step indicator */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span> Details</span>
              <span className="flex-1 h-px bg-border" />
              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</span> Payment</span>
              <span className="flex-1 h-px bg-border" />
              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">3</span> Done</span>
            </div>

            {/* UNIFIED FORM — one card for everything */}
            <Card className="p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5" />
                <h2 className="font-display font-bold text-2xl">
                  {user ? 'Athlete Details' : 'Your details'}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {user && existingProfile
                  ? `Adding ${sport.name} to your existing athlete profile.`
                  : user
                  ? `Joining ${sport.name}. Fill in the athlete's date of birth and gender.`
                  : `One form — your account and ${sport.name} athlete profile.`}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Account fields — guests only */}
                {!user && (
                  <>
                    <div className="sm:col-span-2">
                      <Label>Full name</Label>
                      <Input required className="h-12 mt-1" value={f.full_name} onChange={set('full_name')} placeholder="Aarav Sharma" />
                      <p className="text-xs text-muted-foreground mt-1">This will also be the athlete&apos;s name on their profile.</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input required type="email" className="h-12 mt-1" value={f.email} onChange={set('email')} placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input required type="tel" className="h-12 mt-1" value={f.phone} onChange={set('phone')} placeholder="+91 98xxxx" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input required type="password" className="h-12 mt-1" value={f.password} onChange={set('password')} placeholder="Min. 6 characters" />
                    </div>
                    <div>
                      <Label>Confirm password</Label>
                      <Input required type="password" className="h-12 mt-1" value={f.confirm} onChange={set('confirm')} placeholder="Re-type password" />
                    </div>
                  </>
                )}

                {/* If existing profile — show summary, no re-entry needed */}
                {user && existingProfile ? (
                  <div className="sm:col-span-2 p-4 rounded-xl bg-secondary flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-black text-black text-xl flex-shrink-0">
                      {(existingProfile.athlete_name || existingProfile.child_name || user.full_name)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{existingProfile.athlete_name || existingProfile.child_name || user.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        DOB {existingProfile.dob ? new Date(existingProfile.dob).toLocaleDateString('en-IN') : '—'} · {existingProfile.gender || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{sport.name} will be added to this profile</div>
                    </div>
                  </div>
                ) : (
                  /* Athlete fields — new profile */
                  <>
                    <div>
                      <Label>Date of birth</Label>
                      <Input type="date" className="h-12 mt-1" value={f.dob} onChange={set('dob')} />
                    </div>
                    <div>
                      <Label>Gender <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <div className="flex gap-2 mt-2">
                        {['Male', 'Female', 'Other'].map(g => (
                          <button
                            key={g} type="button"
                            onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                            className={`px-4 py-2 rounded-lg border text-sm transition ${f.gender === g ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'}`}
                          >{g}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Slot quantity selector — only for slot-type plans */}
              {plan.type === 'slot' && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Label className="text-base font-semibold mb-3 block">How many slots do you want?</Label>
                  <p className="text-sm text-muted-foreground mb-4">Each slot = 1 class booking. Use all slots within 30 days.</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-input rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSlotQuantity(Math.max(1, slotQuantity - 1))}
                        className="px-4 py-3 hover:bg-secondary transition"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={slotQuantity}
                        onChange={(e) => setSlotQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="w-16 text-center border-0 bg-transparent font-display font-black text-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSlotQuantity(Math.min(100, slotQuantity + 1))}
                        className="px-4 py-3 hover:bg-secondary transition"
                      >+</button>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total: ₹{finalPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{slotQuantity} slots × ₹400</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jersey customization — first-time basketball monthly/half-yearly/yearly only */}
              {showJerseyForm && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-accent" />
                    <div>
                      <Label className="text-base font-semibold block">Jersey Details</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {enrollmentFee > 0 
                          ? `One-time enrollment fee (₹${enrollmentFee.toLocaleString('en-IN')}) includes 2 sets of uniforms (jerseys)`
                          : `Collect your 2 sets of uniforms (jerseys) — included with your membership`}
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Height (cm)</Label>
                      <Input
                        type="number"
                        className="h-10 mt-1"
                        placeholder="e.g., 170"
                        value={jerseyForm.height}
                        onChange={(e) => setJerseyForm({ ...jerseyForm, height: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Weight (kg)</Label>
                      <Input
                        type="number"
                        className="h-10 mt-1"
                        placeholder="e.g., 65"
                        value={jerseyForm.weight}
                        onChange={(e) => setJerseyForm({ ...jerseyForm, weight: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Name on Jersey</Label>
                      <Input
                        type="text"
                        className="h-10 mt-1"
                        placeholder="e.g., AARAV"
                        maxLength="12"
                        value={jerseyForm.name}
                        onChange={(e) => setJerseyForm({ ...jerseyForm, name: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Jersey Number (0-999)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="999"
                        className="h-10 mt-1"
                        placeholder="e.g., 23"
                        value={jerseyForm.number}
                        onChange={(e) => setJerseyForm({ ...jerseyForm, number: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm">Jersey Size (Shirt Sizing)</Label>
                      <p className="text-xs text-muted-foreground mb-2">Select your shirt size</p>
                      <div className="flex gap-2 flex-wrap">
                        {JERSEY_SIZES.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setJerseyForm({ ...jerseyForm, size })}
                            className={`px-3 py-2 rounded-lg border text-sm transition ${
                              jerseyForm.size === size
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-input hover:border-primary/50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!user && (
                <p className="text-xs text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link href={`/auth?mode=login&next=/checkout?plan=${plan.id}`} className="underline">Sign in first</Link>
                </p>
              )}
            </Card>

            {/* Sport confirmation */}
            <Card className="p-5 rounded-2xl">
              <div className="flex items-center gap-4">
                {sport.image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{sport.name}</span>
                    <Badge variant="secondary">{plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}</Badge>
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{sport.tagline} · Classes unlocked after payment</p>
                </div>
              </div>
            </Card>

            {/* Payment info */}
            <Card className="p-6 md:p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-1"><Lock className="w-5 h-5" /><h2 className="font-display font-bold text-2xl">Payment</h2></div>
              <p className="text-sm text-muted-foreground mb-4">Secure checkout via Razorpay. UPI, cards, netbanking & wallets accepted.</p>
              <div className="flex items-center justify-between rounded-xl border p-4 bg-secondary/40">
                <div className="text-sm font-medium">Razorpay Secure Checkout</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="w-4 h-4" /> 256-bit SSL</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {['UPI', 'Cards', 'Netbanking', 'Wallets', 'EMI'].map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-full bg-background border">{m}</span>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 rounded-2xl lg:sticky lg:top-24">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Order Summary</p>
              <h3 className="font-display font-black text-2xl">{sport.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}</Badge>
                {plan.popular && <Badge className="bg-accent text-black hover:bg-accent">Popular</Badge>}
                {plan.savings && <Badge variant="outline">{plan.savings}</Badge>}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{plan.price.toLocaleString('en-IN')}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {enrollmentFee > 0 && (
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Enrollment Fee</span>
                      <div className="text-[10px] text-muted-foreground">One-time (2 Uniforms)</div>
                    </div>
                    <span>₹{enrollmentFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Per month</span><span>₹{perMonth.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-baseline">
                <div>
                  <span className="font-semibold">Total</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {enrollmentFee > 0 
                      ? `${plan.duration_months}M membership + one-time jersey fee`
                      : `${plan.duration_months}M membership`}
                  </p>
                </div>
                <span className="font-display font-black text-3xl">₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>

              {/* Coupon */}
              <div className="mt-4">
                <Label className="text-xs">Coupon code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="text" placeholder="Enter code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={processing || (!!appliedCoupon && !!appliedEnrollmentCoupon)}
                    className="flex-1 h-10"
                  />
                  {!(appliedCoupon && appliedEnrollmentCoupon)
                    ? <Button type="button" variant="outline" onClick={applyCoupon} disabled={processing || !couponCode.trim()} className="h-10">Apply</Button>
                    : <Button type="button" variant="ghost" onClick={() => { 
                        setAppliedCoupon(null); 
                        setAppliedEnrollmentCoupon(null); 
                        setCouponCode(''); 
                        if (enrollmentFee > 0) setEnrollmentFee(2000);
                      }} disabled={processing} className="h-10">Remove All</Button>
                  }
                </div>
                {/* Show applied coupons */}
                {appliedCoupon && (
                  <div className="mt-2 text-xs text-green-600 flex items-center justify-between">
                    <span>✓ {appliedCoupon.code}: {appliedCoupon.description}</span>
                    <button onClick={() => { setAppliedCoupon(null); }} className="text-xs hover:underline">Remove</button>
                  </div>
                )}
                {appliedEnrollmentCoupon && (
                  <div className="mt-2 text-xs text-green-600 flex items-center justify-between">
                    <span>✓ {appliedEnrollmentCoupon.code}: {appliedEnrollmentCoupon.description}</span>
                    <button onClick={() => { setAppliedEnrollmentCoupon(null); setEnrollmentFee(2000); }} className="text-xs hover:underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Pay button — always enabled, loads Razorpay on click */}
              <Button
                onClick={pay}
                disabled={processing}
                className="w-full mt-6 h-14 bg-accent text-black hover:bg-accent/90 text-base font-semibold"
              >
                {processing
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing…</>
                  : <><CreditCard className="w-5 h-5 mr-2" /> Pay ₹{finalPrice.toLocaleString('en-IN')}</>
                }
              </Button>

              <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-primary mt-0.5" /> {sport.name} classes included</li>
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-primary mt-0.5" /> Unlimited bookings</li>
                {plan.pause_days > 0 && <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-primary mt-0.5" /> One free pause (up to {plan.pause_days} days)</li>}
                <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-primary mt-0.5" /> Progress & level tracking</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><CheckoutInner /></Suspense>;
}
