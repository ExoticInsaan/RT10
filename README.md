# Toppershelf

**Better Resources. Better Results.**

Toppershelf is an online shop for exam-focused nursing study material. Students buy PDFs and read them in the browser.

- **Live site:** https://www.toppershelf.online
- **Courses:** B.Sc. Nursing (semesters 1 to 8), GNM (years 1 to 3), Post Basic (years 1 to 2)
- **Content types:** Important Questions, Care Plans, Case Studies, Flashcards, Notes, Assignments
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
| Design (home, About, Founders, Study Smarter and cart) | Done |
| Sign-in with Google and email code | Done |
| Browse page: search, filters and sorting | Done. Filters: course, semester or year, resource type. Results are always newest first. There is no sort control and no price filter. |
| Legal pages (privacy, terms, refund, contact) | Done |
| Database tables and security rules | Done |
| Admin page: upload PDFs, set price, publish | Done |
| Shop pages read uploaded resources | Done. Home, browse and product pages show only resources the admin has published. |
| In-browser PDF reader (no download button) | Done. The PDF stays on the server; buyers get watermarked page pictures. |
| Razorpay checkout and webhook | Code written, not live. Needs keys and Razorpay approval. |
| Cart checkout for several items at once | Done. One Razorpay order pays for the whole cart (one `purchases` row per item). Needs `0008_multi_item_orders.sql`. |
| Analytics: Google Analytics 4 (no ads, no cookie banner) | Done. Active on the live site (Vercel production) with the built-in ID; see "Analytics" below. |
| Custom 404, error and crash pages | Done (`app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`) |
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
| `NEXT_PUBLIC_GA_ID` | Optional. Overrides the Google Analytics 4 measurement ID built into `components/Analytics.tsx`. An empty value switches analytics off. | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only: checkout and payment webhook | **Yes** |
| `RAZORPAY_KEY_ID` | Server: creates payment orders | **Yes** |
| `RAZORPAY_KEY_SECRET` | Server: creates payment orders | **Yes** |
| `RAZORPAY_WEBHOOK_SECRET` | Server: verifies payment messages | **Yes** |


### Analytics

`components/Analytics.tsx` loads Google Analytics 4 on the live site only (Vercel production). Local development and preview deployments send nothing. It is analytics only:

- There are **no ads** and **no cookie banner**. Google's advertising features are switched off.
- For visitors in the EEA, UK and Switzerland, analytics cookies are off (Google Consent Mode), so only cookieless pings are sent.
- Events sent (see `lib/analytics.ts`): `view_item`, `search`, `add_to_cart`, `remove_from_cart`, `begin_checkout` and `purchase`. The sale is reported from My Library after the payment is confirmed, once per order. Nothing personal (name, email, account id) is sent.
- **If you ever add ads, remarketing or the Meta Pixel, add a consent banner first** and update the privacy policy. Those need visitors' consent.
- India's data-protection law (DPDP) main obligations start in May 2027. Re-check the privacy notice and consent wording then.

---

## Folder guide

| Path | What it is |
| --- | --- |
| `app/` | Pages and routes: `/`, `/browse`, `/p/[slug]`, `/library`, `/admin`, `/about`, `/founders`, `/study-smarter`, `/privacy`, `/terms`, `/refund`, `/contact`, `/login` |
| `app/api/checkout` | Creates one Razorpay order for one or many resources (the cart). Prices are read from the database, never from the browser. |
| `app/api/webhooks/razorpay` | Checks the payment signature, then marks the purchase as paid. |
| `app/auth/callback` | Finishes Google sign-in. |
| `components/` | `home/`, `browse/`, `cart/`, `admin/`, `ui/`, plus sign-in and header parts |
| `lib/catalog-config.ts` | The courses and the six content types. The database enforces the same values, so change both together (add a migration). |
| `lib/supabase/` | Browser, server and admin (service role) clients |
| `lib/products.ts` | Reads published resources from Supabase (cached for about a minute) |
| `lib/browse.ts` | Search, filters and sorting for `/browse` (sort options include one entry per content type) |
| `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` | The 404 page, the error page, and the last-resort crash page |
| `lib/design/` | Design styles and catalogue helpers |
| `public/` | Logos |
| `supabase/migrations/` | SQL for the database |

---

## Database (Supabase)

Run the files in `supabase/migrations/` in order, using the Supabase SQL Editor:

1. `0001_init.sql`: profiles, products, questions, purchases, attempts, security rules, and the private `notes` bucket.
2. `0003_admin_and_catalogue.sql`: admin list, the catalogue fields, and file permissions.
3. `0004_buyers_read_bought_products.sql`: buyers keep access to what they paid for, even if it is unpublished.
4. `0005_subject_optional.sql`: the subject column is now optional.
5. `0006_covers.sql`: cover pictures (`cover_path` and the public `covers` bucket).
6. `0007_notes_type.sql`: adds the `notes` content type.
7. `0008_multi_item_orders.sql`: lets one payment cover several resources (cart checkout).

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

1. The student signs in and taps **Buy now** on one resource, or **Checkout** in the cart to pay for everything in it at once (up to 20 resources).
2. `/api/checkout` creates one Razorpay order for the total, using the prices stored in the database. It saves one `purchases` row per resource, all sharing the same order id. It refuses to charge for anything the student already owns, and reuses an open order instead of creating a second one.
3. Razorpay sends the result to `/api/webhooks/razorpay`.
4. The webhook checks the signature, checks that the payment equals the sum of the order's rows, and marks all of them as paid. **Access is unlocked only here, never because the browser says "paid".**
5. Refunds: a full refund of the payment removes access to everything in it; a partial refund keeps access. If a payment turns out to be a duplicate of something already owned, the whole payment is refunded automatically.

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

---

## Cover pictures

Every card, the product page and the cart show the **real first page of the PDF** as the cover. The page is scaled to fit the frame and is never cropped. It carries no watermark, so everyone can see it. Resources that have no cover yet show the plain generated cover.

- **Made automatically** when you upload or replace a PDF in `/admin`. The server (`app/api/admin/cover`) draws page 1 at 640 px wide and saves it as a WebP in the public `covers` bucket.
- **Existing resources:** open `/admin` and click **Create cover** (or **Refresh cover**) on each one.
- The shop caches its lists for about a minute, so a new cover can take up to a minute to appear.
- Only the first page is public. Paid pages are still served only to buyers, with their email on them.
- Needs migration `0006_covers.sql` and the `SUPABASE_SERVICE_ROLE_KEY` setting.
