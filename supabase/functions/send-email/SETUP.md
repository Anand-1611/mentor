# Email Service Setup Guide

This guide will help you set up the email notification system using Resend.

## 1. Sign Up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (includes 100 emails/day, 3,000 emails/month)
3. Verify your email address

## 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "MentorLink Production")
5. Copy the API key (starts with `re_`)

## 3. Configure Sender Domain

### Option A: Use Resend's Test Domain (Development Only)
- Resend provides `onboarding@resend.dev` for testing
- Emails will only be sent to verified email addresses
- Good for development, not for production

### Option B: Add Your Custom Domain (Recommended for Production)

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain registrar:
   - **SPF Record** (TXT): Authorizes Resend to send emails
   - **DKIM Record** (TXT): Authenticates your emails
   - **DMARC Record** (TXT): Protects against spoofing
5. Wait for DNS propagation (can take up to 48 hours)
6. Verify the domain in Resend dashboard

### DNS Records Example:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

## 4. Set Environment Variables

Add these to your Supabase Edge Functions environment:

```bash
# In Supabase Dashboard: Settings > Edge Functions > Environment Variables
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Or for local development, add to `supabase/functions/.env`:
```bash
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 5. Test the Setup

You can test the email service by calling the send-email function:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
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
      "dashboardUrl": "https://yourapp.com/dashboard",
      "buyerEmail": "test@example.com"
    }
  }'
```

## 6. Email Templates

The following templates are available:

1. **purchase-confirmation** - Sent after successful note purchase
2. **download-link** - Sent when watermarked PDF is ready
3. **booking-confirmation-student** - Sent to student after booking
4. **booking-confirmation-mentor** - Sent to mentor after booking
5. **mentor-verification-success** - Sent when mentor passes verification
6. **mentor-verification-failure** - Sent when mentor fails verification

## 7. Monitoring

- View email logs in Resend dashboard
- Check delivery status and open rates
- Monitor bounce and complaint rates
- Review the `email_logs` table in your database for debugging

## 8. Rate Limits

**Free Tier:**
- 100 emails per day
- 3,000 emails per month

**Paid Plans:**
- Start at $20/month for 50,000 emails
- No daily limits
- Better deliverability

## 9. Best Practices

1. **Use verified domains** for better deliverability
2. **Include unsubscribe links** for marketing emails
3. **Monitor bounce rates** and remove invalid addresses
4. **Test emails** before sending to production
5. **Use meaningful from names** (e.g., "MentorLink Team")
6. **Keep templates mobile-responsive**
7. **Include plain text versions** for better compatibility

## 10. Troubleshooting

### Emails not being sent
- Check API key is correct
- Verify domain is properly configured
- Check Resend dashboard for error logs
- Review `email_logs` table for error messages

### Emails going to spam
- Ensure SPF, DKIM, and DMARC records are set up
- Use a verified custom domain
- Avoid spam trigger words in subject lines
- Include unsubscribe links

### Rate limit exceeded
- Upgrade to a paid plan
- Implement email queuing for bulk sends
- Batch emails during off-peak hours

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- MentorLink Issues: Create an issue in the repository
