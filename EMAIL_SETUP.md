# Email Notifications Setup

This app sends automated email notifications using Resend.

## Email Types

### 1. Learning Plan Email
Sent immediately when a user generates their learning plan. Includes:
- Personalized learning plan summary
- Complete review schedule (J+2, J+7, J+21)
- Link to view full plan

### 2. Review Reminder Emails
Sent daily at 9:00 AM UTC for scheduled reviews. Includes:
- Reminder for the specific review session
- Motivational content about spaced repetition
- Link to start the review

## Setup Instructions

### 1. Resend Account Setup
1. Create account at https://resend.com
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Get your API key from the dashboard

### 2. Environment Variables
Add to Vercel and `.env.local`:

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional - for cron job security
CRON_SECRET=your-random-secret-string

# Required - used in email links
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 3. Database Migration
Run the migration to add the `reminder_sent` column:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase dashboard:
# supabase/migrations/20251211_add_reminder_sent.sql
```

### 4. Vercel Cron Job
The `vercel.json` file is already configured to run the cron job daily at 9:00 AM UTC.

**Important:** Cron jobs only work on **Pro** Vercel plans or higher.

For Hobby plans, you can:
- Use an external service like https://cron-job.org to call `/api/send-review-reminders`
- Set up your own cron server
- Manually trigger the endpoint

### 5. Testing Emails

#### Test Learning Plan Email:
1. Create a study source
2. Generate diagnostic questions
3. Answer all questions
4. Generate learning plan
5. Check your email inbox

#### Test Review Reminder (Manual):
```bash
# Call the API endpoint (add Bearer token if CRON_SECRET is set)
curl -X GET https://your-domain.vercel.app/api/send-review-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## Customization

### Change Email Sender
Update the `from` field in:
- `src/features/emails/send-learning-plan-email.ts`
- `src/features/emails/send-review-reminder-email.ts`

Replace `onboarding@resend.dev` with your verified domain.

### Change Cron Schedule
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/send-review-reminders",
      "schedule": "0 9 * * *"  // Change this (cron format)
    }
  ]
}
```

### Customize Email Templates
Edit the React Email components:
- `src/features/emails/learning-plan-email.tsx`
- `src/features/emails/review-reminder-email.tsx`

## Troubleshooting

### Emails not sending?
1. Check Resend dashboard for error logs
2. Verify `RESEND_API_KEY` is set correctly
3. Check console logs in Vercel deployment
4. Verify user email exists in database

### Cron job not running?
1. Verify you have a Vercel Pro plan
2. Check Vercel dashboard > Cron Jobs
3. Test manually: `curl https://your-domain/api/send-review-reminders`
4. Check deployment logs for errors

### Wrong review schedule?
The default schedule is:
- Review #1: J+2 days (2 days after plan creation)
- Review #2: J+7 days (7 days after plan creation)
- Review #3: J+21 days (21 days after plan creation)

To modify, edit `src/app/study/[id]/plan/actions.ts`.

## Architecture

```
User generates plan
  ↓
generateStudyPlan() in actions.ts
  ↓
Creates review schedule in DB
  ↓
Sends learning plan email immediately
  
---

Daily at 9 AM UTC
  ↓
Vercel Cron triggers /api/send-review-reminders
  ↓
Fetches today's reviews
  ↓
Sends reminder emails
  ↓
Marks reminder_sent = true
```
