# Booking System Integration Test Plan

## Test Environment Setup

### Prerequisites
- Supabase project with migrations applied
- Stripe test mode configured
- Two test accounts: one mentor, one student
- Daily.co API key (optional for testing)

### Test Data
```
Mentor Account:
- Email: mentor@test.com
- Subject: Mathematics
- Hourly Rate: ₹500
- Availability: Monday-Friday, 9:00 AM - 5:00 PM

Student Account:
- Email: student@test.com
```

## Test Cases

### TC1: Mentor Sets Availability
**Steps:**
1. Log in as mentor account
2. Navigate to profile/settings
3. Open AvailabilitySettings component
4. Enable Monday with 9:00 AM - 5:00 PM
5. Click "Save Availability"

**Expected Results:**
- ✅ Success toast appears
- ✅ Record created in mentor_availability table
- ✅ Settings persist on page reload

**SQL Verification:**
```sql
SELECT * FROM mentor_availability 
WHERE mentor_id = 'mentor_user_id';
```

---

### TC2: Student Views Mentor Profile
**Steps:**
1. Log in as student account
2. Navigate to /mentors
3. Click on mentor card
4. Verify redirect to /mentors/:mentorId

**Expected Results:**
- ✅ Mentor profile displays correctly
- ✅ Booking calendar shows next 14 days
- ✅ Monday shows available time slots
- ✅ Other days show "No availability"

---

### TC3: Student Selects Time Slot
**Steps:**
1. On mentor profile page
2. Select next Monday from calendar
3. Click on 10:00 AM time slot

**Expected Results:**
- ✅ BookingConfirmationDialog opens
- ✅ Shows correct mentor name
- ✅ Shows selected date and time
- ✅ Shows duration (60 minutes)
- ✅ Shows correct price (₹500)

---

### TC4: Student Completes Booking Payment
**Steps:**
1. In confirmation dialog, click "Proceed to Payment"
2. Redirected to Stripe Checkout
3. Enter test card: 4242 4242 4242 4242
4. Complete payment

**Expected Results:**
- ✅ Booking record created with pending status
- ✅ Payment session created
- ✅ Redirected to Stripe Checkout
- ✅ Payment succeeds
- ✅ Webhook receives checkout.session.completed
- ✅ Booking status updated to confirmed
- ✅ Video room created (meeting_url populated)
- ✅ Email notifications logged
- ✅ Redirected to success page

**SQL Verification:**
```sql
-- Check booking
SELECT * FROM bookings 
WHERE student_id = 'student_user_id' 
AND status = 'confirmed';

-- Check payment session
SELECT * FROM payment_sessions 
WHERE user_id = 'student_user_id' 
AND status = 'completed';

-- Verify meeting URL exists
SELECT meeting_url FROM bookings 
WHERE id = 'booking_id';
```

---

### TC5: Student Views Booking
**Steps:**
1. Navigate to /my-bookings
2. Check "Upcoming" tab

**Expected Results:**
- ✅ Booking appears in list
- ✅ Shows mentor name
- ✅ Shows correct date and time
- ✅ Shows amount paid
- ✅ Shows "Upcoming" badge
- ✅ "Join Call" button disabled (if more than 10 min before)

---

### TC6: Student Joins Video Call
**Steps:**
1. Wait until 10 minutes before booking time (or modify booking time for testing)
2. Refresh /my-bookings page
3. Click "Join Call" button

**Expected Results:**
- ✅ "Join Call" button is enabled
- ✅ VideoCallInterface component loads
- ✅ Shows "Join Call" button
- ✅ Click joins the call
- ✅ Daily.co iframe loads
- ✅ Video/audio controls appear
- ✅ Can toggle video on/off
- ✅ Can toggle audio on/off
- ✅ Can share screen
- ✅ Can leave call

---

### TC7: Mentor Views Booking
**Steps:**
1. Log in as mentor account
2. Navigate to /my-bookings
3. Check "Upcoming" tab

**Expected Results:**
- ✅ Same booking appears in list
- ✅ Shows student name
- ✅ Shows correct date and time
- ✅ Shows amount
- ✅ Can join call when time arrives

---

### TC8: Booking Prevents Double Booking
**Steps:**
1. Log in as different student account
2. Navigate to same mentor profile
3. Try to book same time slot

**Expected Results:**
- ✅ Time slot shows as "Booked"
- ✅ Button is disabled
- ✅ Cannot select that slot

---

### TC9: Past Time Slots Disabled
**Steps:**
1. View mentor calendar
2. Check time slots for today

**Expected Results:**
- ✅ Past time slots are disabled
- ✅ Future time slots are enabled
- ✅ Cannot book past times

---

### TC10: Booking Outside Availability
**Steps:**
1. View mentor calendar
2. Select a day mentor is not available (e.g., Saturday)

**Expected Results:**
- ✅ Day is disabled in calendar
- ✅ Shows "No availability on this day"
- ✅ No time slots displayed

---

## Edge Cases

### EC1: Concurrent Booking Attempts
**Test:** Two students try to book same slot simultaneously
**Expected:** One succeeds, other gets error or sees slot as booked

### EC2: Payment Failure
**Test:** Use declined test card (4000 0000 0000 0002)
**Expected:** Booking remains pending, user notified of failure

### EC3: Webhook Delay
**Test:** Simulate webhook delay
**Expected:** Booking eventually confirmed, user can refresh to see status

### EC4: Video Room Creation Failure
**Test:** Invalid Daily.co API key
**Expected:** Booking still confirmed, placeholder URL used, admin notified

### EC5: Timezone Handling
**Test:** User in different timezone
**Expected:** Times displayed correctly in user's local timezone

---

## Performance Tests

### PT1: Calendar Load Time
**Test:** Measure time to load calendar with availability
**Target:** < 500ms

### PT2: Booking Creation
**Test:** Measure time from slot selection to payment redirect
**Target:** < 2 seconds

### PT3: Video Call Join
**Test:** Measure time from click to video stream
**Target:** < 5 seconds

---

## Security Tests

### ST1: RLS Policies
**Test:** Try to access other user's bookings
**Expected:** Access denied

### ST2: Payment Verification
**Test:** Try to create booking without payment
**Expected:** Booking remains pending until payment confirmed

### ST3: Video Room Access
**Test:** Try to access video room URL without booking
**Expected:** Daily.co handles authentication

---

## Regression Tests

After any changes, verify:
- [ ] Existing bookings still display correctly
- [ ] Payment flow still works
- [ ] Video calls still function
- [ ] Email notifications still trigger
- [ ] Calendar still shows correct availability

---

## Manual Testing Checklist

- [ ] Mentor can set availability
- [ ] Student can view available slots
- [ ] Booking confirmation shows correct details
- [ ] Payment completes successfully
- [ ] Booking appears in MyBookings
- [ ] Video room URL is generated
- [ ] Join button appears at correct time
- [ ] Video call works properly
- [ ] Both parties can see the booking
- [ ] Past bookings move to "Past" tab
- [ ] Cancelled bookings show correct status

---

## Automated Test Ideas

```typescript
// Example test structure (not implemented)
describe('Booking Flow', () => {
  it('should create booking with payment', async () => {
    // 1. Set mentor availability
    // 2. Select time slot
    // 3. Confirm booking
    // 4. Mock Stripe payment
    // 5. Verify booking created
    // 6. Verify video room created
  });

  it('should prevent double booking', async () => {
    // 1. Create first booking
    // 2. Try to book same slot
    // 3. Verify second attempt fails
  });

  it('should allow joining call at correct time', async () => {
    // 1. Create booking
    // 2. Mock time to be 10 min before
    // 3. Verify join button enabled
    // 4. Mock time to be after session
    // 5. Verify join button disabled
  });
});
```

---

## Bug Report Template

```
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. 
2. 
3. 

Expected Result:
Actual Result:
Screenshots:
Environment:
- Browser:
- OS:
- User Role:
```

---

## Test Results Log

| Test Case | Date | Tester | Result | Notes |
|-----------|------|--------|--------|-------|
| TC1 | | | | |
| TC2 | | | | |
| TC3 | | | | |
| TC4 | | | | |
| TC5 | | | | |
| TC6 | | | | |
| TC7 | | | | |
| TC8 | | | | |
| TC9 | | | | |
| TC10 | | | | |
