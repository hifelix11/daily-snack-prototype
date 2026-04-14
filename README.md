# Daily Snack

A daily knowledge card prototype for a retention study. Users pick a card each day, answer a trivia question, and see an explanation. 20 questions across 4 stages, one per day.

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres + Anonymous Auth)
- PostHog (analytics + session recording)

## Setup

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   - Paste the contents of `supabase/migrations/0001_init.sql` and execute
3. Seed the questions:
   - Paste the contents of `supabase/seed.sql` and execute
4. Enable Anonymous Auth:
   - Go to **Authentication > Providers > Anonymous Sign-Ins** and toggle it on
5. Copy your project URL and anon key from **Settings > API**

### 2. PostHog

1. Create a free account at [posthog.com](https://posthog.com)
2. Copy your project API key
3. Enable Session Recording in your PostHog project settings

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and PostHog credentials.

### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Import it in [vercel.com](https://vercel.com)
3. Add the environment variables from `.env.local` to the Vercel project settings
4. Deploy

## Data Model

- **questions**: 20 trivia questions across 4 stages (3/5/8/4)
- **user_progress**: tracks each user's answers with timestamps

Stages unlock sequentially. Users answer one question per calendar day.

## Analytics Events

| Event | Description |
|---|---|
| `app_opened` | App loaded |
| `card_picked` | User picked one of 3 cards |
| `question_viewed` | Question revealed |
| `answer_submitted` | Answer selected (with correct, time_to_answer_ms) |
| `explanation_viewed` | Explanation screen shown |
| `stage_completed` | All questions in a stage answered |
| `daily_gate_hit` | User returned but already played today |
| `all_questions_completed` | All 20 questions done |
