# Releasing TopperShelf to Google Play

## 1. One-time: make your upload key (keep it safe, never commit it)
```
keytool -genkeypair -v -storetype PKCS12 -keystore toppershelf-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```
Save the `.jks` file and its passwords in a password manager and a second backup. In Play Console, turn on **Play App Signing** (default) so Google holds the real signing key and this is only the upload key.

Create `mobile/android/keystore.properties` (git-ignored):
```
storeFile=/full/path/to/toppershelf-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

## 2. Before every release
- `google-services.json` is in `mobile/android/app/` (package `online.toppershelf.app`).
- Supabase → Authentication → URL Configuration → Redirect URLs has `online.toppershelf.app://auth`.
- Raise `versionCode` (and `versionName`) in `mobile/android/app/build.gradle`. Play rejects a repeated versionCode.
- Test on a real phone: Google sign-in, a game, card Download and Share, back button, Settings, Delete my account (throwaway account), notifications.

## 3. Build the bundle
```
git pull
cd mobile
npm install
npm run sync
cd android
./gradlew bundleRelease
```
Output: `mobile/android/app/build/outputs/bundle/release/app-release.aab` (signed). Or in Android Studio: Build > Generate Signed App Bundle.

## 4. Play Console
- Create app → name TopperShelf, free, App category, default language.
- Store listing: short and full description, 512x512 icon, 1024x500 feature graphic, at least 2 phone screenshots.
- Privacy policy URL: https://www.toppershelf.online/privacy
- Data safety form: account info (email, name via Google sign-in), app activity (saved favourites, flashcards, reminders), device ID for push notifications. Data is encrypted in transit; users can delete their account in the app (Settings → Delete my account). Delete account URL: https://www.toppershelf.online/contact
- Content rating questionnaire, target audience (13+ is simplest; an app for under-13s needs extra rules), Ads: none.
- Upload the `.aab` to Internal testing first, then promote.
- Personal developer accounts created after Nov 2023 must run a **closed test with at least 12 testers for 14 days in a row** before Production. Organization accounts skip this.
