# Android Share Target Receiver

## Overview
Rupiyo integrates with Android Share Sheet, allowing users to share payment receipts, screenshots, PDF invoices, or SMS payment notifications directly into Rupiyo from other apps.

## Supported Content Types
- `image/jpeg`, `image/png`, `image/webp` (Receipt photos, payment screenshots)
- `application/pdf` (Digital invoice PDFs)
- `text/plain` (Payment SMS text snippets)

## Incoming Intent Handling
- Native Capacitor intent handler redirects shared content to `/transactions/import`.
- Web Share Target API in `manifest.js` handles web-based share target invocations.
- Payload is passed to `ocr-service.js` for extraction.
- User review form (`ImportTransactionView.jsx`) opens with pre-filled fields and duplicate detection warnings.
