# Rupiyo — Security & Threat Modeling Architecture

## 1. Zero-Trust Security Foundation
Rupiyo implements a defense-in-depth security model combining Next.js Server Action validation, Supabase Auth session verification, strict server/client separation, and mandatory **Supabase Row Level Security (RLS)** policies at the PostgreSQL database tier.

---

## 2. Supabase Security Architecture & Row Level Security (RLS)

```mermaid
graph TD
    UserClient[User Browser Client] -->|Anon Key + Session JWT| SupabaseProxy[Supabase API Endpoint]
    SupabaseProxy --> AuthVerify[Supabase Auth JWT Verifier]
    AuthVerify -->|Extract auth.uid()| RLS[PostgreSQL Row Level Security Engine]
    
    subgraph PostgreSQL Database Schema
        RLS -->|Pass: auth.uid() == user_id| UserData[(User Private Rows)]
        RLS -->|Fail: auth.uid() != user_id| AccessDenied[403 / 0 Rows Returned]
    end
```

### 2.1 RLS Enforcement Mandate
- Every user-owned table (`profiles`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `goal_contributions`, `recurring_transactions`, `notifications`, `insights`) MUST have Row Level Security enabled:
  ```sql
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  ```
- Default policy pattern:
  ```sql
  CREATE POLICY "Users access own data" ON public.transactions
      FOR ALL USING (auth.uid() = user_id);
  ```

### 2.2 Privileged Service Role Key Safety
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `ANON_KEY`: Safe for browser usage. Restricts operations based on user JWT and RLS policies.
- `SUPABASE_SERVICE_ROLE_KEY`: Privileged key that **bypasses all RLS policies**.
  - **MANDATORY RULE**: `SUPABASE_SERVICE_ROLE_KEY` MUST NEVER be exposed via `NEXT_PUBLIC_`.
  - Must NEVER be imported into Client Components (`.jsx`).
  - Restricted strictly to trusted server-side system background jobs (e.g. account cleanup crons).

---

## 3. Threat Modeling & OWASP Top 10 Mitigation Matrix

| Threat Category | Risk Description | Rupiyo Architectural Mitigation |
| :--- | :--- | :--- |
| **Broken Access Control (A01:2021)** | User A attempts to view, edit, or delete User B's transactions or balance. | Database-enforced **Supabase RLS** (`auth.uid() = user_id`). Even if an API parameter is manipulated, PostgreSQL rejects the query. |
| **Cryptographic Failures (A02:2021)** | Interception of tokens or storage of plain-text credentials. | Password hashing handled natively by Supabase Auth (Argon2 / bcrypt). TLS 1.3 enforced for all HTTPS traffic. |
| **Injection Attacks (A03:2021)** | SQL Injection or script injection via form fields. | Parameterized PostgreSQL queries via Supabase JS SDK. Input sanitization with Zod. |
| **Insecure Design (A04:2021)** | Negative balance exploits or unauthorized account assignment. | Check constraints (`amount > 0`). Balance mutations executed within server-side SQL atomic transactions. |
| **Security Misconfiguration (A05:2021)** | Exposure of secret API keys in client bundles. | Automated static linting prohibiting `NEXT_PUBLIC_` prefixes on `SUPABASE_SERVICE_ROLE_KEY` and `NVIDIA_NIM_API_KEY`. |
| **Vulnerable Components (A06:2021)** | Outdated dependencies containing CVE vulnerabilities. | Automated npm audit checks and version pin locks. |
| **Auth Failures (A07:2021)** | Brute-force login attacks or session hijacking. | Supabase Auth rate limiting. HTTP-only secure session cookies managed via `@supabase/ssr`. |
| **Software Data Integrity (A08:2021)** | Duplicate recurring execution or unvalidated webhook calls. | Unique SQL idempotency keys and strict Zod validation. |
| **Logging & Monitoring (A09:2021)** | Unmonitored unauthorized data access attempts. | Server Action error logging without leaking PII or credentials. |
| **Server-Side Request Forgery (A10:2021)** | Manipulation of internal API URLs or NVIDIA NIM endpoints. | Hardcoded server-side base URL configuration for NVIDIA NIM API (`https://integrate.api.nvidia.com/v1`). |

---

## 4. Supabase Storage Security Policies
User avatar uploads and financial report attachments stored in Supabase Storage enforce strict access control policies:

```sql
-- Avatar Storage Bucket Policy
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view own avatar" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
```

---

## 5. Account Erasure & Data Compliance Workflow
When a user requests account deletion:
1. Server Action verifies password / OAuth re-authentication.
2. Calls `supabase.auth.admin.deleteUser(userId)` using server-side privileged client.
3. PostgreSQL `ON DELETE CASCADE` automatically wipes records across `public.profiles`, `accounts`, `transactions`, `budgets`, `goals`, `recurring_transactions`, `notifications`, and `insights`. Zero residual user data retained.
