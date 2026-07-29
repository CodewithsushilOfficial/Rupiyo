# Rupiyo — API & Server Actions Specification

## 1. Overview & Architecture Strategy
Rupiyo uses Next.js Server Actions and Route Handlers built on top of `@supabase/ssr` / `@supabase/supabase-js`.
- **Authentication**: Session cookie context is validated on every action via `createClient()` from `@/lib/supabase/server`.
- **Authorization**: Enforced at database level via **Supabase Row Level Security (RLS)** (`auth.uid() = user_id`).
- **Validation**: Inputs validated using Zod schemas before database queries execute.
- **Return Type Standard**: `{ success: boolean, data?: any, error?: string, code?: string }`.

---

## 2. Supabase Client Utilities Layout

```text
lib/
└── supabase/
    ├── client.js      # Browser Supabase client (anon key)
    ├── server.js      # Server Component / Server Action client (cookies)
    └── middleware.js  # Next.js Middleware auth session updater
```

---

## 3. Server Actions Specifications

### 3.1 Authentication Actions (`lib/actions/auth-actions.js`)

#### `signUpWithEmail(formData)`
- **Input**: `{ email, password, fullName }`
- **Execution**: Calls `supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })`.
- **Response**: `{ success: true, message: 'Verification email sent' }`

#### `signInWithEmail(formData)`
- **Input**: `{ email, password }`
- **Execution**: Calls `supabase.auth.signInWithPassword({ email, password })`.
- **Response**: `{ success: true, user: { id, email } }`

#### `signOutUser()`
- **Input**: None
- **Execution**: Calls `supabase.auth.signOut()`.
- **Response**: `{ success: true }`

#### `resetPasswordEmail(email)`
- **Input**: `{ email }`
- **Execution**: Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` })`.
- **Response**: `{ success: true }`

---

### 3.2 Account Actions (`lib/actions/account-actions.js`)

#### `createAccountAction(data)`
- **Input**: `{ name, type, openingBalance, currency, description }`
- **Zod Validation**: `createAccountSchema`
- **Execution**:
  ```js
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      opening_balance: data.openingBalance,
      current_balance: data.openingBalance,
      currency: data.currency || 'INR',
      description: data.description,
    })
    .select()
    .single();
  ```
- **Response**: `{ success: true, data: account }`

#### `getAccountsAction()`
- **Execution**: `supabase.from('accounts').select('*').eq('is_archived', false).order('created_at', { ascending: false })`.
- **Response**: `{ success: true, data: accounts }`

---

### 3.3 Transaction Actions (`lib/actions/transaction-actions.js`)

#### `createTransactionAction(data)`
- **Input**: `{ accountId, categoryId, type, amount, paymentMethod, transactionDate, description, notes, tags }`
- **Zod Validation**: `createTransactionSchema`
- **Execution**:
  1. Verify user session (`auth.uid()`).
  2. Insert record into `public.transactions`. (RLS verifies `user_id == auth.uid()`).
  3. Atomically update `public.accounts` balance:
     - Income: `current_balance = current_balance + amount`
     - Expense: `current_balance = current_balance - amount`
  4. Trigger background budget threshold alert calculation.
- **Response**: `{ success: true, data: transaction }`

#### `getTransactionsAction(filters)`
- **Input**: `{ startDate, endDate, categoryId, accountId, type, page, limit }`
- **Execution**:
  ```js
  let query = supabase.from('transactions').select('*, category:categories(*), account:accounts(*)', { count: 'exact' });
  if (filters.startDate) query = query.gte('transaction_date', filters.startDate);
  if (filters.endDate) query = query.lte('transaction_date', filters.endDate);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.accountId) query = query.eq('account_id', filters.accountId);
  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1).order('transaction_date', { ascending: false });
  ```
- **Response**: `{ success: true, data, total: count, page, limit }`

#### `deleteTransactionAction(transactionId)`
- **Input**: `transactionId`
- **Execution**: Reverses balance change on associated account and deletes transaction record. (RLS prevents cross-user deletes).
- **Response**: `{ success: true }`

---

### 3.4 Budget Actions (`lib/actions/budget-actions.js`)

#### `upsertBudgetAction(data)`
- **Input**: `{ categoryId, amount, monthYear }`
- **Execution**: Upserts budget cap in `public.budgets`.
- **Response**: `{ success: true, data: budget }`

---

### 3.5 Goal Actions (`lib/actions/goal-actions.js`)

#### `createGoalAction(data)`
- **Input**: `{ title, targetAmount, targetDate, description }`
- **Execution**: Inserts record into `public.goals`.
- **Response**: `{ success: true, data: goal }`

#### `addGoalContributionAction(data)`
- **Input**: `{ goalId, accountId, amount, notes }`
- **Execution**: Inserts contribution record, updates goal `current_amount`, and deducts amount from specified account.
- **Response**: `{ success: true }`

---

### 3.6 Route Handlers specifications

#### `GET /api/reports/export`
- **Query Params**: `type=pdf|csv|excel&startDate=...&endDate=...`
- **Auth**: Checked via Supabase Server Client cookies.
- **Output**: Binary file stream (`Content-Disposition: attachment; filename="rupiyo-report.pdf"`).

#### `GET /api/insights/generate`
- **Auth**: Checked via Supabase Server Client.
- **Execution**: Aggregates user monthly spend, calls `NvidiaNimAdapter`, persists result into `public.insights`, and returns JSON.
