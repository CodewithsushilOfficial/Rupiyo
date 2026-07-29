# Rupiyo — Validation & Error Handling Specification

## 1. Multi-Layer Validation Strategy
Validation occurs across three distinct tiers:
1. **Client-Side Tier**: Instant UX validation using React Hook Form + Zod resolvers.
2. **Server Action Tier**: Strict Zod schema parsing before database interaction.
3. **Database Tier**: Supabase PostgreSQL check constraints (`NUMERIC(15,2)`, `amount > 0`), foreign keys, and Row Level Security (RLS) policies.

---

## 2. Standardized Error Response Envelope
All Server Actions return a consistent response object:

```js
{
  success: false,
  error: "Human readable error message for UI toast",
  code: "ERROR_CODE_ENUM",
  fieldErrors?: {
    fieldName: ["Error message 1", "Error message 2"]
  }
}
```

---

## 3. Error Taxonomy Table

| System Error Code | HTTP / Supabase Status | Category | User-Facing Message | Resolution Action |
| :--- | :--- | :--- | :--- | :--- |
| `ERR_AUTH_UNAUTHENTICATED` | 401 | Auth | Your session has expired. Please sign in again. | Redirect to `/login?redirect=...`. |
| `ERR_AUTH_INVALID_CREDENTIALS`| 400 / Auth | Auth | Invalid email address or password. | Highlight form fields. |
| `ERR_AUTH_EMAIL_EXISTS` | 422 / Auth | Auth | An account with this email address already exists. | Prompt user to log in instead. |
| `ERR_RLS_ACCESS_DENIED` | 403 / 42501 | Security | Access denied: You do not have permission for this resource. | Log security attempt; return 403 error. |
| `ERR_VALIDATION_FAILED` | 400 | Validation | Please check the highlighted form errors. | Populate form field errors. |
| `ERR_ACCOUNT_NOT_FOUND` | 404 | Database | Selected account was not found or has been archived. | Refresh account dropdown. |
| `ERR_INSUFFICIENT_BALANCE` | 422 | Business Logic| Selected account balance is insufficient for this transaction. | Display warning toast. |
| `ERR_DUPLICATE_NAME` | 409 / 23505 | Database | An account or category with this name already exists. | Request unique name. |
| `ERR_AI_SERVICE_UNAVAILABLE` | 503 | AI Service | Smart Insights service is temporarily busy. Showing rule fallback insights. | Fallback to rule engine. |

---

## 4. Primary Reusable Zod Schemas (`lib/validation/`)

```js
import { z } from 'zod';

// Registration Schema
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Transaction Creation Schema
export const createTransactionSchema = z.object({
  accountId: z.string().uuid('Invalid account selection'),
  categoryId: z.string().uuid('Invalid category selection'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Type is required' }),
  amount: z.number().positive('Amount must be greater than zero').max(100000000, 'Amount limit exceeded'),
  paymentMethod: z.enum(['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER']),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().max(255).optional(),
  notes: z.string().optional(),
});
```
