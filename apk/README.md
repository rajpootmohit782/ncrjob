# VMWjobs Android APK (v1.0)

Signed release build for direct installation and testing.

| Item | Value |
| --- | --- |
| File | `VMWjobs-v1.0.apk` |
| Package | `in.vmwncrjob.app` |
| Version | 1.0 (versionCode 1) |
| Size | ~4.8 MB |
| SHA-256 | `DFA459BC9A107BC238D4C8E5BDBE132B4E91B21C95983FED63149438ED3F9086` |
| Signer | `CN=VMWjobs, OU=Mobile, O=VMWjobs, L=Greater Noida, ST=Uttar Pradesh, C=IN` |

## Download

From GitHub, open `apk/VMWjobs-v1.0.apk` and click **Download raw file**, or use:

```
https://github.com/rajpootmohit782/ncrjob/raw/main/apk/VMWjobs-v1.0.apk
```

## Install on Android

1. Download the APK to your phone.
2. Open it â€” Android will ask to allow "Install unknown apps" for the browser/file manager you used. Allow it.
3. Tap **Install**.

Because this APK is signed with a self-generated upload key (not the Play Store signing key), you must **uninstall any previously installed VMWjobs app** before installing this one, otherwise Android will report a signature conflict.

## Notes

- This APK is for testing/direct download. For Play Store, upload
  `android/app/build/outputs/bundle/release/app-release.aab` instead.
- Web-only changes can be published without rebuilding this APK via the live-update mechanism
  documented in [PLAY_STORE.md](../PLAY_STORE.md).
- To rebuild locally: `npm run android:sync`, then `cd android && .\gradlew.bat assembleRelease`.
