# Rupiyo — Software Requirements Specification (SRS)

## 1. Purpose
This SRS defines functional, non-functional, data, security, interface, and quality requirements for Rupiyo.

## 2. System Context
Rupiyo is a responsive web application built with Next.js and JavaScript. **Supabase Auth** manages identity. **Supabase PostgreSQL** with mandatory **Row Level Security (RLS)** is used as the relational application data layer. **NVIDIA NIM AI API** provides financial insights.

## 3. User Roles
### Guest
Can access public pages, register, and log in.

### Authenticated User
Can manage only their own financial data, settings, reports, accounts, transactions, budgets, goals, and insights. Access is enforced at both application layer and database level via Supabase RLS policies.

### System
Executes validation, calculations, recurring transaction processing, notifications, analytics, and scheduled tasks.

---

## 4. Functional Requirements

### 4.1 Authentication & Profile Requirements (Supabase Auth)
- **FR-AUTH-SB-001**: System shall manage registration, login, and email verification using Supabase Auth.
- **FR-AUTH-SB-002**: System shall support Google OAuth authentication via Supabase Auth.
- **FR-AUTH-SB-003**: System shall automatically provision a `public.profiles` record linked to `auth.users.id` upon user signup.
- **FR-AUTH-SB-004**: System shall support password recovery emails using Supabase Auth password reset workflows.
- **FR-AUTH-SB-005**: Next.js App Router middleware shall enforce protected routes (`/dashboard/*`, `/transactions/*`, `/accounts/*`, etc.) using Supabase session cookies.
- **FR-AUTH-SB-006**: Users shall be able to initiate full self-service account and profile deletion.

### 4.2 Data & Security Requirements (Supabase PostgreSQL & RLS)
- **FR-DATA-SB-001**: System shall store all relational financial entities in Supabase PostgreSQL tables.
- **FR-SEC-SB-001**: System shall enable Row Level Security (RLS) on all user-owned tables (`profiles`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `goal_contributions`, `recurring_transactions`, `notifications`, `insights`).
- **FR-SEC-SB-002**: RLS policies shall enforce that `auth.uid() = user_id` for all `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations.
- **FR-STORAGE-SB-001**: System shall store user profile avatars and report files in protected Supabase Storage buckets.

### 4.3 Financial Accounts Management
- **FR-ACC-001**: Users shall create, edit, archive, and view financial accounts (Cash, Bank, UPI, Wallet, Credit Card, Other).
- **FR-ACC-002**: System shall calculate live account balances from valid transaction logs: `Live Balance = Initial Balance + Total Income - Total Expenses`.
- **FR-ACC-003**: Users shall filter transaction lists by account.

### 4.4 Transaction Ledger Management
- **FR-TXN-001**: Users shall log income and expense records with required attributes: Amount, Type, Account ID, Category ID, Date, Payment Method.
- **FR-TXN-002**: Monetary amounts shall be stored in Supabase PostgreSQL using `NUMERIC(15, 2)` exact decimal representation.
- **FR-TXN-003**: Users shall edit and delete their records with immediate atomic balance updates.
- **FR-TXN-004**: System shall provide server-side filtering and 20-record pagination.

### 4.5 Categories & Payment Methods
- **FR-CAT-001**: System shall provide system default expense/income categories accessible to all authenticated users.
- **FR-CAT-002**: Users shall create, edit, and archive custom categories owned by their user ID.

### 4.6 Budget Management
- **FR-BUD-001**: Users shall set overall monthly spending caps and specific category budgets.
- **FR-BUD-002**: System shall calculate budget consumption percentages and generate threshold alerts (50%, 80%, 100%, Over-Budget).

### 4.7 Savings Goals
- **FR-GOL-001**: Users shall create savings goals with Target Amount and Target Date.
- **FR-GOL-002**: Users shall log deposit contributions linked to account balance deductions.

### 4.8 Recurring Transactions
- **FR-REC-001**: Users shall configure recurring income and expense rules (Daily, Weekly, Monthly, Yearly).
- **FR-REC-002**: Background execution jobs shall process due rules idempotently to prevent duplicate transaction generation.

### 4.9 Analytics, Reports & AI Insights
- **FR-ANL-001**: System shall aggregate metrics across customizable date ranges and render interactive Recharts visualizations.
- **FR-REP-001**: Users shall export filtered financial summaries to PDF, Excel, and CSV files.
- **FR-INS-001**: System shall generate descriptive financial observations using the **NVIDIA NIM AI API** (`NvidiaNimAdapter`) with rule fallbacks.

---

## 5. Non-Functional Requirements

### 5.1 Security
- **NFR-SEC-001**: HTTPS with TLS 1.3 enforced for all data transmission.
- **NFR-SEC-002**: Supabase Row Level Security (RLS) active on 100% of user tables.
- **NFR-SEC-003**: Zod schema validation enforced on all Server Actions and Route Handlers.
- **NFR-SEC-004**: `SUPABASE_SERVICE_ROLE_KEY` and `NVIDIA_NIM_API_KEY` kept strictly server-side; NEVER exposed via `NEXT_PUBLIC_`.

### 5.2 Performance
- **NFR-PERF-001**: Page initial paint under 1.5s on standard mobile connections.
- **NFR-PERF-002**: Server Action CRUD response latency under 350ms.
- **NFR-PERF-003**: Supabase PostgreSQL query execution under 50ms utilizing composite indexes.

### 5.3 Reliability & Accessibility
- **NFR-REL-001**: 99.9% platform availability.
- **NFR-A11Y-001**: WCAG 2.1 Level AA compliance across all client interfaces.
