# Rupiyo — Quality Assurance & Testing Strategy

## 1. Quality Assurance Philosophy
Rupiyo mandates automated testing across unit, integration, database security, and end-to-end user flows. Special emphasis is placed on **Supabase Row Level Security (RLS)** verification to guarantee multi-tenant data isolation.

---

## 2. Test Suite Classification

```text
               ┌───────────────────────────┐
               │    Playwright E2E Tests    │
               └─────────────┬─────────────┘
                             │
               ┌─────────────┴─────────────┐
               │ Supabase RLS Security     │
               │ Verification Tests        │
               └─────────────┬─────────────┘
                             │
               ┌─────────────┴─────────────┐
               │ Server Actions Integration│
               │ & Zod Validation Tests    │
               └─────────────┬─────────────┘
                             │
               ┌─────────────┴─────────────┐
               │ Unit Tests (Math / Utils) │
               └───────────────────────────┘
```

---

## 3. Supabase Row Level Security (RLS) Test Suite Requirements

Every private table (`profiles`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `recurring_transactions`, `notifications`, `insights`) must pass three explicit RLS tests:

### 3.1 RLS Verification Matrix

| Entity | Test 1: Authenticated Owner Access | Test 2: Cross-User Access Attempt (User B -> User A) | Test 3: Unauthenticated Access Attempt |
| :--- | :--- | :--- | :--- |
| **`public.profiles`** | ✅ Returns owner profile | ❌ Returns 0 rows (Access Denied) | ❌ Returns 0 rows (Access Denied) |
| **`public.accounts`** | ✅ Returns owner accounts | ❌ Returns 0 rows (Access Denied) | ❌ Returns 0 rows (Access Denied) |
| **`public.categories`** | ✅ Returns system + own categories | ❌ Cannot view / edit User A custom categories | ❌ Cannot view custom categories |
| **`public.transactions`**| ✅ Full CRUD on own records | ❌ SELECT/UPDATE/DELETE rejected | ❌ Rejects query |
| **`public.budgets`** | ✅ Full CRUD on own budgets | ❌ SELECT/UPDATE/DELETE rejected | ❌ Rejects query |
| **`public.goals`** | ✅ Full CRUD on own goals | ❌ Contribution/Edit rejected | ❌ Rejects query |

### 3.2 Automated RLS Test Example (Jest / Supabase Client)

```js
describe('Supabase RLS Security Verification - Transactions', () => {
  let userAClient, userBClient;

  beforeAll(async () => {
    userAClient = await getAuthenticatedSupabaseClient('userA@rupiyo.app');
    userBClient = await getAuthenticatedSupabaseClient('userB@rupiyo.app');
  });

  test('User B cannot read User A transactions', async () => {
    // User A creates transaction
    const { data: txn } = await userAClient.from('transactions').insert({ amount: 1500, type: 'EXPENSE' }).select().single();

    // User B attempts to read User A transaction
    const { data: readAttempt, error } = await userBClient.from('transactions').select().eq('id', txn.id);

    expect(readAttempt).toHaveLength(0); // RLS filtered out row
  });
});
```

---

## 4. Test Execution Commands

```bash
# Run unit and schema validation tests
npm run test:unit

# Run Supabase RLS security test suite
npm run test:rls

# Run end-to-end browser tests
npm run test:e2e
```
