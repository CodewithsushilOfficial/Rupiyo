# Rupiyo — NVIDIA NIM Smart Financial Insights Specification

## 1. Executive Summary & AI Vision
Rupiyo incorporates an automated financial observation engine powered by **NVIDIA NIM AI API** (`https://integrate.api.nvidia.com/v1`).
- **Strict Non-Advisory Guarantee**: The AI engine provides descriptive statistical analysis (e.g. "Food delivery expenses increased by 34% compared to last month"). It **NEVER** provides stock recommendations or financial advisory services.
- **Privacy First**: Sensitive PII (user names, emails, account numbers, card details) is **NEVER** sent to NVIDIA NIM endpoints.
- **Deterministic Rule Fallback**: If the NVIDIA NIM API key is unconfigured or rate-limited, the system falls back seamlessly to a local rule evaluation engine (`RuleBasedInsightEngine`).

---

## 2. AI Service Architecture

```mermaid
graph TD
    SupabaseDB[(Supabase PostgreSQL)] --> AnalyticsEngine[Financial Domain Aggregator]
    AnalyticsEngine -->|Anonymized Monthly Metrics| InsightService[InsightService Interface]
    
    InsightService -->|API Key Present| NvidiaAdapter[NvidiaNimAdapter]
    InsightService -->|Key Missing / Timeout| LocalRuleEngine[Deterministic Rule Engine]
    
    NvidiaAdapter -->|POST /chat/completions| NvidiaNIM[NVIDIA NIM API endpoint - llama-3.1-70b-instruct]
    NvidiaNIM -->> NvidiaAdapter: Return Structured Insights JSON
    LocalRuleEngine -->> InsightService: Return Rule-Generated Insights
    
    NvidiaAdapter --> Validation[Zod Response Validation]
    Validation --> InsightsDB[(Persist into public.insights)]
    InsightsDB --> UI[Render Smart Insights Cards UI]
```

---

## 3. Environment & API Credentials
- `AI_PROVIDER=nvidia_nim`
- `NVIDIA_NIM_API_KEY=nvapi-...` (Server-Side ONLY — NEVER expose via `NEXT_PUBLIC_`)
- `NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1`
- `NVIDIA_NIM_MODEL=meta/llama-3.1-70b-instruct`
- `NVIDIA_NIM_TIMEOUT_MS=8000`

---

## 4. Anonymized AI Payload Example

```json
{
  "period": "2026-07",
  "baseCurrency": "INR",
  "aggregates": {
    "totalIncome": 125000.00,
    "totalExpense": 84200.00,
    "savingsRate": 32.64,
    "topCategories": [
      { "name": "Rent", "amount": 35000.00, "deltaPercentage": 0.0 },
      { "name": "Food & Dining", "amount": 18400.00, "deltaPercentage": 28.5 },
      { "name": "Shopping", "amount": 12300.00, "deltaPercentage": -12.0 }
    ],
    "overBudgetCategories": [
      { "name": "Food & Dining", "budget": 15000.00, "spent": 18400.00 }
    ]
  }
}
```

---

## 5. System Prompt & Anti-Hallucination Rules

```text
You are an expert financial data analyst for the Rupiyo app.
You analyze anonymized user spending summaries and return structured insights.

CRITICAL CONSTRAINTS:
1. Provide ONLY factual, descriptive insights based strictly on the provided JSON numbers.
2. NEVER suggest buying specific stocks, cryptocurrencies, mutual funds, or financial products.
3. Keep each insight title under 60 characters and body under 200 characters.
4. Output valid JSON matching the specified schema.
```
