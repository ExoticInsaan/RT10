<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: TopperShelf (free tools website)

TopperShelf is a free, fast tools website (PDF, image, calculators, text, India tools, student tools, and a Fun Zone of witty shareable tools). Positioning: **Useful tools. A few silly ones. All free, one quick signup.** Read `README.md` for status, routes and the product plan.

### What the user experience must feel like

- **Fast:** tools run in the browser. No upload wait, no queue.
- **Private:** process files on the user's device wherever possible. Show "Your files never leave your device" only on tools where that is actually true.
- **Simple:** one signup (Google), no watermark, no popups blocking the tool. One screen per tool: input, one main button, result.
- Visitors mostly land on a tool page from Google. Every tool page must work as its own entry point.

### Adding a tool

1. Add one entry to `lib/tools/registry.ts` (id, name, description, category, icon, tone, optional `popular`). Pages, search, sitemap and related tools read from it automatically.
2. Build the tool UI and plug it into `components/tools/ToolGate.tsx` (shown after sign-in). Fun tools instead add a config and logic in `lib/tools/fun.ts` and use `FunRunner` and the share card.
3. Follow the tool page template in `app/tool/[id]/page.tsx`: H1 matching the search phrase, tool above the fold, result with Download, Copy or Share, 3-step how-to, 3 to 5 FAQs (with FAQ structured data), related tools, breadcrumbs.
4. Add a new icon to `components/tools/ToolIcon.tsx` only if none fits.
5. Heavy file work (PDF, image) runs client-side with lazy-loaded libraries so pages stay light. Check size limits and give clear errors.

### Conventions

- **Routes:** tool pages are `/tool/[id]`, categories are `/tools?category=Name`. Do not introduce nested `/tools/pdf/...` URLs without a decision, because sitemap and canonicals use the current form.
- **Sign-in gate:** anyone can open and read a tool page; signing in is required to run it. The sign-in popup opens from `useAuth().openSignIn`, and after sign-in the tool should run with the input still in place. Collect only name and email.
- **One component set:** every page uses `components/tools/*` (`ui.tsx`, `ToolIcon`) and `components/shell/*`.
- **Styling:** Tailwind 4 with theme tokens in `app/globals.css` (`navy`, `blue`, `violet`, `teal`, `coral`, `line`, `muted`). Every new component needs `dark:` variants. Keep form fields 16px on phones.
- **Metadata:** every public page sets its own `alternates.canonical` with an absolute path. Result and share pages and personal pages (`/my-tools`, `/login`) are `noindex`.
- **Favourites and recents:** `useStoredList` currently uses `localStorage`. The planned change is to back it with the signed-in Supabase account without changing callers.
- **Fun tools:** results are deterministic (same input and salt give the same card) so a share link rebuilds the exact result. Share cards are 9:16 (1080x1920) with the user's result and the TopperShelf name. Keep jokes friendly: no content that targets real groups or people.
- **Supabase:** browser client in `lib/supabase/client.ts`, server client in `lib/supabase/server.ts`. New tables need Row Level Security so users only read and write their own rows. Never expose the service role key to client code. New SQL goes in a numbered file in `supabase/migrations/`.

### Known cleanup (do when touching the area)

- Add tool analytics events (tool opened, run, shared, sign-in).
- Add a feedback form with "Request a tool" (Supabase table with RLS) to replace the mailto-only contact page.
- Legal pages (`/privacy`, `/terms`) were rewritten for the tools site. Have a lawyer review them before ads or the Play Store listing, and update them when favourites move to accounts or ads are added.

### Build order (from the product plan)

Foundation (done) → first real tools (one PDF, one image) → launch set of about 10 tools, Fun Zone polish, About, Contact, Legal → PWA (install prompt, offline for simple tools, My Tools in the account) → Play Store via TWA → growth (2 to 3 new tools a week, guides for SEO, tool-request leaderboard, ads once traffic is steady).

### Before finishing any change

Run `npm run lint` and `npm run typecheck`. Test the page on a narrow phone width and in dark mode. Never commit `.env.local` or secrets.
