# Rupiyo — Authentication & Authorization Architecture

## 1. Overview & Architecture Strategy
Rupiyo uses **Supabase Auth** for identity management and session handling in Next.js App Router.
- **Client Web SDK**: Browser-side authentication helpers for login, signup, and OAuth popups/redirects.
- **Server SSR Client (`@supabase/ssr`)**: Cookie-based server session verification for Server Components, Server Actions, and Route Handlers.
- **Database Authorization**: **Supabase Row Level Security (RLS)** enforces row ownership (`auth.uid() = user_id`) on all queries.

---

## 2. Authentication Flow Diagrams

### 2.1 Email & Password Sign Up & Automatic Profile Provisioning

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Form as RegisterForm Component
    participant Auth as Supabase Auth Engine
    participant DB as Supabase PostgreSQL Trigger
    participant Profile as public.profiles Table

    User->>Form: Enter Email, Password, Full Name
    Form->>Auth: supabase.auth.signUp({ email, password, options: { data: { full_name } } })
    Auth->>Auth: Create auth.users Record
    Auth->>DB: Fire PostgreSQL Trigger: on_auth_user_created
    DB->>Profile: INSERT INTO public.profiles (id, email, full_name)
    DB->>DB: INSERT INTO public.user_preferences (user_id)
    Auth-->>Form: Return User Session & Email Verification Sent
    Form-->>User: Redirect to /onboarding
```

---

### 2.2 Google OAuth Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant App as Next.js Client App
    participant Supabase as Supabase Auth Endpoint
    participant Google as Google OAuth 2.0 Server
    participant Middleware as Next.js Proxy/Middleware

    User->>App: Click "Continue with Google"
    App->>Supabase: supabase.auth.signInWithOAuth({ provider: 'google', redirectTo })
    Supabase-->>User: Redirect to Google Accounts Login
    User->>Google: Authenticate & Authorize Scope
    Google-->>Supabase: Return OAuth Authorization Code
    Supabase->>App: Redirect to /auth/callback?code=...
    App->>Middleware: Exchange Code for Session Cookies via @supabase/ssr
    Middleware-->>User: Session Established & Redirect to /dashboard
```

---

## 3. Session Persistence & Protected Route Middleware

Next.js Middleware (`middleware.js`) intercepts requests to enforce route access boundaries:

```js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/accounts') ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/goals') ||
    pathname.startsWith('/settings');

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
```

---

---

## 5. Supabase OAuth 2.1 & OIDC Server Endpoints

For third-party app integrations and OIDC authentication discovery:

| Endpoint Type | Protocol / Spec | Target URL |
|---|---|---|
| **Authorization Endpoint** | OAuth 2.1 | `https://kaljmvhnnoknupzkzptz.supabase.co/auth/v1/oauth/authorize` |
| **Token Endpoint** | OAuth 2.1 | `https://kaljmvhnnoknupzkzptz.supabase.co/auth/v1/oauth/token` |
| **JWKS Endpoint** | JSON Web Key Set | `https://kaljmvhnnoknupzkzptz.supabase.co/auth/v1/.well-known/jwks.json` |
| **OIDC Discovery** | OpenID Connect | `https://kaljmvhnnoknupzkzptz.supabase.co/auth/v1/.well-known/openid-configuration` |
