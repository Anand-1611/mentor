# Infrastructure Reference Guide

Quick reference for using the file storage and payment infrastructure.

## Storage API

### Import

```typescript
import {
  uploadFile,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  validateFile,
  generateStoragePath,
  STORAGE_BUCKETS,
} from "@/lib/storage";
```

### Upload a File

```typescript
// Generate a unique path
const userId = "user-123";
const path = generateStoragePath(userId, file.name, "notes");

// Upload file
const { data, error } = await uploadFile("notes", path, file);

if (error) {
  console.error("Upload failed:", error);
} else {
  console.log("File uploaded to:", data.path);
}
```

### Get File URL

```typescript
// For public buckets (thumbnails, avatars)
const publicUrl = getPublicUrl("thumbnails", "path/to/file.png");

// For private buckets (notes, grades) - expires in 1 hour
const { data, error } = await getSignedUrl("notes", "path/to/file.pdf");
if (data) {
  console.log("Signed URL:", data.signedUrl);
}
```

### Validate File Before Upload

```typescript
const validation = validateFile(file, "notes");
if (!validation.valid) {
  alert(validation.error);
  return;
}
```

### Delete a File

```typescript
const { error } = await deleteFile("notes", "path/to/file.pdf");
```

## Payment API

### Import

```typescript
import {
  createCheckoutSession,
  calculatePaymentBreakdown,
  formatCurrency,
  validateNotePrice,
  validateHourlyRate,
  STRIPE_CONFIG,
} from "@/lib/stripe";
```

### Create Checkout Session for Note Purchase

```typescript
const session = await createCheckoutSession({
  noteId: "note-uuid",
  amount: 100, // ₹100
  successUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/notes`,
});

if (session) {
  // Redirect to Stripe Checkout
  window.location.href = session.url;
}
```

### Create Checkout Session for Booking

```typescript
const session = await createCheckoutSession({
  bookingId: "booking-uuid",
  amount: 500, // ₹500
});

if (session) {
  window.location.href = session.url;
}
```

### Calculate Payment Breakdown

```typescript
const breakdown = calculatePaymentBreakdown(100);
console.log(breakdown);
// {
//   amount: 100,
//   commission: 15,
//   sellerPayout: 85,
//   commissionRate: 0.15
// }
```

### Format Currency

```typescript
const formatted = formatCurrency(100);
console.log(formatted); // "₹100"
```

### Validate Prices

```typescript
// Validate note price (₹10 - ₹5000)
const priceValidation = validateNotePrice(50);
if (!priceValidation.valid) {
  alert(priceValidation.error);
}

// Validate hourly rate (₹100 - ₹5000)
const rateValidation = validateHourlyRate(200);
if (!rateValidation.valid) {
  alert(rateValidation.error);
}
```

## Storage Bucket Specifications

| Bucket | Public | Max Size | Allowed Types |
|--------|--------|----------|---------------|
| `notes` | No | 50 MB | PDF |
| `thumbnails` | Yes | 5 MB | PNG, JPEG, WebP |
| `grades` | No | 5 MB | PNG, JPEG, CSV |
| `avatars` | Yes | 2 MB | PNG, JPEG, WebP |

## Payment Configuration

- **Currency**: INR (Indian Rupees)
- **Commission Rate**: 15%
- **Note Price Range**: ₹10 - ₹5,000
- **Hourly Rate Range**: ₹100 - ₹5,000

## Edge Functions

### create-checkout-session

**Endpoint**: `/functions/v1/create-checkout-session`

**Request**:
```json
{
  "noteId": "uuid",
  "bookingId": "uuid",
  "amount": 100,
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### stripe-webhook

**Endpoint**: `/functions/v1/stripe-webhook`

Handles Stripe webhook events:
- `checkout.session.completed` - Processes successful payments

## Database Tables

### payment_sessions

Tracks Stripe checkout sessions.

```sql
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  note_id UUID REFERENCES notes(id),
  booking_id UUID REFERENCES bookings(id),
  stripe_session_id TEXT UNIQUE,
  amount DECIMAL(10,2),
  status TEXT, -- pending, completed, failed, expired
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### transactions

Records completed purchases.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id),
  note_id UUID REFERENCES notes(id),
  amount DECIMAL(10,2),
  commission DECIMAL(10,2),
  seller_payout DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  watermarked_file_path TEXT,
  created_at TIMESTAMP
);
```

## Common Patterns

### Complete Note Upload Flow

```typescript
import { uploadFile, generateStoragePath } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";

async function uploadNote(file: File, metadata: NoteMetadata) {
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2. Generate storage path
  const noteId = crypto.randomUUID();
  const filePath = generateStoragePath(user.id, file.name, noteId);

  // 3. Upload file
  const { data, error } = await uploadFile("notes", filePath, file);
  if (error) throw error;

  // 4. Create database record
  const { data: note, error: dbError } = await supabase
    .from("notes")
    .insert({
      id: noteId,
      title: metadata.title,
      description: metadata.description,
      subject: metadata.subject,
      price: metadata.price,
      file_path: data.path,
      owner_id: user.id,
      tags: metadata.tags,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return note;
}
```

### Complete Purchase Flow

```typescript
import { createCheckoutSession } from "@/lib/stripe";

async function purchaseNote(noteId: string, amount: number) {
  // 1. Create checkout session
  const session = await createCheckoutSession({
    noteId,
    amount,
    successUrl: `${window.location.origin}/notes/${noteId}/success`,
    cancelUrl: `${window.location.origin}/notes/${noteId}`,
  });

  if (!session) {
    throw new Error("Failed to create checkout session");
  }

  // 2. Redirect to Stripe Checkout
  window.location.href = session.url;
}
```

## Error Handling

### Storage Errors

```typescript
const { data, error } = await uploadFile("notes", path, file);

if (error) {
  if (error.message.includes("size")) {
    // File too large
  } else if (error.message.includes("type")) {
    // Invalid file type
  } else if (error.message.includes("duplicate")) {
    // File already exists
  } else {
    // Generic error
  }
}
```

### Payment Errors

```typescript
const session = await createCheckoutSession({ ... });

if (!session) {
  // Check if user is authenticated
  // Check if amount is valid
  // Check network connection
}
```

## Testing

### Test Storage in Development

```typescript
// Test file upload
const testFile = new File(["test content"], "test.pdf", {
  type: "application/pdf",
});

const result = await uploadFile(
  "notes",
  "test/test.pdf",
  testFile
);

console.log("Upload result:", result);
```

### Test Payments with Stripe Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Always validate files** before upload
3. **Use signed URLs** for private files
4. **Verify webhook signatures** in Edge Functions
5. **Enable RLS policies** on all tables
6. **Sanitize file names** before storage

## Performance Tips

1. **Compress images** before uploading to thumbnails/avatars
2. **Use public URLs** for frequently accessed files
3. **Cache signed URLs** (they're valid for 1 hour)
4. **Batch operations** when possible
5. **Use CDN** for public buckets (Supabase provides this)
