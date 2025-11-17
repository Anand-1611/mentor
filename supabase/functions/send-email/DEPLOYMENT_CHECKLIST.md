# Email Notifications System - Deployment Checklist

Use this checklist to deploy the email notification system to production.

## Pre-Deployment

### 1. Resend Account Setup
- [ ] Sign up for Resend account at https://resend.com
- [ ] Verify email address
- [ ] Generate API key from dashboard
- [ ] Save API key securely

### 2. Domain Configuration (Production Only)
- [ ] Add domain in Resend dashboard
- [ ] Copy DNS records (SPF, DKIM, DMARC)
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify domain in Resend dashboard
- [ ] Set verified domain as `RESEND_FROM_EMAIL`

**For Development/Testing:**
- [ ] Use `onboarding@resend.dev` as sender
- [ ] Add test recipient emails to Resend dashboard

## Database Migration

- [ ] Review migration file: `supabase/migrations/20251113000013_create_email_logs_table.sql`
- [ ] Apply migration to local database:
  ```bash
  supabase db reset
  ```
- [ ] Verify `email_logs` table exists:
  ```sql
  SELECT * FROM email_logs LIMIT 1;
  ```
- [ ] Apply migration to production:
  ```bash
  supabase db push
  ```

## Edge Function Deployment

### 1. Deploy send-email Function
- [ ] Review function code: `supabase/functions/send-email/index.ts`
- [ ] Deploy to Supabase:
  ```bash
  supabase functions deploy send-email
  ```
- [ ] Verify deployment in Supabase Dashboard > Edge Functions

### 2. Set Environment Variables
In Supabase Dashboard > Settings > Edge Functions > Environment Variables:

- [ ] Add `RESEND_API_KEY` = `re_your_api_key_here`
- [ ] Add `RESEND_FROM_EMAIL` = `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing)
- [ ] Add `FRONTEND_URL` = `https://yourdomain.com` (or `http://localhost:5173` for local)
- [ ] Verify all variables are set correctly

### 3. Redeploy Dependent Functions
These functions now call send-email and need to be redeployed:

- [ ] Deploy stripe-webhook:
  ```bash
  supabase functions deploy stripe-webhook
  ```
- [ ] Deploy watermark-pdf:
  ```bash
  supabase functions deploy watermark-pdf
  ```
- [ ] Deploy send-booking-email:
  ```bash
  supabase functions deploy send-booking-email
  ```

## Testing

### 1. Test send-email Function Directly
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "purchase-confirmation",
    "to": "your-test-email@example.com",
    "variables": {
      "buyerName": "Test User",
      "noteTitle": "Test Note",
      "subject": "Mathematics",
      "amount": "100",
      "transactionId": "test-123",
      "purchaseDate": "January 1, 2024",
      "dashboardUrl": "https://yourdomain.com/dashboard",
      "buyerEmail": "your-test-email@example.com"
    }
  }'
```

- [ ] Email received successfully
- [ ] Email displays correctly on desktop
- [ ] Email displays correctly on mobile
- [ ] All links work correctly
- [ ] Email logged in `email_logs` table

### 2. Test Each Email Template

#### Purchase Confirmation
- [ ] Make a test purchase
- [ ] Verify purchase confirmation email received
- [ ] Check email content and formatting
- [ ] Verify dashboard link works

#### Download Link
- [ ] Complete a purchase
- [ ] Wait for watermarking to complete
- [ ] Verify download link email received
- [ ] Test download link works
- [ ] Verify expiry date is correct

#### Booking Confirmation (Student)
- [ ] Book a test session
- [ ] Verify student confirmation email received
- [ ] Check session details are correct
- [ ] Verify dashboard link works

#### Booking Confirmation (Mentor)
- [ ] Book a test session
- [ ] Verify mentor notification email received
- [ ] Check earnings calculation is correct
- [ ] Verify dashboard link works

#### Mentor Verification Success
- [ ] Complete verification test with ≥70% score
- [ ] Verify success email received
- [ ] Check score is displayed correctly
- [ ] Verify profile link works

#### Mentor Verification Failure
- [ ] Complete verification test with <70% score
- [ ] Verify failure email received
- [ ] Check score is displayed correctly
- [ ] Verify study resources link works

### 3. Test Error Handling
- [ ] Test with invalid template name (should fail gracefully)
- [ ] Test with missing variables (should log error)
- [ ] Test with invalid email address (should log error)
- [ ] Verify errors are logged in `email_logs` table

### 4. Test Retry Logic
- [ ] Temporarily set invalid API key
- [ ] Trigger an email
- [ ] Verify retry attempts in logs
- [ ] Restore correct API key

## Monitoring Setup

### 1. Database Monitoring
- [ ] Create saved query for failed emails:
  ```sql
  SELECT * FROM email_logs 
  WHERE status = 'failed' 
  ORDER BY created_at DESC 
  LIMIT 100;
  ```
- [ ] Create saved query for email statistics:
  ```sql
  SELECT 
    template_name,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
  FROM email_logs
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY template_name;
  ```

### 2. Resend Dashboard
- [ ] Bookmark Resend dashboard
- [ ] Set up email notifications for bounces
- [ ] Set up email notifications for complaints
- [ ] Review delivery statistics weekly

### 3. Supabase Dashboard
- [ ] Bookmark Edge Functions logs
- [ ] Set up alerts for high error rates
- [ ] Monitor function invocation counts
- [ ] Review performance metrics

## Post-Deployment

### 1. Verify Production Emails
- [ ] Test all email flows in production
- [ ] Verify emails are not going to spam
- [ ] Check email delivery times
- [ ] Verify all links use production URLs

### 2. Documentation
- [ ] Update team documentation with email system details
- [ ] Share Resend dashboard access with team
- [ ] Document troubleshooting procedures
- [ ] Create runbook for common issues

### 3. User Communication
- [ ] Announce email notification feature to users
- [ ] Update help documentation
- [ ] Add email preferences to user settings (future)

## Rollback Plan

If issues occur after deployment:

### 1. Disable Email Sending
- [ ] Comment out email invocations in Edge Functions
- [ ] Redeploy affected functions
- [ ] System continues to work without emails

### 2. Revert Environment Variables
- [ ] Remove or update `RESEND_API_KEY`
- [ ] Functions will log errors but not crash

### 3. Database Rollback
- [ ] If needed, drop `email_logs` table:
  ```sql
  DROP TABLE IF EXISTS email_logs CASCADE;
  ```

## Success Criteria

- [ ] All 6 email templates sending successfully
- [ ] Email delivery rate > 95%
- [ ] No emails going to spam
- [ ] Email logs capturing all sends
- [ ] Error handling working correctly
- [ ] Retry logic functioning as expected
- [ ] All links in emails working
- [ ] Mobile and desktop rendering correct
- [ ] Team trained on monitoring and troubleshooting

## Notes

- **Resend Free Tier Limits:** 100 emails/day, 3,000 emails/month
- **Upgrade if needed:** $20/month for 50,000 emails
- **DNS Propagation:** Can take up to 48 hours
- **Test thoroughly:** Use test mode before production
- **Monitor closely:** Check logs daily for first week

## Support Resources

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Setup Guide: `./SETUP.md`
- Usage Guide: `./README.md`

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Verified By:** _________________  
**Production URL:** _________________
