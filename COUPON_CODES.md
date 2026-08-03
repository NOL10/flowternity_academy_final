# Flowternity Academy Coupon Codes

## Active Coupons

### 1. NEWJERSEY20
- **Type**: Enrollment Fee Waiver
- **Discount**: ₹2,000 (100% waive of jersey enrollment fee)
- **Applies To**: 
  - Basketball 1-month plan
  - Basketball 6-month plan
- **Description**: Waive jersey enrollment fee
- **Usage**: Customers get FREE 2 sets of jerseys (no ₹2,000 fee)
- **Notes**: 
  - Jersey information still collected
  - Cannot be combined with other enrollment fee coupons
  - Can be combined with membership discount coupons

### 2. Coach30
- **Type**: Membership Discount
- **Discount**: ₹2,000 off membership price
- **Applies To**: Basketball 12-month plan only
- **Description**: ₹2,000 off
- **Usage**: Reduces 12-month plan from ₹24,708 to ₹22,708
- **Notes**:
  - Jersey collection still applies (no fee for 12M anyway)
  - Can be combined with NEWJERSEY20 if user upgrades to 1M or 6M

---

## How Coupons Work in Checkout

### Membership Discount Coupons (Coach30)
- Reduces the base membership price
- Applied to subtotal
- Affects the recurring monthly payment calculation

### Enrollment Fee Waiver Coupons (NEWJERSEY20)
- Waives the ₹2,000 one-time jersey enrollment fee
- Only applies to 1-month and 6-month plans
- Cannot be applied to 12-month plan (already free)
- Cannot be applied to slot plans (no fee anyway)

### Multiple Coupons
- Users CAN apply both a membership discount AND an enrollment fee waiver
- Each coupon shows separately in the coupon section
- Both can be removed independently

---

## Checkout Examples

### Example 1: Basketball 1-month + NEWJERSEY20
```
Subtotal: ₹2,910
Enrollment Fee: ₹2,000
  ↓ Apply NEWJERSEY20
Subtotal: ₹2,910
Enrollment Fee: ₹0 (waived)
Total: ₹2,910
```

### Example 2: Basketball 6-month + NEWJERSEY20
```
Subtotal: ₹16,704
Enrollment Fee: ₹2,000
  ↓ Apply NEWJERSEY20
Subtotal: ₹16,704
Enrollment Fee: ₹0 (waived)
Total: ₹16,704
```

### Example 3: Basketball 12-month + Coach30 + NEWJERSEY20 (attempt)
```
Subtotal: ₹24,708
  ↓ Apply Coach30
Subtotal: ₹22,708
  ↓ Try to apply NEWJERSEY20
Error: "This coupon only applies to: basketball_1m, basketball_6m"
```

### Example 4: Basketball 6-month with both coupons (if we upgrade membership discount)
```
(If Coach30 is updated to apply to 6-month plan)
Subtotal: ₹16,704
Discount (Coach30): -₹2,000
Enrollment Fee: ₹2,000
  ↓ Apply Coach30, then NEWJERSEY20
Subtotal: ₹16,704
Discount (Coach30): -₹2,000
Enrollment Fee: ₹0 (waived by NEWJERSEY20)
Total: ₹14,704
```

---

## Adding New Coupons

To add a new coupon, edit `lib/flowternity/config.js`:

```javascript
export const COUPONS = [
  // Existing coupons...
  
  // New coupon template
  { 
    code: 'COUPON_CODE',
    discount_amount: 1000,
    description: 'Description here',
    applicable_to: 'membership', // OR 'enrollment_fee'
    applicable_plans: ['basketball_1m', 'basketball_6m'] 
  },
];
```

### Coupon Types:

**Membership Coupons** (`applicable_to: 'membership'`):
- Discount the base membership price
- Applied before calculating enrollment fee
- Can be combined with enrollment fee coupons

**Enrollment Fee Coupons** (`applicable_to: 'enrollment_fee'`):
- Discount only the ₹2,000 jersey enrollment fee
- Only work on 1-month and 6-month plans
- Can be combined with membership coupons

---

## Testing Coupons

### Test NEWJERSEY20
1. Go to checkout with Basketball 1-month or 6-month plan
2. See enrollment fee of ₹2,000
3. Enter coupon code: `NEWJERSEY20`
4. Click Apply
5. Verify:
   - ✅ Enrollment fee becomes ₹0
   - ✅ Total reduces by ₹2,000
   - ✅ Jersey form still shows (data collection)
   - ✅ Jersey details still collected on payment
   - ✅ "NEWJERSEY20: Waive jersey enrollment fee" shown in coupon list

### Test Coach30
1. Go to checkout with Basketball 12-month plan
2. See total of ₹24,708
3. Enter coupon code: `Coach30`
4. Click Apply
5. Verify:
   - ✅ Subtotal reduces by ₹2,000
   - ✅ Total becomes ₹22,708
   - ✅ Jersey form still shows
   - ✅ No additional fees

### Test Combined Coupons (Future)
- If we expand Coach30 to work on 1-month/6-month:
1. Apply both NEWJERSEY20 and Coach30
2. Both discounts should stack
3. Each should be removable independently

---

## API Considerations

### Checkout Order Creation
The `enrollment_fee` parameter is automatically included in the payment:
```json
{
  "membership_id": "basketball_1m",
  "enrollment_fee": 2000,  // or 0 if NEWJERSEY20 applied
  "jersey": { ... }
}
```

### Payment Record
Payment documents include both:
```json
{
  "amount": 2910,  // or 4910 if no coupon
  "enrollment_fee": 2000,  // or 0 if waived
  "coupon_code": "NEWJERSEY20",
  ...
}
```

---

## UI Indicators

- ✅ Green checkmark when coupon applied
- ✅ Shows coupon code and description
- ✅ Individual Remove buttons for each coupon
- ✅ Toast notification when applied/removed
- ✅ Disabled input if both coupons already applied
- ❌ Error toast if coupon not applicable to plan
- ❌ Red banner if trying to use NEWJERSEY20 on non-eligible plan
