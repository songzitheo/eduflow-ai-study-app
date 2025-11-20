# 🚀 Quick Start Guide - AI Study Assistant

## Prerequisites

- OpenAI API account with API key
- Supabase project (already configured)
- Node.js 18+ installed

## Setup Steps (5 minutes)

### Step 1: Add OpenAI API Key

Edit `.env.local` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

Get your key from: https://platform.openai.com/api-keys

---

### Step 2: Create Database Tables

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the ENTIRE contents of `DATABASE_SCHEMA.md` (the Quick Setup Script section)
4. Click "Run" to execute

This creates:
- `diagnostic_questions` table
- `diagnostic_answers` table
- `study_plans` table
- `reviews` table
- All necessary indexes and RLS policies

---

### Step 3: Restart Dev Server

```bash
# If server is running, stop it (Ctrl+C)
# Then restart:
npm run dev
```

---

### Step 4: Test the Application

1. **Navigate to** `http://localhost:3000/study/new`

2. **Create a study source:**
   - Title: "Introduction to Machine Learning"
   - Content: Paste some learning material (e.g., a tutorial, notes, article)
   - Deadline: (optional)
   - Click "Create Study Source"

3. **Complete Diagnostics:**
   - You'll be redirected to `/study/[id]`
   - Wait ~10 seconds for AI to generate 8-10 questions
   - Answer each question in the textarea
   - Click "Submit Answer" for each
   - Receive instant AI feedback

4. **Generate Learning Plan:**
   - After answering all questions, click "Generate Learning Plan"
   - You'll be redirected to `/study/[id]/plan`
   - Wait ~15 seconds for AI to create your personalized plan
   - See the macro→meso→micro breakdown

5. **Check Review Schedule:**
   - Navigate to `/reviews`
   - See 3 scheduled reviews (J+2, J+7, J+21 days from now)
   - Try marking one as complete

---

## Troubleshooting

### ❌ "getEnvVar: OPENAI_API_KEY is required"
**Fix:** Add your OpenAI API key to `.env.local`

### ❌ "Table 'diagnostic_questions' does not exist"
**Fix:** Run the SQL script from `DATABASE_SCHEMA.md` in Supabase

### ❌ TypeScript errors about imports
**Fix:** Restart your IDE or run:
```bash
rm -rf .next
npm run dev
```

### ❌ Questions not generating
**Checks:**
1. OpenAI API key is valid
2. You have API credits
3. Check browser console for errors
4. Check terminal for server-side errors

### ❌ RLS policy errors
**Fix:** Make sure you're logged in with Supabase Auth
- Navigate to `/login` or `/signup` first

---

## Expected AI Response Times

- **Question Generation:** ~8-12 seconds (generates 8-10 questions)
- **Answer Feedback:** ~2-4 seconds per answer
- **Learning Plan:** ~12-18 seconds (complex JSON structure)

---

## Costs (OpenAI API)

Using GPT-4o-mini (~$0.15 per 1M input tokens):

- **Question Generation:** ~$0.002 per study source
- **Answer Feedback:** ~$0.0003 per answer
- **Learning Plan:** ~$0.003 per plan

**Estimated cost per complete flow:** ~$0.01 USD

---

## File Structure Created

```
✅ src/app/study/[id]/page.tsx
✅ src/app/study/[id]/actions.ts
✅ src/app/study/[id]/diagnostic-questions-client.tsx
✅ src/app/study/[id]/plan/page.tsx
✅ src/app/study/[id]/plan/actions.ts
✅ src/app/reviews/page.tsx
✅ src/app/reviews/actions.ts
✅ src/features/study/lib/openai-client.ts
✅ src/features/study/types/index.ts
✅ src/components/ui/textarea.tsx
✅ src/components/ui/label.tsx
```

---

## Database Tables Created

```
✅ diagnostic_questions (AI-generated questions)
✅ diagnostic_answers (user answers + AI feedback)
✅ study_plans (macro→meso→micro plans)
✅ reviews (spaced repetition schedule)
```

---

## Routes Available

- `/study/new` - Create new study source ✅
- `/study/[id]` - View/answer diagnostic questions ✅
- `/study/[id]/plan` - View learning plan ✅
- `/reviews` - Review schedule dashboard ✅

---

## Need Help?

Check these files:
- `IMPLEMENTATION_SUMMARY.md` - Complete technical documentation
- `DATABASE_SCHEMA.md` - Full SQL schema with RLS policies

---

## Next Steps After Testing

1. **Improve AI Prompts:** Edit prompts in `actions.ts` files
2. **Customize UI:** Modify page components
3. **Add Navigation:** Create links from homepage
4. **Deploy:** Push to Vercel
5. **Monitor Costs:** Check OpenAI dashboard

---

## ✨ You're Ready!

The MVP is complete. Just add your OpenAI API key, create the database tables, and start learning! 🎓
