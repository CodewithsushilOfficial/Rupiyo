# Rupiyo APK Distribution Specification

## 1. Release Artifact Location
- **Local Location**: `public/downloads/rupiyo-release.apk`
- **Configurable Environment URL**: `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL`
- **Default Production Endpoint**: `/downloads/rupiyo-release.apk`

---

## 2. Distribution Security & Transport
- Served strictly over **HTTPS** with header `Content-Type: application/vnd.android.package-archive`.
- Verified binary signature matching `com.rupiyo.app` release keystore.
- Database isolation: APK binaries are stored as static release assets on CDN/Storage endpoints, NEVER inside PostgreSQL database rows.

---

## 3. Update Policy
- In-app version metadata displays `v1.0.0`.
- Automatic silent APK installations are strictly forbidden by operating system security policies.
- Users are notified of official updates via release notes and manual user-approved package upgrades.
