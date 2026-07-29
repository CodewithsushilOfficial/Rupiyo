# File Import Architecture

## Unified Import Workflow
Rupiyo routes all transaction creation pathways through one standardized form pipeline:
1. **Manual Entry**: User opens `TransactionModal.jsx` directly.
2. **Camera Scan**: User captures photo via camera viewfinder in `ReceiptScannerModal.jsx`.
3. **Image / PDF Upload**: User selects file from device storage.
4. **Android Share Sheet**: User shares file/text from external app.

## Duplicate Detection
Before displaying pre-filled transaction form, `duplicate-detection-service.js` queries Supabase transactions for matching amount and date range (±3 days). If a potential match is found, a prominent warning alert is displayed in `ImportTransactionView.jsx`.
