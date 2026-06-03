# Deployment Guide

How to build the Android APK and deploy the restaurant dashboard.

---

## Mobile App — Android APK

### Option A: Local Gradle Build (Release APK)

Requires Android Studio installed with the Android SDK and NDK.

```bash
cd mobile

# 1. Build the JS bundle first
npx expo export --platform android

# 2. Build the release APK via Gradle
cd android
.\gradlew assembleRelease

# Output: mobile/android/app/build/outputs/apk/release/app-release.apk
```

The release APK is already signed with the debug keystore by default. For a production-signed APK, configure your keystore in `android/app/build.gradle`.

---

### Option B: EAS Build (Cloud — recommended)

Expo Application Services builds the APK on Expo's servers — no Android Studio required.

```bash
cd mobile

# First time: install EAS CLI and log in
npm install -g eas-cli
eas login

# Build a preview APK (faster, not app-store ready)
eas build --platform android --profile preview

# Build a production AAB (Google Play ready)
eas build --platform android --profile production
```

EAS configuration is in `mobile/eas.json`:

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

EAS Project ID: `6dfc5aab-b58a-406c-abf7-60b786269658`

---

### APK distribution

The current release APK (`BiteSync.apk` in the root) can be:
- Shared directly via WhatsApp / Google Drive for sideloading
- Distributed via Firebase App Distribution for beta testers
- Published to the Google Play Store (requires a developer account)

**Enable sideloading on Android:**
Settings → Apps → Special App Access → Install Unknown Apps → allow for your file manager or browser.

---

## Dashboard — Next.js

### Vercel (recommended)

1. Push the `dashboard/` directory to a GitHub repo (or use the monorepo root).
2. Go to [vercel.com](https://vercel.com), import the repository, and set the root directory to `dashboard`.
3. Add environment variables in the Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
4. Deploy. Vercel auto-redeploys on every push to `main`.

### Manual / self-hosted

```bash
cd dashboard
npm run build      # Generates .next/ production build
npm run start      # Starts production server on port 3000
```

Use a process manager like PM2 for uptime:
```bash
npm install -g pm2
pm2 start "npm run start" --name bitesync-dashboard
pm2 save
```

---

## Pre-deployment checklist

Before shipping a new APK or deploying the dashboard:

- [ ] All `console.log` / `console.error` debug statements reviewed and removed
- [ ] Environment variables are production values (not dev Supabase project)
- [ ] RLS policies verified — run `database/security_hardening.sql` in production DB
- [ ] App version bumped in `mobile/app.json` (`version` field)
- [ ] Test on a real Android device (not just web)
- [ ] Confirm image uploads work in production Supabase Storage
- [ ] Confirm reviews can be submitted and updated within 5-minute window

---

## Version numbering

BiteSync follows semantic versioning (`MAJOR.MINOR.PATCH`):

| Part | When to bump |
|------|-------------|
| MAJOR | Breaking changes to data model or complete redesigns |
| MINOR | New features (e.g. new screen, new dashboard page) |
| PATCH | Bug fixes, UI tweaks, copy changes |

Update `version` in `mobile/app.json` before each APK build.
