# Rupiyo — Technology Stack Specification

## 1. Stack Architecture Overview
Rupiyo is built on a modern, production-grade technology stack designed for high performance, strict multi-tenant data isolation, relational integrity, mobile-first responsiveness, PWA installability, native Android execution, and seamless AI/OCR capabilities.

```text
Rupiyo Cross-Platform Architecture
├── Client / Native Platform Layer
│   ├── Responsive Web Browser (320px - 1440px+)
│   ├── Installable Progressive Web App (PWA Web App Manifest + Service Worker)
│   └── Native Android Application (Capacitor Android Shell - com.rupiyo.app)
│
├── Frontend Application Layer (Next.js 16.2 App Router - React 19)
│   ├── JavaScript Standard (.js / .jsx)
│   ├── Mobile Shell (Header.jsx, MobileDrawer.jsx, BottomNav.jsx)
│   ├── Tailwind CSS v4 + HSL Semantic CSS Tokens
│   ├── Lucide React Icons & Recharts Visualization Engine
│   └── Camera Scanner UI & Receipt OCR Import Review Form
│
├── Server / Application Layer (Next.js Node.js Runtime)
│   ├── Server Components & Server Actions Layer
│   ├── Server-side OCR Engine (Tesseract.js + pdf-parse)
│   ├── Duplicate Transaction Detection Engine
│   └── InsightService → NvidiaNimAdapter (NVIDIA NIM AI API)
│
└── Backend Infrastructure Layer (Supabase Platform)
    ├── Identity: Supabase Auth
    ├── Relational Database: Supabase PostgreSQL
    └── Security: Supabase Row Level Security (RLS) policies
```

---

## 2. Comprehensive Technology Matrix

| Technology | Category | Selected Version / Type | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Next.js** | Web Framework | App Router (16.2.12) | Server Components, built-in Server Actions, optimized asset routing, SSR/SSG capabilities. |
| **React** | Core Library | React 19.2.4 | Modern render-phase state synchronization, `useSyncExternalStore` for SSR hydration safety. |
| **Capacitor** | Native Mobile | Android Shell (`com.rupiyo.app`) | Wraps single Next.js codebase into installable Android APK with native camera & Share Target intent receivers. |
| **PWA** | Web App Engine | Manifest + Service Worker (`sw.js`) | Offline shell caching, standalone launch mode, web share target support, installation banner. |
| **Tesseract.js** | OCR Engine | Server-side Optical Recognition | Extracts amount (₹), merchant, date, payment method from receipt images without storing files permanently. |
| **pdf-parse** | PDF Engine | Node.js Buffer Parser | Direct text extraction from digital PDF receipt invoices. |
| **Tailwind CSS** | Styling Framework | v4 | Utility-first CSS engine with custom CSS variables (`globals.css`), responsive breakpoints, and dark mode support. |
| **Lucide React** | Icon System | React Icon Library | Modern, consistent financial iconography across desktop and mobile drawer/bottom nav. |
| **Supabase Auth** | Identity Provider | Client & SSR Web SDK | Turnkey identity management, Email/Password, profile triggers, secure session cookie handling. |
| **Supabase PostgreSQL** | Relational Database | Managed PostgreSQL Engine | Relational integrity, foreign keys, `NUMERIC(15, 2)` exact decimal money storage. |
| **Supabase RLS** | Database Security | Row Level Security | Database-enforced multi-tenant data isolation (`auth.uid() = user_id`). |
| **NVIDIA NIM AI** | AI Engine | REST Microservices | Low-latency LLM inference API (`meta/llama-3.1-70b-instruct`) for financial insights. |
