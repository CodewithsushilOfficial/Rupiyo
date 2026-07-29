# OCR Pipeline & Privacy Security

## OCR Processing Engine (`lib/services/ocr-service.js`)
- Uses `tesseract.js` for optical character recognition on scanned images and receipts.
- Uses `pdf-parse` for text extraction from digital PDF invoices.
- Server route `/api/ocr/parse` receives file payload securely over HTTPS.

## Financial Entity Extraction
- **Amount**: Regex detection of INR formats (`₹ 850.00`, `INR 850`, `Rs. 850`, `Total: 850`).
- **Merchant / Payee**: Extracted from bill header lines.
- **Date**: Extracted from Indian standard date formats (`29 Jul 2026`, `29/07/2026`).
- **Payment Method**: Detects `UPI`, `CARD`, `CASH`, `NETBANKING`.
- **Category Suggestion**: Maps merchant keywords to Rupiyo categories (`Food & Dining`, `Transport`, `Shopping`, `Bills & Utilities`, `Healthcare`).

## Privacy & Zero-Retention Policy
- Sensitive identifiers (full credit card numbers, bank account numbers) are redacted.
- Image buffers exist strictly in temporary memory during parsing.
- Memory buffers are explicitly zeroed out (`buffer.fill(0)`) after extraction.
- Receipt images are **never** permanently stored in database tables or Supabase storage buckets.
- **Mandatory User Confirmation**: No transaction is inserted into Supabase automatically without explicit user review.
