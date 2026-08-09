# Membership Expiry Fix - Test Guide

## The Issue (FIXED)
When cancelling ALL class bookings from a membership, the expiry date was NOT reverting to the original 30-day date.

**Root Causes Found & Fixed:**
1. ❌ Only slot-based memberships were having expiry recalculated (regular memberships were ignored)
2. ❌ `original_expiry_date` was not being stored for old memberships
3. ❌ Booking cancellation endpoint checked `user_membership_id` which could be null

**Solution Applied:**
- Now recalculate expiry for ALL bookings (not just slot-based)
- `original_expiry_date` is stored when memberships are created
- If no bookings remain → expiry reverts to original
- If bookings remain → expiry = 1 day after last class

## Test Steps

### Step 1: Create Test Account
- Email: `noelgeorge1012@gmail.com` (or any new email)
- Password: Your choice
- Sign up for a membership (any type: kids_6m, adult_12m, basketball_slot, etc.)

### Step 2: Book Classes
- Go to /classes page
- Book 1-2 classes
- Dashboard should show expiry date shortened (e.g., Aug 14 instead of Sept 7)

### Step 3: Cancel All Classes
- Dashboard → Cancel all your class bookings
- Refresh page (Cmd+R or F5)
- **EXPECTED:** Expiry date reverts to original (e.g., Sept 7)

### Step 4: Book Again & Verify
- Book 1 class
- Expiry shortens to 1 day after class ends
- Cancel that class
- Expiry reverts to original again

## Debug Commands

If it still doesn't work, run:

```bash
cd "/Users/noel/Desktop/P R O J E C T S/flowternity_academy-main final"
node << 'DEBUG'
const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowternity';

(async () => {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db();
    
    const user = await db.collection('users').findOne({ email: 'noelgeorge1012@gmail.com' });
    if (!user) { console.log('❌ User not found'); return; }
    
    const mems = await db.collection('user_memberships').find({ user_id: user.id }).toArray();
    
    for (const m of mems) {
      const bookings = await db.collection('bookings').find({ user_membership_id: m.id }).toArray();
      console.log(`\nMembership: ${m.membership_id}`);
      console.log(`  Current Expiry: ${new Date(m.expiry_date).toISOString().slice(0, 10)}`);
      console.log(`  Original Expiry: ${m.original_expiry_date ? new Date(m.original_expiry_date).toISOString().slice(0, 10) : 'NOT SET'}`);
      console.log(`  Active Bookings: ${bookings.filter(b => b.status === 'booked').length}`);
    }
  } finally {
    await client.close();
  }
})();
DEBUG
```

## Files Modified
- `app/api/[[...path]]/route.js` - Cancellation endpoint now recalculates ALL bookings
- `lib/flowternity/membership-expiry.js` - Expiry calculation logic
