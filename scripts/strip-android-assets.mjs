// The APK download belongs on the website, not inside the Android app itself.
// Run after `vite build` and before `cap sync android` so the native bundle
// does not carry a redundant copy of the APK.

import fs from 'node:fs';
import path from 'node:path';

const apkDir = path.resolve(process.cwd(), 'dist/apk');
if (fs.existsSync(apkDir)) {
  fs.rmSync(apkDir, { recursive: true, force: true });
  console.log('Removed dist/apk from the native build.');
}
