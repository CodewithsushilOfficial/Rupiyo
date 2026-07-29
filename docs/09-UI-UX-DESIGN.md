# Rupiyo — UI/UX Design & Screen Specifications

## 1. Design Direction & UX Philosophy
Rupiyo is designed as a modern, high-trust, premium fintech web application. The design aesthetic prioritizes clarity, financial visibility, minimal clutter, mobile responsiveness, and high performance.

### Key Design Pillars:
- **Clarity First**: Important numbers (Current Balance, Total Monthly Spent, Remaining Budget) are displayed prominently with clear visual contrast.
- **Responsive Adaptability**: Desktop presents rich multi-column dashboards and data tables; Mobile transitions into stacked cards, touch-friendly drawers, and bottom bar navigation.
- **Delightful Micro-Interactions**: Smooth state transitions, instant optimistic UI updates on transaction entry, and accessible toasts for success feedback.
- **State Completeness**: Every screen strictly handles four states: **Loading (Skeleton)**, **Empty (Guidance state)**, **Error (Recovery path)**, and **Success (Populated state)**.

---

## 2. Complete Screen Index & Detailed Specifications

### 2.1 Public Pages

#### Screen 01: Landing Page (`/`)
- **Purpose**: Communicates Rupiyo's value proposition, features, security model, and CTA links.
- **Layout**: Hero banner with preview mockup, feature grid (Budgeting, Multi-Account, Insights), security reassurance badge, and footer.
- **Primary CTA**: "Get Started Free" -> `/register`.
- **Secondary CTA**: "Sign In" -> `/login`.

#### Screen 02: Login Screen (`/login`)
- **Purpose**: Authenticates returning users.
- **Components**: Email/password form, "Continue with Google" OAuth button, "Forgot Password" link, "Remember Me" toggle.
- **Loading State**: Form inputs disabled; submit button renders loading spinner.
- **Error State**: Inline alert banner highlighting invalid credentials.

#### Screen 03: Registration Screen (`/register`)
- **Purpose**: Onboards new users into the platform.
- **Components**: Display Name input, Email input, Password strength indicator, Terms checkbox, Google Sign-up button.

#### Screen 04 & 05: Password Recovery (`/forgot-password`, `/reset-password`)
- **Purpose**: Email-based password reset triggering secure recovery instructions.

---

### 2.2 Onboarding Workflow

#### Screen 06: Onboarding Wizard (`/onboarding`)
- **Step 1 — Currency & Preference Selection**: Select Base Currency (Default: `INR ₹`), Timezone, and Theme.
- **Step 2 — Initial Financial Account Setup**: Form to create first account (e.g., "HDFC Bank Account", Type: BANK, Opening Balance: ₹25,000).
- **Step 3 — Optional Monthly Budget Setup**: Define total monthly spending target.
- **Step 4 — Add First Transaction**: Optional guided entry logging a initial expense or income.
- **Completion**: Redirects seamlessly to `/dashboard`.

---

### 2.3 Application Core Modules

#### Screen 07: Main Financial Dashboard (`/dashboard`)
- **Desktop Layout**: 3-column layout. Left column (Metrics cards & Spending trends chart), Center column (Category breakdown donut & Recent transactions table), Right column (Goal progress cards, Upcoming recurring, Smart insight banner).
- **Mobile Layout**: Vertical single column. Hero balance card -> Quick Action buttons (Add Expense / Add Income) -> Category progress -> Recent transaction cards.
- **Empty State**: Renders welcome banner with "Add Your First Transaction" prompt.

```text
+-----------------------------------------------------------------------+
|  Total Balance      Total Income       Total Expense    Savings Rate  |
|  ₹ 1,45,200.00      ₹ 85,000.00        ₹ 32,450.00      61.8%         |
+-----------------------------------------------------------------------+
|  [Spending Trends Line Chart]    | [Category Breakdown Donut Chart]  |
|                                  |  Food: 35% | Rent: 40% | Travel: 25%|
+----------------------------------+------------------------------------+
|  Recent Transactions List        | Savings Goals & Smart Insights     |
+-----------------------------------------------------------------------+
```

---

#### Screen 08: Transactions Ledger (`/transactions`)
- **Components**: Composite Filter Bar (Search text, Date Range picker, Category multi-select, Account dropdown, Payment Method filter), Transaction Data Table (Desktop) / Transaction Card Stack (Mobile), Pagination Controls.
- **Actions**: "Add Transaction" modal launcher, Row edit action, Row delete confirmation drawer.
- **Empty State**: "No transactions found matching your filters." with "Clear Filters" button.

#### Screen 09: Transaction Detail Modal / Drawer
- **Purpose**: Displays full metadata for a transaction including payment method, timestamp, tags, notes, and recurring rule source.

#### Screen 10: Accounts Manager (`/accounts`)
- **Components**: Account Summary Cards (Cash, Bank, UPI, Credit Card liabilities), Net Worth summary, "Create Account" modal, Account Archival toggle.

#### Screen 11: Categories & Payment Methods (`/categories`)
- **Components**: Tabbed interface for Income Categories, Expense Categories, and Custom Categories. Color palette picker & Lucide icon selector for custom categories.

#### Screen 12: Budget Planner (`/budgets`)
- **Components**: Monthly Budget Overview Gauge, Category Budget Cards with progress bars (Green <50%, Yellow 50-80%, Orange 80-100%, Red >100%), "Set Budget" modal.

#### Screen 13: Savings Goals Tracker (`/goals`)
- **Components**: Goal Progress Grid Cards (Target vs Saved, Target Date countdown, Percentage radial indicator), "Add Goal" modal, "Make Contribution" drawer.

#### Screen 14: Recurring Transactions Schedule (`/recurring`)
- **Components**: Active Recurring Rules List, Frequency badges, Next due date countdown, Pause/Resume toggle, Manual "Execute Now" action button.

#### Screen 15: Analytics & Visualizations (`/analytics`)
- **Components**: Period selector (This Month, Last Month, YTD, Custom), Income vs Expense comparison bar chart, Daily Average spend widget, Highest spending categories table.

#### Screen 16: Reports & Exports (`/reports`)
- **Components**: Report Generator Form (Report Type, Date Range, Accounts filter), Format selection (PDF, Excel, CSV), "Download Report" CTA button, Past Reports audit log.

#### Screen 17: Smart Insights Center (`/insights`)
- **Components**: Financial Insight Cards highlighting spending spikes, budget overruns, savings opportunities, and natural language monthly summaries.

#### Screen 18: Notification Center (`/notifications`)
- **Components**: Filter tabs (All, Unread, Budget, Goals), "Mark All as Read" CTA, Notification Item cards with direct deep-link URLs.

#### Screen 19 & 20: Profile & Settings (`/settings/*`)
- **Components**: Profile details form, Currency & Locale preferences, Theme switcher (Light/Dark), Security & Password update, Data Export, Account Deletion trigger.

---

## 3. UI State Matrix Enforcement

| Screen | Loading State (Skeleton) | Empty State | Error State |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Animated skeleton pulse for cards & chart containers. | "Welcome to Rupiyo! Add your first account to unlock insights." | "Failed to load dashboard metrics. Retrying..." |
| **Transactions** | Table row skeleton layout with 5 placeholders. | "No transactions logged for this period." | "Database query timeout. Please refresh." |
| **Budgets** | Budget progress card skeletons. | "No budget configured for this month." | "Unable to update budget threshold." |
| **Goals** | Goal card radial skeleton placeholders. | "No active savings goals. Create one to start saving!" | "Goal contribution failed." |
