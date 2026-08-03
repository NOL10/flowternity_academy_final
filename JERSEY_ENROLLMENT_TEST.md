# Jersey Enrollment Fee Test Plan

## System Overview
- **Feature**: One-time ₹2,000 enrollment fee for first-time Basketball 1-month and 6-month students
- **Jersey Collection**: Basketball 1-month, 6-month, AND 12-month plans (no fee for 12m)
- **Includes**: 2 sets of uniforms (jerseys) with customization
- **One-time Payment**: NOT recurring - charged only on first basketball purchase
- **Applies to**: 
  - ✅ Basketball 1-month: ₹2,000 enrollment fee + jersey form
  - ✅ Basketball 6-month: ₹2,000 enrollment fee + jersey form
  - ✅ Basketball 12-month: NO fee + jersey form (data collection only)
  - ❌ Slot plans: NO fee, NO jersey form
  - ❌ Other sports: NO fee, NO jersey form
- **Not applied to**: Slot plans, other sports, subsequent memberships

---

## Test Scenario 1: First-time Guest → Basketball Monthly → Checkout → Payment

**Objective**: Verify new guest user is charged ₹2,000 one-time enrollment fee and jersey form is shown

**Steps**:
1. Go to `/memberships` (logged out)
2. Click on "Basketball" → "Monthly" plan (1 month)
3. Should see:
   - ✅ "Complete your membership" page
   - ✅ Account fields (name, email, phone, password)
   - ✅ Athlete details section (DOB, gender)
4. Scroll down → Should see:
   - ✅ **Jersey Details** section with fields:
     - Height (cm)
     - Weight (kg)
     - Name on Jersey
     - Jersey Number (0-999)
     - Jersey Size (XS, S, M, L, XL, XXL)
   - ✅ Message: "One-time enrollment fee (₹2,000) includes 2 sets of uniforms (jerseys)"
5. In Order Summary (right sidebar):
   - ✅ Subtotal: ₹2,910
   - ✅ **Enrollment Fee**: ₹2,000 with note "One-time (2 Uniforms)" ← NEW
   - ✅ Per month: ₹2,910
   - ✅ **Total**: ₹4,910 with note "1M membership + one-time jersey fee"
6. Fill in all fields:
   - Full name: `Test User One`
   - Email: `testuser1@test.com`
   - Phone: `9999999999`
   - Password: `Test1234`
   - DOB: `2010-05-15`
   - Gender: `Male`
   - Height: `170`
   - Weight: `65`
   - Name on Jersey: `TESTUSER`
   - Jersey Number: `23`
   - Jersey Size: `M`
7. Click "Pay ₹4,910"
8. Complete payment (mock or Razorpay)
9. Verify success:
   - ✅ Redirected to dashboard
   - ✅ Welcome toast shows "Membership activated!"
   - ✅ Membership card shows "1 Month" basketball active

**Verify in MongoDB**:
```javascript
// Check users collection
db.users.findOne({ email: "testuser1@test.com" })
// Should show role: 'member'

// Check user_memberships collection
db.user_memberships.findOne({ user_id: <user_id> })
// Should show status: 'active', membership_id: 'basketball_1m'

// Check jerseys collection
db.jerseys.findOne({ user_id: <user_id> })
// Should show:
// {
//   user_id: <user_id>,
//   height: '170',
//   weight: '65',
//   name: 'TESTUSER',
//   number: 23,
//   size: 'M',
//   sport_id: 'basketball',
//   created_at: <timestamp>
// }

// Check payments collection
db.payments.findOne({ user_id: <user_id> })
// Should show:
// {
//   amount: 4910,
//   enrollment_fee: 2000,
//   original_amount: 2910,
//   status: 'success'
// }
```

---

## Test Scenario 2: Basketball 6-Month Plan (One-time ₹2,000 fee)

**Objective**: Verify 6-month plan also charges one-time ₹2,000 enrollment fee

**Steps**:
1. Go to `/memberships`
2. Select Basketball 6-month plan
3. Should see:
   - ✅ Jersey form
   - ✅ Enrollment fee: ₹2,000
4. Order summary:
   - ✅ Subtotal: ₹16,704
   - ✅ **Enrollment Fee**: ₹2,000 (one-time)
   - ✅ **Total**: ₹18,704
5. Fill jersey details and complete payment
6. Verify payment has `enrollment_fee: 2000`

---

## Test Scenario 3: Basketball 12-Month Plan (Jersey form, NO fee)

**Objective**: Verify 12-month plan shows jersey form but does NOT charge enrollment fee

**Steps**:
1. Go to `/memberships`
2. Select Basketball 12-month plan
3. Should see:
   - ✅ Jersey Details form
   - ✅ Message: "Collect your 2 sets of uniforms (jerseys) — included with your membership"
   - ❌ NO "Enrollment Fee" line
4. Order summary:
   - ✅ Subtotal: ₹24,708
   - ❌ NO enrollment fee line
   - ✅ **Total**: ₹24,708 (NO +₹2,000)
5. Fill jersey details and complete payment
6. Verify in MongoDB:
   - ✅ Jersey document created
   - ✅ Payment has `enrollment_fee: 0` or undefined

---

## Test Scenario 4: Logged-in User (No Basketball) → First Basketball 6-Month

**Objective**: Verify existing member without basketball gets charged one-time ₹2,000 fee

**Steps**:
1. Create/login as existing user (any sport except basketball)
   - Email: `existing@test.com`
2. Go to `/memberships`
3. Select Basketball 6-month plan
4. Should see jersey form with enrollment fee message
5. Order summary should show:
   - ✅ Subtotal: ₹16,704
   - ✅ **Enrollment Fee: ₹2,000**
   - ✅ **Total: ₹18,704**
6. Fill jersey details and complete payment
7. Verify in MongoDB:
   - ✅ New membership created
   - ✅ Jersey document created with user_id
   - ✅ Payment with enrollment_fee: 2000

---

## Test Scenario 5: Logged-in User (Has Basketball) → Renew Basketball

**Objective**: Verify existing basketball user is NOT charged enrollment fee on renewal (same or different duration)

**Prerequisites**: User has active/expired basketball membership (from Test 1, 2, or 3)

**Steps**:
1. Login as the user from Test Scenario 1
2. Go to `/memberships`
3. Select Basketball 1-month or 6-month plan
4. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
5. Order summary should show:
   - ✅ Subtotal: ₹2,910 or ₹16,704 (membership only, NO fee)
   - ✅ Per month: ₹2,910 or ₹2,784
   - ✅ **Total: ₹2,910 or ₹16,704** (NO +₹2,000)
   - ✅ Note: "1M membership" (no mention of jersey fee)
6. Complete checkout without jersey form
7. Verify in MongoDB:
   - ✅ New membership created
   - ✅ NO new jersey document created
   - ✅ Payment has enrollment_fee: 0 or undefined

---

## Test Scenario 6: Basketball Slot Plan (No Jersey, No Fee)

**Objective**: Verify slot plans do NOT get enrollment fee or jersey form

**Steps**:
1. Go to `/memberships` (logged out or logged in)
2. Select Basketball Slots (Pay Per Class)
3. Select quantity (e.g., 5 slots)
4. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
5. Order summary:
   - ✅ Subtotal: ₹2,000 (5 × ₹400)
   - ✅ **Total: ₹2,000** (NO +₹2,000 fee)

---

## Test Scenario 7: Non-Basketball Plans (No Jersey, No Fee)

**Objective**: Verify other sports don't get enrollment fee or jersey form

**Steps**:
1. Go to `/memberships`
2. Select Futsal or other sport monthly plan
3. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
4. Order summary should show plan price only (no fee)

---

## Test Scenario 8: Dashboard Jersey Display

**Objective**: Verify jersey details appear on dashboard after purchase

**Steps**:
1. Login as user from Test Scenario 1
2. Go to `/dashboard`
3. Should see section: **Jersey Details**
4. Should display:
   - ✅ Jersey name: `TESTUSER`
   - ✅ Jersey number: `#23`
   - ✅ Size badge: `M`
   - ✅ Height: `170 cm`
   - ✅ Weight: `65 kg`
   - ✅ Created date

---

## Test Scenario 9: 12-Month Plan User Dashboard Jersey

**Objective**: Verify jersey from 12-month plan also shows on dashboard

**Steps**:
1. Login as user from Test Scenario 3 (12-month user)
2. Go to `/dashboard`
3. Should see **Jersey Details** section
4. Should display same information as Test Scenario 8
5. Note: User paid NO enrollment fee but still has jersey

---

## Checkout Page Visual Checklist

- [ ] Jersey form shows for Basketball 1M, 6M, and 12M only
- [ ] Enrollment fee (₹2,000) shows for 1M and 6M only
- [ ] 12M plan shows jersey form with message "Collect your 2 sets..."
- [ ] Order summary clearly states "One-time" for enrollment fee
- [ ] Total breakdown shows which fee is one-time vs recurring
- [ ] Jersey form all 5 fields work properly
- [ ] Jersey number accepts 0-999
- [ ] Jersey size buttons work (XS, S, M, L, XL, XXL)
- [ ] Name field auto-capitalizes input
- [ ] Form validation prevents submit without jersey details (if form shown)
- [ ] Renewal of basketball plan shows NO enrollment fee line
- [ ] Renewal message differs from first-time message

---

## Database Validation Checklist

### After Test 1 or 2 (First Basketball Monthly/6M Purchase with ₹2,000 fee):
- [ ] User document created
- [ ] User membership with status: 'active'
- [ ] Jersey document created with all fields
- [ ] Payment with `enrollment_fee: 2000` and `amount: (base + 2000)`
- [ ] No duplicate jersey documents

### After Test 3 (Basketball 12M - NO fee):
- [ ] User membership created
- [ ] Jersey document created
- [ ] Payment has `enrollment_fee: 0` or undefined
- [ ] Total payment = membership price only (no +₹2000)

### After Test 5 (Renewal - NO fee):
- [ ] New membership created (separate from first)
- [ ] NO new jersey document created
- [ ] Payment has `enrollment_fee: 0` or undefined

---

## Messaging Updates for Users

**First-time Basketball (1M or 6M)**:
```
"One-time enrollment fee (₹2,000) includes 2 sets of uniforms (jerseys)"
Order total: "1M membership + one-time jersey fee"
```

**First-time Basketball (12M)**:
```
"Collect your 2 sets of uniforms (jerseys) — included with your membership"
Order total: "12M membership"
```

**Renewal/Subsequent Purchase**:
```
No jersey form shown
Order total: "XM membership"
```

---

## Success Criteria

✅ Basketball 1M and 6M charge one-time ₹2,000 enrollment fee  
✅ Basketball 12M collects jersey info but NO fee  
✅ Jersey form shown for all three basketball durations (1M, 6M, 12M)  
✅ Jersey details saved to MongoDB for all three  
✅ Renewal/subsequent purchases show NO enrollment fee or jersey form  
✅ Clear messaging: "One-time payment, not recurring"  
✅ Dashboard displays jersey details  
✅ API endpoints return correct jersey data  
✅ No duplicate charges for same user  
✅ Slot plans and other sports unaffected

---

## Test Scenario 1: First-time Guest → Checkout → Payment

**Objective**: Verify new guest user is charged enrollment fee and jersey form is shown

**Steps**:
1. Go to `/memberships` (logged out)
2. Click on "Basketball" → "Monthly" plan (1 month)
3. Should see:
   - ✅ "Complete your membership" page
   - ✅ Account fields (name, email, phone, password)
   - ✅ Athlete details section (DOB, gender)
4. Scroll down → Should see:
   - ✅ **Jersey Details** section with fields:
     - Height (cm)
     - Weight (kg)
     - Name on Jersey
     - Jersey Number (0-999)
     - Jersey Size (XS, S, M, L, XL, XXL)
   - ✅ Message: "One-time enrollment fee includes 2 sets of uniforms (jerseys)"
5. In Order Summary (right sidebar):
   - ✅ Subtotal: ₹2,910
   - ✅ **Enrollment Fee (Jersey + 2 Uniforms): ₹2,000** ← NEW LINE
   - ✅ Per month: ₹2,910
   - ✅ **Total: ₹4,910** (2,910 + 2,000)
6. Fill in all fields:
   - Full name: `Test User One`
   - Email: `testuser1@test.com`
   - Phone: `9999999999`
   - Password: `Test1234`
   - DOB: `2010-05-15`
   - Gender: `Male`
   - Height: `170`
   - Weight: `65`
   - Name on Jersey: `TESTUSER`
   - Jersey Number: `23`
   - Jersey Size: `M`
7. Click "Pay ₹4,910"
8. Complete payment (mock or Razorpay)
9. Verify success:
   - ✅ Redirected to dashboard
   - ✅ Welcome toast shows "Membership activated!"
   - ✅ Membership card shows "1 Month" basketball active

**Verify in MongoDB**:
```javascript
// Check users collection
db.users.findOne({ email: "testuser1@test.com" })
// Should show role: 'member'

// Check user_memberships collection
db.user_memberships.findOne({ user_id: <user_id> })
// Should show status: 'active', membership_id: 'basketball_1m'

// Check jerseys collection
db.jerseys.findOne({ user_id: <user_id> })
// Should show:
// {
//   user_id: <user_id>,
//   height: '170',
//   weight: '65',
//   name: 'TESTUSER',
//   number: 23,
//   size: 'M',
//   sport_id: 'basketball',
//   created_at: <timestamp>
// }

// Check payments collection
db.payments.findOne({ user_id: <user_id> })
// Should show:
// {
//   amount: 4910,
//   enrollment_fee: 2000,
//   original_amount: 2910,
//   status: 'success'
// }
```

---

## Test Scenario 2: Logged-in User (No Basketball) → First Basketball Plan

**Objective**: Verify existing member without basketball gets charged enrollment fee

**Steps**:
1. Create/login as existing user (any sport except basketball)
   - Email: `existing@test.com`
2. Go to `/memberships`
3. Select Basketball 6-month plan
4. Should see jersey form (same as Test 1)
5. Order summary should show:
   - ✅ Subtotal: ₹16,704
   - ✅ **Enrollment Fee: ₹2,000**
   - ✅ **Total: ₹18,704**
6. Fill jersey details and complete payment
7. Verify in MongoDB:
   - ✅ New membership created
   - ✅ Jersey document created with user_id

---

## Test Scenario 3: Logged-in User (Has Basketball) → Renew Basketball

**Objective**: Verify existing basketball user is NOT charged enrollment fee on renewal

**Prerequisites**: User has active/expired basketball membership (from Test 1 or 2)

**Steps**:
1. Login as the user from Test Scenario 1
2. Go to `/memberships`
3. Select Basketball 1-month or 6-month plan
4. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
5. Order summary should show:
   - ✅ Subtotal: ₹2,910 or ₹16,704 (membership only, NO fee)
   - ✅ Per month: ₹2,910 or ₹2,784
   - ✅ **Total: ₹2,910 or ₹16,704** (NO +₹2,000)
6. Complete checkout without jersey form
7. Verify in MongoDB:
   - ✅ New membership created
   - ✅ NO new jersey document created
   - ✅ Payment has enrollment_fee: 0 or undefined

---

## Test Scenario 4: Basketball Slot Plan (No Enrollment Fee)

**Objective**: Verify slot plans do NOT get enrollment fee

**Steps**:
1. Go to `/memberships` (logged out or logged in)
2. Select Basketball Slots (Pay Per Class)
3. Select quantity (e.g., 5 slots)
4. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
5. Order summary:
   - ✅ Subtotal: ₹2,000 (5 × ₹400)
   - ✅ **Total: ₹2,000** (NO +₹2,000 fee)

---

## Test Scenario 5: Non-Basketball Plans (No Enrollment Fee)

**Objective**: Verify other sports don't get enrollment fee

**Steps**:
1. Go to `/memberships`
2. Select Futsal or other sport monthly plan
3. Should NOT see:
   - ❌ Jersey Details section
   - ❌ Enrollment Fee line
4. Order summary should show plan price only

---

## Test Scenario 6: Dashboard Jersey Display

**Objective**: Verify jersey details appear on dashboard after purchase

**Steps**:
1. Login as user from Test Scenario 1
2. Go to `/dashboard`
3. Should see section: **Jersey Details**
4. Should display:
   - ✅ Jersey name: `TESTUSER`
   - ✅ Jersey number: `#23`
   - ✅ Size badge: `M`
   - ✅ Height: `170 cm`
   - ✅ Weight: `65 kg`
   - ✅ Created date

---

## Test Scenario 7: API Endpoints

### GET /api/jerseys
```bash
curl -H "Cookie: ft_token=<token>" https://localhost:3000/api/jerseys
```
**Expected Response**:
```json
{
  "jerseys": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "height": "170",
      "weight": "65",
      "name": "TESTUSER",
      "number": 23,
      "size": "M",
      "sport_id": "basketball",
      "created_at": "2026-08-01T10:30:00Z"
    }
  ]
}
```

### GET /api/jerseys/:id
```bash
curl -H "Cookie: ft_token=<token>" https://localhost:3000/api/jerseys/<jersey_id>
```
**Expected Response**:
```json
{
  "jersey": { ... jersey object ... }
}
```

---

## Checkout Page Visual Checklist

- [ ] Jersey form only shows for Basketball Monthly/Half-yearly (not slots)
- [ ] Jersey form shows all 5 fields properly
- [ ] Jersey number accepts 0-999
- [ ] Jersey size buttons work (XS, S, M, L, XL, XXL)
- [ ] Name field auto-capitalizes input
- [ ] Order summary shows ₹2,000 enrollment fee when applicable
- [ ] Enrollment fee NOT shown for non-eligible plans
- [ ] Total calculation correct: base price + enrollment fee
- [ ] Form validation prevents submit without jersey details (if form shown)

---

## Database Validation Checklist

### After Test 1 (First Basketball Purchase):
- [ ] User document created in `users` collection
- [ ] User membership in `user_memberships` with status: 'active'
- [ ] Jersey document in `jerseys` collection with all fields
- [ ] Payment document with enrollment_fee: 2000 and amount: 4910
- [ ] No duplicate jersey documents

### After Test 3 (Renewal):
- [ ] New membership document created (separate from first)
- [ ] NO new jersey document created
- [ ] Payment has enrollment_fee: 0 or undefined
- [ ] Total payment amount = membership price only

---

## Known Issues & Edge Cases

1. **Enrollment fee on admin-granted membership**: Check if admin panel grants also apply enrollment fee (should they?)
2. **Multiple sports**: If user has basketball + other sports, enrollment fee should only apply once
3. **Expired then renew**: User with expired basketball renews → should NOT charge enrollment fee
4. **Cancellation then repurchase**: If user cancels membership then buys again → enrollment fee should NOT apply (user already has)

---

## Success Criteria

✅ All 7 test scenarios pass  
✅ Jersey form only shows for eligible plans  
✅ ₹2,000 enrollment fee correctly calculated and shown  
✅ Jersey details saved to MongoDB  
✅ Jersey details display in dashboard  
✅ Subsequent basketball purchases don't show enrollment fee  
✅ API endpoints return correct jersey data  
✅ No duplicate charges for same user  
