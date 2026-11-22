# Distribution while the Play Store review is pending

Short version: **use both channels**. Keep the Play Store as the long-term primary channel, but
ship a direct APK download and make the website installable as a PWA right now.

| Channel | Best for | Trade-off |
| --- | --- | --- |
| **Direct APK** from this website | Android users in NCR, WhatsApp sharing, quick testing | User must allow "Install unknown apps"; no automatic updates |
| **PWA** (Add to Home Screen) | Everyone, including iPhone; instant updates | Fewer native capabilities; not listed in any store |
| **Play Store** (in review) | Long-term discovery, trust and automatic updates | Slow review, account deletion + data safety required |

The three channels share the same account system and job data (Supabase), and the APK/PWA use the
same live-update mechanism for web-only changes.

---

## What is set up

### 1. Direct APK download

- File served from your own domain: `https://vmwncrjob.in/apk/VMWjobs-v1.0.apk`
- Download page: `https://vmwncrjob.in/download` (linked from the footer as **Get the App**)
- GitHub release backup: https://github.com/rajpootmohit782/ncrjob/releases/tag/v1.0
- `vercel.json` sets the correct `Content-Type`, `Content-Disposition: attachment` and cache headers.

The APK is copied to both `apk/` (for GitHub) and `public/apk/` (for the website). The native build
script removes `dist/apk` before `cap sync`, so the APK is **not** bundled inside the Android app.

### 2. PWA / installable website

- `public/manifest.webmanifest` — name, icons, standalone display, theme colours
- `public/sw.js` — conservative service worker: network-first navigation, cache-first hashed assets,
  offline fallback to the app shell. Nothing cross-origin is cached (Supabase/Razorpay unaffected).
- `index.html` links the manifest and Apple mobile meta tags
- `src/main.jsx` registers the service worker only in production on the website, never in the
  Capacitor app.

Android Chrome shows **Install app** in the menu; iPhone Safari shows **Add to Home Screen**
(share button). Web push notifications on the PWA need iOS 16.4+ and are not implemented yet.

---

## Deploying

Vercel's default build command `npm run build` produces everything: the site, the APK, the PWA
manifest/service worker, and the `app-update.json` + `app-update.zip` files used by the native
app's live-update mechanism. (`npm run build:app` is kept as an alias.)

After pushing to `main`, verify:

```
https://vmwncrjob.in/download                     -> 200 (page)
https://vmwncrjob.in/apk/VMWjobs-v1.0.apk         -> 200, application/vnd.android.package-archive
https://vmwncrjob.in/manifest.webmanifest         -> 200, application/manifest+json
https://vmwncrjob.in/sw.js                        -> 200, no-cache
```

---

## Publishing a newer APK

1. Bump `versionCode` / `versionName` in `android/app/build.gradle`.
2. `npm.cmd run android:sync`
3. `cd android && .\gradlew.bat assembleRelease` (and `bundleRelease` for Play)
4. Copy `android/app/build/outputs/apk/release/app-release.apk` to both `apk/` and `public/apk/`,
   renaming consistently (e.g. `VMWjobs-v1.1.apk`).
5. Update `APK_URL`, `APK_SHA256`, version/size text in `src/pages/static/DownloadApp.jsx` and the
   table in `apk/README.md`.
6. On GitHub, create a new release/tag with the new APK attached.
7. Commit and push; Vercel redeploys automatically.

---

## After the Play Store release goes live

Set this environment variable in Vercel (Production) and redeploy:

```
VITE_SHOW_APK_DOWNLOAD=false
```

This hides the **Get the App** footer link. The `/download` page still resolves if someone has a
direct link; to remove it completely, delete the route and page. Play policy discourages pointing
Play users at an alternative download of the same app, so do this before the store release is
published.

The live-update manifest URL stays the same — it updates the content inside the Play app and does
not download or replace native code.

---

## Security note for users

The APK is signed with a self-generated upload key (`android/app/vmwncrjob-upload.jks`). It is safe
to install, but Android will show an "unknown source" warning because it did not come from Play.
Publish the SHA-256 shown on the download page if you want users to verify the file. Once the Play
version is published, recommend that channel instead.
