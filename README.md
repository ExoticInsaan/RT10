# Toppershelf

**Better Resources. Better Results.**

Toppershelf is an online shop for exam-focused nursing study material. Students buy PDFs and read them in the browser.

- **Live site:** https://www.toppershelf.online
- **Courses:** B.Sc. Nursing (semesters 1 to 8), GNM (years 1 to 3), Post Basic (years 1 to 2)
- **Content types:** Important Questions, Case Studies, Care Plans, Assignments, Flashcards
- **Price:** every PDF is currently sold at **₹49**. The price is stored on each resource, so it can be changed per item in the admin page.
- **Support:** support@toppershelf.online

---

## Tech stack

| Part | Tool |
| --- | --- |
| Website | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database, sign-in, file storage | Supabase (Postgres, Auth, Storage) |
| Payments | Razorpay (UPI, cards, net banking) |
| Hosting | Vercel (production deploys from `main`) |
| Domain and email forwarding | Cloudflare (DNS only, no proxy) |

## Project status

| Area | Status |
| --- | --- |
| Design (home, About, Founders, Study Smarter, cart and wishlist) | Done |
| Sign-in with Google and email code | Done |
| Legal pages (privacy, terms, refund, contact) | Done |
| Database tables and security rules | Done |
| Admin page: upload PDFs, set price, publish | Done |
| Shop pages read uploaded resources | Done. Home, browse and product pages show only resources the admin has published. |
| In-browser PDF reader (no download button) | Done. The PDF stays on the server; buyers get watermarked page pictures. |
| Razorpay checkout and webhook | Code written, not live. Needs keys and Razorpay approval. |
| Cart checkout for several items at once | Planned. An order currently covers one item. |
| Sitemap and robots file | Planned |

---

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local    # then fill in the values
npm run dev                   # http://localhost:3000
```

Other commands: `npm run build`, `npm run start`, `npm run lint`.

### Environment variables

Copy `.env.example` to `.env.local` and fill it in. On Vercel, add the same names under **Settings → Environment Variables**.

| Name | Where it is used | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Links and metadata | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server (the public key) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only: checkout and payment webhook | **Yes** |
| `RAZORPAY_KEY_ID` | Server: creates payment orders | **Yes** |
| `RAZORPAY_KEY_SECRET` | Server: creates payment orders | **Yes** |
| `RAZORPAY_WEBHOOK_SECRET` | Server: verifies payment messages | **Yes** |

---

## Folder guide

| Path | What it is |
| --- | --- |
| `app/` | Pages and routes: `/`, `/browse`, `/p/[slug]`, `/library`, `/admin`, `/about`, `/founders`, `/study-smarter`, `/privacy`, `/terms`, `/refund`, `/contact`, `/login` |
| `app/api/checkout` | Creates a Razorpay order. The price is read from the database, never from the browser. |
| `app/api/webhooks/razorpay` | Checks the payment signature, then marks the purchase as paid. |
| `app/auth/callback` | Finishes Google sign-in. |
| `components/` | `home/`, `browse/`, `cart/`, `admin/`, `ui/`, plus sign-in and header parts |
| `lib/catalog-config.ts` | The courses and the five content types. The database enforces the same values. |
| `lib/supabase/` | Browser, server and admin (service role) clients |
| `lib/products.ts` | Reads published resources from Supabase (cached for about a minute) |
| `lib/browse.ts` | Search, filters and sorting for `/browse` |
| `lib/design/` | Design styles and catalogue helpers |
| `public/` | Logos |
| `supabase/migrations/` | SQL for the database |

---

## Database (Supabase)

Run the files in `supabase/migrations/` in order, using the Supabase SQL Editor:

1. `0001_init.sql`: profiles, products, questions, purchases, attempts, security rules, and the private `notes` bucket.
2. `0003_admin_and_catalogue.sql`: admin list, the catalogue fields, and file permissions.

There is no `0002` file. It was an experiment that was rolled back.

**Security rules (Row Level Security) are on for every table.**

- Anyone can read **published** products.
- Only admins can add, change or delete products.
- Students can read only their own purchases.
- Only the server (service role) writes purchases.

**Files** live in the private `notes` bucket:

- `pdf/<product-id>.pdf` is the paid PDF. Only an admin or a buyer who has paid can open it.
- `sample/<product-id>.pdf` is the free sample. Anyone can open it once the product is published.
- Uploads are limited to PDFs, 50 MB each.

---

## Admin page

Open `/admin` and sign in. Only emails listed in the `admins` table can use it. Everyone else sees "Admin only".

To add another admin, run this in the Supabase SQL Editor (use lowercase):

```sql
insert into public.admins (email) values ('name@example.com');
```

To add a resource: choose the course, semester or year, type and price, then upload the PDF (and an optional free sample). Tick **Published** to show it in the shop (it appears within about a minute). New resources start as drafts.

**There is no subject field.** Students find a PDF by typing words from its document name (the title) into the search bar on the home or browse page. Search also matches the description, type, course and semester, ignores capital letters, and "and" matches "&". Give each resource a clear title, for example "Applied Anatomy - Most Important Questions".

---

## Payments

1. The student signs in and taps **Buy now**.
2. `/api/checkout` creates a Razorpay order using the price stored in the database.
3. Razorpay sends the result to `/api/webhooks/razorpay`.
4. The webhook checks the signature and marks the purchase as paid. **Access is unlocked only here, never because the browser says "paid".**

---

## PDF reader

After paying, a student opens the PDF at `/read/<slug>` and reads it in the browser.

- **The PDF file never reaches the browser.** The server draws one page at a time and sends a picture with the student's email burned into it (diagonal across the page and along the bottom). `/api/read/<slug>` gives the page sizes; `/api/read/<slug>/page/<n>` gives a page picture. Both check the sign-in and a paid purchase first (admins can preview any PDF).
- No download, print or share button. Right-click, Ctrl+S and Ctrl+P are blocked, printing shows only a note, and the pages are hidden whenever the window is not in front or the Print Screen key is pressed.
- A copied page link does not work for anyone else, because it needs the student's own sign-in.
- **What this cannot do:** no website can block a phone's own screenshot button, a screen recording or a photo of the screen. The burned-in email is what makes any leaked copy traceable to the person who shared it. Say so honestly in any copy you write.
- Code: `lib/reader-access.ts` (who may read), `lib/reader-server.ts` (draws pages and the watermark), `components/reader/` (the screen). The watermark font is `lib/fonts/DejaVuSans-Bold.ttf` (see `DejaVu-LICENSE.txt`).
- `next.config.ts` lists `pdfjs-dist` and `@napi-rs/canvas` as server external packages and makes sure the worker, fonts and watermark font ship with the deploy. If the reader works locally but not after deploying, check those first.
- A student whose purchase is refunded can keep reading for up to a minute (the server remembers "allowed" briefly to save database calls).

## Sign-in

Students sign in with Google, or with an email code (no passwords).

In Supabase, under **Authentication → URL Configuration**:

- Site URL: `https://www.toppershelf.online`
- Redirect URLs: `https://www.toppershelf.online/auth/callback`, `https://toppershelf.online/auth/callback`

Google sign-in is configured in Google Cloud Console (OAuth client) and in Supabase (**Authentication → Providers → Google**).

---

## Deployment

- `main` is production. Vercel builds and publishes it automatically.
- Every other branch gets a preview build.
- Domain: `toppershelf.online` points to Vercel through Cloudflare. DNS records are set to **DNS only** (grey cloud), because the proxy breaks Vercel's HTTPS.
- `support@toppershelf.online` forwards to the owner's inbox through Cloudflare Email Routing.

### Working on changes

1. Make a branch, for example `git checkout -b my-change`.
2. Push it and check the Vercel preview.
3. Open a pull request into `main` and merge it.

---

## Rules for this repo

- Never commit `.env.local`, the Supabase service role key, Razorpay keys, or any PDF.
- Keep paid PDFs in the private Supabase bucket only.
- Never trust the browser for prices or payment status.
- Do not pass the service role key to any client component.
- Only claim on the site what is true, such as real reviews and real numbers.

## License

No license is set. By default, all rights are reserved by the owner. The study material is for each buyer's personal use only.
