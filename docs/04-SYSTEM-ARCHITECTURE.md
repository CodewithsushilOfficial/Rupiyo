# Rupiyo — System Architecture Specification

## 1. Architectural Principles
Rupiyo is architected around five foundational pillars:
1. **Modular Monolith in Next.js**: Domain logic grouped cleanly into modular service components while keeping deployment simplified via Next.js App Router.
2. **Supabase Zero-Trust Security**: Every database query executes under Supabase Row Level Security (RLS) policies, guaranteeing database-enforced multi-tenant data isolation.
3. **Relational Financial Engine**: Financial entities (Accounts, Transactions, Budgets, Goals) reside in **Supabase PostgreSQL** with full ACID transaction consistency and `NUMERIC(15, 2)` monetary precision.
4. **Idempotent Background Jobs**: Scheduled tasks (recurring payments, budget check crons) execute using atomic locks to ensure single-execution guarantees.
5. **NVIDIA NIM AI Layer**: AI financial synthesis is isolated behind an abstract `InsightService` interface using NVIDIA NIM microservices API (`https://integrate.api.nvidia.com/v1`), ensuring zero exposure of sensitive PII.

---

## 2. C4 Architecture Diagrams

### 2.1 System Context Diagram (C4 Level 1)

```mermaid
graph TD
    User([Rupiyo User / Client Browser])
    
    subgraph Rupiyo Next.js Boundary
        RupiyoApp[Next.js App Router Application]
    end
    
    SupabaseAuth[Supabase Auth Engine]
    SupabaseDB[(Supabase PostgreSQL + RLS)]
    SupabaseStorage[Supabase Storage Buckets]
    NvidiaNIM[NVIDIA NIM AI API Service]

    User <-->|HTTPS / TLS 1.3| RupiyoApp
    RupiyoApp <-->|Session Cookies / OAuth| SupabaseAuth
    RupiyoApp <-->|Supabase SSR Client / RLS| SupabaseDB
    RupiyoApp <-->|Signed URLs / Uploads| SupabaseStorage
    RupiyoApp -->|Anonymized JSON / HTTPS| NvidiaNIM
```

---

### 2.2 Container Architecture Diagram (C4 Level 2)

```mermaid
graph TB
    subgraph Client Browser Container
        UI[Next.js App Router UI Pages - JS/JSX]
        RHF[React Hook Form + Zod]
        RechartsComp[Recharts Visualization Engine]
        SupabaseBrowser[Supabase Browser Client]
    end

    subgraph Next.js Server Runtime
        AuthMiddleware[Supabase Auth Middleware]
        ServerActions[Server Actions Controller Layer]
        ValidationLayer[Zod Server Validator]
        
        subgraph Domain Services
            AccService[Account Service]
            TxnService[Transaction Service]
            BudService[Budget Service]
            GoalService[Goal Service]
            RecurEngine[Recurring Execution Engine]
            InsightService[Insight AI Service - NvidiaNimAdapter]
        end
    end

    subgraph Supabase Cloud Infrastructure
        SupabaseAuth[Supabase Auth Engine]
        SupabaseRLS[Row Level Security Policy Layer]
        SupabaseDB[(Supabase PostgreSQL Database)]
        SupabaseStorage[Supabase Storage Buckets]
        NvidiaNIM[NVIDIA NIM AI Microservice API]
    end

    UI --> AuthMiddleware
    AuthMiddleware --> ServerActions
    ServerActions --> ValidationLayer
    ValidationLayer --> AccService & TxnService & BudService & GoalService & RecurEngine & InsightService
    
    AccService & TxnService & BudService & GoalService & RecurEngine --> SupabaseRLS
    SupabaseRLS --> SupabaseDB
    InsightService -->|HTTPS / NVIDIA_NIM_API_KEY| NvidiaNIM
```

---

## 3. Core Operational Data Flows

### 3.1 Transaction Write Flow (Income / Expense Creation)

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant SA as Server Action (createTransaction)
    participant Auth as Supabase Auth Verifier
    participant Zod as Server Zod Schema
    participant DB as Supabase PostgreSQL (with RLS)
    participant Budget as Budget Alert Evaluator

    User->>SA: Submit Form Data (Amount, Account, Category, Date)
    SA->>Auth: Verify Supabase Session Token & Extract User ID
    Auth-->>SA: Valid User Session (auth.uid: "user_uuid_123")
    SA->>Zod: Validate Raw Parameters
    Zod-->>SA: Clean Validated Payload
    
    SA->>DB: Execute Transaction Insert & Account Balance Update
    Note over DB: Supabase RLS Policy Evaluates:<br/>auth.uid() == user_id AND account.user_id == auth.uid()
    DB-->>SA: RLS Pass & Commit Success
    
    SA->>Budget: Trigger Async Budget Threshold Check
    Budget->>DB: Query Active Category Budget Usage
    Budget-->>SA: Return Budget Status (e.g., 85% Used Alert)
    
    SA-->>User: Return Success Payload & Revalidate Path Cache
```

---

### 3.2 Dashboard Read & Aggregation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Page as Dashboard Server Component
    participant Auth as Supabase Auth Engine
    participant DB as Supabase PostgreSQL (RLS Enforced)

    User->>Page: Request /dashboard
    Page->>Auth: Retrieve & Verify Supabase Session
    Auth-->>Page: User Authenticated (uid: "user_uuid_123")
    
    par Parallel Data Retrieval via Supabase Server Client
        Page->>DB: Query Total Income, Expenses, Balance
        Page->>DB: Query Account Summary List
        Page->>DB: Query Monthly Category Spending Breakdown
        Page->>DB: Query Recent 10 Transactions
        Page->>DB: Query Savings Goals Progress
    end
    
    DB-->>Page: Return Filtered RLS Aggregated Payloads
    Note over Page: Assemble Layout, Format Currency (INR ₹), Render Server Component HTML
    Page-->>User: Stream Fully Rendered Dashboard UI
```

---

### 3.3 NVIDIA NIM AI Insight Synthesis Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant SA as Server Action (generateInsights)
    participant DB as Supabase PostgreSQL
    participant AI as NvidiaNimAdapter
    participant Provider as NVIDIA NIM API Endpoint

    User->>SA: Request Smart Insights
    SA->>DB: Fetch Aggregated Monthly Category Deltas & Totals (RLS Filtered)
    Note over SA: Anonymize Payload (Strip Name, Emails, Account IDs)
    SA->>AI: Pass Anonymized Aggregates
    AI->>Provider: POST https://integrate.api.nvidia.com/v1/chat/completions
    Provider-->>AI: Return Structured JSON Summary & Insights
    AI-->>SA: Return Validated Insight Objects
    SA->>DB: Store Persisted Insight Record in public.insights
    SA-->>User: Render Financial Insight Cards
```

---

## 4. Deployment Boundaries & Scalability

- **Frontend / Application Server**: Hosted on Vercel / Cloud Provider (Next.js SSR/SSG App Router deployment).
- **Identity & Backend Service**: Managed Supabase Auth & Supabase Storage global infrastructure.
- **Database Layer**: Managed Supabase PostgreSQL with automated daily backups, read replicas, connection pooling (pgBouncer), and Row Level Security.
- **AI Infrastructure**: NVIDIA NIM API hosted microservices (`integrate.api.nvidia.com`).
