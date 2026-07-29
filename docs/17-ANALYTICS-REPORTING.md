# Rupiyo — Analytics & Reporting Engine Specification

## 1. Financial Calculation Formulas & Mathematical Contracts

All financial analytics operate under standard mathematical contracts. Calculations handle zero-denominator edge cases gracefully without causing runtime divisions by zero or returning `NaN`.

---

### 1.1 Account Balance Formulas
$$\text{Account Live Balance} = \text{Opening Balance} + \sum \text{Income Transactions} - \sum \text{Expense Transactions}$$

---

### 1.2 Net Savings & Savings Rate Formulas
$$\text{Net Monthly Savings} = \sum \text{Monthly Income} - \sum \text{Monthly Expenses}$$

$$\text{Savings Rate (\%)} = \begin{cases} 
0.00\% & \text{if } \sum \text{Income} \le 0 \\
\max\left(0, \frac{\text{Net Monthly Savings}}{\sum \text{Income}} \times 100\right) & \text{if } \sum \text{Income} > 0 
\end{cases}$$

---

### 1.3 Budget Usage & Variance Formulas
$$\text{Budget Usage (\%)} = \begin{cases} 
0.00\% & \text{if } \text{Budget Cap} \le 0 \\
\left( \frac{\sum \text{Category Expenses}}{\text{Budget Cap}} \right) \times 100 & \text{if } \text{Budget Cap} > 0 
\end{cases}$$

$$\text{Budget Remaining} = \text{Budget Cap} - \sum \text{Category Expenses}$$

---

### 1.4 Savings Goal Progress Formula
$$\text{Goal Progress (\%)} = \min\left(100.00\%, \left( \frac{\text{Current Saved Amount}}{\text{Target Goal Amount}} \right) \times 100\right)$$

---

### 1.5 Period-Over-Period Change Formula
$$\text{Period Change (\%)} = \begin{cases} 
0.00\% & \text{if } \text{Previous Period Spent} = 0 \text{ and } \text{Current Spent} = 0 \\
100.00\% & \text{if } \text{Previous Period Spent} = 0 \text{ and } \text{Current Spent} > 0 \\
\left( \frac{\text{Current Spent} - \text{Previous Spent}}{\text{Previous Spent}} \right) \times 100 & \text{if } \text{Previous Spent} > 0 
\end{cases}$$

---

## 2. Recharts Data Contracts Specification

### 2.1 Income vs Expense Monthly Comparison Chart Contract
```json
[
  { "month": "Jan 2026", "income": 85000.00, "expense": 34200.00, "savings": 50800.00 },
  { "month": "Feb 2026", "income": 85000.00, "expense": 38100.00, "savings": 46900.00 },
  { "month": "Mar 2026", "income": 92000.00, "expense": 31500.00, "savings": 60500.00 }
]
```

### 2.2 Category Spending Distribution Donut Chart Contract
```json
[
  { "name": "Food & Dining", "value": 12450.00, "color": "#2563EB", "percentage": 38.3 },
  { "name": "Rent & Housing", "value": 15000.00, "color": "#16A34A", "percentage": 46.2 },
  { "name": "Travel & Fuel", "value": 5000.00, "color": "#F59E0B", "percentage": 15.5 }
]
```

---

## 3. Financial Report Export Engine Architecture

Rupiyo supports PDF, Excel (`.xlsx`), and CSV file generation streamed directly via HTTP Route Handlers (`/api/reports/export`).

```text
[ Client Request /reports ] ──> [ Route Handler ] ──> Query Filtered Data ──> Format Payload
                                                                                    │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
 [ CSV Formatter ]             [ Excel Formatter ]             [ PDF Generator ]
 (PapaParse / Custom String)   (ExcelJS Engine)                (PDFKit / React-PDF)
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        ▼
                       Streaming HTTP Response Stream
```

---

### 3.1 PDF Report Structure Standard
- **Header**: Rupiyo Logo, Report Title, User Display Name, Generated Timestamp, Selected Date Range Filter.
- **Section 1 — Financial Executive Summary Table**: Total Income, Total Expenses, Net Savings, Savings Rate, Active Accounts Net Balance.
- **Section 2 — Category Breakdown Table**: Category Name, Transaction Count, Total Amount, % Contribution to Expenses.
- **Section 3 — Filtered Transactions Ledger**: Date, Account Name, Category, Payment Method, Description, Type, Amount.
- **Footer**: "Generated securely by Rupiyo Financial System — Confidential User Data".
