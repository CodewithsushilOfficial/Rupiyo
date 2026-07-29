# Rupiyo — Notification Center Engine Specification

## 1. Notification Architecture Overview
The Notification Engine provides in-app alert delivery to keep users informed about budget caps, goal progress milestones, upcoming recurring payment obligations, and financial insights.

```text
[ Trigger Event ]
  ├── Budget Threshold Evaluator (>=50%, >=80%, >=100%)
  ├── Goal Progress Evaluator (Completion / Milestone)
  ├── Recurring Execution Worker (Payment Due / Processed)
  └── Insight Service Engine (New Insight Generated)
       │
       ▼
[ Notification Dispatcher Service ]
       │  (Deduplication Check: Prevents identical alerts within 24h)
       ▼
[ PostgreSQL `notifications` Table ] ──> Server Action ──> [ Notification Center UI ]
```

---

## 2. Notification Types & Trigger Conditions Catalog

| Notification Type | Trigger Condition | Severity | Persisted Message Template |
| :--- | :--- | :--- | :--- |
| **`BUDGET_WARNING`** | Category budget reaches **80%** usage threshold. | `WARNING` | "Warning: You have used 80% of your **{category_name}** monthly budget cap." |
| **`BUDGET_EXCEEDED`**| Category or overall monthly budget reaches **100%** or greater. | `DANGER` | "Alert: You have exceeded your monthly budget for **{category_name}** by **₹ {overrun_amount}**." |
| **`GOAL_MILESTONE`** | Savings Goal reaches 50%, 75%, or 100% progress. | `SUCCESS` | "Congratulations! Your savings goal **{goal_title}** has reached **{progress_percent}%** completion." |
| **`RECURRING_DUE`**  | Active recurring rule execution is due within 48 hours. | `INFO` | "Reminder: Upcoming recurring payment of **₹ {amount}** for **{description}** due on **{due_date}**." |
| **`SYSTEM_INFO`**    | System updates, account deletion confirmations, export readiness.| `INFO` | "Your requested financial export report for **{period}** is ready for download." |

---

## 3. Persistent Notification Operations API

### 3.1 Fetch Unread Notifications Server Action (`getNotificationsAction`)
- **Query**: `SELECT * FROM notifications WHERE user_id = $session_uid ORDER BY created_at DESC LIMIT 50`.
- **Response**: Array of notification records + total unread count integer.

---

### 3.2 Mark Notification as Read (`markNotificationReadAction`)
- **Payload**: `{ "notificationId": "uuid-v4" }`.
- **SQL Execution**: `UPDATE notifications SET is_read = TRUE WHERE id = $notificationId AND user_id = $session_uid`.

---

### 3.3 Mark All as Read (`markAllNotificationsReadAction`)
- **SQL Execution**: `UPDATE notifications SET is_read = TRUE WHERE user_id = $session_uid AND is_read = FALSE`.

---

## 4. Alert Deduplication Strategy
To prevent notification flooding (e.g., repeatedly generating budget alerts on every new transaction once over 80%), the dispatcher verifies deduplication rules:
1. **Unique Deduplication Key**: `(user_id, type, link_url, date_trunc('day', created_at))`.
2. **Frequency Cap**: Only 1 notification of type `BUDGET_WARNING` per category per calendar month.

---

## 5. Future Email & Push Infrastructure Extensions
The notification table payload is designed for seamless extensibility to external delivery channels:
- **Email Delivery Adapter**: Integration with Supabase Auth Email service or Resend API using user notification preference toggles (`user_preferences.email_alerts == true`).
- **Web Push Notifications**: Service Worker integration handling Web Push API notifications for PWA clients.
