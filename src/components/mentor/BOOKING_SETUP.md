# Booking System Setup Guide

This document explains how to set up and use the booking system for MentorLink.

## Components Created

### 1. AvailabilitySettings.tsx
Allows mentors to set their weekly availability schedule.

**Features:**
- Toggle availability for each day of the week
- Set start and end times for available days
- Save availability to database

**Usage:**
```tsx
import { AvailabilitySettings } from "@/components/mentor/AvailabilitySettings";

<AvailabilitySettings />
```

### 2. MentorBookingCalendar.tsx
Displays available time slots for booking sessions with a mentor.

**Features:**
- Calendar view showing next 14 days
- Available time slots based on mentor availability
- Disabled slots for past times and existing bookings
- Time zone handling

**Usage:**
```tsx
import { MentorBookingCalendar } from "@/components/mentor/MentorBookingCalendar";

<MentorBookingCalendar
  mentorId={mentorId}
  mentorName={mentorName}
  hourlyRate={hourlyRate}
  onBookingSelect={(slot, duration) => {
    // Handle booking selection
  }}
/>
```

### 3. BookingConfirmationDialog.tsx
Confirmation dialog for booking a session with payment integration.

**Features:**
- Display booking details (mentor, date, time, price)
- Calculate total price based on hourly rate and duration
- Stripe checkout integration
- Create booking record in database

**Usage:**
```tsx
import { BookingConfirmationDialog } from "@/components/mentor/BookingConfirmationDialog";

<BookingConfirmationDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  mentorId={mentorId}
  mentorName={mentorName}
  slot={selectedSlot}
  duration={60}
  hourlyRate={hourlyRate}
/>
```

### 4. VideoCallInterface.tsx
Video call interface using Daily.co for mentoring sessions.

**Features:**
- Join/leave video calls
- Toggle video and audio
- Screen sharing
- Basic call controls

**Usage:**
```tsx
import { VideoCallInterface } from "@/components/mentor/VideoCallInterface";

<VideoCallInterface
  meetingUrl={meetingUrl}
  bookingId={bookingId}
  userName={userName}
/>
```

## Pages Created

### 1. MentorProfile.tsx
Displays mentor profile with booking calendar.

**Route:** `/mentors/:mentorId`

### 2. MyBookings.tsx
Shows user's bookings (as student or mentor) with ability to join video calls.

**Route:** `/my-bookings`

## Database Migration

Run the migration to create the `mentor_availability` table:

```bash
# The migration file is located at:
supabase/migrations/20251113000005_create_mentor_availability.sql
```

This creates:
- `mentor_availability` table with day_of_week, start_time, end_time fields
- Indexes for performance
- RLS policies for security
- Additional columns in `bookings` table (meeting_url, duration, amount)

## Edge Functions

### 1. create-video-room
Creates Daily.co video rooms for confirmed bookings.

**Location:** `supabase/functions/create-video-room/index.ts`

**Environment Variables Required:**
- `DAILY_API_KEY` - Your Daily.co API key (optional, will use placeholder if not set)

### 2. send-booking-email
Sends email notifications to student and mentor after booking confirmation.

**Location:** `supabase/functions/send-booking-email/index.ts`

**Note:** Currently logs emails to console. Integrate with email service (Resend, SendGrid, etc.) for production.

### 3. Updated stripe-webhook
Enhanced to handle booking payments and trigger video room creation + email notifications.

## Setup Instructions

### 1. Install Dependencies

The following packages are already in package.json:
- `@stripe/stripe-js` - Stripe payment integration
- `date-fns` - Date manipulation
- `react-day-picker` - Calendar component

**Additional package needed:**
```bash
npm install @daily-co/daily-js
# or
bun add @daily-co/daily-js
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Stripe (already configured)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Daily.co (new)
DAILY_API_KEY=your_daily_api_key_here
```

### 3. Daily.co Setup

1. Sign up at https://daily.co
2. Get your API key from the dashboard
3. Add it to your Supabase Edge Functions environment variables:
   ```bash
   supabase secrets set DAILY_API_KEY=your_api_key
   ```

### 4. Run Database Migration

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually in Supabase dashboard
```

### 5. Deploy Edge Functions

```bash
# Deploy the new functions
supabase functions deploy create-video-room
supabase functions deploy send-booking-email

# Redeploy updated webhook
supabase functions deploy stripe-webhook
```

## Usage Flow

### For Mentors:

1. Navigate to profile/settings
2. Use `AvailabilitySettings` component to set weekly schedule
3. Students can now book sessions during available times
4. View bookings in `/my-bookings`
5. Join video calls 10 minutes before session

### For Students:

1. Browse mentors at `/mentors`
2. Click "Book Session" on a mentor card
3. View mentor profile at `/mentors/:mentorId`
4. Select date and time from calendar
5. Confirm booking and proceed to payment
6. After payment, booking is confirmed and video room is created
7. View bookings in `/my-bookings`
8. Join video call when session time arrives

## Testing

### Test Booking Flow:

1. Create a mentor account and set availability
2. Log in as a different user (student)
3. Navigate to mentor profile
4. Select an available time slot
5. Complete payment with Stripe test card: `4242 4242 4242 4242`
6. Check that booking appears in `/my-bookings`
7. Verify video room URL is created
8. Test joining the video call

### Test Video Call:

1. Open booking in `/my-bookings` 10 minutes before scheduled time
2. Click "Join Call" button
3. Verify video/audio controls work
4. Test screen sharing
5. Test leaving the call

## Troubleshooting

### Calendar not showing available slots:
- Check that mentor has set availability in `AvailabilitySettings`
- Verify `mentor_availability` table has records
- Check browser console for errors

### Payment not working:
- Verify Stripe keys are correct
- Check webhook is receiving events
- Look at Stripe dashboard for payment status

### Video call not loading:
- Verify Daily.co API key is set
- Check that `meeting_url` is stored in booking record
- Ensure Daily.co script loads (check browser console)
- Try loading Daily.co from CDN as fallback

### Bookings not appearing:
- Check RLS policies on `bookings` table
- Verify user is authenticated
- Check that booking status is correct

## Future Enhancements

- Add booking cancellation/rescheduling
- Implement mentor ratings and reviews
- Add recurring availability patterns
- Support multiple duration options (30min, 60min, 90min)
- Add calendar sync (Google Calendar, iCal)
- Implement waiting room for video calls
- Add session recording capability
- Send reminder emails before sessions
