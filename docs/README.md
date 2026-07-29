# Rupiyo — Documentation System & Technical Single Source of Truth

Welcome to the central documentation repository for **Rupiyo**, a production-grade personal finance and expense tracking application.

> [!IMPORTANT]
> **ARCHITECTURAL MANDATE**: Rupiyo utilizes **Supabase** (Supabase Auth, Supabase PostgreSQL, Supabase Row Level Security) as its official backend infrastructure. AI capabilities are powered by **NVIDIA NIM AI API**. Frontend is built using **Next.js App Router** with **JavaScript (`.js` / `.jsx`)**, **Tailwind CSS v4**, **Progressive Web App (PWA)**, and **Capacitor Android Native Integration (`com.rupiyo.app`)**.

---

## 1. Documentation Index & Recommended Reading Order

For developers, architects, and QA engineers onboarding to Rupiyo, follow this reading order:

### Tier 1 — Core Overview & Business Logic
1. [00-PROJECT-OVERVIEW.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/00-PROJECT-OVERVIEW.md) — Product vision, target personas, core value proposition, success criteria.
2. [01-PRD.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/01-PRD.md) — Product Requirements Document, business rules, feature priority matrix.
3. [02-SRS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/02-SRS.md) — Formal Software Requirements Specification (Functional, Non-Functional & Supabase FRs).

### Tier 2 — Architecture, Database & Security
4. [03-TECH-STACK.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/03-TECH-STACK.md) — Technology stack specification and rationale for Supabase PostgreSQL + RLS + NVIDIA NIM + Capacitor Android.
5. [04-SYSTEM-ARCHITECTURE.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/04-SYSTEM-ARCHITECTURE.md) — C4 architecture diagrams, container layouts, request flows, transaction sequence diagrams.
6. [05-DATABASE-SCHEMA.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/05-DATABASE-SCHEMA.md) — Production PostgreSQL DDL, `auth.users` -> `public.profiles` relationship, Row Level Security (RLS) policies, indexes, ER diagram.
7. [06-DATA-MODEL.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/06-DATA-MODEL.md) — Domain entity relationships, state machines, balance update invariants.
8. [07-API-AND-SERVER-ACTIONS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/07-API-AND-SERVER-ACTIONS.md) — Supabase Server Actions and Route Handlers contracts specifications.
9. [08-AUTHENTICATION-AUTHORIZATION.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/08-AUTHENTICATION-AUTHORIZATION.md) — Supabase Auth integration, protected middleware, server session management, profile triggers.
10. [15-SECURITY.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/15-SECURITY.md) — Supabase Security, Row Level Security (RLS) policies, zero-trust model, account erasure workflows.

### Tier 3 — Mobile, PWA, Android & OCR Architecture
11. [MOBILE-ARCHITECTURE.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/MOBILE-ARCHITECTURE.md) — Responsive layout shell, compact mobile header, hamburger navigation drawer, and bottom navigation bar.
12. [PWA.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/PWA.md) — Progressive Web App manifest, service worker shell caching, network-only financial API rules, install prompt banner.
13. [ANDROID-CAPACITOR.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/ANDROID-CAPACITOR.md) — Capacitor Android shell configuration (`com.rupiyo.app`), camera plugin, and native build pipeline.
14. [CAMERA-SCANNER.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/CAMERA-SCANNER.md) — Native & Web camera viewfinder scanner interface and receipt capture flow.
15. [OCR-PIPELINE.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/OCR-PIPELINE.md) — Server-side OCR parsing (`tesseract.js` + `pdf-parse`), entity extraction, EXIF redaction, and zero-retention memory buffer clearing.
16. [ANDROID-SHARE-TARGET.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/ANDROID-SHARE-TARGET.md) — Android Share Sheet intent receiving (`image/*`, `application/pdf`, `text/plain`).
17. [FILE-IMPORT.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/FILE-IMPORT.md) — Unified transaction import review workflow and duplicate transaction detection.
18. [PRIVACY-SECURITY.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/PRIVACY-SECURITY.md) — Privacy policies, zero receipt storage, server-side API key isolation, and mandatory user confirmation.

### Tier 4 — User Interface & System Workflows
19. [09-UI-UX-DESIGN.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/09-UI-UX-DESIGN.md) — Screen specifications across 18+ app views, loading/empty/error states.
20. [10-DESIGN-SYSTEM.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/10-DESIGN-SYSTEM.md) — Centralized HSL CSS tokens, Geist typography, shadcn/ui component standards, WCAG 2.2 AA rules.
21. [11-USER-JOURNEY.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/11-USER-JOURNEY.md) — Visual user journey flowcharts (onboarding, tracking, budgeting, goals).
22. [12-USER-WORKFLOWS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/12-USER-WORKFLOWS.md) — Procedural workflows with DB impacts and security rules.
23. [13-FEATURES.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/13-FEATURES.md) — Categorized feature prioritization matrix (`P0` to `P3`).
24. [14-MODULES.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/14-MODULES.md) — 16 functional system modules breakdown.

### Tier 5 — Analytics, AI, Notifications & Validation
25. [16-VALIDATION-ERROR-HANDLING.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/16-VALIDATION-ERROR-HANDLING.md) — Reusable Zod schemas, validation primitives, error taxonomy table.
26. [17-ANALYTICS-REPORTING.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/17-ANALYTICS-REPORTING.md) — Financial formulas, Recharts data contracts, PDF/Excel/CSV export standards.
27. [18-AI-INSIGHTS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/18-AI-INSIGHTS.md) — NVIDIA NIM AI API, `NvidiaNimAdapter`, prompt engineering, anti-hallucination rules.
28. [19-NOTIFICATIONS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/19-NOTIFICATIONS.md) — Notification types, alert triggers, deduplication strategy.
29. [20-PERFORMANCE.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/20-PERFORMANCE.md) — Performance SLAs, database indexing strategy, RLS query tuning.

### Tier 6 — Execution Roadmap, Testing, Deployment & Governance
30. [21-TESTING-STRATEGY.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/21-TESTING-STRATEGY.md) — Test pyramid, unit/integration test rules, Supabase RLS security tests.
31. [22-DEPLOYMENT.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/22-DEPLOYMENT.md) — Next.js on Vercel, Supabase PostgreSQL, Supabase Auth & Storage setup.
32. [23-ENVIRONMENT-CONFIG.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/23-ENVIRONMENT-CONFIG.md) — Production `.env.example` blueprint and secret classification rules.
33. [24-DEVELOPMENT-PHASES.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/24-DEVELOPMENT-PHASES.md) — Development roadmap with atomic task IDs.
34. [25-MODULE-WISE-TASKS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/25-MODULE-WISE-TASKS.md) — Module-oriented task checklist.
35. [26-ROADMAP.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/26-ROADMAP.md) — Product evolution roadmap.
36. [27-ACCEPTANCE-CRITERIA.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/27-ACCEPTANCE-CRITERIA.md) — Acceptance criteria for Supabase Auth & RLS.
37. [28-TRACEABILITY-MATRIX.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/28-TRACEABILITY-MATRIX.md) — Requirement Traceability Matrix.
38. [29-RISKS-AND-MITIGATIONS.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/29-RISKS-AND-MITIGATIONS.md) — Risk matrix and mitigations.
39. [30-FUTURE-SCOPE.md](file:///c:/Users/codew/Downloads/Rupiyo/docs/30-FUTURE-SCOPE.md) — Post-V1 feature expansion horizon.

---

## 2. Project Status Summary

```text
Current Status: 🟩 FULLY PRODUCTION READY & VERIFIED
Backend Architecture: Supabase Auth + Supabase PostgreSQL + Row Level Security (RLS)
AI Engine: NVIDIA NIM AI API
Frontend: Next.js App Router (React 19) + JavaScript + Tailwind CSS v4
Mobile & Cross-Platform: Responsive PWA + Capacitor Android App (com.rupiyo.app)
Scanner & OCR: Camera Scanner + Image/PDF OCR + Android Share Target Receiver
Quality Gate: PASS (0 ESLint Errors/Warnings, 0 Build Errors across 21 routes)
```
