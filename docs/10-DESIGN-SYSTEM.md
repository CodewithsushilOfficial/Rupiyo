# Rupiyo — Design System & Theme Architecture

## 1. Overview & Architecture

Rupiyo uses a centralized, semantic design system architecture. All colors, borders, surface treatments, shadows, and radii are defined in `app/globals.css` using CSS custom properties (variables) for `:root` (Light Theme) and `.dark` (Dark Theme).

Tailwind CSS v4 consumes these variables via `@theme` block directives, generating utility classes like `bg-background`, `text-foreground`, `text-heading`, `bg-card`, `bg-primary`, `bg-income`, `bg-expense`, `bg-savings`, `border-border`, etc.

**ABSOLUTE DIRECTIVE:**
> Component files (`.jsx`/`.js`) MUST NOT contain hardcoded HEX (`#6759E8`), RGB, HSL, or arbitrary dark mode classes (`dark:bg-slate-900`, `dark:text-white`). All styling MUST reference semantic CSS tokens or Tailwind semantic utility classes.

---

## 2. Color Palette & Semantic Tokens Matrix

### 2.1 Brand & Surface Palette

| Token Name | Light Theme (`:root`) | Dark Theme (`.dark`) | Purpose |
| :--- | :--- | :--- | :--- |
| `--primary` | `#6759E8` (Electric Indigo) | `#7668F2` | Core brand identity |
| `--primary-hover` | `#594BD7` | `#6759E8` | Primary button hover state |
| `--primary-soft` | `#EEECFF` | `#2D285E` | Soft badge & highlight background |
| `--background` | `#F7F8FC` | `#0B0F19` | Main application background |
| `--card` | `#FFFFFF` | `#121827` | Card & modal background |
| `--card-hover` | `#FCFCFF` | `#171E31` | Interactive card hover state |
| `--popover` | `#FFFFFF` | `#171E31` | Dropdown & tooltip background |
| `--heading` | `#111827` | `#F9FAFB` | High-contrast title typography |
| `--foreground` | `#1F2937` | `#F3F4F6` | Primary body text |
| `--muted-foreground` | `#6B7280` | `#9CA3AF` | Secondary & caption text |
| `--border` | `#E5E7EB` | `#1F2937` | Card & surface divider borders |
| `--border-subtle` | `#F3F4F6` | `#171E2E` | Inner table & card row dividers |

### 2.2 Semantic Financial Status Colors

| Token Name | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--income` | `#22B573` | `#2ED48B` | Positive cash flow, income, growth |
| `--income-soft` | `#E8F8F1` | `#103827` | Income badge background |
| `--expense` | `#F05B78` | `#F8718B` | Outflow, expenses, debits |
| `--expense-soft` | `#FDECEF` | `#401A24` | Expense badge background |
| `--savings` | `#548AF7` | `#60A5FA` | Net worth, asset balances, savings |
| `--savings-soft` | `#EDF3FE` | `#182C54` | Savings badge background |
| `--warning` | `#F5A524` | `#FBBF24` | Budget threshold warnings (80%) |
| `--warning-soft` | `#FEF6E9` | `#3E2D12` | Warning badge background |

---

## 3. Radii & Shadow Tokens

```css
@theme {
  --radius-card: 16px;
  --radius-control: 10px;
  --radius-dialog: 20px;

  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02);
  --shadow-card-hover: 0 10px 25px -5px rgba(103, 89, 232, 0.08);
  --shadow-dropdown: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-dialog: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## 4. Recharts Dynamic Variable Integration

Charts (`Recharts`) read CSS custom variables directly via string references:

```jsx
<Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} />
<Bar dataKey="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} />
<CartesianGrid stroke="var(--border-subtle)" />
<XAxis tick={{ fill: 'var(--muted-foreground)' }} />
```

Tooltips in charts are styled with semantic Tailwind classes:

```jsx
<div className="rounded-control border border-border bg-popover p-3 text-xs shadow-dropdown">
  <p className="font-bold text-popover-foreground">{label}</p>
  <span className="font-semibold text-foreground">₹{value}</span>
</div>
```

---

## 5. Theme Switching & Accessibility

- **Theme Toggle**: The user can toggle between Light and Dark mode using the Sun/Moon toggle button in the Sidebar component (`components/layout/Sidebar.jsx`).
- **`next-themes` Provider**: Configured in `app/layout.js` with `attribute="class"`, `defaultTheme="light"`, `enableSystem`.
- **WCAG 2.1 AA Compliance**: Both Light and Dark modes maintain a minimum 4.5:1 contrast ratio between text (`--foreground`, `--heading`, `--muted-foreground`) and background surfaces (`--card`, `--background`).
