# TopperShelf Android app (Play Store only)

A Capacitor app that wraps a Vite + React + **Tailwind** build. It reuses the website's real games and tools
(`../components/fun`, `../components/tools/shelf`, `../lib/tools`) without changing them, and adds the app screens
from the design: splash, 2 onboarding screens, sign in, Home, The Shelf, Fun Zone, My Shelf and a full-screen tool/game view.
The website (Next.js, Vercel) is untouched.

## How it works
- `src/shims/` replaces `next/image`, `next/link`, `next/dynamic`, `next/navigation`, `next/font` and the website's
  `AuthProvider` / Supabase client so the shared components run in a plain static bundle.
- Everything is bundled in the app: images, fonts and tools open offline. Sign-in and account data (flashcards, reminders, countdowns) need internet.
- `src/native.ts`: Android back button, status-bar colours, and file saving. Downloads (PDFs, edited images, Fun Zone cards) are saved
  to the phone by our own plugin, `android/.../DownloadsPlugin.java`: images go to `Pictures/TopperShelf`, everything else to
  `Download/TopperShelf`, using MediaStore, so no storage permission is needed on Android 10+. A "Saved" message with Open and Share
  appears (`src/components/SavedToast.tsx`). On Android 9 and older the plugin declines and the Share sheet opens instead.

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

## Reminders (app only)
The Reminder tool in the app (`src/components/AppReminder.tsx`) schedules a real phone notification for each reminder with
`@capacitor/local-notifications` (`src/reminders.ts`). It fires at the chosen time even when the app is closed, survives a phone restart,
and tapping it opens the Reminder screen. The calendar buttons are not shown in the app. Android 13+ asks for notification permission
when the first reminder is added. `ReminderScheduler` re-schedules saved reminders at launch (for example ones added on another phone) and
clears them on sign-out. The website's Reminder is unchanged.

Play Store: the app does **not** use the exact-alarm permission (Google Play restricts it to alarm-clock and calendar apps, and Android 14+ also
sends people to a settings page to grant it). The notifications plugin adds `SCHEDULE_EXACT_ALARM` by itself, so `AndroidManifest.xml` removes it
(`tools:node="remove"`) and every notification is scheduled with `isExactNotification: false`. Android still delivers each one while the phone
is idle, normally close to the chosen time, but it is not guaranteed to the second and can be later on phones in deep battery saving.

## Focus Timer notification
While the Focus Timer runs, the app schedules one phone notification for its end time (`src/focusTimer.ts`), so the person is told with the
screen locked or the app closed. The shared timer announces start and stop with a `toppershelf:focus-timer` event (the website ignores it).
There is one fixed notification id, so a new start replaces the old alert and pause, skip or leaving the screen cancels it. No early warning.

## First-launch tour
Splash, then three intro screens (`src/screens/Onboard.tsx`): useful tools, the silly ones, and a third screen with reminders, offline use and
account sync, where the app asks once to allow notifications (or "Not now"). The choice is the same one as Settings → Notifications, and a
blocked or skipped permission never stops the tour. Returning people skip the tour.

## Offline use
The screens, tools, fonts and images are bundled in the app, so it opens with no internet. Saved tools (Flashcards, Countdown, Reminders)
use `src/shims/useAccountData.ts` instead of the website's version: they open from a copy kept on the phone, refresh from the account
when online, and changes made offline are saved on the phone first and sent when the internet or the app comes back (the phone's waiting
changes are never overwritten by an older account copy). `src/shims/AuthProvider.tsx` reads the login from the phone, so the app does
not look signed out offline. Copies on the phone are removed on sign-out. A small "You're offline" notice shows while there is no
connection. Friend games, sign-in and the account-deletion call still need the internet. The website is unchanged.

## Settings and account deletion

The Settings screen (Home → account icon) is app-only. "Delete my account" calls the `delete-account` Supabase Edge Function
(`supabase/functions/delete-account`), which deletes the signed-in person's saved data and login. Deploy it once to the TopperShelf project:

```
supabase functions deploy delete-account --project-ref <your TopperShelf project ref>
```

Keep "Verify JWT" on. The function uses the project's built-in `SUPABASE_SERVICE_ROLE_KEY`, so no extra secret is needed.
For the Play Console Data safety form, point "Delete account URL" at https://www.toppershelf.online/contact (or a page that explains in-app deletion).

## Quick start on your computer

```
git pull
cd mobile
cp .env.example .env     # already holds the TopperShelf Supabase URL and anon key
npm install
npm run android          # builds, syncs and opens Android Studio; plug in your phone and press Run
```

Phone checklist: Google sign-in works, a game opens, an image or PDF saves through the share sheet, the back button behaves,
Settings opens from the Home account icon, Delete my account works (use a throwaway Google account), and favourites follow you to another device.
Before sign-in works, add `online.toppershelf.app://auth` under Supabase → Authentication → URL Configuration → Redirect URLs.
Notifications also need `google-services.json` in `mobile/android/app/` (see the Firebase section above).
