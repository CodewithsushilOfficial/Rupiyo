# Rupiyo Android App & PWA Installation Architecture

## 1. Installation Overview
Rupiyo provides two primary mobile installation paths for users:
1. **Method 1: Progressive Web App (PWA) Direct Browser Install**
2. **Method 2: Official Signed Android Release APK Download**

---

## 2. Method 1 — PWA Installation (Browser Native Flow)
- **Engine**: Web App Manifest (`app/manifest.js`) + Service Worker (`public/sw.js`).
- **Prompt API**: Listens for the browser `beforeinstallprompt` event.
- **Entry Points**:
  - Contextual Mobile Banner ([PwaInstallPrompt.jsx](file:///c:/Users/codew/Downloads/Rupiyo/components/common/PwaInstallPrompt.jsx))
  - Mobile Drawer Entry ([MobileDrawer.jsx](file:///c:/Users/codew/Downloads/Rupiyo/components/layout/MobileDrawer.jsx)): `↓ Install Rupiyo`
- **Installed State Detection**: Checks `display-mode: standalone` and `window.navigator.standalone`. Hides PWA install CTA when already running as an installed PWA or Capacitor app.
- **Dismissal Caching**: Dismissing the banner caches timestamp in `localStorage.setItem('rupiyo_pwa_dismissed_at', ...)` for 7 days without annoying repeat popups.

---

## 3. Method 2 — Android Release APK Download
- **Configuration Variable**: `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL` (Default: `/downloads/rupiyo-release.apk`).
- **Package ID**: `com.rupiyo.app`
- **Version**: `v1.0.0` (`versionCode 1`, `versionName "1.0.0"`).
- **UX Flow**:
  1. User opens Mobile Drawer `☰` on an Android phone.
  2. Taps `📱 Download Android App`.
  3. [ApkDownloadModal.jsx](file:///c:/Users/codew/Downloads/Rupiyo/components/common/ApkDownloadModal.jsx) opens displaying package version, feature list, and 3-step installation guide.
  4. User taps **Download APK**.
  5. Browser downloads official release APK artifact over HTTPS.
  6. User opens downloaded file to launch the Android Package Installer and confirms installation.

> [!IMPORTANT]
> **LEGITIMATE OS SECURITY**: Rupiyo does NOT attempt to silently install APKs in background or bypass Android system package installer prompts. The final installation prompt remains 100% controlled by the user's operating system.

---

## 4. Platform Detection & iOS Safeguards
- **Android Users**: Offered both **Install Rupiyo (PWA)** and **Download Android App (APK)**.
- **iOS Users (iPhone / iPad)**: Offered **Install Rupiyo (PWA)** with native iOS guidance (`Share ⎋ -> Add to Home Screen`). Android APK download CTA is hidden on iOS devices to prevent confusion.
- **Desktop Users**: Standard browser view. APK download CTA is excluded from aggressive desktop banners.
