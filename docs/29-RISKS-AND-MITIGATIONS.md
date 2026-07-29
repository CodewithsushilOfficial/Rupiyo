# Rupiyo — Risks & Mitigations Matrix

## 1. Risk Matrix

| Risk ID | Risk Title | Category | Severity | Probability | Architectural Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | Incorrect RLS Policy Configuration | Security | High | Medium | Enable RLS by default on 100% of user tables. Enforce strict `auth.uid() = user_id` check. Execute automated cross-user access tests (`npm run test:rls`) on every CI build. |
| **RSK-002** | Exposure of Privileged `SUPABASE_SERVICE_ROLE_KEY` | Security | High | Low | Restrict service role key strictly to server-side background processes. Never prefix with `NEXT_PUBLIC_`. Add automated static linter checks preventing client component imports. |
| **RSK-003** | Floating-Point Financial Rounding Errors | Data Integrity| Medium | Low | Store all monetary values as fixed-precision PostgreSQL `NUMERIC(15, 2)`. Execute rounding using `date-fns` and fixed decimal math utilities. |
| **RSK-004** | NVIDIA NIM API Rate Limit or Outage | AI Service | Medium | Medium | Implement `InsightService` fallback to `RuleBasedInsightEngine` executing local deterministic data evaluation if AI API call fails or times out. |
| **RSK-005** | OAuth Redirect Domain Misconfiguration | Auth | Medium | Medium | Configure environment-specific callback URLs in Supabase Auth settings (`/auth/callback`). Test OAuth flows across local, staging, and production domains. |
