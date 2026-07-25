import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb, clean } from '@/lib/flowternity/db';
import { hashPassword, verifyPassword, createToken, setAuthCookie, clearAuthCookie, getSession } from '@/lib/flowternity/auth-server';
import { SPORTS, MEMBERSHIPS, MAX_PAUSE_DAYS, KIDS_LEVELS, COUPONS } from '@/lib/flowternity/config';
import { metricsForSport, isValidMetricKey, SPORT_METRICS, GENERIC_METRICS } from '@/lib/flowternity/metrics';
import { createOrder, verifySignature, publicKeyId, getRazorpay, verifyWebhookSignature, refundPayment } from '@/lib/flowternity/razorpay';
import { sendPasswordResetEmail, sendWelcomeEmail, sendOnboardingEmail, sendBookingConfirmationEmail, sendMembershipPurchaseEmail } from '@/lib/flowternity/email';

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

const j = (data, status = 200) => cors(NextResponse.json(data, { status }));
const err = (message, status = 400) => j({ error: message }, status);

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })); }

async function requireUser() {
  const session = await getSession();
  if (!session) return { error: err('Unauthorized', 401) };
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: session.sub });
  if (!user) return { error: err('User not found', 401) };
  return { user, session };
}

function publicUser(u) {
  if (!u) return null;
  const { password_hash, _id, ...rest } = u;
  return rest;
}

async function upsertAthleteProfile(db, { user_id, athlete_name, dob, gender, sport_id }) {
  // Find existing profile for this user
  const existing = await db.collection('child_profiles').findOne({ parent_id: user_id });
  if (existing) {
    // Add sport if not already there
    const sports = Array.isArray(existing.selected_sports) ? existing.selected_sports : [];
    if (sport_id && !sports.includes(sport_id)) {
      await db.collection('child_profiles').updateOne(
        { id: existing.id },
        { $addToSet: { selected_sports: sport_id } }
      );
    }
    return { ...existing, selected_sports: sport_id && !sports.includes(sport_id) ? [...sports, sport_id] : sports };
  }
  // Create new profile
  const profile = {
    id: uuidv4(),
    parent_id: user_id,
    athlete_name: athlete_name || '',
    child_name: athlete_name || '', // backward compat
    dob: dob || '',
    gender: gender || '',
    selected_sports: sport_id ? [sport_id] : [],
    created_at: new Date(),
  };
  await db.collection('child_profiles').insertOne(profile);
  return profile;
}

async function seedKidLevels(db, { user_id, child_profile_id, sport_ids }) {
  if (!Array.isArray(sport_ids) || sport_ids.length === 0) return;
  const now = new Date();
  for (const sport_id of sport_ids) {
    const existing = await db.collection('athlete_levels').findOne({
      user_id, child_profile_id: child_profile_id || null, sport_id,
    });
    if (existing) continue;
    await db.collection('athlete_levels').insertOne({
      id: uuidv4(),
      user_id,
      child_profile_id: child_profile_id || null,
      sport_id,
      level: 1,
      created_at: now,
      updated_at: now,
      updated_by: null,
    });
  }
}

function levelInfo(level) {
  return KIDS_LEVELS.find(l => l.level === Number(level)) || KIDS_LEVELS[0];
}

// Idempotent: activate a membership from a Razorpay order_id. Used by both
// /checkout/verify (client-driven) and the /webhooks/razorpay (server-driven, race-proof).
// Returns { alreadyProcessed, user_membership, payment }.
async function activateOrderMembership(db, { razorpay_order_id, razorpay_payment_id, razorpay_signature = null, source = 'client' }) {
  const paymentRec = await db.collection('payments').findOne({ razorpay_order_id });
  if (!paymentRec) return { error: 'Order not found', status: 404 };
  if (paymentRec.status === 'success') {
    const existing = paymentRec.user_membership_id ? await db.collection('user_memberships').findOne({ id: paymentRec.user_membership_id }) : null;
    return { alreadyProcessed: true, payment: paymentRec, user_membership: existing };
  }
  const mem = MEMBERSHIPS.find(m => m.id === paymentRec.membership_id);
  if (!mem) return { error: 'Membership not found', status: 404 };
  const user = await db.collection('users').findOne({ id: paymentRec.user_id });
  if (!user) return { error: 'User not found', status: 404 };
  const meta = paymentRec.pending_meta || {};
  const now = new Date();
  const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + mem.duration_months);
  const um = {
    id: uuidv4(),
    user_id: user.id,
    child_profile_id: meta.child_profile_id || null,
    membership_id: mem.id,
    membership_snapshot: mem,
    sport_id: mem.sport_id,
    selected_sports: [mem.sport_id],
    start_date: now, expiry_date: expiry,
    status: 'active', pause_days: 0, paused_at: null,
    created_at: now,
  };
  await db.collection('user_memberships').insertOne(um);
  // Ensure the athlete profile has this sport in selected_sports
  if (meta.child_profile_id && mem.sport_id) {
    await db.collection('child_profiles').updateOne(
      { id: meta.child_profile_id },
      { $addToSet: { selected_sports: mem.sport_id } }
    );
  }
  await db.collection('payments').updateOne({ razorpay_order_id }, {
    $set: {
      status: 'success',
      razorpay_payment_id,
      ...(razorpay_signature ? { razorpay_signature } : {}),
      ref: razorpay_payment_id,
      user_membership_id: um.id,
      verified_at: new Date(),
      activation_source: source, // 'client' | 'webhook'
    },
  });
  if (meta.child_profile_id && mem.sport_id) {
    await seedKidLevels(db, { user_id: user.id, child_profile_id: meta.child_profile_id, sport_ids: [mem.sport_id] });
  }
  try {
    await sendMembershipPurchaseEmail({
      to: user.email, name: user.full_name,
      membershipName: mem.name, months: mem.duration_months, price: mem.price, expiryDate: expiry,
    });
  } catch (e) { /* non-fatal */ }
  const updatedPayment = await db.collection('payments').findOne({ razorpay_order_id });
  return { alreadyProcessed: false, payment: updatedPayment, user_membership: um };
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    const db = await getDb();

    // -------- HEALTH --------
    if (route === '/' || route === '/root') return j({ ok: true, app: 'Flowternity', ts: Date.now() });

    // -------- CONFIG --------
    if (route === '/config' && method === 'GET') {
      return j({ sports: SPORTS, memberships: MEMBERSHIPS });
    }

    // -------- METRICS CATALOG --------
    if (route === '/metrics/catalog' && method === 'GET') {
      const { searchParams } = new URL(request.url);
      const sport = searchParams.get('sport');
      if (sport) return j({ sport_id: sport, metrics: metricsForSport(sport), levels: KIDS_LEVELS });
      const catalog = {};
      for (const s of SPORTS) catalog[s.id] = metricsForSport(s.id);
      return j({ catalog, levels: KIDS_LEVELS });
    }

    // -------- ATHLETE METRICS + LEVELS (view) --------
    // GET /api/athletes/:user_id/performance -- adult sees self, parent sees child, admin sees anyone
    const perfMatch = route.match(/^\/athletes\/([^/]+)\/performance$/);
    if (perfMatch && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const targetId = perfMatch[1];
      const isSelf = targetId === auth.user.id;
      const isAdmin = auth.user.role === 'admin';
      const isParentOfTarget = auth.user.role === 'parent' && (await db.collection('child_profiles').findOne({ parent_id: auth.user.id, id: targetId }));
      // Support looking up by child_profile_id too (for parents/admins)
      const targetChild = await db.collection('child_profiles').findOne({ id: targetId });
      let user_id_for_metrics = targetId;
      let child_profile_id_for_metrics = null;
      if (targetChild) {
        user_id_for_metrics = targetChild.parent_id;
        child_profile_id_for_metrics = targetChild.id;
      }
      if (!isSelf && !isAdmin && !isParentOfTarget && !(targetChild && targetChild.parent_id === auth.user.id)) {
        return err('Forbidden', 403);
      }
      const metricsDocs = await db.collection('athlete_metrics').find({
        user_id: user_id_for_metrics,
        ...(child_profile_id_for_metrics ? { child_profile_id: child_profile_id_for_metrics } : { $or: [{ child_profile_id: null }, { child_profile_id: { $exists: false } }] }),
      }).toArray();
      const levelDocs = await db.collection('athlete_levels').find({
        user_id: user_id_for_metrics,
        ...(child_profile_id_for_metrics ? { child_profile_id: child_profile_id_for_metrics } : { $or: [{ child_profile_id: null }, { child_profile_id: { $exists: false } }] }),
      }).toArray();

      // Also include metrics/levels from ALL profiles belonging to this user
      // so that duplicate profiles from before the upsert fix don't hide data
      const allProfiles = await db.collection('child_profiles').find({ parent_id: user_id_for_metrics }).toArray();
      const allProfileIds = allProfiles.map(p => p.id);
      const allMetricsDocs = allProfileIds.length ? await db.collection('athlete_metrics').find({
        user_id: user_id_for_metrics,
        child_profile_id: { $in: allProfileIds },
      }).toArray() : [];
      const allLevelDocs = allProfileIds.length ? await db.collection('athlete_levels').find({
        user_id: user_id_for_metrics,
        child_profile_id: { $in: allProfileIds },
      }).toArray() : [];

      // Merge: primary profile docs take precedence, then fall back to any profile's data
      const mergedMetrics = [...allMetricsDocs, ...metricsDocs];
      const mergedLevels = [...allLevelDocs, ...levelDocs];

      // Collect all enrolled sports from all profiles + active memberships
      const enrolledSportIds = new Set([
        ...allProfiles.flatMap(p => p.selected_sports || []),
        ...mergedMetrics.map(d => d.sport_id),
        ...mergedLevels.map(d => d.sport_id),
      ]);

      // Enrich per sport
      const bySport = {};

      // Seed every enrolled sport as an empty entry first
      for (const sid of enrolledSportIds) {
        bySport[sid] = { sport_id: sid, scores: {}, level: null };
      }

      for (const doc of mergedMetrics) {
        bySport[doc.sport_id] = bySport[doc.sport_id] || { sport_id: doc.sport_id, scores: {}, level: null };
        // Later docs (primary profile) overwrite earlier
        bySport[doc.sport_id].scores = { ...bySport[doc.sport_id].scores, ...doc.scores };
        bySport[doc.sport_id].updated_at = doc.updated_at;
      }
      for (const doc of mergedLevels) {
        bySport[doc.sport_id] = bySport[doc.sport_id] || { sport_id: doc.sport_id, scores: {}, level: null };
        if (!bySport[doc.sport_id].level || doc.level > bySport[doc.sport_id].level) {
          bySport[doc.sport_id].level = doc.level;
          bySport[doc.sport_id].level_info = levelInfo(doc.level);
        }
      }
      const sports = Object.values(bySport).map(s => ({
        ...s,
        sport_name: SPORTS.find(sp => sp.id === s.sport_id)?.name || s.sport_id,
        metrics_catalog: metricsForSport(s.sport_id),
      }));
      return j({ sports, levels_catalog: KIDS_LEVELS });
    }

    // -------- CHECKOUT (Razorpay) --------
    // 1) Authenticated user creates order for existing account
    if (route === '/checkout/order' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { membership_id, child_profile_id, coupon_code } = await request.json();
      const mem = MEMBERSHIPS.find(m => m.id === membership_id);
      if (!mem) return err('Invalid membership');
      if (!child_profile_id) return err('Child profile required');
      if (!getRazorpay()) return err('Payments not configured', 500);
      
      // Validate and apply coupon
      let finalPrice = mem.price;
      let appliedCoupon = null;
      if (coupon_code) {
        const coupon = COUPONS.find(c => c.code.toLowerCase() === coupon_code.toLowerCase());
        if (!coupon) return err('Invalid coupon code');
        // Check if coupon applies to this plan
        if (!coupon.applicable_plans.includes(mem.id)) {
          return err(`This coupon only applies to: ${coupon.applicable_plans.join(', ')}`);
        }
        appliedCoupon = coupon;
        finalPrice = mem.price - coupon.discount_amount;
      }
      
      try {
        const order = await createOrder({
          amountRupees: finalPrice,
          receipt: `sub_${auth.user.id.slice(0, 8)}_${Date.now()}`,
          notes: { user_id: auth.user.id, membership_id: mem.id, coupon_code: appliedCoupon?.code },
        });
        // Save pending payment
        await db.collection('payments').insertOne({
          id: uuidv4(),
          user_id: auth.user.id,
          amount: finalPrice, currency: 'INR',
          original_amount: mem.price,
          status: 'created', method: 'razorpay',
          razorpay_order_id: order.id,
          membership_id: mem.id,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount_percent: appliedCoupon?.discount_percent || null,
          pending_meta: { child_profile_id, selected_sports: [mem.sport_id], sport_id: mem.sport_id },
          created_at: new Date(),
        });
        return j({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: publicKeyId(), membership: mem, applied_coupon: appliedCoupon, final_price: finalPrice });
      } catch (e) {
        return err('Order creation failed: ' + e.message, 500);
      }
    }

    // 2) Public: register + create order
    if (route === '/checkout/register-order' && method === 'POST') {
      const body = await request.json();
      const { full_name, email, password, phone, membership_id, child, coupon_code } = body || {};
      if (!full_name || !email || !password || !membership_id) return err('full_name, email, password, membership_id are required');
      if (password.length < 6) return err('Password must be 6+ chars');
      const mem = MEMBERSHIPS.find(m => m.id === membership_id);
      if (!mem) return err('Invalid membership');
      
      // Validate and apply coupon
      let finalPrice = mem.price;
      let appliedCoupon = null;
      if (coupon_code) {
        const coupon = COUPONS.find(c => c.code.toLowerCase() === coupon_code.toLowerCase());
        if (!coupon) return err('Invalid coupon code');
        // Check if coupon applies to this plan
        if (!coupon.applicable_plans.includes(mem.id)) {
          return err(`This coupon only applies to: ${coupon.applicable_plans.join(', ')}`);
        }
        appliedCoupon = coupon;
        finalPrice = mem.price - coupon.discount_amount;
      }
      
      if (!child || (!child.athlete_name && !child.child_name) || !child.dob) return err('Athlete name & DOB required');

      const emailLower = email.toLowerCase();
      const existing = await db.collection('users').findOne({ email: emailLower });
      if (existing) return err('Email already registered — please sign in first, then buy a membership.', 409);
      const isAdmin = emailLower === (process.env.ADMIN_EMAIL || '').toLowerCase();
      if (!getRazorpay()) return err('Payments not configured', 500);

      const newUser = {
        id: uuidv4(), role: isAdmin ? 'admin' : 'member', full_name, email: emailLower, phone: phone || '',
        address: '', emergency_contact: '', photo_url: '',
        password_hash: hashPassword(password), created_at: new Date(),
      };
      await db.collection('users').insertOne(newUser);

      const childProfile = {
        id: uuidv4(), parent_id: newUser.id,
        athlete_name: child.athlete_name || child.child_name,
        child_name: child.athlete_name || child.child_name, // backward compat
        dob: child.dob, gender: child.gender || '',
        selected_sports: [mem.sport_id],
        created_at: new Date(),
      };
      await db.collection('child_profiles').insertOne(childProfile);

      try {
        const order = await createOrder({
          amountRupees: finalPrice,
          receipt: `reg_${newUser.id.slice(0, 8)}_${Date.now()}`,
          notes: { user_id: newUser.id, membership_id: mem.id, flow: 'register-and-pay', coupon_code: appliedCoupon?.code },
        });
        await db.collection('payments').insertOne({
          id: uuidv4(), user_id: newUser.id,
          amount: finalPrice, currency: 'INR',
          original_amount: mem.price,
          status: 'created', method: 'razorpay',
          razorpay_order_id: order.id,
          membership_id: mem.id,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount_percent: appliedCoupon?.discount_percent || null,
          pending_meta: {
            child_profile_id: childProfile.id,
            selected_sports: [mem.sport_id],
            sport_id: mem.sport_id,
            flow: 'register-and-pay',
          },
          created_at: new Date(),
        });
        // Sign in the user immediately (they'll only get membership after verify)
        const token = createToken(newUser);
        await setAuthCookie(token);
        return j({
          order_id: order.id, amount: order.amount, currency: order.currency,
          key_id: publicKeyId(), membership: mem,
          user: publicUser(newUser),
          child_profile: clean(childProfile),
          applied_coupon: appliedCoupon,
          final_price: finalPrice,
        });
      } catch (e) {
        // Roll back user + child if order creation failed
        await db.collection('users').deleteOne({ id: newUser.id });
        await db.collection('child_profiles').deleteOne({ id: childProfile.id });
        return err('Order creation failed: ' + e.message, 500);
      }
    }

    // 3) Verify signature and activate membership (client-driven path)
    if (route === '/checkout/verify' && method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return err('Missing payment fields');
      if (!verifySignature({ order_id: razorpay_order_id, payment_id: razorpay_payment_id, signature: razorpay_signature })) {
        await db.collection('payments').updateOne({ razorpay_order_id }, { $set: { status: 'failed', failure_reason: 'invalid_signature', updated_at: new Date() } });
        return err('Invalid signature', 400);
      }
      const result = await activateOrderMembership(db, {
        razorpay_order_id, razorpay_payment_id, razorpay_signature, source: 'client',
      });
      if (result.error) return err(result.error, result.status || 500);
      return j({
        ok: true,
        payment: clean(result.payment),
        user_membership: result.user_membership ? clean(result.user_membership) : null,
        already_processed: result.alreadyProcessed,
      });
    }

    // -------- RAZORPAY WEBHOOK (public, server-to-server) --------
    // Configure this URL in Razorpay Dashboard → Settings → Webhooks with a shared secret,
    // then set RAZORPAY_WEBHOOK_SECRET in .env. This is the source-of-truth for
    // activation — the client /checkout/verify is a UX nicety.
    if (route === '/webhooks/razorpay' && method === 'POST') {
      const rawBody = await request.text();
      const signature = request.headers.get('x-razorpay-signature') || request.headers.get('X-Razorpay-Signature');
      const check = verifyWebhookSignature(rawBody, signature);
      if (!check.ok) {
        console.warn('[razorpay-webhook] rejected:', check.reason);
        return err('Invalid signature', 400);
      }
      let payload;
      try { payload = JSON.parse(rawBody); }
      catch { return err('Invalid JSON', 400); }
      const event = payload.event;
      const payment = payload?.payload?.payment?.entity;
      const refund = payload?.payload?.refund?.entity;
      try {
        if (event === 'payment.captured' && payment) {
          const orderId = payment.order_id;
          const paymentId = payment.id;
          if (orderId) {
            const result = await activateOrderMembership(db, {
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: null,
              source: 'webhook',
            });
            if (result.error) {
              console.warn('[razorpay-webhook] activation error:', result.error);
              // Return 200 anyway so Razorpay doesn't keep retrying for unknown orders (e.g., mock orders)
              return j({ ok: true, note: result.error });
            }
          }
        } else if (event === 'payment.failed' && payment) {
          const orderId = payment.order_id;
          if (orderId) {
            await db.collection('payments').updateOne(
              { razorpay_order_id: orderId, status: { $ne: 'success' } },
              { $set: {
                status: 'failed',
                razorpay_payment_id: payment.id,
                failure_reason: payment.error_description || payment.error_code || 'payment.failed',
                updated_at: new Date(),
                activation_source: 'webhook',
              } }
            );
          }
        } else if (event && event.startsWith('refund.') && refund) {
          // Mark linked payment refunded if we haven't already (admin refund path also does this)
          const paymentId = refund.payment_id;
          if (paymentId) {
            await db.collection('payments').updateOne(
              { razorpay_payment_id: paymentId },
              { $set: {
                status: 'refunded',
                refunded_at: new Date(),
                refund_id: refund.id,
                refund_status: refund.status,
                updated_at: new Date(),
              } }
            );
            const p = await db.collection('payments').findOne({ razorpay_payment_id: paymentId });
            if (p?.user_membership_id) {
              await db.collection('user_memberships').updateOne(
                { id: p.user_membership_id },
                { $set: { status: 'expired', refunded_at: new Date() } }
              );
            }
          }
        }
      } catch (e) {
        console.error('[razorpay-webhook] handler error:', e);
        // Still return 200 to prevent Razorpay retry storms — we've logged the issue
      }
      return j({ ok: true });
    }

    // -------- AUTH --------
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json();
      const { full_name, email, phone, password } = body || {};
      if (!full_name || !email || !password) return err('full_name, email, password required');
      if (password.length < 6) return err('Password must be 6+ chars');
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existing) return err('Email already registered', 409);
      const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();
      const user = {
        id: uuidv4(),
        role: isAdmin ? 'admin' : 'member',
        full_name,
        email: email.toLowerCase(),
        phone: phone || '',
        address: '',
        emergency_contact: '',
        photo_url: '',
        password_hash: hashPassword(password),
        created_at: new Date(),
      };
      await db.collection('users').insertOne(user);
      const token = createToken(user);
      await setAuthCookie(token);
      // Onboarding email — best-effort, non-fatal
      try { await sendOnboardingEmail({ to: user.email, name: user.full_name }); } catch (e) { /* non-fatal */ }
      return j({ user: publicUser(user) });
    }

    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json();
      if (!email || !password) return err('email & password required');
      const u = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!u || !verifyPassword(password, u.password_hash)) return err('Invalid credentials', 401);
      const token = createToken(u);
      await setAuthCookie(token);
      return j({ user: publicUser(u) });
    }

    if (route === '/auth/logout' && method === 'POST') {
      await clearAuthCookie();
      return j({ ok: true });
    }

    if (route === '/auth/me' && method === 'GET') {
      const session = await getSession();
      if (!session) return err('Unauthenticated', 401);
      const u = await db.collection('users').findOne({ id: session.sub });
      if (!u) return err('User not found', 404);
      
      // Get all active memberships (users can hold multiple sport memberships)
      const activeMemberships = await db.collection('user_memberships').find({
        user_id: u.id,
        status: 'active',
        expiry_date: { $gt: new Date() }
      }).toArray();
      
      return j({ user: publicUser(u), active_memberships: activeMemberships.map(clean) });
    }

    // -------- PROFILE --------
    if (route === '/profile' && method === 'PATCH') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const body = await request.json();
      const allowed = ['full_name', 'phone', 'address', 'emergency_contact', 'photo_url'];
      const update = {};
      for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
      await db.collection('users').updateOne({ id: auth.user.id }, { $set: update });
      const u = await db.collection('users').findOne({ id: auth.user.id });
      return j({ user: publicUser(u) });
    }

    // -------- CHILD PROFILES --------
    if (route === '/children' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { athlete_name, child_name, dob, gender, selected_sports } = await request.json();
      const name = athlete_name || child_name;
      if (!name || !dob) return err('athlete_name & dob required');
      // Upsert — reuse existing profile if one already exists
      const sport_id = Array.isArray(selected_sports) ? selected_sports[0] : null;
      const profile = await upsertAthleteProfile(db, { user_id: auth.user.id, athlete_name: name, dob, gender, sport_id });
      return j({ child: clean(profile) });
    }

    if (route === '/children' && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const kids = await db.collection('child_profiles').find({ parent_id: auth.user.id }).toArray();
      return j({ children: kids.map(clean) });
    }

    // -------- FREE TRIAL (public, no auth) --------
    if (route === '/trial/classes' && method === 'GET') {
      const url = new URL(request.url);
      const sport = url.searchParams.get('sport');
      const today = new Date().toISOString().slice(0, 10);
      const filter = { date: { $gte: today } };
      if (sport) filter.sport_id = sport;
      const classes = await db.collection('classes').find(filter).sort({ date: 1, start_time: 1 }).limit(30).toArray();
      const classIds = classes.map(c => c.id);
      const bookings = classIds.length ? await db.collection('bookings').find({ class_id: { $in: classIds }, status: 'booked' }).toArray() : [];
      const counts = bookings.reduce((a, b) => (a[b.class_id] = (a[b.class_id] || 0) + 1, a), {});
      return j({
        classes: classes.map(c => ({
          ...clean(c),
          sport: SPORTS.find(s => s.id === c.sport_id) || null,
          booked_count: counts[c.id] || 0,
          seats_left: Math.max(0, c.capacity - (counts[c.id] || 0)),
        })),
      });
    }

    if (route === '/trial/book' && method === 'POST') {
      const body = await request.json();
      const { full_name, email, phone, sport_id, class_id, message } = body || {};
      if (!full_name || !email || !phone || !sport_id) return err('full_name, email, phone, sport_id required');
      const existingLead = await db.collection('trial_leads').findOne({
        email: email.toLowerCase(),
        created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
      if (existingLead) return err('You have already booked a free class recently. Check your email or contact us.', 409);

      let classInfo = null;
      if (class_id) {
        const cls = await db.collection('classes').findOne({ id: class_id });
        if (!cls) return err('Selected class not found', 404);
        const activeCount = await db.collection('bookings').countDocuments({ class_id, status: 'booked' });
        if (activeCount >= cls.capacity) return err('That class is full — please pick another slot.', 409);
        classInfo = cls;
      }

      const lead = {
        id: uuidv4(),
        full_name,
        email: email.toLowerCase(),
        phone,
        sport_id,
        class_id: class_id || null,
        message: message || '',
        status: class_id ? 'scheduled' : 'pending',
        created_at: new Date(),
      };
      await db.collection('trial_leads').insertOne(lead);

      // Best-effort confirmation email — reuse booking confirmation email if class picked
      let email_sent = false;
      try {
        if (classInfo) {
          const sport = SPORTS.find(s => s.id === classInfo.sport_id);
          const r = await sendBookingConfirmationEmail({
            to: lead.email, name: lead.full_name,
            sport: sport?.name || classInfo.sport_id,
            date: classInfo.date, startTime: classInfo.start_time, endTime: classInfo.end_time,
            coach: classInfo.coach_name,
          });
          email_sent = !!r?.data;
        }
      } catch (e) { /* non-fatal */ }

      return j({ lead: clean(lead), email_sent, class: classInfo ? clean(classInfo) : null });
    }

    // -------- REGISTER + PAY (combined signup) --------
    if (route === '/checkout/register-and-pay' && method === 'POST') {
      const body = await request.json();
      const { full_name, email, password, phone, membership_id, child } = body || {};
      if (!full_name || !email || !password || !membership_id) {
        return err('full_name, email, password, membership_id are required');
      }
      if (password.length < 6) return err('Password must be 6+ chars');

      const mem = MEMBERSHIPS.find(m => m.id === membership_id);
      if (!mem) return err('Invalid membership');

      const emailLower = email.toLowerCase();
      const existing = await db.collection('users').findOne({ email: emailLower });
      if (existing) return err('Email already registered — please sign in first, then buy a membership.', 409);

      const isAdmin = emailLower === (process.env.ADMIN_EMAIL || '').toLowerCase();

      if (!child || (!child.athlete_name && !child.child_name) || !child.dob) return err('Athlete name & DOB required');

      const newUser = {
        id: uuidv4(),
        role: isAdmin ? 'admin' : 'member',
        full_name,
        email: emailLower,
        phone: phone || '',
        address: '', emergency_contact: '', photo_url: '',
        password_hash: hashPassword(password),
        created_at: new Date(),
      };
      await db.collection('users').insertOne(newUser);

      const athleteName = child.athlete_name || child.child_name;
      const childProfile = {
        id: uuidv4(), parent_id: newUser.id,
        athlete_name: athleteName,
        child_name: athleteName, // backward compat
        dob: child.dob, gender: child.gender || '',
        selected_sports: [mem.sport_id],
        created_at: new Date(),
      };
      await db.collection('child_profiles').insertOne(childProfile);

      const now = new Date();
      const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + mem.duration_months);
      const um = {
        id: uuidv4(),
        user_id: newUser.id,
        child_profile_id: childProfile.id,
        membership_id: mem.id,
        membership_snapshot: mem,
        sport_id: mem.sport_id,
        selected_sports: [mem.sport_id],
        start_date: now, expiry_date: expiry,
        status: 'active', pause_days: 0, paused_at: null,
        created_at: now,
      };
      await db.collection('user_memberships').insertOne(um);

      // Seed default level 1 for the sport
      await seedKidLevels(db, { user_id: newUser.id, child_profile_id: childProfile.id, sport_ids: [mem.sport_id] });

      const payment = {
        id: uuidv4(), user_id: newUser.id, amount: mem.price, currency: 'INR',
        status: 'success', method: 'mock',
        ref: 'MOCK_' + uuidv4().slice(0, 8).toUpperCase(),
        membership_id: mem.id, user_membership_id: um.id, created_at: now,
      };
      await db.collection('payments').insertOne(payment);

      // Auth cookie — user is now signed in
      const token = createToken(newUser);
      await setAuthCookie(token);

      // Best-effort emails
      try {
        await sendMembershipPurchaseEmail({
          to: newUser.email, name: newUser.full_name,
          membershipName: mem.name, months: mem.duration_months, price: mem.price, expiryDate: expiry,
        });
      } catch (e) { /* non-fatal */ }
      // Also send onboarding email since this is a new user
      try { await sendOnboardingEmail({ to: newUser.email, name: newUser.full_name }); } catch (e) { /* non-fatal */ }

      return j({
        user: publicUser(newUser),
        child_profile: clean(childProfile),
        user_membership: clean(um),
        payment: clean(payment),
      });
    }

    // -------- CHECKOUT (MOCK PAYMENT) --------
    if (route === '/checkout/mock' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { membership_id, child_profile_id } = await request.json();
      const mem = MEMBERSHIPS.find(m => m.id === membership_id);
      if (!mem) return err('Invalid membership');

      if (!child_profile_id) return err('Child profile required');

      const now = new Date();
      const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + mem.duration_months);

      const um = {
        id: uuidv4(),
        user_id: auth.user.id,
        child_profile_id,
        membership_id: mem.id,
        membership_snapshot: mem,
        sport_id: mem.sport_id,
        selected_sports: [mem.sport_id],
        start_date: now,
        expiry_date: expiry,
        status: 'active',
        pause_days: 0,
        paused_at: null,
        created_at: now,
      };
      await db.collection('user_memberships').insertOne(um);

      // Seed default level 1 for the sport
      await seedKidLevels(db, { user_id: auth.user.id, child_profile_id, sport_ids: [mem.sport_id] });

      const payment = {
        id: uuidv4(),
        user_id: auth.user.id,
        amount: mem.price,
        currency: 'INR',
        status: 'success',
        method: 'mock',
        ref: 'MOCK_' + uuidv4().slice(0, 8).toUpperCase(),
        membership_id: mem.id,
        user_membership_id: um.id,
        created_at: now,
      };
      await db.collection('payments').insertOne(payment);

      // Fire-and-forget email confirmation
      await sendMembershipPurchaseEmail({
        to: auth.user.email, name: auth.user.full_name,
        membershipName: mem.name, months: mem.duration_months, price: mem.price, expiryDate: expiry
      });

      return j({ user_membership: clean(um), payment: clean(payment) });
    }

    // -------- DASHBOARD --------
    if (route === '/dashboard' && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const now = new Date();

      const memberships = await db.collection('user_memberships')
        .find({ user_id: auth.user.id }).sort({ created_at: -1 }).toArray();

      // Auto-expire
      for (const m of memberships) {
        if (m.status === 'active' && new Date(m.expiry_date) < now) {
          await db.collection('user_memberships').updateOne({ id: m.id }, { $set: { status: 'expired' } });
          m.status = 'expired';
        }
      }

      const activeMemberships = memberships.filter(m => m.status === 'active' || m.status === 'paused');
      const activeMembership = activeMemberships[0] || null;

      const bookings = await db.collection('bookings').find({ user_id: auth.user.id, status: 'booked' }).toArray();
      const classIds = bookings.map(b => b.class_id);
      const classes = classIds.length ? await db.collection('classes').find({ id: { $in: classIds } }).toArray() : [];
      const upcoming = bookings.map(b => {
        const cls = classes.find(c => c.id === b.class_id);
        if (!cls) return null;
        const sport = SPORTS.find(s => s.id === cls.sport_id);
        return { booking_id: b.id, class: clean(cls), sport_name: sport?.name || cls.sport_id };
      }).filter(x => x && new Date(x.class.date) >= new Date(now.toDateString()))
        .sort((a, b) => new Date(a.class.date + 'T' + a.class.start_time) - new Date(b.class.date + 'T' + b.class.start_time));

      const payments = await db.collection('payments').find({ user_id: auth.user.id }).sort({ created_at: -1 }).limit(5).toArray();
      const announcements = await db.collection('announcements').find({}).sort({ created_at: -1 }).limit(3).toArray();

      return j({
        user: publicUser(auth.user),
        active_membership: activeMembership ? clean(activeMembership) : null,
        active_memberships: activeMemberships.map(clean),
        memberships: memberships.map(clean),
        upcoming_classes: upcoming,
        payments: payments.map(clean),
        announcements: announcements.map(clean),
      });
    }

    // -------- CLASSES --------
    if (route === '/classes' && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const url = new URL(request.url);
      const sport = url.searchParams.get('sport');
      const day = url.searchParams.get('day'); // YYYY-MM-DD

      // Only show classes for sports the user has an active membership for.
      // Check sport_id field (new), membership_snapshot.sport_id, and selected_sports (legacy).
      const activeMems = await db.collection('user_memberships').find({
        user_id: auth.user.id,
        status: 'active',
        expiry_date: { $gt: new Date() },
      }).toArray();

      // Collect all sport IDs from any field that could hold them
      const memberSportIds = [...new Set(activeMems.flatMap(m => {
        const ids = [];
        if (m.sport_id) ids.push(m.sport_id);
        if (m.membership_snapshot?.sport_id) ids.push(m.membership_snapshot.sport_id);
        if (Array.isArray(m.selected_sports)) ids.push(...m.selected_sports);
        return ids;
      }).filter(Boolean))];

      // Admin sees everything
      const isAdmin = auth.user.role === 'admin';

      const filter = {};
      if (sport) {
        // If requesting a specific sport, verify they have access (unless admin)
        if (!isAdmin && !memberSportIds.includes(sport)) {
          return j({ classes: [] });
        }
        filter.sport_id = sport;
      } else if (!isAdmin) {
        // No sport filter — limit to their memberships
        if (memberSportIds.length === 0) return j({ classes: [] });
        filter.sport_id = { $in: memberSportIds };
      }

      if (day) filter.date = day;
      const today = new Date().toISOString().slice(0, 10);
      if (!filter.date) filter.date = { $gte: today };

      const classes = await db.collection('classes').find(filter).sort({ date: 1, start_time: 1 }).limit(200).toArray();

      // enrich with booked count & sport
      const classIds = classes.map(c => c.id);
      const bookings = classIds.length
        ? await db.collection('bookings').find({ class_id: { $in: classIds }, status: 'booked' }).toArray()
        : [];
      const counts = bookings.reduce((acc, b) => (acc[b.class_id] = (acc[b.class_id] || 0) + 1, acc), {});

      const session = await getSession();
      const myBookings = session ? new Set(bookings.filter(b => b.user_id === session.sub).map(b => b.class_id)) : new Set();

      const enriched = classes.map(c => ({
        ...clean(c),
        booked_count: counts[c.id] || 0,
        sport: SPORTS.find(s => s.id === c.sport_id) || null,
        is_booked: myBookings.has(c.id),
      }));
      return j({ classes: enriched, member_sport_ids: isAdmin ? null : memberSportIds });
    }

    // -------- BOOKINGS --------
    if (route === '/bookings' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { class_id, child_profile_id } = await request.json();
      const cls = await db.collection('classes').findOne({ id: class_id });
      if (!cls) return err('Class not found', 404);

      // Must have an active membership for this specific sport.
      // Check sport_id field first (new memberships), then fall back to
      // membership_snapshot.sport_id and selected_sports for older records.
      const um = await db.collection('user_memberships').findOne({
        user_id: auth.user.id,
        status: 'active',
        expiry_date: { $gt: new Date() },
        $or: [
          { sport_id: cls.sport_id },
          { 'membership_snapshot.sport_id': cls.sport_id },
          { selected_sports: cls.sport_id },
        ],
      });
      if (!um) return err(`No active ${cls.sport_id} membership. Please purchase one to book this class.`, 403);

      const already = await db.collection('bookings').findOne({ user_id: auth.user.id, class_id, status: 'booked' });
      if (already) return err('Already booked', 409);

      // Limit: read max_bookings_per_member from settings (default 3)
      const settingsDoc = await db.collection('settings').findOne({ key: 'global' });
      const maxBookings = settingsDoc?.max_bookings_per_member ?? 3;
      const today = new Date().toISOString().slice(0, 10);
      const upcomingClassIds = (await db.collection('bookings').find({ user_id: auth.user.id, status: 'booked' }).toArray()).map(b => b.class_id);
      const upcomingCount = upcomingClassIds.length
        ? await db.collection('classes').countDocuments({ id: { $in: upcomingClassIds }, date: { $gte: today } })
        : 0;
      if (upcomingCount >= maxBookings) return err(`You can only have ${maxBookings} upcoming classes booked at a time. Cancel one to book another.`, 409);

      const activeCount = await db.collection('bookings').countDocuments({ class_id, status: 'booked' });
      if (activeCount >= cls.capacity) return err('Class is full', 409);

      const booking = {
        id: uuidv4(),
        user_id: auth.user.id,
        class_id,
        child_profile_id: child_profile_id || null,
        status: 'booked',
        created_at: new Date(),
      };
      await db.collection('bookings').insertOne(booking);

      // Booking confirmation email
      const sport = SPORTS.find(s => s.id === cls.sport_id);
      await sendBookingConfirmationEmail({
        to: auth.user.email, name: auth.user.full_name,
        sport: sport?.name || cls.sport_id,
        date: cls.date, startTime: cls.start_time, endTime: cls.end_time, coach: cls.coach_name
      });

      return j({ booking: clean(booking) });
    }

    const bookingCancelMatch = route.match(/^\/bookings\/([^/]+)\/cancel$/);
    if (bookingCancelMatch && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const bid = bookingCancelMatch[1];
      const b = await db.collection('bookings').findOne({ id: bid, user_id: auth.user.id });
      if (!b) return err('Booking not found', 404);
      await db.collection('bookings').updateOne({ id: bid }, { $set: { status: 'cancelled', cancelled_at: new Date() } });
      return j({ ok: true });
    }

    // -------- MEMBERSHIP PAUSE/RESUME --------
    if (route === '/memberships/pause' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { days, membership_id } = await request.json();
      // Find the specific membership, or fall back to the first active one with pause allowed
      let um;
      if (membership_id) {
        um = await db.collection('user_memberships').findOne({ id: membership_id, user_id: auth.user.id, status: 'active' });
      } else {
        um = await db.collection('user_memberships').findOne({ user_id: auth.user.id, status: 'active' });
      }
      if (!um) return err('No active membership');
      if ((um.pause_days || 0) > 0) return err('You have already used your pause on this membership');
      // Check pause_days from snapshot or live config
      const livePlan = MEMBERSHIPS.find(m => m.id === um.membership_id);
      const allowedPauseDays = um.membership_snapshot?.pause_days ?? livePlan?.pause_days ?? 0;
      if (!(allowedPauseDays > 0)) return err('Pause is only available for annual memberships');
      const d = Math.min(Math.max(parseInt(days) || 7, 1), allowedPauseDays);
      await db.collection('user_memberships').updateOne({ id: um.id }, {
        $set: { status: 'paused', pause_days: d, paused_at: new Date() }
      });
      return j({ ok: true, paused_days: d });
    }

    if (route === '/memberships/resume' && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const { membership_id } = await request.json();
      let um;
      if (membership_id) {
        um = await db.collection('user_memberships').findOne({ id: membership_id, user_id: auth.user.id, status: 'paused' });
      } else {
        um = await db.collection('user_memberships').findOne({ user_id: auth.user.id, status: 'paused' });
      }
      if (!um) return err('No paused membership');
      const newExpiry = new Date(um.expiry_date);
      newExpiry.setDate(newExpiry.getDate() + (um.pause_days || 0));
      await db.collection('user_memberships').updateOne({ id: um.id }, {
        $set: { status: 'active', expiry_date: newExpiry, resumed_at: new Date() }
      });
      return j({ ok: true, new_expiry: newExpiry });
    }

    // -------- FORGOT / RESET PASSWORD (Resend email + in-app link fallback) --------
    if (route === '/auth/forgot' && method === 'POST') {
      const { email } = await request.json();
      if (!email) return err('email required');
      const u = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!u) return j({ ok: true, message: 'If an account exists, a reset link has been generated.', reset_link: null });
      const token = uuidv4() + uuidv4().replace(/-/g, '');
      const expires = new Date(Date.now() + 30 * 60 * 1000);
      await db.collection('password_resets').insertOne({ id: uuidv4(), user_id: u.id, token, expires, used: false, created_at: new Date() });
      const base = process.env.NEXT_PUBLIC_BASE_URL || '';
      const resetLink = `${base}/reset?token=${token}`;
      // Send email (best-effort; falls back to in-app link)
      const emailResult = await sendPasswordResetEmail({ to: u.email, name: u.full_name, resetLink });
      return j({ ok: true, reset_link: resetLink, token, email_sent: !!emailResult.data, email_error: emailResult.error || null, message: emailResult.data ? 'Reset link emailed to you. You can also use the link below.' : 'Use the link below to reset (email delivery failed).' });
    }

    if (route === '/auth/reset' && method === 'POST') {
      const { token, password } = await request.json();
      if (!token || !password) return err('token & password required');
      if (password.length < 6) return err('Password must be 6+ chars');
      const rec = await db.collection('password_resets').findOne({ token, used: false });
      if (!rec) return err('Invalid or used token', 400);
      if (new Date(rec.expires) < new Date()) return err('Token expired', 400);
      await db.collection('users').updateOne({ id: rec.user_id }, { $set: { password_hash: hashPassword(password) } });
      await db.collection('password_resets').updateOne({ id: rec.id }, { $set: { used: true, used_at: new Date() } });
      return j({ ok: true });
    }

    // -------- FULL PROFILE (kids vs adult view) --------
    if (route === '/profile/full' && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const children = await db.collection('child_profiles').find({ parent_id: auth.user.id }).toArray();
      const memberships = await db.collection('user_memberships').find({ user_id: auth.user.id }).sort({ created_at: -1 }).toArray();
      const payments = await db.collection('payments').find({ user_id: auth.user.id }).sort({ created_at: -1 }).limit(20).toArray();
      return j({ user: publicUser(auth.user), children: children.map(clean), memberships: memberships.map(clean), payments: payments.map(clean) });
    }

    // -------- PUBLIC COACHES --------
    if (route === '/coaches' && method === 'GET') {
      const list = await db.collection('coaches').find({}).sort({ created_at: -1 }).toArray();
      return j({ coaches: list.map(clean) });
    }

    // -------- GAMES (login required; join is adult-only) --------
    if (route === '/games' && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const url = new URL(request.url);
      const sport = url.searchParams.get('sport');
      const today = new Date().toISOString().slice(0, 10);
      const filter = { date: { $gte: today } };
      if (sport) filter.sport_id = sport;
      const games = await db.collection('games').find(filter).sort({ date: 1, start_time: 1 }).limit(200).toArray();

      const gameIds = games.map(g => g.id);
      const parts = gameIds.length ? await db.collection('game_participants').find({ game_id: { $in: gameIds } }).toArray() : [];
      const counts = parts.reduce((a, p) => (a[p.game_id] = (a[p.game_id] || 0) + 1, a), {});
      const mine = new Set(parts.filter(p => p.user_id === auth.user.id).map(p => p.game_id));

      return j({
        games: games.map(g => ({
          ...clean(g),
          participants_count: counts[g.id] || 0,
          sport: SPORTS.find(s => s.id === g.sport_id) || null,
          i_joined: mine.has(g.id),
        }))
      });
    }

    const gameDetailMatch = route.match(/^\/games\/([^/]+)$/);
    if (gameDetailMatch && method === 'GET') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const game = await db.collection('games').findOne({ id: gameDetailMatch[1] });
      if (!game) return err('Game not found', 404);
      const parts = await db.collection('game_participants').find({ game_id: game.id }).toArray();
      const uids = parts.map(p => p.user_id);
      const users = uids.length ? await db.collection('users').find({ id: { $in: uids } }).toArray() : [];
      return j({
        game: { ...clean(game), sport: SPORTS.find(s => s.id === game.sport_id) || null },
        participants: parts.map(p => {
          const u = users.find(x => x.id === p.user_id);
          return { user_id: p.user_id, name: u?.full_name || 'Player', joined_at: p.joined_at };
        }),
        i_joined: parts.some(p => p.user_id === auth.user.id),
      });
    }

    const gameJoinMatch = route.match(/^\/games\/([^/]+)\/join$/);
    if (gameJoinMatch && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      const game = await db.collection('games').findOne({ id: gameJoinMatch[1] });
      if (!game) return err('Game not found', 404);
      // Require any active membership to join a game
      const um = await db.collection('user_memberships').findOne({ user_id: auth.user.id, status: 'active', expiry_date: { $gt: new Date() } });
      if (!um) return err('You need an active membership to join a game.', 403);
      const already = await db.collection('game_participants').findOne({ game_id: game.id, user_id: auth.user.id });
      if (already) return err('You already joined this game', 409);
      const count = await db.collection('game_participants').countDocuments({ game_id: game.id });
      if (count >= (game.max_players || 999)) return err('Game is full', 409);
      const p = { id: uuidv4(), game_id: game.id, user_id: auth.user.id, joined_at: new Date() };
      await db.collection('game_participants').insertOne(p);
      return j({ ok: true, participant: clean(p) });
    }

    const gameLeaveMatch = route.match(/^\/games\/([^/]+)\/leave$/);
    if (gameLeaveMatch && method === 'POST') {
      const auth = await requireUser(); if (auth.error) return auth.error;
      await db.collection('game_participants').deleteOne({ game_id: gameLeaveMatch[1], user_id: auth.user.id });
      return j({ ok: true });
    }

    // -------- SETTINGS (public read) --------
    if (route === '/settings' && method === 'GET') {
      const settingsDoc = await db.collection('settings').findOne({ key: 'global' });
      return j({
        max_bookings_per_member: settingsDoc?.max_bookings_per_member ?? 3,
      });
    }

    // -------- ADMIN --------
    if (route.startsWith('/admin/')) {
      const auth = await requireUser(); if (auth.error) return auth.error;
      if (auth.user.role !== 'admin') return err('Admin only', 403);

      if (route === '/admin/classes' && method === 'POST') {
        const { sport_id, coach_name, date, start_time, end_time, capacity } = await request.json();
        if (!sport_id || !date || !start_time || !end_time || !capacity) return err('Missing fields');
        const cls = {
          id: uuidv4(),
          sport_id, coach_name: coach_name || 'Head Coach',
          date, start_time, end_time, capacity: parseInt(capacity),
          created_at: new Date(),
          created_by: auth.user.id,
        };
        await db.collection('classes').insertOne(cls);
        return j({ class: clean(cls) });
      }

      if (route === '/admin/classes' && method === 'GET') {
        const classes = await db.collection('classes').find({}).sort({ date: 1, start_time: 1 }).toArray();
        return j({ classes: classes.map(clean) });
      }

      const delMatch = route.match(/^\/admin\/classes\/([^/]+)$/);
      if (delMatch && method === 'DELETE') {
        await db.collection('classes').deleteOne({ id: delMatch[1] });
        await db.collection('bookings').updateMany({ class_id: delMatch[1] }, { $set: { status: 'cancelled', cancelled_at: new Date() } });
        return j({ ok: true });
      }

      // -------- Bulk class scheduling (recurring) --------
      // POST /admin/classes/bulk { sport_id, coach_name, capacity, start_date, end_date, weekdays: [0..6], slots: [{start_time, end_time}] }
      if (route === '/admin/classes/bulk' && method === 'POST') {
        const body = await request.json();
        const { sport_id, coach_name, capacity, start_date, end_date, weekdays, slots } = body || {};
        if (!sport_id || !start_date || !end_date || !capacity) return err('sport_id, start_date, end_date, capacity required');
        if (!Array.isArray(weekdays) || weekdays.length === 0) return err('weekdays (array of 0-6) required');
        if (!Array.isArray(slots) || slots.length === 0) return err('slots required');
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (isNaN(start) || isNaN(end) || start > end) return err('Invalid date range');
        const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > 366) return err('Date range too large (max 1 year)');
        const wkSet = new Set(weekdays.map(Number));
        const created = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (!wkSet.has(d.getDay())) continue;
          const dateStr = d.toISOString().slice(0, 10);
          for (const slot of slots) {
            if (!slot.start_time || !slot.end_time) continue;
            const cls = {
              id: uuidv4(),
              sport_id,
              coach_name: coach_name || 'Head Coach',
              date: dateStr,
              start_time: slot.start_time,
              end_time: slot.end_time,
              capacity: parseInt(capacity),
              created_at: new Date(),
              created_by: auth.user.id,
              batch_tag: `bulk_${start_date}_${end_date}`,
            };
            created.push(cls);
          }
        }
        if (created.length === 0) return err('No matching dates in range');
        if (created.length > 500) return err('Would create ' + created.length + ' classes; keep under 500 per request');
        await db.collection('classes').insertMany(created);
        return j({ ok: true, count: created.length, classes: created.map(clean) });
      }

      // POST /admin/classes/bulk-rows { rows: [{sport_id, coach_name, date, start_time, end_time, capacity}] }
      if (route === '/admin/classes/bulk-rows' && method === 'POST') {
        const { rows } = await request.json();
        if (!Array.isArray(rows) || rows.length === 0) return err('rows required');
        if (rows.length > 500) return err('Max 500 rows per import');
        const validSports = new Set(SPORTS.map(s => s.id));
        const inserts = [];
        const errors = [];
        rows.forEach((r, i) => {
          if (!r.sport_id || !validSports.has(r.sport_id)) { errors.push({ row: i + 1, error: 'invalid sport_id' }); return; }
          if (!r.date || !r.start_time || !r.end_time || !r.capacity) { errors.push({ row: i + 1, error: 'missing fields' }); return; }
          inserts.push({
            id: uuidv4(),
            sport_id: r.sport_id,
            coach_name: r.coach_name || 'Head Coach',
            date: r.date,
            start_time: r.start_time,
            end_time: r.end_time,
            capacity: parseInt(r.capacity),
            created_at: new Date(),
            created_by: auth.user.id,
            batch_tag: 'csv_import',
          });
        });
        if (inserts.length) await db.collection('classes').insertMany(inserts);
        return j({ ok: true, imported: inserts.length, errors });
      }

      // PATCH /admin/classes/bulk-update { ids: [...], updates: {coach_name, capacity, start_time, end_time} }
      if (route === '/admin/classes/bulk-update' && method === 'PATCH') {
        const { ids, updates } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) return err('ids required');
        const allowed = ['coach_name', 'capacity', 'start_time', 'end_time', 'date'];
        const $set = {};
        for (const k of allowed) if (updates && updates[k] !== undefined) $set[k] = k === 'capacity' ? parseInt(updates[k]) : updates[k];
        if (Object.keys($set).length === 0) return err('No valid updates');
        $set.updated_at = new Date();
        const r = await db.collection('classes').updateMany({ id: { $in: ids } }, { $set });
        return j({ ok: true, modified: r.modifiedCount });
      }

      // DELETE /admin/classes/bulk { ids: [...] } - passed via POST body since DELETE with body is spotty
      if (route === '/admin/classes/bulk-delete' && method === 'POST') {
        const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) return err('ids required');
        await db.collection('classes').deleteMany({ id: { $in: ids } });
        await db.collection('bookings').updateMany({ class_id: { $in: ids } }, { $set: { status: 'cancelled', cancelled_at: new Date() } });
        return j({ ok: true, deleted: ids.length });
      }

      // -------- Bulk games (recurring) --------
      if (route === '/admin/games/bulk' && method === 'POST') {
        const body = await request.json();
        const { sport_id, host_name, max_players, skill_level, start_date, end_date, weekdays, slots, title, description } = body || {};
        if (!sport_id || !start_date || !end_date || !max_players) return err('sport_id, start_date, end_date, max_players required');
        if (!Array.isArray(weekdays) || weekdays.length === 0) return err('weekdays required');
        if (!Array.isArray(slots) || slots.length === 0) return err('slots required');
        const start = new Date(start_date), end = new Date(end_date);
        if (isNaN(start) || isNaN(end) || start > end) return err('Invalid date range');
        const wkSet = new Set(weekdays.map(Number));
        const sport = SPORTS.find(s => s.id === sport_id);
        const created = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (!wkSet.has(d.getDay())) continue;
          const dateStr = d.toISOString().slice(0, 10);
          for (const slot of slots) {
            if (!slot.start_time || !slot.end_time) continue;
            created.push({
              id: uuidv4(),
              sport_id,
              title: title || `${sport?.name || sport_id} Game`,
              description: description || '',
              date: dateStr,
              start_time: slot.start_time,
              end_time: slot.end_time,
              max_players: parseInt(max_players),
              host_name: host_name || 'Host',
              skill_level: skill_level || 'all',
              created_at: new Date(),
              created_by: auth.user.id,
              batch_tag: `bulk_${start_date}_${end_date}`,
            });
          }
        }
        if (created.length === 0) return err('No matching dates in range');
        if (created.length > 500) return err('Would create ' + created.length + ' games; keep under 500 per request');
        await db.collection('games').insertMany(created);
        return j({ ok: true, count: created.length, games: created.map(clean) });
      }

      // -------- Athlete performance metrics + levels --------
      // Target is either user_id (adult) or child_profile_id (kid). We resolve both.
      const metricsMatch = route.match(/^\/admin\/athletes\/([^/]+)\/metrics$/);
      if (metricsMatch && method === 'PATCH') {
        const targetId = metricsMatch[1];
        const { sport_id, scores } = await request.json();
        if (!sport_id) return err('sport_id required');
        if (!scores || typeof scores !== 'object') return err('scores object required');
        const validSport = SPORTS.find(s => s.id === sport_id);
        if (!validSport) return err('Invalid sport');
        // resolve target
        const child = await db.collection('child_profiles').findOne({ id: targetId });
        let user_id = targetId, child_profile_id = null;
        if (child) { user_id = child.parent_id; child_profile_id = child.id; }
        else {
          const u = await db.collection('users').findOne({ id: targetId });
          if (!u) return err('Athlete not found', 404);
        }
        // Validate & clamp scores
        const cleanScores = {};
        for (const [k, v] of Object.entries(scores)) {
          if (!isValidMetricKey(sport_id, k)) continue;
          const num = Number(v);
          if (isNaN(num)) continue;
          cleanScores[k] = Math.max(0, Math.min(10, Math.round(num * 10) / 10));
        }
        const now = new Date();
        // Save against this specific profile AND all other profiles for the same user
        // so data is visible regardless of which profile the dashboard picks
        const allProfiles = await db.collection('child_profiles').find({ parent_id: user_id }).toArray();
        const profileIds = child_profile_id
          ? [...new Set([child_profile_id, ...allProfiles.map(p => p.id)])]
          : [null];

        for (const pid of profileIds) {
          const existing = await db.collection('athlete_metrics').findOne({
            user_id, sport_id,
            ...(pid ? { child_profile_id: pid } : { child_profile_id: null }),
          });
          if (existing) {
            const merged = { ...(existing.scores || {}), ...cleanScores };
            await db.collection('athlete_metrics').updateOne({ id: existing.id }, {
              $set: { scores: merged, updated_at: now, updated_by: auth.user.id },
            });
          } else {
            await db.collection('athlete_metrics').insertOne({
              id: uuidv4(), user_id, child_profile_id: pid || null,
              sport_id, scores: cleanScores,
              created_at: now, updated_at: now, updated_by: auth.user.id,
            });
          }
        }
        return j({ ok: true, sport_id, scores: cleanScores });
      }

      const levelMatch = route.match(/^\/admin\/athletes\/([^/]+)\/level$/);
      if (levelMatch && method === 'PATCH') {
        const targetId = levelMatch[1];
        const { sport_id, level } = await request.json();
        if (!sport_id) return err('sport_id required');
        const lvl = Number(level);
        if (!Number.isInteger(lvl) || lvl < 1 || lvl > 7) return err('level must be 1-7');
        const child = await db.collection('child_profiles').findOne({ id: targetId });
        let user_id = targetId, child_profile_id = null;
        if (child) { user_id = child.parent_id; child_profile_id = child.id; }
        else {
          const u = await db.collection('users').findOne({ id: targetId });
          if (!u) return err('Athlete not found', 404);
        }
        const now = new Date();
        // Update level across all profiles for this user
        const allProfiles2 = await db.collection('child_profiles').find({ parent_id: user_id }).toArray();
        const levelProfileIds = child_profile_id
          ? [...new Set([child_profile_id, ...allProfiles2.map(p => p.id)])]
          : [null];

        for (const pid of levelProfileIds) {
          const existingLevel = await db.collection('athlete_levels').findOne({
            user_id, sport_id,
            ...(pid ? { child_profile_id: pid } : { child_profile_id: null }),
          });
          if (existingLevel) {
            await db.collection('athlete_levels').updateOne({ id: existingLevel.id }, {
              $set: { level: lvl, updated_at: now, updated_by: auth.user.id },
            });
          } else {
            await db.collection('athlete_levels').insertOne({
              id: uuidv4(), user_id, child_profile_id: pid || null,
              sport_id, level: lvl,
              created_at: now, updated_at: now, updated_by: auth.user.id,
            });
          }
        }
        return j({ ok: true, sport_id, level: lvl, level_info: levelInfo(lvl) });
      }

      // GET /admin/athletes/:target_id/performance - admin view of any athlete
      const adminPerfMatch = route.match(/^\/admin\/athletes\/([^/]+)\/performance$/);
      if (adminPerfMatch && method === 'GET') {
        const targetId = adminPerfMatch[1];
        const child = await db.collection('child_profiles').findOne({ id: targetId });
        let user_id = targetId, child_profile_id = null, subject = null;
        if (child) { user_id = child.parent_id; child_profile_id = child.id; subject = { type: 'child', ...clean(child) }; }
        else {
          const u = await db.collection('users').findOne({ id: targetId });
          if (!u) return err('Athlete not found', 404);
          subject = { type: 'user', ...publicUser(u) };
        }
        const metricsDocs = await db.collection('athlete_metrics').find({
          user_id, sport_id: { $exists: true },
          ...(child_profile_id ? { child_profile_id } : { $or: [{ child_profile_id: null }, { child_profile_id: { $exists: false } }] }),
        }).toArray();
        const levelDocs = await db.collection('athlete_levels').find({
          user_id,
          ...(child_profile_id ? { child_profile_id } : { $or: [{ child_profile_id: null }, { child_profile_id: { $exists: false } }] }),
        }).toArray();
        // Also expose the sports the athlete has access to (from their active membership)
        const memberships = await db.collection('user_memberships').find({ user_id, status: { $in: ['active', 'paused'] } }).toArray();
        const enrolledSports = new Set();
        for (const mm of memberships) {
          // Collect sport from sport_id, membership_snapshot.sport_id, and selected_sports
          if (mm.sport_id) enrolledSports.add(mm.sport_id);
          if (mm.membership_snapshot?.sport_id) enrolledSports.add(mm.membership_snapshot.sport_id);
          (mm.selected_sports || []).forEach(s => enrolledSports.add(s));
        }
        const bySport = {};
        for (const doc of metricsDocs) {
          bySport[doc.sport_id] = { sport_id: doc.sport_id, scores: doc.scores || {}, level: null };
        }
        for (const doc of levelDocs) {
          bySport[doc.sport_id] = bySport[doc.sport_id] || { sport_id: doc.sport_id, scores: {}, level: null };
          bySport[doc.sport_id].level = doc.level;
          bySport[doc.sport_id].level_info = levelInfo(doc.level);
        }
        // Ensure enrolled sports appear even if no scores yet
        for (const sid of enrolledSports) {
          bySport[sid] = bySport[sid] || { sport_id: sid, scores: {}, level: null };
        }
        const sports = Object.values(bySport).map(s => ({
          ...s,
          sport_name: SPORTS.find(sp => sp.id === s.sport_id)?.name || s.sport_id,
          metrics_catalog: metricsForSport(s.sport_id),
        }));
        return j({ subject, sports, levels_catalog: KIDS_LEVELS });
      }

      if (route === '/admin/stats' && method === 'GET') {
        const total = await db.collection('users').countDocuments({});
        const active = await db.collection('user_memberships').countDocuments({ status: 'active' });
        const today = new Date().toISOString().slice(0, 10);
        const todayClasses = await db.collection('classes').countDocuments({ date: today });
        const totalBookings = await db.collection('bookings').countDocuments({ status: 'booked' });
        return j({ total_users: total, active_memberships: active, today_classes: todayClasses, active_bookings: totalBookings });
      }

      // -------- Settings (admin read/write) --------
      if (route === '/admin/settings' && method === 'GET') {
        const settingsDoc = await db.collection('settings').findOne({ key: 'global' });
        return j({
          max_bookings_per_member: settingsDoc?.max_bookings_per_member ?? 3,
        });
      }

      if (route === '/admin/settings' && method === 'PATCH') {
        const { max_bookings_per_member } = await request.json();
        const val = parseInt(max_bookings_per_member);
        if (!Number.isInteger(val) || val < 1 || val > 20) return err('max_bookings_per_member must be between 1 and 20');
        await db.collection('settings').updateOne(
          { key: 'global' },
          { $set: { max_bookings_per_member: val, updated_at: new Date(), updated_by: auth.user.id } },
          { upsert: true }
        );
        return j({ ok: true, max_bookings_per_member: val });
      }

      if (route === '/admin/announcements' && method === 'POST') {
        const { title, message } = await request.json();
        if (!title || !message) return err('title & message required');
        const a = { id: uuidv4(), title, message, created_at: new Date() };
        await db.collection('announcements').insertOne(a);
        return j({ announcement: clean(a) });
      }

      if (route === '/admin/announcements' && method === 'GET') {
        const list = await db.collection('announcements').find({}).sort({ created_at: -1 }).toArray();
        return j({ announcements: list.map(clean) });
      }

      const annDel = route.match(/^\/admin\/announcements\/([^/]+)$/);
      if (annDel && method === 'DELETE') {
        await db.collection('announcements').deleteOne({ id: annDel[1] });
        return j({ ok: true });
      }

      // -------- Games (admin CRUD) --------
      if (route === '/admin/games' && method === 'POST') {
        const { sport_id, title, description, date, start_time, end_time, max_players, host_name, skill_level } = await request.json();
        if (!sport_id || !date || !start_time || !end_time || !max_players) return err('Missing fields');
        const g = {
          id: uuidv4(),
          sport_id,
          title: title || `${SPORTS.find(s => s.id === sport_id)?.name || sport_id} Game`,
          description: description || '',
          date, start_time, end_time,
          max_players: parseInt(max_players),
          host_name: host_name || 'Flowternity',
          skill_level: skill_level || 'all_levels',
          created_at: new Date(),
          created_by: auth.user.id,
        };
        await db.collection('games').insertOne(g);
        return j({ game: clean(g) });
      }

      if (route === '/admin/games' && method === 'GET') {
        const list = await db.collection('games').find({}).sort({ date: 1, start_time: 1 }).toArray();
        const gameIds = list.map(g => g.id);
        const parts = gameIds.length ? await db.collection('game_participants').find({ game_id: { $in: gameIds } }).toArray() : [];
        const counts = parts.reduce((a, p) => (a[p.game_id] = (a[p.game_id] || 0) + 1, a), {});
        return j({ games: list.map(g => ({ ...clean(g), participants_count: counts[g.id] || 0 })) });
      }

      const gameDel = route.match(/^\/admin\/games\/([^/]+)$/);
      if (gameDel && method === 'DELETE') {
        await db.collection('games').deleteOne({ id: gameDel[1] });
        await db.collection('game_participants').deleteMany({ game_id: gameDel[1] });
        return j({ ok: true });
      }

      const gameRosterMatch = route.match(/^\/admin\/games\/([^/]+)\/roster$/);
      if (gameRosterMatch && method === 'GET') {
        const gid = gameRosterMatch[1];
        const parts = await db.collection('game_participants').find({ game_id: gid }).toArray();
        const uids = parts.map(p => p.user_id);
        const users = uids.length ? await db.collection('users').find({ id: { $in: uids } }).toArray() : [];
        return j({ participants: parts.map(p => { const u = users.find(x => x.id === p.user_id); return { user_id: p.user_id, name: u?.full_name || 'Player', email: u?.email, phone: u?.phone, joined_at: p.joined_at }; }) });
      }

      // -------- Members --------
      if (route === '/admin/members' && method === 'POST') {
        // Admin creates new user, optionally with membership.
        const body = await request.json();
        const { full_name, email, phone, role, password, membership_id, athlete } = body || {};
        if (!full_name || !email) return err('full_name & email required');
        const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (existing) return err('Email already registered', 409);
        const tempPassword = password && password.length >= 6 ? password : (Math.random().toString(36).slice(-4) + Math.random().toString(36).slice(-4)).toUpperCase();
        const finalRole = ['admin', 'member', 'coach'].includes(role) ? role : 'member';
        const newUser = {
          id: uuidv4(),
          role: finalRole,
          full_name, email: email.toLowerCase(), phone: phone || '',
          address: '', emergency_contact: '', photo_url: '',
          password_hash: hashPassword(tempPassword),
          created_at: new Date(),
          created_by_admin: auth.user.id,
        };
        await db.collection('users').insertOne(newUser);

        let childProfile = null;
        let membership = null;

        // Optionally purchase a membership on behalf of the user
        if (membership_id) {
          const mem = MEMBERSHIPS.find(m => m.id === membership_id);
          if (mem) {
            // Create athlete profile if provided
            if (athlete && (athlete.athlete_name || athlete.child_name) && athlete.dob) {
              const athleteName = athlete.athlete_name || athlete.child_name;
              childProfile = {
                id: uuidv4(), parent_id: newUser.id,
                athlete_name: athleteName,
                child_name: athleteName,
                dob: athlete.dob, gender: athlete.gender || '',
                selected_sports: [mem.sport_id],
                created_at: new Date(),
              };
              await db.collection('child_profiles').insertOne(childProfile);
            }

            const now = new Date();
            const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + mem.duration_months);
            const um = {
              id: uuidv4(),
              user_id: newUser.id,
              child_profile_id: childProfile ? childProfile.id : null,
              membership_id: mem.id,
              membership_snapshot: mem,
              sport_id: mem.sport_id,
              selected_sports: [mem.sport_id],
              start_date: now, expiry_date: expiry,
              status: 'active', pause_days: 0, paused_at: null,
              created_at: now, created_by_admin: auth.user.id,
            };
            await db.collection('user_memberships').insertOne(um);
            // Seed athlete level
            if (childProfile) {
              await seedKidLevels(db, { user_id: newUser.id, child_profile_id: childProfile.id, sport_ids: [mem.sport_id] });
            }
            await db.collection('payments').insertOne({
              id: uuidv4(), user_id: newUser.id, amount: mem.price, currency: 'INR',
              status: 'success', method: 'admin_created', ref: 'ADMIN_' + uuidv4().slice(0, 8).toUpperCase(),
              membership_id: mem.id, user_membership_id: um.id, created_at: now
            });
            membership = um;
          }
        }

        // Send welcome email with credentials
        const emailResult = await sendWelcomeEmail({ to: newUser.email, name: newUser.full_name, tempPassword });

        return j({
          user: publicUser(newUser),
          child_profile: childProfile ? clean(childProfile) : null,
          membership: membership ? clean(membership) : null,
          temp_password: tempPassword,
          email_sent: !!emailResult.data,
          email_error: emailResult.error || null,
        });
      }

      if (route === '/admin/members' && method === 'GET') {
        const url = new URL(request.url);
        const q = (url.searchParams.get('q') || '').toLowerCase().trim();
        const membership_id = url.searchParams.get('membership_id') || '';
        const coupon_code = url.searchParams.get('coupon_code') || '';
        const expiring = url.searchParams.get('expiring') === 'true';
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
        const skip = (page - 1) * limit;

        const query = q ? {
          $or: [
            { full_name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { phone: { $regex: q } },
          ]
        } : {};

        const total = await db.collection('users').countDocuments(query);
        let users = await db.collection('users').find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();

        const uids = users.map(u => u.id);
        let ums = uids.length ? await db.collection('user_memberships').find({ user_id: { $in: uids } }).toArray() : [];
        
        // Filter by membership_id
        if (membership_id) {
          const filteredUids = new Set(ums.filter(m => m.membership_id === membership_id).map(m => m.user_id));
          users = users.filter(u => filteredUids.has(u.id));
          ums = ums.filter(m => m.membership_id === membership_id);
        }
        
        // Filter by coupon_code (need to check payments)
        if (coupon_code) {
          const payments = await db.collection('payments').find({ coupon_code: coupon_code }).toArray();
          const couponUids = new Set(payments.map(p => p.user_id));
          users = users.filter(u => couponUids.has(u.id));
        }
        
        // Filter by expiring (active memberships expiring within 7 days)
        if (expiring) {
          const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const expiringUids = new Set(
            ums
              .filter(m => m.status === 'active' && new Date(m.expiry_date) <= sevenDaysFromNow && new Date(m.expiry_date) > new Date())
              .map(m => m.user_id)
          );
          users = users.filter(u => expiringUids.has(u.id));
        }

        const latestByUser = {};
        const allByUser = {};
        for (const m of ums) {
          if (!allByUser[m.user_id]) allByUser[m.user_id] = [];
          allByUser[m.user_id].push(m);
          if (!latestByUser[m.user_id] || new Date(m.created_at) > new Date(latestByUser[m.user_id].created_at)) latestByUser[m.user_id] = m;
        }
        return j({
          members: users.map(u => ({
            ...publicUser(u),
            latest_membership: latestByUser[u.id] ? clean(latestByUser[u.id]) : null,
            active_memberships: (allByUser[u.id] || []).filter(m => m.status === 'active' || m.status === 'paused').map(clean),
          })),
          total, page, limit,
        });
      }

      const memPatch = route.match(/^\/admin\/members\/([^/]+)$/);
      if (memPatch && method === 'PATCH') {
        const body = await request.json();
        const allowed = ['full_name', 'phone', 'address', 'emergency_contact', 'role', 'status'];
        const upd = {};
        for (const k of allowed) if (body[k] !== undefined) upd[k] = body[k];
        await db.collection('users').updateOne({ id: memPatch[1] }, { $set: upd });
        const u = await db.collection('users').findOne({ id: memPatch[1] });
        return j({ user: publicUser(u) });
      }

      const memDeact = route.match(/^\/admin\/members\/([^/]+)\/deactivate$/);
      if (memDeact && method === 'POST') {
        await db.collection('users').updateOne({ id: memDeact[1] }, { $set: { status: 'inactive' } });
        await db.collection('user_memberships').updateMany({ user_id: memDeact[1], status: 'active' }, { $set: { status: 'expired' } });
        return j({ ok: true });
      }

      const memDetail = route.match(/^\/admin\/members\/([^/]+)\/detail$/);
      if (memDetail && method === 'GET') {
        const id = memDetail[1];
        const u = await db.collection('users').findOne({ id });
        if (!u) return err('Not found', 404);
        const children = await db.collection('child_profiles').find({ parent_id: id }).toArray();
        const memberships = await db.collection('user_memberships').find({ user_id: id }).sort({ created_at: -1 }).toArray();
        const payments = await db.collection('payments').find({ user_id: id }).sort({ created_at: -1 }).toArray();
        const bookings = await db.collection('bookings').find({ user_id: id }).sort({ created_at: -1 }).limit(20).toArray();
        return j({ user: publicUser(u), children: children.map(clean), memberships: memberships.map(clean), payments: payments.map(clean), bookings: bookings.map(clean) });
      }

      // -------- Attendance / Roster --------
      const rosterMatch = route.match(/^\/admin\/classes\/([^/]+)\/roster$/);
      if (rosterMatch && method === 'GET') {
        const cid = rosterMatch[1];
        const cls = await db.collection('classes').findOne({ id: cid });
        if (!cls) return err('Class not found', 404);
        const bookings = await db.collection('bookings').find({ class_id: cid, status: 'booked' }).toArray();
        const uids = bookings.map(b => b.user_id);
        const users = uids.length ? await db.collection('users').find({ id: { $in: uids } }).toArray() : [];
        const kids = await db.collection('child_profiles').find({ id: { $in: bookings.map(b => b.child_profile_id).filter(Boolean) } }).toArray();
        const att = await db.collection('attendance').find({ class_id: cid }).toArray();
        return j({
          class: clean(cls),
          roster: bookings.map(b => {
            const u = users.find(x => x.id === b.user_id);
            const kid = b.child_profile_id ? kids.find(k => k.id === b.child_profile_id) : null;
            const a = att.find(x => x.booking_id === b.id);
            return {
              booking_id: b.id,
              user_id: b.user_id,
              name: kid ? kid.child_name : (u?.full_name || 'Unknown'),
              subtitle: kid ? `Kid of ${u?.full_name}` : (u?.email || ''),
              present: a ? a.present : null,
            };
          }),
        });
      }

      if (route === '/admin/attendance' && method === 'POST') {
        const { class_id, records } = await request.json();
        if (!class_id || !Array.isArray(records)) return err('class_id & records[] required');
        for (const r of records) {
          await db.collection('attendance').updateOne(
            { booking_id: r.booking_id },
            {
              $set: {
                class_id, present: !!r.present, marked_at: new Date(), marked_by: auth.user.id,
              },
              $setOnInsert: { id: uuidv4(), booking_id: r.booking_id, created_at: new Date() },
            },
            { upsert: true }
          );
        }
        return j({ ok: true, count: records.length });
      }

      // -------- Payments (admin) --------
      if (route === '/admin/payments' && method === 'GET') {
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
        const skip = (page - 1) * limit;
        const total = await db.collection('payments').countDocuments({});
        const payments = await db.collection('payments').find({}).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();
        const uids = [...new Set(payments.map(p => p.user_id))];
        const users = uids.length ? await db.collection('users').find({ id: { $in: uids } }).toArray() : [];
        return j({
          payments: payments.map(p => {
            const u = users.find(x => x.id === p.user_id);
            return { ...clean(p), user_name: u?.full_name || 'Unknown', user_email: u?.email || '' };
          }),
          total, page, limit,
        });
      }

      // Refund a payment — calls Razorpay refund API if it was a real Razorpay payment,
      // otherwise marks a mock/admin_granted record as refunded in DB only.
      const paymentRefundMatch = route.match(/^\/admin\/payments\/([^/]+)\/refund$/);
      if (paymentRefundMatch && method === 'POST') {
        const pid = paymentRefundMatch[1];
        const p = await db.collection('payments').findOne({ id: pid });
        if (!p) return err('Payment not found', 404);
        if (p.status === 'refunded') return err('Already refunded', 400);
        let reason = '';
        try { const body = await request.json(); reason = body?.reason || ''; } catch (e) { /* body optional */ }

        let razorpayRefund = null;
        if (p.method === 'razorpay' && p.razorpay_payment_id && p.status === 'success') {
          try {
            razorpayRefund = await refundPayment({
              payment_id: p.razorpay_payment_id,
              amountPaise: p.amount ? Math.round(p.amount * 100) : undefined,
              notes: { reason: reason || 'admin_refund', admin_id: auth.user.id },
            });
          } catch (e) {
            return err('Razorpay refund failed: ' + (e.error?.description || e.message), 502);
          }
        }

        await db.collection('payments').updateOne({ id: pid }, {
          $set: {
            status: 'refunded',
            refunded_at: new Date(),
            refunded_by: auth.user.id,
            refund_reason: reason,
            ...(razorpayRefund ? {
              refund_id: razorpayRefund.id,
              refund_status: razorpayRefund.status,
              refund_amount: razorpayRefund.amount,
            } : {}),
          },
        });
        if (p.user_membership_id) {
          await db.collection('user_memberships').updateOne({ id: p.user_membership_id }, {
            $set: { status: 'expired', refunded_at: new Date() },
          });
        }
        // Audit
        await db.collection('admin_audit').insertOne({
          id: uuidv4(),
          action: 'payment.refund',
          admin_id: auth.user.id,
          payment_id: pid,
          razorpay_refund_id: razorpayRefund?.id || null,
          reason,
          at: new Date(),
        });
        return j({ ok: true, refund: razorpayRefund || { id: null, mock: true } });
      }

      // Grant membership manually to a user
      const grantMatch = route.match(/^\/admin\/members\/([^/]+)\/grant-membership$/);
      if (grantMatch && method === 'POST') {
        const uid = grantMatch[1];
        const target = await db.collection('users').findOne({ id: uid });
        if (!target) return err('User not found', 404);
        const { membership_id, child_profile_id, note } = await request.json();
        const mem = MEMBERSHIPS.find(m => m.id === membership_id);
        if (!mem) return err('Invalid membership');
        if (!child_profile_id) return err('Athlete profile required');

        const now = new Date();
        const expiry = new Date(now); expiry.setMonth(expiry.getMonth() + mem.duration_months);
        const um = {
          id: uuidv4(),
          user_id: uid,
          child_profile_id,
          membership_id: mem.id,
          membership_snapshot: mem,
          sport_id: mem.sport_id,
          selected_sports: [mem.sport_id],
          start_date: now, expiry_date: expiry,
          status: 'active', pause_days: 0, paused_at: null,
          created_at: now, granted_by_admin: auth.user.id,
          admin_note: note || '',
        };
        await db.collection('user_memberships').insertOne(um);
        // Seed athlete level
        await seedKidLevels(db, { user_id: uid, child_profile_id, sport_ids: [mem.sport_id] });
        await db.collection('payments').insertOne({
          id: uuidv4(), user_id: uid, amount: 0, currency: 'INR',
          status: 'success', method: 'admin_granted',
          ref: 'GRANT_' + uuidv4().slice(0, 8).toUpperCase(),
          membership_id: mem.id, user_membership_id: um.id,
          created_at: now, granted_by_admin: auth.user.id, admin_note: note || '',
        });
        return j({ user_membership: clean(um) });
      }

      // Extend a membership by N days
      const extendMatch = route.match(/^\/admin\/memberships\/([^/]+)\/extend$/);
      if (extendMatch && method === 'POST') {
        const mid = extendMatch[1];
        const { days, note } = await request.json();
        const d = parseInt(days);
        if (!d || d < 1 || d > 365) return err('days must be between 1 and 365');
        const um = await db.collection('user_memberships').findOne({ id: mid });
        if (!um) return err('Membership not found', 404);
        const newExpiry = new Date(um.expiry_date);
        newExpiry.setDate(newExpiry.getDate() + d);
        const update = { expiry_date: newExpiry };
        // If it was expired, reactivate
        if (um.status === 'expired' && newExpiry > new Date()) update.status = 'active';
        await db.collection('user_memberships').updateOne({ id: mid }, {
          $set: update,
          $push: { extensions: { days: d, at: new Date(), by: auth.user.id, note: note || '' } },
        });
        return j({ ok: true, expiry_date: newExpiry });
      }

      // Expire a membership immediately
      const expireMatch = route.match(/^\/admin\/memberships\/([^/]+)\/expire$/);
      if (expireMatch && method === 'POST') {
        await db.collection('user_memberships').updateOne({ id: expireMatch[1] }, {
          $set: { status: 'expired', expired_by_admin: auth.user.id, expired_at: new Date() }
        });
        return j({ ok: true });
      }

      // -------- Trial leads (admin) --------
      if (route === '/admin/trial-leads' && method === 'GET') {
        const list = await db.collection('trial_leads').find({}).sort({ created_at: -1 }).limit(500).toArray();
        const classIds = [...new Set(list.map(l => l.class_id).filter(Boolean))];
        const classes = classIds.length ? await db.collection('classes').find({ id: { $in: classIds } }).toArray() : [];
        return j({
          leads: list.map(l => {
            const cls = l.class_id ? classes.find(c => c.id === l.class_id) : null;
            const sport = SPORTS.find(s => s.id === l.sport_id);
            return { ...clean(l), sport_name: sport?.name || l.sport_id, class: cls ? clean(cls) : null };
          }),
        });
      }

      const leadStatusMatch = route.match(/^\/admin\/trial-leads\/([^/]+)$/);
      if (leadStatusMatch && method === 'PATCH') {
        const { status } = await request.json();
        if (!['pending', 'scheduled', 'attended', 'no_show', 'cancelled'].includes(status)) return err('Invalid status');
        await db.collection('trial_leads').updateOne({ id: leadStatusMatch[1] }, { $set: { status, updated_at: new Date() } });
        return j({ ok: true });
      }

      // -------- Coaches --------
      if (route === '/admin/coaches' && method === 'POST') {
        const { full_name, email, phone, sports, bio } = await request.json();
        if (!full_name || !email) return err('full_name & email required');
        const c = { id: uuidv4(), full_name, email: email.toLowerCase(), phone: phone || '', sports: Array.isArray(sports) ? sports : [], bio: bio || '', photo_url: '', created_at: new Date() };
        await db.collection('coaches').insertOne(c);
        return j({ coach: clean(c) });
      }
      if (route === '/admin/coaches' && method === 'GET') {
        const list = await db.collection('coaches').find({}).sort({ created_at: -1 }).toArray();
        return j({ coaches: list.map(clean) });
      }
      const coachDel = route.match(/^\/admin\/coaches\/([^/]+)$/);
      if (coachDel && method === 'DELETE') {
        await db.collection('coaches').deleteOne({ id: coachDel[1] });
        return j({ ok: true });
      }
    }

    return err(`Route ${route} not found`, 404);
  } catch (e) {
    console.error('API Error:', e);
    return err('Internal server error: ' + e.message, 500);
  }
}

export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
