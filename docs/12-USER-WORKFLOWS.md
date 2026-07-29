# Rupiyo — Detailed User Workflows Specification

## 1. Workflow Documentation Framework
Every operational feature in Rupiyo follows a standardized operational workflow structure:
- **Trigger**: Event initiating the workflow.
- **Preconditions**: Required system state or authentication context.
- **UI Steps**: Sequential user interactions.
- **Validation**: Client & Server input constraints.
- **Database Impact**: Atomic table modifications.
- **Security Checks**: Authorization & ownership rules.
- **Success & Failure States**: Expected UI feedback and recovery paths.

---

## 2. Complete Workflow Specifications Catalog

### Workflow 01: User Registration
- **Trigger**: User submits the registration form on `/register`.
- **Preconditions**: User is unauthenticated.
- **UI Steps**:
  1. Fill Display Name, Email, Password, and Confirm Password.
  2. Click "Create Account".
- **Validation**: Email format, Password length `>= 8`, Password match.
- **Security Checks**: Supabase Auth rate limits registration attempts per IP.
- **Database Impact**: Inserts records into `users` and `user_preferences`. Provisions default seed `categories`.
- **Success State**: Redirects to `/onboarding` with welcome toast.
- **Failure State**: Displays inline error banner (e.g., "Email address already registered").

---

### Workflow 02: User Login
- **Trigger**: User submits credentials at `/login`.
- **Preconditions**: Account exists in Supabase Auth.
- **UI Steps**: Enter Email and Password -> Click "Sign In".
- **Database Impact**: Reads `users` table to fetch internal UUID.
- **Success State**: Issues session cookie, redirects to `/dashboard`.

---

### Workflow 03: Google OAuth Authentication
- **Trigger**: Click "Continue with Google" on `/login` or `/register`.
- **Preconditions**: Popup browser permissions allowed.
- **UI Steps**: Authenticate via Google Account selection popup.
- **Security Checks**: Validates OAuth token integrity via Supabase SSR client on the server.
- **Database Impact**: Provisions `users` record if logging in for the first time.

---

### Workflow 04: Password Reset Request
- **Trigger**: User submits email on `/forgot-password`.
- **UI Steps**: Enter account email -> Click "Send Recovery Link".
- **Success State**: Renders success screen: "Check your inbox for password reset instructions."

---

### Workflow 05: Onboarding Completion
- **Trigger**: User submits the multi-step onboarding wizard at `/onboarding`.
- **Preconditions**: Authenticated user without existing accounts or completed profile.
- **UI Steps**: Select Base Currency (`INR`) -> Enter Initial Account details -> Set Optional Monthly Budget.
- **Database Impact**: Inserts `accounts` record and optional `budgets` record. Updates `users.is_onboarded = true`.

---

### Workflow 06: Create Financial Account
- **Trigger**: Click "+ Add Account" on `/accounts` or `/dashboard`.
- **Preconditions**: Authenticated user.
- **UI Steps**: Enter Account Name, Type (Bank, Cash, UPI, Wallet, Credit Card), Opening Balance, Description -> Submit.
- **Validation**: Name length `1-100` chars, Type within valid enum list, Opening Balance numeric.
- **Database Impact**: Inserts `accounts` row with `current_balance = opening_balance`.

---

### Workflow 07: Edit Financial Account
- **Trigger**: Click "Edit Account" icon on account card.
- **Security Checks**: Verifies `account.user_id == session.uid`.
- **Database Impact**: Updates `name`, `type`, `description` on target `accounts` row. `current_balance` remains computed via transaction log invariants.

---

### Workflow 08: Archive Financial Account
- **Trigger**: Click "Archive Account" in account options drawer.
- **Database Impact**: Sets `is_archived = true` on target `accounts` row. Existing transaction references remain untouched.

---

### Workflow 09: Log New Income / Expense Transaction
- **Trigger**: Click "+ Add Transaction" floating CTA button.
- **Preconditions**: At least one active account exists.
- **UI Steps**:
  1. Toggle Transaction Type (`INCOME` or `EXPENSE`).
  2. Enter Amount (e.g., `1250.00`).
  3. Select Account and Category from dropdowns.
  4. Pick Date (Default: Today).
  5. Select Payment Method (Cash, UPI, Credit Card, etc.).
  6. Enter Optional Description & Tags.
  7. Click "Save Transaction".
- **Validation**: `amount > 0`, Account ID active, Category ID matches transaction type.
- **Database Impact**: Inserts `transactions` row, inserts `transaction_tags`, updates `accounts.current_balance`.
- **Success State**: Modal closes, table updates, budget threshold evaluator triggers asynchronously.

---

### Workflow 10: Edit Existing Transaction
- **Trigger**: Click transaction row -> Select "Edit".
- **Security Checks**: Server Action verifies transaction ownership.
- **Database Impact**: Reverses old transaction amount from account balance, applies new transaction details, updates account balance, updates `transactions` row.

---

### Workflow 11: Delete Transaction
- **Trigger**: Click "Delete" on transaction row -> Confirm prompt.
- **Database Impact**: Reverses balance impact on `accounts`, hard-deletes `transactions` row.

---

### Workflow 12: Create Custom Category
- **Trigger**: Click "Add Category" on `/categories`.
- **UI Steps**: Select Category Type (`INCOME` / `EXPENSE`), Enter Name, Pick Lucide Icon, Select Color Hex -> Save.
- **Database Impact**: Inserts custom `categories` row with `user_id = session.uid`.

---

### Workflow 13: Configure Monthly Budget
- **Trigger**: Click "Set Budget" on `/budgets`.
- **UI Steps**: Select Category (or "Overall Monthly Budget"), Enter Amount (e.g., `₹ 6,000`), Select Month (`2026-07`) -> Save.
- **Database Impact**: Upserts row into `budgets` table using composite unique constraint `(user_id, category_id, month_year)`.

---

### Workflow 14: Create Savings Goal
- **Trigger**: Click "Create Goal" on `/goals`.
- **UI Steps**: Enter Goal Title, Target Amount, Target Date, Description -> Submit.
- **Database Impact**: Inserts `goals` row with `current_amount = 0.00` and `status = 'IN_PROGRESS'`.

---

### Workflow 15: Log Goal Contribution
- **Trigger**: Click "Contribute" on goal card.
- **UI Steps**: Enter Deposit Amount, Select Source Account -> Submit.
- **Validation**: Source account balance must be `>= Deposit Amount`.
- **Database Impact**: Inserts `goal_contributions` row, deducts balance from source `accounts`, increments `goals.current_amount`. Checks if goal completed.

---

### Workflow 16: Create Recurring Transaction Rule
- **Trigger**: Click "New Recurring Rule" on `/recurring`.
- **UI Steps**: Enter Amount, Select Account & Category, Select Frequency (Daily, Weekly, Monthly, Yearly), Select Start Date -> Submit.
- **Database Impact**: Inserts `recurring_transactions` row with `next_date = start_date` and `status = 'ACTIVE'`.

---

### Workflow 17: Generate & Download Report
- **Trigger**: Click "Download Report" on `/reports`.
- **UI Steps**: Select Date Range, Filter Accounts/Categories, Choose PDF/CSV/Excel format -> Click Export.
- **Database Impact**: Executes read-only query against `transactions` and `accounts`. Streams file to browser.

---

### Workflow 18: Generate Smart Financial Insights
- **Trigger**: Automatic on `/dashboard` mount or manual refresh on `/insights`.
- **Database Impact**: Reads category month-over-month deltas, passes anonymized metrics to `InsightService`, persists returned summary into `insights` table.

---

### Workflow 19: Full Account Deletion
- **Trigger**: User confirms account destruction in `/settings/security`.
- **Security Checks**: Requires fresh credential validation (re-entering password or OAuth login).
- **Database Impact**: Deletes Supabase Auth identity, executing CASCADE deletion across all user rows in public.profiles and domain tables.
