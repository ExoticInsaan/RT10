# TopperShelf Android app (Play Store only)

A Capacitor app that wraps a Vite + React + **Tailwind** build. It reuses the website's real games and tools
(`../components/fun`, `../components/tools/shelf`, `../lib/tools`) without changing them, and adds the app screens
from the design: splash, 2 onboarding screens, sign in, Home, The Shelf, Fun Zone, My Shelf and a full-screen tool/game view.
The website (Next.js, Vercel) is untouched.

## How it works
- `src/shims/` replaces `next/image`, `next/link`, `next/dynamic`, `next/navigation`, `next/font` and the website's
  `AuthProvider` / Supabase client so the shared components run in a plain static bundle.
- Everything is bundled in the app: images, fonts and tools open offline. Sign-in and account data (flashcards, reminders, countdowns) need internet.
- `src/native.ts`: Android back button, status-bar colours, and file saving (PDF/image downloads open the Share sheet).

## First-time setup
```bash
cd mobile
cp .env.example .env          # same VITE_SUPABASE_* values as the website's NEXT_PUBLIC_* ones
npm install
npm run build                 # type-checks, copies images from ../public, builds dist/
npx cap sync android
npx cap open android          # Android Studio: Build > Generate Signed App Bundle (.aab)
```
Day to day: `npm run dev` for a browser preview, `npm run android` to rebuild and open Android Studio.

## Google sign-in (one-time setup)
1. Supabase → Authentication → URL Configuration → add `online.toppershelf.app://auth` to **Redirect URLs**.
2. Google provider stays as on the website (the app uses the same Supabase project).
The app opens Google in a secure browser tab and returns through that link (declared in `AndroidManifest.xml`).

## Icons and splash
Source images are in `assets/`. After changing them: `npm run icons`.

## Before Play review
- Play requires an in-app way to delete the account if people can create one. Add it (or link to a web page) before publishing.
- Privacy policy URL, Data safety form and content rating are filled in Play Console as usual.

## Push notifications (Firebase)
The app is ready to receive notifications; you send them from the Firebase console. One-time setup:
1. console.firebase.google.com → **Add project** (name it TopperShelf; Analytics optional).
2. Project overview → **Add app → Android**. Package name: `online.toppershelf.app`. Download **google-services.json**.
3. Put that file at `mobile/android/app/google-services.json` (the Gradle plugin is already wired and switches on when the file exists), commit it, then rebuild the `.aab`.
4. To send: Firebase console → **Messaging → New campaign → Notifications**. Write the title and text, choose **Target: App → TopperShelf (Android)** to reach everyone, and send. To open a screen when tapped, add custom data `path` = `/tool/cgpa-calculator`, `/fun`, `/shelf`, etc.
People turn notifications on with the switch on the **My Shelf** screen (Android 13+ asks for permission at that moment).
Test on a real phone: the emulator needs Google Play services.
