# Rupiyo — Acceptance Criteria Specification

## 1. Overview
Acceptance criteria are written in standard Given/When/Then Behavior-Driven Development (BDD) format.

---

## 2. Acceptance Criteria by Domain

### 2.1 Authentication & Profile Provisioning
- **AC-AUTH-001: Email/Password Registration**
  - **Given**: A guest user on the `/register` page with valid name, email, and password.
  - **When**: The user submits the registration form.
  - **Then**: Supabase Auth creates the `auth.users` record, the PostgreSQL trigger inserts a corresponding `public.profiles` row, a verification email is sent, and the user is redirected to `/onboarding`.

- **AC-AUTH-002: Google OAuth Login**
  - **Given**: A guest user on `/login` clicking "Continue with Google".
  - **When**: Google authenticates the user and redirects back to `/auth/callback`.
  - **Then**: Supabase SSR sets HTTP-only session cookies and routes the user to `/dashboard`.

---

### 2.2 Supabase Row Level Security (RLS) Data Isolation
- **AC-RLS-001: Cross-User Read Prevention**
  - **Given**: Authenticated User A and Authenticated User B.
  - **When**: User B executes a query requesting User A's transaction ID.
  - **Then**: Supabase PostgreSQL Row Level Security policy evaluates `auth.uid() = user_id` to false and returns 0 rows (Access Denied).

- **AC-RLS-002: Cross-User Mutation Prevention**
  - **Given**: Authenticated User B attempting to UPDATE or DELETE a transaction owned by User A.
  - **When**: The query reaches the Supabase database.
  - **Then**: Row Level Security rejects the update operation with error 42501 (Insufficient Privilege).

---

### 2.3 Financial Accounts & Balances
- **AC-ACC-001: Balance Recalculation**
  - **Given**: An account with opening balance ₹10,000.
  - **When**: A new income transaction of ₹5,000 is logged.
  - **Then**: The account `current_balance` updates atomically to ₹15,000.

---

### 2.4 NVIDIA NIM Smart Insights
- **AC-INS-001: Non-Advisory Insight Generation**
  - **Given**: An authenticated user with 30 logged transactions in the current month.
  - **When**: The user views `/insights`.
  - **Then**: System sends anonymized aggregate spend stats to NVIDIA NIM API (`meta/llama-3.1-70b-instruct`) and renders non-investment statistical observations on the screen.
