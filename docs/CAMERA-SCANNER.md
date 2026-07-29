# Camera Receipt Scanner

## User Flow
1. User taps **Scan** on Bottom Navigation or Header.
2. `ReceiptScannerModal.jsx` opens.
3. User selects camera mode, image upload, PDF document, or text paste.
4. On native Android app, `@capacitor/camera` triggers native viewfinder. On web browsers, HTML5 MediaDevices camera is used.
5. Image buffer is sent to server endpoint `/api/ocr/parse`.
6. OCR engine parses amount, merchant name, date, payment method, category.
7. `ImportTransactionView.jsx` displays extracted draft with confidence indicators and duplicate transaction warnings.
8. User edits if necessary and confirms save to Supabase PostgreSQL.
