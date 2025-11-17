# Email Notification System

This directory contains the email notification system for MentorLink, built using Resend as the email service provider.

## Overview

The email system provides a centralized Edge Function (`send-email`) that handles all email sending with:
- Template-based emails with variable substitution
- Automatic retry logic with exponential backoff
- Email logging for debugging and monitoring
- Error handling and graceful degradation

## Architecture

```
send-email/
├── index.ts                    # Main Edge Function
├── templates/                  # HTML email templates
│   ├── purchase-confirmation.html
│   ├── download-link.html
│   ├── booking-confirmation-student.html
│   ├── booking-confirmation-mentor.html
│   ├── mentor-verification-success.html
│   └── mentor-verification-failure.html
├── SETUP.md                    # Setup instructions
└── README.md                   # This file
```

## Email Templates

### 1. Purchase Confirmation
**Template:** `purchase-confirmation`  
**Trigger:** After successful note purchase payment  
**Sent to:** Buyer  
**Variables:**
- `buyerName`: Buyer's full name
- `noteTitle`: Title of purchased note
- `subject`: Academic subject
- `amount`: Purchase amount in ₹
- `transactionId`: Unique transaction ID
- `purchaseDate`: Date of purchase
- `dashboardUrl`: Link to user's purchases dashboard
- `buyerEmail`: Buyer's email address

### 2. Download Link
**Template:** `download-link`  
**Trigger:** After watermarked PDF is generated  
**Sent to:** Buyer  
**Variables:**
- `buyerName`: Buyer's full name
- `noteTitle`: Title of purchased note
- `subject`: Academic subject
- `transactionId`: Unique transaction ID
- `downloadUrl`: Signed URL for PDF download
- `expiryDate`: Download link expiration date
- `dashboardUrl`: Link to user's purchases dashboard
- `buyerEmail`: Buyer's email address

### 3. Booking Confirmation (Student)
**Template:** `booking-confirmation-student`  
**Trigger:** After successful booking payment  
**Sent to:** Student  
**Variables:**
- `studentName`: Student's full name
- `mentorName`: Mentor's full name
- `subject`: Session subject
- `sessionDateTime`: Formatted date and time
- `duration`: Session duration in minutes
- `amount`: Booking amount in ₹
- `bookingId`: Unique booking ID
- `dashboardUrl`: Link to user's bookings dashboard
- `studentEmail`: Student's email address

### 4. Booking Confirmation (Mentor)
**Template:** `booking-confirmation-mentor`  
**Trigger:** After successful booking payment  
**Sent to:** Mentor  
**Variables:**
- `mentorName`: Mentor's full name
- `studentName`: Student's full name
- `subject`: Session subject
- `sessionDateTime`: Formatted date and time
- `duration`: Session duration in minutes
- `amount`: Total booking amount in ₹
- `mentorEarnings`: Mentor's earnings after commission
- `bookingId`: Unique booking ID
- `dashboardUrl`: Link to mentor's bookings dashboard
- `mentorEmail`: Mentor's email address

### 5. Mentor Verification Success
**Template:** `mentor-verification-success`  
**Trigger:** After passing verification test (≥70%)  
**Sent to:** Mentor  
**Variables:**
- `mentorName`: Mentor's full name
- `subject`: Test subject
- `score`: Test score percentage
- `mentorEmail`: Mentor's email address
- `profileUrl`: Link to mentor's profile page

### 6. Mentor Verification Failure
**Template:** `mentor-verification-failure`  
**Trigger:** After failing verification test (<70%)  
**Sent to:** Mentor  
**Variables:**
- `mentorName`: Mentor's full name
- `subject`: Test subject
- `score`: Test score percentage
- `mentorEmail`: Mentor's email address
- `studyResourcesUrl`: Link to study resources

## Usage

### Calling the send-email Function

From another Edge Function:
```typescript
const emailResponse = await supabase.functions.invoke("send-email", {
  body: {
    template: "purchase-confirmation",
    to: "user@example.com",
    variables: {
      buyerName: "John Doe",
      noteTitle: "Advanced Calculus Notes",
      subject: "Mathematics",
      amount: "500",
      transactionId: "txn_123456",
      purchaseDate: "January 15, 2024",
      dashboardUrl: "https://mentorlink.com/dashboard/purchases",
      buyerEmail: "user@example.com",
    },
  },
});

if (emailResponse.error) {
  console.error("Error sending email:", emailResponse.error);
} else {
  console.log("Email sent successfully:", emailResponse.data);
}
```

From the frontend (requires authentication):
```typescript
const { data, error } = await supabase.functions.invoke("send-email", {
  body: {
    template: "booking-confirmation-student",
    to: "student@example.com",
    variables: {
      // ... template variables
    },
  },
});
```

### Custom Subject Lines

You can override the default subject line:
```typescript
await supabase.functions.invoke("send-email", {
  body: {
    template: "purchase-confirmation",
    to: "user@example.com",
    subject: "Custom Subject Line",
    variables: {
      // ... template variables
    },
  },
});
```

## Email Triggers

The email system is integrated at the following points:

### 1. Purchase Flow
**File:** `supabase/functions/stripe-webhook/index.ts`
- **Trigger:** `checkout.session.completed` event for note purchase
- **Emails sent:**
  1. Purchase confirmation (immediate)
  2. Download link (after watermarking)

### 2. Watermarking
**File:** `supabase/functions/watermark-pdf/index.ts`
- **Trigger:** After watermarked PDF is generated
- **Email sent:** Download link with signed URL

### 3. Booking Flow
**File:** `supabase/functions/send-booking-email/index.ts`
- **Trigger:** After successful booking payment
- **Emails sent:**
  1. Booking confirmation to student
  2. Booking notification to mentor

### 4. Mentor Verification
**File:** `src/components/mentor/MentorVerificationTest.tsx`
- **Trigger:** After test submission
- **Email sent:** Success or failure notification based on score

## Email Logging

All email sends are logged to the `email_logs` table:

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  resend_email_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Querying Email Logs

```sql
-- View recent emails
SELECT * FROM email_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Check failed emails
SELECT * FROM email_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Emails sent to specific user
SELECT * FROM email_logs 
WHERE recipient_email = 'user@example.com' 
ORDER BY created_at DESC;

-- Email statistics by template
SELECT 
  template_name,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_logs
GROUP BY template_name;
```

## Error Handling

The email system includes robust error handling:

### Retry Logic
- Automatic retry on server errors (5xx) and rate limits (429)
- Exponential backoff: 1s, 2s, 4s
- Maximum 3 retry attempts

### Graceful Degradation
- Email failures don't break the main flow
- Errors are logged but don't throw exceptions
- Users still receive service even if email fails

### Error Logging
All errors are logged to:
1. Edge Function logs (Supabase Dashboard)
2. `email_logs` table with error messages
3. Console output for debugging

## Testing

### Local Testing

1. Set up environment variables in `supabase/functions/.env`:
```bash
RESEND_API_KEY=re_your_test_key
RESEND_FROM_EMAIL=noreply@resend.dev
FRONTEND_URL=http://localhost:5173
```

2. Start Supabase locally:
```bash
supabase start
```

3. Deploy the function locally:
```bash
supabase functions serve send-email
```

4. Test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "purchase-confirmation",
    "to": "test@example.com",
    "variables": {
      "buyerName": "Test User",
      "noteTitle": "Test Note",
      "subject": "Mathematics",
      "amount": "100",
      "transactionId": "test-123",
      "purchaseDate": "2024-01-01",
      "dashboardUrl": "http://localhost:5173/dashboard",
      "buyerEmail": "test@example.com"
    }
  }'
```

### Production Testing

1. Deploy to production:
```bash
supabase functions deploy send-email
```

2. Set environment variables in Supabase Dashboard:
   - Settings > Edge Functions > Environment Variables

3. Test with production URL:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Monitoring

### Resend Dashboard
- View email delivery status
- Check open and click rates
- Monitor bounce and complaint rates
- Review spam reports

### Supabase Dashboard
- View Edge Function logs
- Monitor function invocations
- Check error rates
- Review performance metrics

### Database Monitoring
```sql
-- Daily email statistics
SELECT 
  DATE(created_at) as date,
  template_name,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), template_name
ORDER BY date DESC, template_name;
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   ```bash
   # Verify environment variable is set
   supabase functions env list
   ```

2. **Check Resend Dashboard:**
   - Look for error messages
   - Verify domain is verified
   - Check rate limits

3. **Check Email Logs:**
   ```sql
   SELECT * FROM email_logs 
   WHERE status = 'failed' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### Emails Going to Spam

1. Verify domain DNS records (SPF, DKIM, DMARC)
2. Use a custom verified domain (not resend.dev)
3. Avoid spam trigger words
4. Include unsubscribe links
5. Maintain good sender reputation

### Template Not Found

1. Check template name matches exactly
2. Verify template file exists in `templates/` directory
3. Check file path in `index.ts` templates object

### Variable Not Replaced

1. Ensure variable name matches exactly (case-sensitive)
2. Check variable is passed in the `variables` object
3. Verify template uses `{{variableName}}` syntax

## Best Practices

1. **Always provide all required variables** for a template
2. **Use meaningful from names** (e.g., "MentorLink Team")
3. **Keep templates mobile-responsive**
4. **Test emails before deploying** to production
5. **Monitor email logs regularly** for failures
6. **Set up alerts** for high failure rates
7. **Use verified custom domains** for better deliverability
8. **Include unsubscribe links** for marketing emails
9. **Respect user preferences** for notification settings
10. **Keep email content concise** and actionable

## Future Enhancements

- [ ] Email preference management
- [ ] Unsubscribe functionality
- [ ] Email scheduling/queuing
- [ ] Batch email sending
- [ ] Email analytics dashboard
- [ ] A/B testing for templates
- [ ] Plain text versions of emails
- [ ] Internationalization (i18n)
- [ ] Email preview in admin dashboard
- [ ] Webhook for email events (opens, clicks, bounces)

## Support

For issues or questions:
1. Check the [SETUP.md](./SETUP.md) guide
2. Review Resend documentation: https://resend.com/docs
3. Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
4. Create an issue in the repository
