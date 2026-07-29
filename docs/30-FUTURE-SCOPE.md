# Rupiyo — Future Scope & Expansion Horizon

## 1. Post-V1 Architecture & Product Evolution
This document outlines candidate features and architectural enhancements reserved for future product releases (V1.1, V1.2, V2.0+). These items are explicitly excluded from the V1 core implementation to preserve release focus.

---

## 2. Future Capability Roadmap

### 2.1 Progressive Web App (PWA) & Offline-First Sync (Target: V2.0)
- **Service Worker Caching**: Cache application shell assets and recent transaction ledger locally using Workbox.
- **Offline Entry Queue**: Allow users to log transactions while disconnected from network; queue payloads in IndexedDB.
- **Background Sync API**: Automatically push queued offline transactions to Next.js Server Actions upon network restoration.

---

### 2.2 Camera Receipt OCR Scanning Engine (Target: V2.1)
- **On-Device Image Capture**: Mobile browser camera integration capturing physical receipt photos.
- **OCR Text Extraction**: Utilize Tesseract.js or Cloud Vision API to extract Total Amount, Date, Merchant Name, and suggested Category.
- **Automated Form Pre-fill**: Populate `AddTransactionModal` fields with OCR extracted values for user confirmation.

---

### 2.3 SMS & UPI Screenshot Parsing Engine (Target: V2.2)
- **UPI Screenshot Import**: Upload GPay / PhonePe / Paytm payment success screenshots.
- **Regex & Pattern Extraction**: Extract transaction reference number, payee name, and amount.
- **Android Native SMS Listener Integration**: (Explored for native Android wrapper app) Automatically parse banking SMS alerts to prompt instant transaction logging.

---

### 2.4 Household / Family Shared Financial Workspaces (Target: V2.5)
- **Multi-Tenant Workspaces**: Introduce `workspaces` and `workspace_members` tables.
- **Shared Budgets**: Set collective family spending caps (e.g., Household Groceries, Utilities).
- **Role-Based Access Control (RBAC)**: Define roles (Workspace Owner, Editor, View-Only Member).

---

### 2.5 Voice-Based Transaction Entry (Target: V3.0)
- **Web Speech API Integration**: Tap microphone icon to speak transaction commands (e.g., *"Spent 350 rupees on dinner using UPI"*).
- **Natural Language Parsing**: Convert speech input into structured JSON for `createTransactionAction()`.
