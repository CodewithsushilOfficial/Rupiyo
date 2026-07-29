# Rupiyo — Performance & Database Optimization Specification

## 1. Target SLAs & Performance Benchmarks

| Metric | Target SLA | Target Measurement Context |
| :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | < 1.0s | Mobile / Desktop SSR Dashboard |
| **Largest Contentful Paint (LCP)** | < 1.5s | Home / Ledger views |
| **Server Action Latency** | < 300ms | Single transaction write |
| **Supabase PostgreSQL Query** | < 35ms | Paginated transaction list with RLS |
| **PDF Report Generation** | < 2.0s | 500-record monthly summary report |

---

## 2. Supabase PostgreSQL Indexing Strategy
To ensure Row Level Security (RLS) queries (`auth.uid() = user_id`) execute without full table scans, mandatory composite indexes are applied across the database schema:

```sql
-- 1. Transactions Ledger Indexing
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_account ON public.transactions(user_id, account_id, transaction_date DESC);

-- 2. Account & Category Filtering Indexes
CREATE INDEX idx_accounts_user_archived ON public.accounts(user_id, is_archived);
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type, is_archived);

-- 3. Budgets & Goals Indexes
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, month_year);
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);

-- 4. Notifications & Insights Indexes
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_insights_user_active ON public.insights(user_id, is_dismissed, created_at DESC);
```

---

## 3. Server-Side Filtering & Pagination
- All financial ledger queries use `supabase.from('transactions').range(start, end)` for offset-based pagination.
- Default page size: 20 records per page.
- Prevents loading massive transaction datasets into server memory.

---

## 4. Connection Pooling
- Production deployments connect to Supabase PostgreSQL via **pgBouncer** connection pooling (`transaction` mode).
- Ensures high concurrency handling during peak usage hours without exhausting database connection limits.
