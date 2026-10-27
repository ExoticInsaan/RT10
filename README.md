# TopperShelf

**Useful tools. A few silly ones. All free, one quick signup.**

TopperShelf is a free, fast tools website for everyone: PDF, image, calculators, text utilities, India-specific tools, student tools and a Fun Zone of witty, shareable tools. A visitor should land (usually from Google or an Instagram story), find a tool in seconds, sign in once, use it in the browser and leave with the job done.

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
| Tool registry (`lib/tools/registry.ts`, 18 tools in 7 categories) | Done |
| Home, All Tools (search and category filter), tool page, Fun Zone, My Tools | Done |
| Bottom mobile navigation (Home, Tools, Fun, My Tools), dark mode | Done |
| Google sign-in with a popup on the tool page (`AuthProvider`, `AuthPanel`) | Done |
| Sign-in gate on tools (`ToolGate`): anyone can open a page, signing in runs the tool | Done |
| Fun Zone tools: How cooked are you?, Excuse Generator, Roast My Timetable, Instant Vibe Check | Done (run and produce a result) |
| Share cards: 9:16 page plus 1080x1920 PNG (`app/share/[id]`) | Done |
| Sitemap, robots, JSON-LD on home, 404 page with tool search | Done |
| Real tool UIs (PDF, image, calculators, text, India, students) | **Not built.** Non-fun tools show "coming soon" after sign-in. |
| Favourites and recents saved to the user's account | **Not built.** Currently saved in this browser's `localStorage` (`lib/tools/useStoredList.ts`). |
| Per-tool SEO template (how-to steps, FAQ, FAQ and app structured data, trust note, breadcrumbs) | Done. It fills in from `lib/tools/content.ts`; only the four Fun tools have content so far |
| Category pages (`/tools/pdf`, `/tools/india-tools` and so on) | Done |
| `/search` page, feedback and "Request a tool" form | Not built. Contact is a mailto page. |
| Unfinished tools kept out of Google ("Soon" badge, noindex, not in the sitemap) | Done, controlled by `ready: true` in the registry |
| Link-preview image | Done (`app/opengraph-image.tsx`) |
| PWA (install prompt, offline, manifest), Play Store (TWA) | Not built |
| Ads | Later, not before traffic is steady |
| About, Founders, Contact, Privacy, Terms pages | Rewritten for the tools site (Contact is still mailto-based; a feedback form with "Request a tool" is not built) |

---

## Product plan

### How a user sees the site

1. They arrive from Google (for example "compress pdf to 200kb") or an Instagram story card.
2. They land on a **tool page**, not the homepage. Every tool page is its own entry point.
3. They sign in once (Google), then use the tool in one screen: input, one main button, result.
4. "More tools you may need" under the result is how they discover the rest of the site.
5. They may share (Fun Zone) or install the app after repeat use.

### Routes (as built)

| Route | Purpose |
| --- | --- |
| `/` | Home: search, categories, popular tools, Fun Zone teaser, trust strip |
| `/tools` | All Tools, filter by `?category=` and search with `?q=` |
| `/tool/[id]` | One tool page (open to view, sign-in needed to run) |
| `/fun` | Fun Zone grid |
| `/share/[id]` and `/share/[id]/image` | Result page and downloadable story card (noindex) |
| `/my-tools` | Favourites and recently used (noindex) |
| `/login`, `/auth/callback` | Sign-in |
| `/about`, `/founders`, `/contact`, `/privacy`, `/terms` | Info and legal pages. |

The plan document sketches nested URLs such as `/tools/pdf/compress-pdf`. The build uses the flatter `/tool/[id]` plus category pages at `/tools/[category]` (`/tools?category=` still works as a filter on the All Tools page). Keep the flat form unless there is a deliberate decision to change it, because the sitemap and canonicals already use it.

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
| File handler (PDF and image processing in the browser) | To build |
| Favourites and recents | `useStoredList` (local now, account later) |
| SEO engine | Metadata on each page, `app/sitemap.ts` (lists only ready tools and categories with a ready tool), `components/seo/JsonLd.tsx` |
| Accounts and sign-in | `components/AuthProvider.tsx`, `AuthPanel.tsx`, `lib/supabase/` |
| PWA layer, feedback form, ad slots | To build |

### Launch set (about 10 tools, then 2 to 3 new tools a week)

- **PDF:** merge, compress, split, image to PDF
- **Image:** compress, resize
- **India tools:** compress PDF or image to an exact size (100 KB, 200 KB), passport or Aadhaar-size photo, GST calculator
- **Calculators:** EMI, age and date
- **Text and utilities:** word counter, case converter, QR generator
- **Fun Zone:** How cooked are you?, excuse generator, roast-my-something
- **Students (second wave):** CGPA to percentage, attendance and bunk calculator, nursing calculators (IV drip rate, BMI)

### Build phases

1. Foundation: layout, registry, tool template, search, SEO, sign-in. *(done)*
2. First tools: one PDF, one image, one witty tool to prove the template. *(witty done; PDF and image next)*
3. Launch set: remaining tools to about 10, Fun Zone, About, Contact, Legal.
4. PWA: install support, offline for simple tools, My Tools saved to the account.
5. Play Store: wrap the PWA as a TWA, closed testing, then release.
6. Growth: 2 to 3 tools a week, guides for SEO, a tool-request leaderboard, ads once traffic is steady.

### Open decisions

- Sign-in method (Google only today; email or phone OTP optional) and whether a visitor may try a tool once before signing in.
- Ad strategy and timing. If ads, remarketing or Meta Pixel are ever added, add a consent banner first and update the privacy policy.
- Whether the Fun Zone gets its own sub-brand.

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
| `components/tools/` | Tool UI: cards, browser, gate, fun runner, share card, My Tools |
| `components/shell/` | Header, footer, logo, mobile nav, status pages (404 and error), legal page layout |
| `components/seo/` | JSON-LD helper |
| `lib/tools/` | Registry, fun tool logic, stored-list hook |
| `lib/supabase/` | Browser and server clients |
| `supabase/migrations/` | SQL migrations (none yet) |

---

## Database (Supabase)

The site only needs Supabase Auth today. Planned additions: tables for favourites and recents per user, and tool requests, each with Row Level Security (users read and write only their own rows). Put new SQL in numbered files in `supabase/migrations/`.

Collect only a name and email at sign-in.

## Sign-in

Google only. In Supabase under **Authentication → URL Configuration**:

- Site URL: `https://www.toppershelf.online`
- Redirect URLs: `https://www.toppershelf.online/auth/callback`, `https://toppershelf.online/auth/callback`

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
