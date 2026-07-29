# Rupiyo — Module-Wise Task Tracker & Execution Checklist

## 1. Authentication & Onboarding Module
- [x] **P03-T01**: Initialize Client Supabase SDK (`lib/supabase/client.js`).
- [x] **P03-T02**: Initialize Server Supabase SSR SDK (`lib/supabase/server.js`).
- [x] **P03-T03**: Implement Email/Password registration form and action (`RegisterForm.jsx`).
- [x] **P03-T04**: Implement Email/Password login form and action (`LoginForm.jsx`).
- [x] **P03-T05**: Integrate Google OAuth Sign-in provider (`GoogleAuthButton.jsx`).
- [x] **P03-T06**: Implement Password Recovery request and reset handlers (`ForgotPasswordForm.jsx`).
- [x] **P03-T07**: Implement Next.js Protected Route Middleware (`middleware.js`).
- [x] **P05-T01**: Build 4-step Onboarding Wizard UI (`/onboarding`).
- [x] **P05-T02**: Implement user preferences update action (`updatePreferencesAction()`).

---

## 2. Database Foundation & Row Level Security (RLS) Module
- [x] **P04-T01**: Create Supabase project configuration (`supabase/config.toml`).
- [x] **P04-T02**: Create DDL migrations for 12 core tables (`supabase/migrations/001_initial_schema.sql`).
- [x] **P04-T03**: Implement database profile trigger (`handle_new_user()`).
- [x] **P04-T04**: Create seed script for system default categories (`scripts/seed.js`).
- [x] **P04-T05**: Enable RLS and create security policies on `profiles` and `user_preferences`.
- [x] **P04-T06**: Enable RLS and create security policies on `accounts`.
- [x] **P04-T07**: Enable RLS and create security policies on `categories`.
- [x] **P04-T08**: Enable RLS and create security policies on `transactions` and `transaction_tags`.
- [x] **P04-T09**: Enable RLS and create security policies on `budgets`.
- [x] **P04-T10**: Enable RLS and create security policies on `goals` and `goal_contributions`.
- [x] **P04-T11**: Enable RLS and create security policies on `recurring_transactions`.
- [x] **P04-T12**: Enable RLS and create security policies on `notifications` and `insights`.
- [x] **P04-T13**: Create Supabase Storage bucket and access policies (`avatars`).
- [x] **P04-T14**: Implement cross-user RLS security automated test suite (`tests/rls/rls-security.test.js`).

---

## 3. Financial Account Management Module
- [x] **P06-T01**: Implement Account Server Actions (`createAccountAction()`, `getAccountsAction()`).
- [x] **P06-T02**: Build Accounts List and Account Detail screens (`/accounts`).

---

## 4. Categories & Tags Module
- [x] **P07-T01**: Implement Category Server Actions (`createCategoryAction()`, `getCategoriesAction()`).
- [x] **P07-T02**: Build Custom Category creation modal.

---

## 5. Transaction Ledger Module
- [x] **P08-T01**: Implement Transaction CRUD Server Actions (`createTransactionAction()`, `getTransactionsAction()`).
- [x] **P08-T02**: Build Transaction Ledger view with server-side pagination (`/transactions`).

---

## 6. Budget Management Module
- [x] **P09-T01**: Implement Budget Server Actions (`upsertBudgetAction()`, `getBudgetsAction()`).
- [x] **P09-T02**: Build Budget Progress Cards UI (`/budgets`).

---

## 7. Savings Goals Module
- [x] **P10-T01**: Implement Goal CRUD and Contribution Server Actions.
- [x] **P10-T02**: Build Goals Progress dashboard (`/goals`).

---

## 8. Recurring Transactions Module
- [x] **P11-T01**: Build Recurring Execution Engine service with atomic idempotency locks.

---

## 9. Financial Analytics Module
- [x] **P12-T01**: Implement Analytics aggregation SQL queries.
- [x] **P12-T02**: Build Recharts visual analytics dashboard (`/analytics`).
- [x] **P14-T01**: Implement PDF, Excel, and CSV export Route Handlers (`/api/reports/export`).

---

## 10. NVIDIA NIM AI Smart Insights Module
- [x] **P13-T01**: Implement `NvidiaNimAdapter` calling NVIDIA NIM API (`meta/llama-3.1-70b-instruct`).
- [x] **P13-T02**: Build Smart Insights view (`/insights`).

---

## 11. Notification System Module
- [x] **P15-T01**: Build Notification Center drawer and alert triggers.

---

## 12. Executive Dashboard Summary Engine
- [x] **P16-T01**: Build Executive Dashboard summary view with Net Worth metrics (`/dashboard`).

---

## 13. Production Hardening & Verification Module
- [x] **P17-T01**: Execute full OWASP security audit and E2E verification test suites.
