# RecallCode

A spaced repetition tracker for LeetCode problems. Built with Next.js, Supabase, and the SM-2 algorithm.

## Features

- **Spaced repetition (SRS)** — problems are scheduled for review based on how well you remembered them (Again / Hard / Good / Easy)
- **Today's Review queue** — see only what's due today, nothing more
- **Error classification** — tag each review with why you struggled (no idea, can't code it, bug, edge case, wrong complexity)
- **Solution editor** — write and save your solution with syntax highlighting (Python, JavaScript, Java, C++, C)
- **Auto-fill from LeetCode** — enter a problem number and title, difficulty, tags, and URL are fetched automatically
- **Two-stage status** — Learning → Mastered
- **Stats** — retention rate, daily review count, most common error types

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Actions
- [Supabase](https://supabase.com) — PostgreSQL, Auth, Row Level Security
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor) + [Prism.js](https://prismjs.com)

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-username/RecallCode.git
cd RecallCode
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor
3. Copy your Project URL and anon key

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to [Vercel](https://vercel.com) in one click:

1. Push the repo to GitHub
2. Import the repo on Vercel
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

Then in Supabase → Authentication → URL Configuration, set your Vercel URL as the Site URL.

## SRS Algorithm

Based on SM-2. Each review updates the interval and ease factor:

| Rating | Next interval | Ease factor |
|--------|--------------|-------------|
| Again  | 1 day | −0.20 |
| Hard   | interval × 1.2 | −0.15 |
| Good   | interval × ease factor | unchanged |
| Easy   | interval × ease factor × 1.3 | +0.10 |

A problem is marked **Mastered** when its interval reaches 21+ days.
