# Progressive Web App (PWA) Architecture

## Manifest & Configuration
- Dynamic Web App Manifest generated via `app/manifest.js`.
- **App Name**: `Rupiyo — Expense Tracker`
- **Short Name**: `Rupiyo`
- **Start URL**: `/dashboard`
- **Display**: `standalone`
- **Theme Color**: `#6759E8`
- **Background Color**: `#F7F8FC`

## Service Worker (`public/sw.js`)
- Caches static shell assets (`/`, `/dashboard`, icons) for offline loading.
- Uses **Network-Only** policy for sensitive financial API endpoints (`/api/*`, Supabase queries) to prevent multi-user data leakage.

## Installation Experience (`components/common/PwaInstallPrompt.jsx`)
- Listens for `beforeinstallprompt` event.
- Displays a clean non-intrusive banner prompting users to install Rupiyo for home screen access and receipt scanning.
