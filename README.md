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
| Shop pages read uploaded resources | **Next.** Browse, home and product pages still show sample data. |
| In-browser PDF reader (no download button) | Planned |
| Razorpay checkout and webhook | Code written, not live. Needs keys and Razorpay approval. |
| Cart checkout for several items at once | Planned. An order currently covers one item. |
| Sitemap and robots file | Planned |

Known leftovers: the home page text and sample cards still mention the old prices (₹19 and ₹28). They are replaced when the shop pages switch to the database.

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

To add a resource: choose the course, semester or year, subject, type and price, then upload the PDF (and an optional free sample). Tick **Published** to show it in the shop. New resources start as drafts.

---

## Payments

1. The student signs in and taps **Buy now**.
2. `/api/checkout` creates a Razorpay order using the price stored in the database.
3. Razorpay sends the result to `/api/webhooks/razorpay`.
4. The webhook checks the signature and marks the purchase as paid. **Access is unlocked only here, never because the browser says "paid".**

---

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
