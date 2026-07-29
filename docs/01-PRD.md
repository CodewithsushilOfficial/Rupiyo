# Rupiyo — Product Requirements Document (PRD)

## 1. Document Control
- **Document Version**: 2.0.0 (Supabase Architecture Migration)
- **Product Name**: Rupiyo Personal Finance Application
- **Target Release**: V1.0 Production Web Application
- **Author**: Lead Product Architect

---

## 2. Executive Product Description
Rupiyo is a full-featured personal finance and expense tracking web application. It addresses the universal problem of financial opacity by providing real-time money tracking, budget enforcement, structured saving goals, idempotent recurring payment automation, analytical visualizations, and intelligent financial summaries.

---

## 3. Product Goals & Objectives
1. **Financial Tracking**: Capture every income and expense transaction across multiple accounts with custom metadata.
2. **Budget Enforcement**: Eliminate overspending through proactive threshold notifications (50%, 80%, 100%).
3. **Savings Progress**: Accelerate personal savings with visual milestone tracking and dedicated contribution histories.
4. **Automated Discipline**: Automate regular payments and bills to prevent missed deadlines and late penalties.
5. **Data Ownership & Privacy**: Ensure absolute multi-tenant data privacy with **Supabase Row Level Security (RLS)** boundaries.

---

## 4. User Personas & User Stories

### Persona 1: Ananya (Salaried Software Engineer)
- **Problem**: Earns a monthly salary but loses track of discretionary spending on food delivery, subscriptions, and shopping.
- **User Story**: "As a salaried employee, I want to assign monthly budget limits to entertainment and dining out so that I can ensure 30% of my income is routed into my home down-payment goal."

### Persona 2: Rahul (Freelance Graphic Designer)
- **Problem**: Has fluctuating monthly income and struggles to manage cash flow across bank accounts and UPI wallets.
- **User Story**: "As a freelancer, I want to track income by payment method and account type so that I know exactly how much liquid cash I have available for monthly fixed expenses."

### Persona 3: Vikram (College Student)
- **Problem**: Operates on a tight monthly allowance from parents with zero financial buffer.
- **User Story**: "As a student, I want to log instant daily expenses on my mobile browser and receive alerts when I reach 80% of my monthly spending limit."

---

## 5. Detailed Requirement Specifications

### 5.1 Authentication & Profile Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-AUTH-001** | User Registration | Support email and password registration via Supabase Auth. | P0 |
| **PRD-AUTH-002** | Google OAuth | Allow one-click registration/login using Google Authentication via Supabase Auth. | P0 |
| **PRD-AUTH-003** | Email Verification | Send verification email post-registration; restrict unverified account privileges if configured. | P1 |
| **PRD-AUTH-004** | Password Recovery | Provide "Forgot Password" link triggering a secure password reset email flow via Supabase Auth. | P0 |
| **PRD-AUTH-005** | User Profile Setup | Store profile in `public.profiles` linked to `auth.users.id` (Full Name, Avatar, INR `₹` Base Currency, Timezone, Theme). | P0 |
| **PRD-AUTH-006** | Data Erasure | Support self-service full account and data deletion fulfilling compliance requirements. | P1 |

### 5.2 Financial Accounts Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-ACC-001** | Account Creation | Create accounts with fields: Name, Type (Cash, Bank, UPI, Wallet, Credit Card, Other), Opening Balance, Currency. | P0 |
| **PRD-ACC-002** | Balance Calculation | Compute real-time balance: `Current Balance = Opening Balance + Sum(Income) - Sum(Expense)`. | P0 |
| **PRD-ACC-003** | Credit Card Handling | Display credit card balances as liabilities (negative flow impact) separate from liquid assets. | P0 |
| **PRD-ACC-004** | Account Archival | Support soft-archival of accounts; preserved for historical reporting while hidden from active transaction selectors. | P1 |

### 5.3 Transactions Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-TXN-001** | Transaction Logging | Capture Type (Income/Expense), Amount, Account, Category, Date, Payment Method, Tags, and Notes. | P0 |
| **PRD-TXN-002** | Precision Storage | Store all money values in Supabase PostgreSQL as `NUMERIC(15, 2)` to eliminate rounding errors. | P0 |
| **PRD-TXN-003** | Multi-Filter Search | Filter transactions by keyword, date range, category, account, payment method, and transaction type. | P0 |
| **PRD-TXN-004** | Server-Side Pagination| Paginate transaction lists on the server (default 20 records/page) to maintain performance. | P0 |

### 5.4 Category Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-CAT-001** | System Defaults | Provide seed categories for Expense (Food, Travel, Rent, Bills, Healthcare, etc.) and Income (Salary, Freelance, Gift, etc.). | P0 |
| **PRD-CAT-002** | Custom Categories | Allow users to create custom categories with custom icons and color hex tokens. | P1 |
| **PRD-CAT-003** | Deletion Safety | Prevent hard-deletion of categories bound to existing transactions; require category reassignment or soft-archival. | P0 |

### 5.5 Budget Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-BUD-001** | Overall Monthly Budget | Set a total monthly expenditure cap for the user account. | P0 |
| **PRD-BUD-002** | Category Budgets | Set distinct monthly caps for specific expense categories (e.g., Food ₹5,000). | P0 |
| **PRD-BUD-003** | Threshold Alerts | Trigger notifications when spent amount hits 50%, 80%, 100%, or exceeds cap. | P0 |

### 5.6 Savings Goals Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-GOL-001** | Goal Creation | Define Goal Title, Target Amount, Target Date, and Description. | P0 |
| **PRD-GOL-002** | Contribution Logging | Add dedicated savings deposits linked to an account balance deduction. | P0 |
| **PRD-GOL-003** | Progress Calculation | Calculate percentage achieved (`Saved / Target * 100`) and target milestone status. | P0 |

### 5.7 Recurring Transactions Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-REC-001** | Rule Definition | Set recurrence rules (Daily, Weekly, Monthly, Yearly) for income or expenses. | P0 |
| **PRD-REC-002** | Execution Idempotency| Ensure cron/job retry attempts produce exactly 1 transaction per scheduled period. | P0 |

### 5.8 Analytics & Reports Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-REP-001** | Chart Visualizations | Render Income vs Expense bars, Category Donut charts, and Monthly Trend lines via Recharts. | P0 |
| **PRD-REP-002** | Data Export | Export filtered transaction datasets into downloadable CSV, Excel, and formatted PDF reports. | P1 |

### 5.9 Smart Financial Insights Requirements
| Requirement ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **PRD-INS-001** | NVIDIA NIM AI | Generate non-advisory statistical observations using NVIDIA NIM AI API. | P1 |
| **PRD-INS-002** | Privacy Isolation | Ensure AI/rule evaluation operates solely on anonymized, user-authorized transaction aggregates. | P0 |

---

## 6. Business Rules & Financial Calculations
1. **Balance Formula**: `Account Balance = Opening Balance + Total Income Received - Total Expenses Paid`.
2. **Net Savings Formula**: `Monthly Savings = Monthly Income - Monthly Expense`.
3. **Savings Rate Formula**: `Savings Rate (%) = (Monthly Savings / Monthly Income) * 100`. (If Income = 0, Savings Rate = 0%).
4. **Budget Usage Formula**: `Budget Usage (%) = (Category Spent / Category Budget) * 100`.
5. **Goal Progress Formula**: `Goal Progress (%) = (Current Saved Amount / Target Amount) * 100`.

---

## 7. Product Success Metrics
- **User Activation**: > 75% of newly registered users log at least 1 account and 3 transactions within 48 hours.
- **Engagement**: Average active user logs 12+ transactions per month.
- **Retention**: 60-day user retention rate > 45%.
- **Error Free Rate**: Server Action & API route error rate < 0.05%.
