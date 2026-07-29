# Rupiyo Android Release & Signing Architecture

## 1. Build & Release Configuration
- **Application ID**: `com.rupiyo.app`
- **Current Version**: `1.0.0`
- **Version Code**: `1`
- **Target SDK**: Android 34 (Android 14)
- **Minimum SDK**: Android 22 (Android 5.1)

---

## 2. Release Signing Security Rules
1. **Zero Secret Storage in Source Code**: Keystore files, private signing keys, alias passwords, and keystore passwords are NEVER committed to the Git repository.
2. **Gitignore Protection**: `.gitignore` explicitly excludes `*.keystore`, `*.jks`, `*.pem`, `*.pk8`, and release credential files.
3. **Distribution Artifact**: Official production APK binaries are hosted over HTTPS at `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL` (`/downloads/rupiyo-release.apk`).

---

## 3. Capacitor Native Integration & Android Capabilities
- **Camera Viewfinder**: Native Camera permission (`android.permission.CAMERA`) requested dynamically when tapping receipt scanner.
- **Media Access**: Read media permissions (`android.permission.READ_MEDIA_IMAGES`) for selecting receipt photos.
- **Android Share Target**: Listens for `android.intent.action.SEND` for `image/*`, `application/pdf`, and `text/plain` from Google Pay, PhonePe, and Paytm.
- **Zero-Storage Privacy**: Shared or scanned receipt images are processed server-side in temporary memory buffers and zeroed out immediately after transaction review.
