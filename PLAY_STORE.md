# VMWjobs Android app — build & publish guide

The website is wrapped in a native Android app with **Capacitor 8**. The built site is bundled
inside the APK, so the app works offline and looks like a real app. On top of that, a small
native plugin can download a newer `dist/` zip from your own website and swap it in on the next
launch — no Play Store release needed for web-only changes.

- **Package / application ID:** `in.vmwncrjob.app`
- **App name:** VMWjobs
- **Live update manifest:** `https://vmwncrjob.in/app-update.json`

---

## 1. One-time setup on this PC

### Android SDK
The SDK command-line tools are installed at:

```
C:\Users\ADMIN\AppData\Local\Android\Sdk
```

`android/local.properties` points Gradle at it:

```
sdk.dir=C:\\Users\\ADMIN\\AppData\\Local\\Android\\Sdk
```

If you move the SDK, update that file. **Android Studio 2026.2.2 Patch 2 is also installed** at
`C:\Program Files\Android\Android Studio` (installer verified against Google's SHA-256). Gradle
can build the bundle from the command line; the IDE is useful for running an emulator.

### Java
JDK 21 is installed (`java -version` should show 21.x). Capacitor 8 / AGP need JDK 17+.

### Signing key
A release upload key was generated for you:

| File | Purpose |
| --- | --- |
| `android/app/vmwncrjob-upload.jks` | Upload keystore — **back this up**, it cannot be reissued |
| `android/keystore.properties` | Passwords/alias (git-ignored) |
| `android/keystore.properties.example` | Template |

Enroll in **Play App Signing** when you create the app in Play Console. Upload this key as your
**upload key**; Google will use it to verify future bundles and manage the real app-signing key.

If you ever lose `vmwncrjob-upload.jks` or `keystore.properties`, you cannot publish an update
without resetting your upload key through Play Console identity verification.

---

## 2. Build a signed App Bundle (AAB)

From the repository root (PowerShell):

```powershell
npm.cmd install
npm.cmd run android:sync        # vite build + cap sync android
cd android
.\gradlew.bat bundleRelease
```

Output (already built and verified on this machine — ~4.4 MB, signed with the VMWjobs upload key):

```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload that file in **Play Console → Your app → Release → Production → Create release**.

Before each release, bump the version in `android/app/build.gradle`:

```gradle
versionCode 2        // must increase every upload
versionName "1.1"    // shown to users
```

> `npm run android:sync` copies `dist/` into the Android project. Generated web assets are
> git-ignored, so always run it on a fresh clone before building.

### Debug / local test build

```powershell
cd android
.\gradlew.bat assembleDebug
```

Install the APK on a connected device with `adb install app\build\outputs\apk\debug\app-debug.apk`.

---

## 3. Live updates (publish web changes without a new release)

### Deploy the update to your website

1. Change Vercel's **Build Command** for the site from `npm run build` to:

   ```
   npm run build:app
   ```

   This runs Vite and then `scripts/build-app-update.mjs`, producing two extra files in `dist/`:
   `app-update.json` (manifest) and `app-update.zip` (the site bundle).

2. Deploy. Verify both URLs return 200:

   ```
   https://vmwncrjob.in/app-update.json
   https://vmwncrjob.in/app-update.zip
   ```

3. On the next app launch, the native plugin compares the manifest version with the installed
   bundle, downloads and verifies the SHA-256, and swaps it in on the following launch.

### How it behaves

- First launch uses the bundle shipped in the APK.
- A downloaded bundle is applied at startup, before the site renders.
- The app confirms the bundle rendered ("app ready"). If it never does, the next launch rolls
  back to the previous good bundle, or to the APK bundle if none exists.
- Only web assets are swapped. Native code is never downloaded, which keeps the update
  mechanism within Google Play's rules.

**Use this for fixes and content changes only.** Do not use it to add features that differ from
what Google reviewed. Use it to fix a typo in a listing, adjust styling, or update copy.

### Emergency reset

To clear downloaded bundles and return to the APK version, clear the app's storage
(**Android Settings → Apps → VMWjobs → Storage → Clear data**), or call
`LiveUpdate.reset()` from the app.

The manifest URL can be changed in `capacitor.config.json` under `plugins.LiveUpdate.manifestUrl`.

---

## 4. Play Console listing checklist

Things you must prepare in Play Console before submitting:

| Item | Details |
| --- | --- |
| Developer account | One-time $25 registration fee, identity/phone verification |
| App name | VMWjobs |
| Short description (80 chars) | e.g. "Private-sector jobs in Noida, Gurugram & Delhi NCR." |
| Full description | Mention free job browsing for candidates and paid employer plans |
| App icon (512×512, PNG) | `store/icon-512.png` |
| Feature graphic (1024×500) | `store/feature-graphic-1024x500.png` |
| Screenshots | Take real ones (phone, min 320px, max 3840px). Do not fabricate them |
| Category | Business or Lifestyle |
| Privacy policy URL | `https://vmwncrjob.in/privacy` — must be publicly reachable |
| Data safety form | Disclose the data the app/Supabase collects (email, name, phone if provided, job applications, payment info handled by Razorpay). Be honest and consistent with the privacy page |
| Target API level | Currently 36 (Android 16). Play requires target within the last 2 years |
| Content rating | Complete the questionnaire |
| Account deletion | **Required.** Play requires apps that allow account creation to offer in-app account deletion and a public web deletion URL. See note below |
| Payments | Employer plans are a real-world service, not digital content, so Razorpay may be acceptable. Confirm against Play's payments policy before submitting |
| App access | If login is required for review, provide a demo employer/candidate/admin account with access to all areas |

### Play review risk: "website in a box"

Google Play rejects apps that are essentially just a website with no native value. This app
already has native touches (installable Android app, offline-capable bundled content, native
back navigation, splash screen, live updates). To strengthen the submission, consider adding
at least one genuinely native feature before review — Android push notifications for new
jobs/applications are the most valuable one. I can add that next if you want.

### Account deletion requirement

The site supports signup, so Play will expect a delete-account flow. This is not implemented yet.
The clean solution is a Supabase Edge Function using the service role to delete the auth user
and their employer/profile rows, plus:

- an in-app **Delete account** action (e.g. in profile/settings), and
- a public `https://vmwncrjob.in/delete-account` web page.

Tell me if you want me to implement this before you submit.

---

## 5. Files added / changed for Android

```
capacitor.config.json                          Capacitor app config
android/                                       Generated Android Studio/Gradle project
android/app/src/main/java/in/vmwncrjob/app/
  MainActivity.java                            Registers plugin, back nav, applies bundle at start
  LiveUpdatePlugin.java                        Self-hosted live update implementation
android/app/build.gradle                       Release signing config
android/keystore.properties.example            Signing template
assets/icon.png, assets/splash.png             Sources for generated icons/splash
store/icon-512.png, store/feature-graphic...   Play Console assets
scripts/build-app-update.mjs                   Builds zip + manifest
src/lib/liveUpdate.js                          JavaScript bridge to native plugin
src/main.jsx                                   Starts live update sync on native
package.json                                   New build/android scripts
```

---

## 6. Troubleshooting

- **`sdk.dir` not set / SDK location not found** — check `android/local.properties`.
- **Gradle download is slow** — first build downloads Gradle and AndroidX deps; later builds are fast.
- **`cap sync` overwrites something** — it only rewrites `android/app/src/main/assets/` and plugin
  lists. Your Java sources, resources, icons, and signing config are untouched.
- **Razorpay checkout inside the app** — allowed hosts are listed in `capacitor.config.json`
  under `server.allowNavigation`. Test a real test-mode payment on a device before release.
  If a bank page fails to load inside the WebView, add its host to `allowNavigation`.
- **External links** — links outside the allow-list open in the system browser automatically.
- **Live update not appearing** — check the manifest is reachable over HTTPS, the version is
  greater than the installed one, and the SHA-256 in the manifest matches the zip.
