# Rupiyo — Feature Matrix & Prioritization Specification

## 1. Feature Prioritization Framework
Features are categorized into four priority levels:
- **P0 — Critical (MVP Core)**: Essential functionality required for a functional release. Application cannot launch without these features.
- **P1 — Important (V1 Complete)**: Production-grade capabilities enhancing UX, reporting, and security.
- **P2 — Enhancement (V1.1 / V1.2)**: Advanced features offering competitive differentiation.
- **P3 — Future Expansion (V2+)**: Long-term strategic capabilities (PWA, OCR, Bank Feeds).

---

## 2. Complete Feature Matrix Catalog

### 2.1 Authentication & Profile Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-AUTH-01** | Email/Password Auth | Standard registration, login, and email verification flow. | P0 |
| **FEAT-AUTH-02** | Google OAuth SSO | One-click Google Sign-in integration via Supabase Auth. | P0 |
| **FEAT-AUTH-03** | Password Recovery | Self-service email password reset workflow. | P0 |
| **FEAT-AUTH-04** | User Profile Setup | Display name, avatar, base currency (`INR ₹`), timezone. | P0 |
| **FEAT-AUTH-05** | Account Deletion | Full GDPR-compliant self-service data erasure. | P1 |

---

### 2.2 Financial Account Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-ACC-01** | Multi-Account Management| Create and view Cash, Bank, UPI, Wallet, Credit Card accounts. | P0 |
| **FEAT-ACC-02** | Real-time Balance Engine| Dynamic balance calculation from transaction ledger. | P0 |
| **FEAT-ACC-03** | Credit Card Liabilities | Segregated credit card debt visualization from liquid net worth. | P0 |
| **FEAT-ACC-04** | Account Archival | Soft-archive inactive accounts while preserving transaction logs. | P1 |

---

### 2.3 Transaction Engine Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-TXN-01** | Income/Expense Logging | Record transactions with amount, category, account, date, method. | P0 |
| **FEAT-TXN-02** | Multi-Filter Ledger | Filter ledger by text search, date range, category, account, type. | P0 |
| **FEAT-TXN-03** | Server-Side Pagination | Efficient 20-row paginated data fetching. | P0 |
| **FEAT-TXN-04** | Transaction Tags | Custom multi-tag assignment for detailed tracking. | P1 |
| **FEAT-TXN-05** | Bulk Operations | Select multiple transactions for batch category reassignment or deletion.| P2 |

---

### 2.4 Budgeting & Savings Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-BUD-01** | Overall Monthly Budget | Total spending limit cap for the calendar month. | P0 |
| **FEAT-BUD-02** | Category Caps | Individual spending caps assigned to specific expense categories. | P0 |
| **FEAT-BUD-03** | Threshold Alerts | Visual & in-app alerts at 50%, 80%, 100%, and >100% budget usage. | P0 |
| **FEAT-GOL-01** | Savings Goal Milestone | Create target savings goals with progress tracking. | P0 |
| **FEAT-GOL-02** | Goal Contributions | Deduct account funds and record progress toward goals. | P0 |

---

### 2.5 Recurring Engine Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-REC-01** | Schedule Management | Daily, Weekly, Monthly, Yearly recurring payment definitions. | P0 |
| **FEAT-REC-02** | Idempotent Processor | Background cron generating single scheduled transactions cleanly. | P0 |

---

### 2.6 Analytics, Reporting & Smart Features
| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-ANL-01** | Recharts Visualizations| Interactive Income vs Expense, Category Donut, Trend Line charts. | P0 |
| **FEAT-REP-01** | Export Engine | Export filtered transactions into PDF, CSV, and Excel formats. | P1 |
| **FEAT-INS-01** | Smart Insights | Non-advisory AI summaries highlighting spending anomalies. | P1 |
| **FEAT-NOT-01** | Notification Center | Persistent in-app alert queue with read/unread tracking. | P1 |

---

### 2.7 Future Strategic Scope (P3 Features)
| Feature ID | Feature Name | Target Scope |
| :--- | :--- | :--- |
| **FEAT-FUT-01** | PWA & Offline Support | Installable PWA with offline transaction caching. |
| **FEAT-FUT-02** | Receipt OCR Parser | Camera/upload receipt scanner extracting total & category. |
| **FEAT-FUT-03** | Family / Shared Budgets| Multi-user household accounts with permission roles. |
