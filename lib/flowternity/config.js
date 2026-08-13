// Flowternity configuration - static structural data (not seed data)

export const SPORTS = [
  { id: 'basketball', name: 'Basketball', status: 'active', description: 'Two international standard basketball courts. Train, compete, excel.', tagline: 'Court #1 · Court #2', image: 'https://images.unsplash.com/photo-1595795279832-13f0df36fbb9?auto=format&fit=crop&q=80&w=1200' },
  { id: 'futsal', name: 'Futsal', status: 'disabled', description: 'Fast-paced 5-a-side football on outdoor synthetic flooring.', tagline: 'Outdoor · 5-a-side', image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=1200' },
  { id: 'karate', name: 'Karate', status: 'disabled', description: 'Traditional karate training — kata, kumite, discipline and technique.', tagline: 'Kihon · Kata · Kumite', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1200' },
  { id: 'skating', name: 'Skating', status: 'disabled', description: 'Professional roller skating facility for all skill levels.', tagline: 'Roller', image: 'https://images.unsplash.com/photo-1696685139596-ed3f10bbb6f0?auto=format&fit=crop&q=80&w=1200' },
  { id: 'skateboarding', name: 'Skateboarding', status: 'disabled', description: 'Ramps, rails and obstacles for skaters of every level.', tagline: 'Park · Street · Vert', image: 'https://images.unsplash.com/photo-1547447546-526c3f7462aa?auto=format&fit=crop&q=80&w=1200' },
  { id: 'calisthenics', name: 'Calisthenics', status: 'coming_soon', description: 'Bars, rings and bodyweight strength zones.', tagline: 'Coming Soon', image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=1200' },
  { id: 'yoga', name: 'Yoga', status: 'coming_soon', description: 'Mindful movement, breathwork and flexibility training.', tagline: 'Coming Soon', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200' },
];

export const MEMBERSHIPS = [
  // Basketball — 1m / 6m / 12m
  { id: 'basketball_1m',  name: 'Basketball', sport_id: 'basketball', duration_months: 1,  price: 2910,  popular: false, pause_days: 0 },
  { id: 'basketball_6m',  name: 'Basketball', sport_id: 'basketball', duration_months: 6,  price: 16704, popular: false, pause_days: 0 },
  { id: 'basketball_12m', name: 'Basketball', sport_id: 'basketball', duration_months: 12, price: 24708, popular: false, pause_days: 30 },
  // Basketball — Single Slots (pay per slot, 30 day validity)
  { id: 'basketball_slot', name: 'Basketball Single Slot', sport_id: 'basketball', duration_months: 1, price: 400, type: 'slot', pause_days: 0 },
  // Other sports — 1m
  { id: 'futsal_1m',        name: 'Futsal',        sport_id: 'futsal',        duration_months: 1, price: 2000, pause_days: 0 },
  { id: 'skateboarding_1m', name: 'Skateboarding', sport_id: 'skateboarding', duration_months: 1, price: 5000, pause_days: 0 },
  { id: 'karate_1m',        name: 'Karate',        sport_id: 'karate',        duration_months: 1, price: 2000, pause_days: 0 },
  { id: 'skating_1m',       name: 'Skating',       sport_id: 'skating',       duration_months: 1, price: 2000, pause_days: 0 },
];

export const MAX_PAUSE_DAYS = 30;

// Coupon codes
export const COUPONS = [
  { code: 'Coach30', discount_amount: 2000, description: '₹2,000 off', applicable_plans: ['basketball_12m'] },
  { code: 'NEWJERSEY20', discount_amount: 2000, description: 'Waive jersey enrollment fee', applicable_to: 'enrollment_fee', applicable_plans: ['basketball_1m', 'basketball_6m'] },
];

// Jersey sizes (shirt sizing)
export const JERSEY_SIZES = ['22', '24', '26', '28', '30', '32', '34', '36', '38', '40','42','44','46'];

// Kids progression (per sport per kid). Level 1 is the default.
export const KIDS_LEVELS = [
  { level: 1, name: 'SPARK',      quote: 'Every champion starts with a spark.' },
  { level: 2, name: 'FOUNDATION', quote: 'Strong fundamentals create great players.' },
  { level: 3, name: 'RHYTHM',     quote: 'Skills become second nature.' },
  { level: 4, name: 'FLOW',       quote: 'Where preparation meets instinct. This should be the level every athlete dreams of reaching.' },
  { level: 5, name: 'IMPACT',     quote: 'Great players influence every possession.' },
  { level: 6, name: 'ASCEND',     quote: 'Compete with purpose. Perform with excellence.' },
  { level: 7, name: 'LEGACY',     quote: 'Become the athlete others aspire to be.' },
];

// Leadership Metrics - Track player development across 7 dimensions
export const LEADERSHIP_METRICS = [
  {
    id: 'discipline',
    name: 'Discipline & Professionalism',
    description: 'On-time attendance • Proper dress code / uniform • Respectful behaviour • Timely fee/payment discipline • Following academy rules',
    why: 'Teaches players to behave like serious athletes.',
    emoji: '⏰',
    color: 'bg-blue-500',
  },
  {
    id: 'effort',
    name: 'Effort & Work Ethic',
    description: 'Training intensity • Hustle during drills • Never giving up • Energy levels in practice • Extra practice effort',
    why: 'Talent grows only with consistent effort.',
    emoji: '💪',
    color: 'bg-red-500',
  },
  {
    id: 'skill',
    name: 'Skill Development',
    description: 'Dribbling improvement • Ball handling • Shooting consistency • Defensive skills • Game IQ growth',
    why: 'Rewards improvement, not just natural ability.',
    emoji: '🎯',
    color: 'bg-orange-500',
  },
  {
    id: 'teamwork',
    name: 'Team Player Index',
    description: 'Passing mindset • Communication • Supporting teammates • Positive attitude • Unselfish play',
    why: 'Great teams beat great individuals.',
    emoji: '🤝',
    color: 'bg-green-500',
  },
  {
    id: 'leadership',
    name: 'Leadership & Responsibility',
    description: 'Helping younger students • Taking initiative • Leading warmups/drills • Accountability • Setting the right example',
    why: 'Builds captains, not just players.',
    emoji: '👑',
    color: 'bg-purple-500',
  },
  {
    id: 'community',
    name: 'Community & Sportsmanship',
    description: 'Respect towards coaches/referees • Encouraging others • Helping maintain the facility • Behaviour during games • Representing Flowternity positively',
    why: 'Character is visible off the court too.',
    emoji: '🌟',
    color: 'bg-yellow-500',
  },
  {
    id: 'consistency',
    name: 'Consistency Champion',
    description: 'Weekly attendance streak • Consistent performance • Regular improvement • Commitment over time',
    why: 'Consistency builds champions.',
    emoji: '📈',
    color: 'bg-pink-500',
  },
];

// Leadership Metrics Scoring: 1-10 scale
export const METRIC_SCORES = [
  { value: 1, label: '1 - Needs Improvement', description: 'Shows minimal effort in this area' },
  { value: 2, label: '2 - Below Average', description: 'Inconsistent performance' },
  { value: 3, label: '3 - Average', description: 'Meets basic expectations' },
  { value: 4, label: '4 - Good', description: 'Shows solid commitment' },
  { value: 5, label: '5 - Very Good', description: 'Consistent high performance' },
  { value: 6, label: '6 - Excellent', description: 'Exceeds expectations regularly' },
  { value: 7, label: '7 - Outstanding', description: 'Sets the standard for others' },
  { value: 8, label: '8 - Exceptional', description: 'Role model behaviour' },
  { value: 9, label: '9 - Elite', description: 'Top tier performer' },
  { value: 10, label: '10 - Perfect', description: 'Exemplary in every way' },
];
