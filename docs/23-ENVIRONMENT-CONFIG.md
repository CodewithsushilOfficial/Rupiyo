# Rupiyo — Environment Configuration & Secret Governance

## 1. Environment Blueprint (`.env.example`)

```env
# ============================================
# RUPIYO APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# SUPABASE PLATFORM CONFIGURATION
# ============================================
# Public URL and Publishable/Anon Key (Safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key

# Server-only privileged Secret Key (CRITICAL: NEVER prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key

# ============================================
# NVIDIA NIM AI CONFIGURATION
# ============================================
AI_PROVIDER=nvidia_nim
NVIDIA_NIM_API_KEY=nvapi-your-nvidia-nim-api-key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_NIM_TIMEOUT_MS=8000

# ============================================
# APPLICATION DEFAULTS
# ============================================
NEXT_PUBLIC_DEFAULT_CURRENCY=INR
NEXT_PUBLIC_DEFAULT_LOCALE=en-IN
```

---

## 2. Environment Security & Variable Classification

| Variable Name | Scope | Security Level | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public / Client | Low | Base application domain URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Low | Supabase project API gateway endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Medium | Anon API key restricted by Supabase Auth & RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Only** | **CRITICAL** | Privileged admin key bypassing RLS. Must NEVER hit client. |
| `NVIDIA_NIM_API_KEY` | **Server Only** | **CRITICAL** | Paid API credential for NVIDIA NIM. Server-side only. |
