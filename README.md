# TopperShelf (RT10)

Nursing notes, quizzes and mock tests for GNM, BSc Nursing and Post Basic students.
Notes and quizzes at ₹19, full tests at ₹28.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · Supabase · Razorpay · Vercel · Cloudflare (DNS)

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Folder guide

| Path | What it is |
| --- | --- |
| `app/` | Pages and API routes |
| `app/api/checkout` | Creates a Razorpay order (price read from the database) |
| `app/api/webhooks/razorpay` | Verifies the payment signature, then unlocks the purchase |
| `components/` | Header, footer, product card |
| `lib/supabase/` | Browser, server and admin (service role) clients |
| `lib/sample-data.ts` | Placeholder catalogue until the database is connected |
| `supabase/migrations/` | SQL for tables and Row Level Security |

## Rules

- Never commit `.env.local`, the Supabase service role key, or payment secrets.
- Keep the PDFs in a private Supabase bucket, never in this repo.
- Unlock content only from the verified webhook, never from the browser.
