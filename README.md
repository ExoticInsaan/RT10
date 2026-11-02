# TopperShelf

**Useful tools. A few silly ones. All free, one quick signup.**

TopperShelf is a free, fast tools website for everyone: student tools, document tools for exam forms and a Fun Zone of witty, shareable tools. A visitor should land (usually from Google or an Instagram story), find a tool in seconds, sign in once, use it in the browser and leave with the job done.

- **Live site:** https://www.toppershelf.online
- **Support:** support@toppershelf.online
- **Product plan:** see "Product plan" below (source: *Site Experience, Pages & Modules*, October 2026)

## Three promises

- **Fast:** tools run in the browser, so there is no upload wait and no queue.
- **Private:** files are processed on the user's own device wherever possible. Only say "your files never leave your device" on tools where that is true.
- **Simple:** one quick signup (Google), no watermark, no popups blocking the tool.

---

## Tech stack

| Part | Tool |
| --- | --- |
| Website | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 (`app/globals.css`, dark mode via a `dark` class on `<html>`) |
| Sign-in and database | Supabase (Auth with Google, Postgres) |
| Hosting | Vercel (production deploys from `main`) |
| Domain and email forwarding | Cloudflare (DNS only, no proxy) |
| Analytics | Google Analytics 4, live site only (`components/Analytics.tsx`) |

---

## Project status

| Area | Status |
| --- | --- |
| Website (Next.js, Vercel) at toppershelf.online | Live |
| Android app (Capacitor, Google Play, `mobile/`) | **Live on Google Play** (see "Android app" below) |
| Tool registry (`lib/tools/registry.ts`): 18 tools, all marked `ready: true` | Done |
| Two sections only: **The Shelf** (8 useful tools) and **Fun Zone** (10 playful tools) | Done |
| Home, The Shelf (All Tools, search and filter), tool page, Fun Zone, My Shelf | Done |
| Bottom mobile navigation, dark mode | Done |
| Google sign-in with a popup on the tool page (`AuthProvider`, `AuthPanel`) and the sign-in gate (`ToolGate`) | Done |
| Real tool screens: PDF Toolkit, Image Compressor, Focus Timer, Flashcard Maker, CGPA & Percentage Calculator, Attendance Calculator, Reminder, Days Countdown | Done (`components/tools/shelf/`) |
| Fun Zone games and share cards (9:16 page plus 1080x1920 PNG, `app/share/[id]`) | Done |
| Per-tool SEO template (how-to steps, FAQ, app structured data, trust note, breadcrumbs) | Done, filled from `lib/tools/content.ts` |
| Sitemap, robots, JSON-LD on home, 404 page with tool search, link-preview image | Done |
| Old URLs (`/tools`, `/tools/:category`, `/my-tools`, `/the-shelf/:category`) | Redirect permanently (`next.config.ts`) |
| Account data saved per user in Supabase (Flashcards, Reminders, Countdowns) | Done (`supabase/migrations/0001_user_tool_data.sql`, `lib/tools/useAccountData.ts`) |
| Friend games and Grow a Sapling saved in Supabase | Done (migrations 0002 to 0005) |
| In-app account deletion (`delete-account` Edge Function, `/delete-account` page) | Done |
| Favourites and recents | Done. Kept on the device first (`lib/tools/useStoredList.ts`) and saved to the signed-in account in table `user_tools` (`components/AccountListsSync.tsx`, website and app), so they follow people across devices. |
| PWA (install prompt, offline, manifest) | **Not built** on the website. The Android app is a separate Capacitor build and works offline by itself. |
| `/search` results page, feedback and "Request a tool" form | Not built. Contact is mailto-based. |
| Typo and Hinglish tolerant search | Not built. Plain text match today. |
| Ads | Later, not before traffic is steady |
| About, Founders, Contact, Privacy, Terms pages | Done |

---

## Product plan

### How a user sees the site

1. They arrive from Google (for example "resize photo to 50kb for exam form") or an Instagram story card.
2. They land on a **tool page**, not the homepage. Every tool page is its own entry point.
3. They sign in once (Google), then use the tool in one screen: input, one main button, result.
4. "More tools you may need" under the result is how they discover the rest of the site.
5. They may share (Fun Zone) or install the app after repeat use.

### Routes (as built)

| Route | Purpose |
| --- | --- |
| `/` | Home: search, categories, popular tools, Fun Zone teaser, trust strip |
| `/the-shelf` | The Shelf: all useful tools, with search (`?q=`) |
| `/tool/[id]` | One tool page (open to view, sign-in needed to run) |
| `/fun` | Fun Zone grid |
| `/share/[id]` and `/share/[id]/image` | Result page and downloadable story card (noindex) |
| `/my-shelf` | Favourites and recently used (noindex) |
| `/login`, `/auth/callback` | Sign-in |
| `/delete-account` | Account deletion page |
| `/about`, `/founders`, `/contact`, `/privacy`, `/terms` | Info and legal pages. |

The plan document sketches nested URLs such as `/tools/pdf/compress-pdf`. The build uses the flatter `/tool/[id]`, and the site has two sections only (The Shelf and Fun Zone), so the old category pages redirect to `/the-shelf` or `/fun`. Keep the flat form unless there is a deliberate decision to change it, because the sitemap and canonicals already use it.

### Tool page template

Every tool page follows one template so new tools are quick to add: H1 that matches what people search, the tool above the fold, a result area (Download, Copy or Share), "How to use" in 3 steps, 3 to 5 FAQs (with FAQ markup), related tools, breadcrumbs, and a trust line where true.

### Adding or finishing a tool

1. **New tool:** add an entry to `lib/tools/registry.ts` (id, name, description, category, icon, tone). It appears on All Tools, search, its category page and its own page, with a "Soon" badge, noindex and no sitemap entry.
2. **Build the tool's screen** and render it from `components/tools/ToolGate.tsx` for that id (the sign-in gate already wraps it).
3. **Write its content** in `lib/tools/content.ts`: 3 to 5 how-to steps, 3 to 5 real FAQs, and a `privacyNote` only if it is true for this tool (for example "your files never leave your device" only when the tool really works in the browser).
4. **Go live:** set `ready: true` in the registry. The badge disappears, the page becomes indexable, and the tool, its category page, FAQ markup and app markup are added to the sitemap and the page automatically.

### Modules (reusable building blocks)

| Module | Where it lives |
| --- | --- |
| Tool registry | `lib/tools/registry.ts` (name, id, category, icon, tone, description, popular flag, `ready` flag) |
| Written content | `lib/tools/content.ts` (how-to steps, FAQ and trust note per tool; intro text per category) |
| Shared layout | `components/shell/` (header, footer, logo, mobile nav) |
| Search | `components/tools/ui.tsx` (`SearchBox`) and `ToolsBrowser`. Plain text match today; typo and Hinglish tolerance still to do. |
| Tool page template | `app/tool/[id]/page.tsx` plus `ToolGate` |
| Share-card generator | `components/tools/ShareCard.tsx`, `app/share/[id]/image/route.tsx`, `lib/tools/fun.ts` |
| File handler (PDF and image processing in the browser) | `components/tools/shelf/pdf-engine.ts`, `PdfToolkit.tsx`, `ImageCompressor.tsx` |
| Favourites and recents | `useStoredList` (device copy) plus `AccountListsSync` (account copy in `user_tools`). Saved tool data (flashcards, reminders, countdowns) uses `useAccountData`. |
| SEO engine | Metadata on each page, `app/sitemap.ts` (lists only ready tools and categories with a ready tool), `components/seo/JsonLd.tsx` |
| Accounts and sign-in | `components/AuthProvider.tsx`, `AuthPanel.tsx`, `lib/supabase/` |
| PWA layer (website), feedback form, ad slots | To build |

### Tools today (18, all live)

- **The Shelf (8):** PDF Toolkit, Image Compressor, Focus Timer, Flashcard Maker, CGPA & Percentage Calculator, Attendance Calculator, Reminder, Days Countdown
- **Fun Zone (10):** Decision Wheel, Would You Rather, Grow a Sapling, Friendship Score, What Am I to You?, How Well Do You Know Me?, How Cooked Are You?, Excuse Generator, Roast My Timetable, Instant Vibe Check

Later ideas: Photo & Signature Resizer for exact exam-form sizes, Image to PDF, Leave & Application Letter Maker, Marks Needed Calculator, assignment cover page maker, resume maker, syllabus planner.

### Build phases

1. Foundation: layout, registry, tool template, search, SEO, sign-in. *(done)*
2. First tools and the witty tools. *(done)*
3. Launch set: Shelf tools, Fun Zone, About, Contact, Legal. *(done for the 18 tools above)*
4. PWA on the website: install support and offline for simple tools. *(not started)*
5. Play Store: **done with Capacitor** (not a TWA). See "Android app".
6. Growth: 2 to 3 tools a week, guides for SEO, a tool-request leaderboard, ads once traffic is steady.

### Open decisions

- Sign-in method (Google only today; email or phone OTP optional) and whether a visitor may try a tool once before signing in.
- Ad strategy and timing. If ads, remarketing or Meta Pixel are ever added, add a consent banner first and update the privacy policy.
- Whether the Fun Zone gets its own sub-brand.

---

## Android app (`mobile/`)

The Play Store app is a **Capacitor** app, not a TWA. It lives in `mobile/` and is a Vite + React + Tailwind build wrapped by Capacitor 8. It reuses the website's tool and game components (`components/fun`, `components/tools/shelf`, `lib/tools`) through small replacements in `mobile/src/shims/` for `next/image`, `next/link`, `next/navigation`, `AuthProvider` and the Supabase client.

- **Bundled, not remote.** All screens, tools, fonts and images are packaged inside the app (`webDir: "dist"`, no `server.url`). It opens instantly and works offline. Sign-in, account data and friend games need the internet.
- **The website is separate.** Changes to the website go live on Vercel at once. Changes to the app need a new Play Store release (raise `versionCode` in `mobile/android/app/build.gradle`).
- **App-only features:** onboarding tour, Settings with account deletion, file saving to Downloads and Pictures, Share sheet, push notifications (Firebase), real phone reminders, Focus Timer notification, a "Days left" home-screen widget.
- **Shared backend:** the same Supabase project as the website. The app returns from Google sign-in through `online.toppershelf.app://auth`.
- **Do not remove the website.** The app does not load it, but it is the main source of Google and Instagram traffic, it serves iPhone and laptop users, and the app's sign-in and account data still depend on the Supabase project.

Setup, notifications, widget and offline details are in `mobile/README.md`. Release steps (upload key, versionCode, Play Console, Data safety) are in `mobile/RELEASE.md`.

---

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local    # then fill in the values
npm run dev                   # http://localhost:3000
```

Other commands: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

### Environment variables

| Name | Where it is used | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server (public key) | No |
| `NEXT_PUBLIC_GA_ID` | Optional. Overrides the built-in GA4 ID. An empty value switches analytics off. | No |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Optional Google Search Console tag | No |

### Analytics

`components/Analytics.tsx` loads Google Analytics 4 on the live site only (Vercel production). No ads, no cookie banner, analytics cookies off for EEA, UK and Switzerland, and nothing personal is sent. Tool events (tool opened, tool run, result shared, sign-in started and completed) are still to be added so drop-off per tool is visible.

---

## Folder guide

| Path | What it is |
| --- | --- |
| `app/` | Routes (see the route table) |
| `components/tools/` | Tool UI: cards, browser, gate, fun runner, share card, My Shelf |
| `components/shell/` | Header, footer, logo, mobile nav, status pages (404 and error), legal page layout |
| `components/seo/` | JSON-LD helper |
| `lib/tools/` | Registry, fun tool logic, stored-list hook |
| `lib/supabase/` | Browser and server clients |
| `supabase/migrations/` | SQL migrations (0001 to 0007: tool data, Grow a Sapling, friend games, friend rank, favourites, tool requests) |
| `supabase/functions/` | Edge Functions (`delete-account`) |
| `components/fun/` | Fun Zone games, friend rooms, share buttons |
| `components/tools/shelf/` | The Shelf tool screens |
| `mobile/` | Android app (Capacitor), see "Android app" |

---

## Database (Supabase)

Supabase Auth plus Postgres, shared by the website and the Android app. Every table uses Row Level Security (people read and write only their own rows). SQL lives in numbered files in `supabase/migrations/`:

- `0001_user_tool_data`: saved Flashcards, Reminders and Countdowns per user
- `0002_grow_a_sapling`, `0003_friend_games`, `0004_fix_fun_links_insert`, `0005_friend_rank`: Fun Zone garden and friend games

- `0006_user_tools`: favourite and recently used tools per user
- `0007_tool_requests`: table for "Request a tool" submissions (created, but no screen in the site uses it yet)

The `delete-account` Edge Function (`supabase/functions/delete-account`) removes a person's saved data and login.

Collect only a name and email at sign-in.

## Sign-in

Google only. In Supabase under **Authentication → URL Configuration**:

- Site URL: `https://www.toppershelf.online`
- Redirect URLs: `https://www.toppershelf.online/auth/callback`, `https://toppershelf.online/auth/callback`

For the Android app also add `online.toppershelf.app://auth` to Redirect URLs.

Google is configured in Google Cloud Console (OAuth client) and in Supabase (**Authentication → Providers → Google**).

## Deployment

- `main` is production, built and published by Vercel. Every other branch gets a preview build.
- Domain: `toppershelf.online` points to Vercel through Cloudflare, DNS only (grey cloud), because the proxy breaks Vercel's HTTPS.
- `support@toppershelf.online` forwards through Cloudflare Email Routing.

Working on changes: make a branch, push it, check the Vercel preview, open a pull request into `main`.

## Rules for this repo

- Never commit `.env.local` or the Supabase service role key.
- Only claim on the site what is true: for example, only say files stay on the device for tools that really process locally.
- Do not pass the service role key to any client component.
- Keep result and share pages noindex.

## License

No license is set. All rights are reserved by the owner.
