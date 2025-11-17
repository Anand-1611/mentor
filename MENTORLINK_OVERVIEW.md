# 🎓 MentorLink - Complete Overview

## What is MentorLink?

MentorLink is an **all-in-one educational platform** that connects students with mentors and provides a marketplace for study materials. Think of it as "Udemy + Fiverr + Course Hero" combined into one platform.

---

## 👥 User Workflows

### 1. Student Journey

#### A. Getting Started
1. **Sign Up** - Create account with email/password
2. **Complete Profile** - Add name, bio, profile picture
3. **Browse Platform** - Explore notes and mentors

#### B. Notes Marketplace (Buy Study Materials)
1. **Browse Notes**
   - Search by subject, university, course
   - Filter by price range (₹0 - ₹5000)
   - Sort by recent, popular, or price
   - Preview PDF before buying

2. **Purchase Notes**
   - Click "Purchase" on any paid note
   - **Mock Payment Dialog** opens (since Stripe isn't available in India yet)
   - Choose payment method:
     - Credit/Debit Card
     - UPI
     - Net Banking
   - Enter payment details
   - Complete purchase

3. **Access Purchased Notes**
   - Go to "My Purchases"
   - Download watermarked PDF (with your email + transaction ID)
   - Access anytime, unlimited downloads

#### C. Mentor Booking (Get 1-on-1 Help)
1. **Find a Mentor**
   - Browse mentor profiles
   - View ratings, reviews, expertise
   - Check hourly rate and availability

2. **Book a Session**
   - Select date and time slot
   - Choose session duration (30 min, 1 hour, 2 hours)
   - Add session notes/topics to discuss
   - Make payment (mock payment for now)

3. **Attend Session**
   - Receive email confirmation
   - Join video call at scheduled time
   - Get session recording (optional)

4. **Leave Review**
   - Rate mentor (1-5 stars)
   - Write review
   - Help other students

#### D. AI Study Tools (Free Features)
1. **Upload Your Notes**
   - Upload PDF of your notes
   - AI processes and analyzes content

2. **Generate Flashcards**
   - AI creates flashcards from your notes
   - Study with spaced repetition
   - Track progress

3. **Take Quizzes**
   - AI generates quiz questions
   - Multiple choice, true/false
   - Get instant feedback
   - Track scores over time

4. **Chat with Your Notes**
   - Ask questions about your notes
   - AI answers based on content
   - Get explanations and summaries

#### E. Sell Your Notes (Earn Money)
1. **Upload Notes for Sale**
   - Upload high-quality PDF
   - Set price (₹0 for free, or ₹50-₹5000)
   - Add title, description, tags
   - Select subject and university

2. **Earn Money**
   - Students purchase your notes
   - Platform takes 10% commission
   - You get 90% payout
   - Track earnings in dashboard

---

### 2. Mentor Journey

#### A. Become a Mentor
1. **Sign Up** as mentor
2. **Complete Profile**
   - Add expertise areas
   - Set hourly rate
   - Upload credentials/certificates
   - Write bio

3. **Set Availability**
   - Define available time slots
   - Set recurring schedule
   - Block unavailable dates

#### B. Receive Bookings
1. **Get Booking Notifications**
   - Email when student books
   - View booking details
   - Accept/decline booking

2. **Conduct Sessions**
   - Join video call at scheduled time
   - Use built-in video conferencing
   - Share screen, whiteboard
   - Record session (optional)

3. **Get Paid**
   - Automatic payment after session
   - Platform takes 15% commission
   - You get 85% payout
   - Track earnings

#### C. Build Reputation
1. **Receive Reviews**
   - Students rate and review you
   - Build 5-star rating
   - Get featured as top mentor

2. **Grow Your Business**
   - More reviews = more bookings
   - Increase your rate over time
   - Become verified mentor

---

## 🛠️ Tech Stack

### Frontend
```
React 18.3 + TypeScript
├── Vite (Build tool)
├── React Router (Navigation)
├── TanStack Query (Data fetching)
├── Tailwind CSS (Styling)
├── shadcn/ui (UI components)
├── Framer Motion (Animations)
└── Lucide React (Icons)
```

**Why?**
- **React**: Modern, component-based UI
- **TypeScript**: Type safety, fewer bugs
- **Vite**: Lightning-fast dev server
- **Tailwind**: Rapid UI development
- **shadcn/ui**: Beautiful, accessible components

### Backend & Database
```
Supabase (Backend-as-a-Service)
├── PostgreSQL (Database)
├── Row Level Security (RLS)
├── Realtime subscriptions
├── Edge Functions (Serverless)
├── Storage (File uploads)
└── Authentication (Auth)
```

**Why?**
- **Supabase**: Full backend without writing server code
- **PostgreSQL**: Powerful, reliable database
- **RLS**: Secure data access at database level
- **Edge Functions**: Serverless API endpoints
- **Built-in Auth**: No need for separate auth service

### AI Services
```
Python FastAPI Microservice
├── OpenAI GPT-4 (AI processing)
├── LangChain (AI orchestration)
├── PDF Processing (PyPDF2)
├── Vector Database (Embeddings)
└── FastAPI (REST API)
```

**Why?**
- **Python**: Best for AI/ML workloads
- **FastAPI**: Fast, modern Python framework
- **OpenAI**: State-of-the-art AI models
- **LangChain**: Simplifies AI workflows

### Payment System
```
Mock Payment (Demo Mode)
├── Realistic UI (Card, UPI, Net Banking)
├── Transaction recording
├── Watermarked file generation
└── Ready to switch to Stripe/Razorpay
```

**Why Mock?**
- Stripe is invite-only in India
- Allows full demo and testing
- Easy to switch to real payment later
- No code changes needed

### File Storage
```
Supabase Storage
├── PDF files (notes)
├── Profile pictures (avatars)
├── Watermarked PDFs (purchases)
└── CDN delivery
```

**Why?**
- Integrated with Supabase
- Automatic CDN
- Secure access policies
- Cost-effective

### Video Conferencing
```
Daily.co API
├── Video calls
├── Screen sharing
├── Recording
└── Embedded in app
```

**Why?**
- Easy integration
- Reliable video quality
- No infrastructure needed
- Generous free tier

### Monitoring & Analytics
```
Sentry (Error Tracking)
├── Automatic error capture
├── Performance monitoring
├── Session replay
└── User context

Better Stack (Logging)
├── Log aggregation
├── Uptime monitoring
├── Alert management
└── Incident tracking
```

**Why?**
- Know when things break
- Track performance issues
- Monitor uptime
- Debug production issues

### Deployment
```
Vercel (Frontend)
├── Automatic deployments
├── Preview deployments
├── Edge network (CDN)
└── Analytics

Railway/Render (AI Services)
├── Python hosting
├── Auto-scaling
├── Environment variables
└── Logs
```

**Why?**
- **Vercel**: Best for React apps, automatic CI/CD
- **Railway**: Easy Python deployment

---

## 🔄 Complete User Flow Examples

### Example 1: Student Buys Notes

```
1. Student signs up → Email verification
2. Browses notes → Searches "Data Structures"
3. Finds note → Previews PDF
4. Clicks "Purchase" → Mock payment dialog opens
5. Enters card details → Processes payment (2 sec)
6. Transaction recorded → Watermarked PDF generated
7. Redirected to success page → Note in "My Purchases"
8. Downloads PDF → Can access anytime
```

**Tech Flow**:
```
React UI → Supabase Auth → PostgreSQL (check user)
→ Mock Payment Component → Transaction table insert
→ Supabase Edge Function → Watermark PDF
→ Store in watermarked-notes bucket → Return download link
→ Update download counter → Send confirmation email
```

### Example 2: Student Books Mentor

```
1. Student browses mentors → Filters by subject
2. Views mentor profile → Checks reviews, rate
3. Clicks "Book Session" → Calendar opens
4. Selects date/time → Chooses duration
5. Adds session notes → Proceeds to payment
6. Completes payment → Booking confirmed
7. Receives email → With video call link
8. Joins at scheduled time → Video call starts
9. Session ends → Leaves review
```

**Tech Flow**:
```
React UI → Supabase Auth → Check mentor availability
→ Create booking record → Mock payment
→ Supabase Edge Function → Send emails (mentor + student)
→ Daily.co API → Create video room
→ Store room link → Send in email
→ At session time → Join video call
→ After session → Review form → Update mentor rating
```

### Example 3: AI Flashcard Generation

```
1. Student uploads PDF → File uploaded to storage
2. AI processes → Extracts text from PDF
3. Chunks text → Sends to OpenAI
4. GPT-4 generates → Flashcards with Q&A
5. Stores in database → Returns to frontend
6. Student studies → Spaced repetition algorithm
7. Tracks progress → Updates study streaks
```

**Tech Flow**:
```
React UI → Supabase Storage → Upload PDF
→ Trigger Edge Function → Call AI service
→ Python FastAPI → PyPDF2 extracts text
→ LangChain → Chunks text
→ OpenAI API → Generate flashcards
→ Return JSON → Store in PostgreSQL
→ React displays → Interactive flashcard UI
```

---

## 📊 Database Schema (Simplified)

```
users (Supabase Auth)
├── id
├── email
└── created_at

profiles
├── id (FK to users)
├── full_name
├── bio
├── avatar_url
├── role (student/mentor)
└── is_mentor

notes
├── id
├── owner_id (FK to profiles)
├── title
├── description
├── price
├── file_path
├── subject
├── university
├── downloads_count
└── created_at

transactions
├── id
├── buyer_id (FK to profiles)
├── note_id (FK to notes)
├── amount
├── stripe_payment_intent_id
├── watermarked_file_path
└── created_at

bookings
├── id
├── student_id (FK to profiles)
├── mentor_id (FK to profiles)
├── scheduled_at
├── duration_minutes
├── status
├── video_room_url
├── amount
└── created_at

reviews
├── id
├── reviewer_id (FK to profiles)
├── mentor_id (FK to profiles)
├── booking_id (FK to bookings)
├── rating (1-5)
├── comment
└── created_at

flashcards
├── id
├── user_id (FK to profiles)
├── note_id (FK to notes)
├── question
├── answer
├── difficulty
└── next_review_date

messages
├── id
├── sender_id (FK to profiles)
├── receiver_id (FK to profiles)
├── content
├── read
└── created_at
```

---

## 🎨 Key Features

### For Students
- ✅ Browse and purchase study notes
- ✅ Book 1-on-1 mentor sessions
- ✅ AI-powered flashcards
- ✅ AI-generated quizzes
- ✅ Chat with your notes (AI)
- ✅ Track study progress
- ✅ Study streaks and gamification
- ✅ Sell your own notes

### For Mentors
- ✅ Set your own rates
- ✅ Manage availability
- ✅ Video conferencing built-in
- ✅ Receive bookings and payments
- ✅ Build reputation with reviews
- ✅ Track earnings

### Platform Features
- ✅ Secure authentication
- ✅ Real-time chat
- ✅ File uploads (PDF)
- ✅ Payment processing (mock for now)
- ✅ Email notifications
- ✅ Search and filters
- ✅ Responsive design (mobile-friendly)
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring

---

## 🚀 Deployment Architecture

```
User Browser
    ↓
Vercel CDN (Frontend)
    ↓
Supabase (Backend)
    ├── PostgreSQL (Database)
    ├── Storage (Files)
    ├── Auth (Users)
    └── Edge Functions (API)
    ↓
Railway/Render (AI Services)
    └── Python FastAPI
        └── OpenAI API
    ↓
Daily.co (Video)
```

---

## 💰 Revenue Model

### Commission Structure
- **Notes Sales**: 10% platform fee (90% to seller)
- **Mentor Sessions**: 15% platform fee (85% to mentor)

### Example Earnings
**Student sells note for ₹100**:
- Platform: ₹10
- Student: ₹90

**Mentor charges ₹500/hour**:
- Platform: ₹75
- Mentor: ₹425

---

## 🎯 Target Users

### Primary
- **College Students** (18-25 years)
- **Subject Matter Experts** (Mentors)
- **Note Sellers** (Top students)

### Use Cases
- Exam preparation
- Assignment help
- Concept clarification
- Career guidance
- Skill development

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure file storage with access policies
- ✅ Watermarked PDFs (prevent piracy)
- ✅ Email verification
- ✅ Secure payment processing
- ✅ HTTPS everywhere
- ✅ Environment variables for secrets
- ✅ Rate limiting on AI endpoints

---

## 📈 Scalability

### Current Capacity
- **Users**: Unlimited (Supabase scales automatically)
- **Files**: Unlimited (Supabase Storage)
- **AI Requests**: Limited by OpenAI quota
- **Video Calls**: Limited by Daily.co plan

### Future Scaling
- Add Redis for caching
- CDN for static assets (already via Vercel)
- Database read replicas
- Horizontal scaling for AI services
- Queue system for background jobs

---

## 🎉 Summary

**MentorLink** is a comprehensive educational platform that:

1. **Connects** students with mentors
2. **Provides** a marketplace for study materials
3. **Offers** AI-powered study tools
4. **Enables** video conferencing
5. **Processes** payments (mock for now)
6. **Tracks** progress and analytics

**Built with modern tech stack**:
- React + TypeScript (Frontend)
- Supabase (Backend)
- Python + FastAPI (AI)
- Mock Payment (Demo)
- Vercel (Deployment)

**Ready for**:
- MVP launch
- User testing
- Investor demos
- Production deployment

---

**Status**: Fully functional MVP
**Date**: 2024-11-17
**Next**: Deploy to production and onboard users!
