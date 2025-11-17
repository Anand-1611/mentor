# Mock Payment System Documentation

## Overview

Since Stripe is invite-only in India, we've implemented a **mock payment system** that simulates the complete payment flow without actually processing real payments. This allows you to demo the application and test the full user experience.

## Features

### ✅ Realistic Payment UI

The mock payment dialog includes:
- **Multiple payment methods**: Credit/Debit Card, UPI, Net Banking
- **Card input validation**: Proper formatting for card numbers, expiry dates, and CVV
- **Indian payment options**: UPI and popular Indian banks
- **Security indicators**: SSL badge and secure payment messaging
- **Demo mode banner**: Clear indication that this is a simulation

### ✅ Complete Payment Flow

1. User selects a paid note
2. Mock payment dialog opens
3. User enters payment details (any valid format works)
4. Payment processes with a 2-second delay (simulates API call)
5. Transaction is recorded in database
6. User is redirected to success page
7. Note appears in "My Purchases"

### ✅ Database Integration

The mock payment system:
- Creates real transaction records in the database
- Increments download counters
- Generates mock payment intent IDs
- Works seamlessly with the rest of the app

## How It Works

### Automatic Detection

The system automatically detects if Stripe is configured:

```typescript
// In src/services/payment.ts
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isStripeConfigured = publishableKey && !publishableKey.includes("YOUR_PUBLISHABLE_KEY");

if (!isStripeConfigured) {
  throw new Error("MOCK_PAYMENT_REQUIRED");
}
```

### Mock Payment Dialog

When Stripe is not available, the `MockPaymentDialog` component is shown:

**Location**: `src/components/payment/MockPaymentDialog.tsx`

**Features**:
- Card number formatting (1234 5678 9012 3456)
- Expiry date formatting (MM/YY)
- CVV validation (3 digits)
- Cardholder name input
- UPI ID input
- Bank selection for net banking

### Payment Processing

```typescript
// In src/services/payment.ts
export async function processMockPayment(noteId: string, amount: number): Promise<void> {
  // Creates transaction record
  // Increments download counter
  // Uses mock payment intent ID: mock_${timestamp}
}
```

## Usage

### For Users

1. Browse notes in the marketplace
2. Click "View" on a paid note
3. Click "Purchase" button
4. Mock payment dialog opens
5. Select payment method:
   - **Card**: Enter any 16-digit number, MM/YY expiry, 3-digit CVV, and name
   - **UPI**: Enter any UPI ID (default: demo@upi)
   - **Net Banking**: Select any bank
6. Click "Pay ₹{amount}"
7. Wait 2 seconds for processing
8. Redirected to success page
9. Note available in "My Purchases"

### For Developers

#### Enable Real Stripe (When Available)

1. Get Stripe publishable key
2. Add to `.env`:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key
   ```
3. Add to Vercel environment variables
4. Redeploy
5. System automatically switches to real Stripe

#### Test Mock Payment

```typescript
// Any of these card numbers work:
"1234 5678 9012 3456"
"4111 1111 1111 1111"
"5555 5555 5555 4444"

// Any expiry date in MM/YY format:
"12/25"
"06/26"

// Any 3-digit CVV:
"123"
"456"
```

## Payment Methods

### 1. Credit/Debit Card

**Fields**:
- Card Number (16 digits, auto-formatted with spaces)
- Expiry Date (MM/YY format)
- CVV (3 digits, password field)
- Cardholder Name (any text)

**Validation**:
- All fields required
- Card number must be exactly 16 digits
- Expiry must be 5 characters (MM/YY)
- CVV must be 3 digits

### 2. UPI

**Fields**:
- UPI ID (format: username@upi)

**Default**: demo@upi

**Validation**: None (demo mode)

### 3. Net Banking

**Fields**:
- Bank selection dropdown

**Options**:
- HDFC Bank
- ICICI Bank
- State Bank of India
- Axis Bank
- Kotak Mahindra Bank

**Validation**: None (demo mode)

## Database Schema

### Transaction Record

```typescript
{
  id: string;
  buyer_id: string;
  note_id: string;
  amount: number;
  stripe_payment_intent_id: "mock_1234567890"; // Mock ID
  created_at: timestamp;
}
```

## UI Components

### MockPaymentDialog

**Props**:
```typescript
interface MockPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  noteTitle: string;
  onSuccess: () => void;
}
```

**Features**:
- Responsive design
- Accessible form inputs
- Loading states
- Error handling
- Success callbacks

### Demo Mode Banner

```tsx
<Alert className="bg-yellow-50 border-yellow-200">
  <AlertCircle className="h-4 w-4 text-yellow-600" />
  <AlertDescription className="text-yellow-800 text-sm">
    <strong>Demo Mode:</strong> This is a simulated payment screen. 
    No real charges will be made.
  </AlertDescription>
</Alert>
```

## Security Notes

### What's Safe

- ✅ No real payment processing
- ✅ No sensitive data stored
- ✅ No external API calls
- ✅ Clear demo mode indication
- ✅ All data stays in your database

### What to Know

- ⚠️ This is for **demo purposes only**
- ⚠️ Do not use in production with real users
- ⚠️ Switch to real Stripe before launch
- ⚠️ Mock payment IDs are prefixed with "mock_"

## Switching to Real Stripe

When Stripe becomes available in India or you get access:

### Step 1: Get Stripe Keys

1. Sign up at https://stripe.com
2. Get your publishable key (starts with `pk_`)
3. Get your secret key (starts with `sk_`)

### Step 2: Update Environment Variables

**Local (.env)**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key
```

**Vercel**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key
```

**Supabase Edge Functions**:
```bash
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 3: Deploy

1. Redeploy your application
2. System automatically detects Stripe
3. Mock payment dialog is bypassed
4. Real Stripe checkout is used

### Step 4: Test

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVV

## Troubleshooting

### Mock Payment Not Showing

**Check**:
1. Is `VITE_STRIPE_PUBLISHABLE_KEY` set to a placeholder?
2. Does it contain "YOUR_PUBLISHABLE_KEY"?
3. Is the key empty or undefined?

**Solution**: Remove or set to placeholder value

### Payment Not Recording

**Check**:
1. Is user logged in?
2. Does transaction table exist?
3. Are database permissions correct?

**Solution**: Check Supabase logs and permissions

### Success Page Not Loading

**Check**:
1. Is `/payment/success` route configured?
2. Is navigation working?

**Solution**: Check React Router configuration

## Demo Script

Use this script when demoing the app:

```
1. "Let me show you how purchasing works"
2. Browse to a paid note
3. "This note costs ₹50"
4. Click "Purchase"
5. "Since Stripe isn't available in India yet, we have a demo payment system"
6. Select "Credit/Debit Card"
7. Enter: 1234 5678 9012 3456
8. Enter: 12/25
9. Enter: 123
10. Enter: John Doe
11. Click "Pay ₹50"
12. "Processing payment..."
13. "Payment successful! The note is now in my purchases"
14. Navigate to "My Purchases"
15. "Here's the note I just bought"
```

## Future Enhancements

### When Stripe is Available

- [ ] Remove mock payment system
- [ ] Enable real payment processing
- [ ] Add webhook handling
- [ ] Implement refunds
- [ ] Add payment history
- [ ] Enable subscriptions

### Possible Alternatives

If Stripe remains unavailable:
- **Razorpay**: Popular in India
- **PayU**: Indian payment gateway
- **Instamojo**: Indian payment solution
- **Cashfree**: Indian payment gateway

## Summary

The mock payment system provides a complete, realistic payment experience for demo purposes. It:

- ✅ Looks and feels like real payment
- ✅ Records transactions in database
- ✅ Works with existing purchase flow
- ✅ Clearly indicates demo mode
- ✅ Easy to switch to real Stripe
- ✅ No security risks
- ✅ Perfect for demos and testing

---

**Status**: ✅ Implemented
**Date**: 2024-11-17
**Purpose**: Demo and testing until Stripe is available
**Location**: `src/components/payment/MockPaymentDialog.tsx`
