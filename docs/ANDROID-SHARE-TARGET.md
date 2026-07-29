# Rupiyo Android Share Target & Import Architecture

## Overview
Rupiyo provides native Android Share Target integration via `MainActivity.java` and Capacitor. Users can share payment screenshots, receipt photos, PDF invoices, or SMS payment notifications directly from external apps (Google Photos, WhatsApp, Files, SMS apps) into Rupiyo.

## 1. Native Intent Handling (`MainActivity.java`)
- **Action**: `android.intent.action.SEND`
- **MIME Types**: `image/*`, `application/pdf`, `text/plain`
- **URI Scoping & Permission Handling**:
  - `content://` URIs are opened using Android `ContentResolver.openInputStream(uri)`.
  - Bytes are copied into a temporary scoped cache file (`getCacheDir()/shared_receipt_import.jpg`).
  - Base64 & metadata payload `{ source, kind, mimeType, base64, tempFilePath, filename, timestamp }` is passed to the webview via `window.__RUPIYO_PENDING_SHARE__` and custom event `rupiyo_android_share_intent`.

## 2. Cold-Start & Warm-Start Lifecycle
- **Cold Start**: If Rupiyo is closed when shared to, native code stores the pending import in `window.__RUPIYO_PENDING_SHARE__`. Once JS hydrates and Supabase auth restores session, `lib/utils/share-payload-handler.js` retrieves the pending payload and routes to `/transactions/import`.
- **Warm Start**: If Rupiyo is already running, native `onNewIntent` fires `rupiyo_android_share_intent`, causing the import view to immediately display the extracted receipt draft.

## 3. OCR & Parsing Pipeline
- **Image Preprocessing**: Client-side canvas downscales 12-30MP camera photos to ~1400px JPEG (~250KB) before submitting to `/api/ocr/parse`.
- **OCR Engine**: Server-side Tesseract.js with 12-second timeout and structured error codes (`OCR_TIMEOUT`, `OCR_EMPTY_RESULT`).
- **Text Parser**: Indian financial format parsing (INR ₹, Rs, Rs., dates, UPI, merchant name, category suggestions).
- **Zero Retention**: All temporary image buffers are zeroed out after processing. No receipt images are stored in Supabase storage buckets.

## 4. User Review & Save
- Extracted transaction details are displayed in `ImportTransactionView.jsx`.
- Duplicate detection warning checks recent transactions.
- User reviews, edits any low-confidence fields, and confirms save.
- Transaction is committed to Supabase PostgreSQL via `createTransactionAction` enforcing Row-Level Security (RLS).
