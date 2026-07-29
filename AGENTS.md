<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# RUPIYO DESIGN SYSTEM & THEME RULES

1. **Centralized CSS Variables**:
   - ALL application colors, backgrounds, borders, radii, and shadows MUST come from `app/globals.css`.
   - Never write hardcoded HEX (`#6759E8`), RGB, HSL, or arbitrary dark mode classes (`dark:bg-slate-900`, `dark:text-white`) inside `.jsx`/`.js` component files.

2. **Tailwind CSS v4 Semantic Tokens**:
   - Use semantic Tailwind utility classes: `bg-background`, `text-foreground`, `text-heading`, `bg-card`, `bg-card-hover`, `bg-popover`, `bg-primary`, `bg-primary-hover`, `bg-primary-soft`, `bg-secondary`, `bg-muted`, `text-muted-foreground`, `border-border`, `border-border-subtle`, `border-input`, `ring-ring`, `text-income`, `bg-income-soft`, `border-income-border`, `text-expense`, `bg-expense-soft`, `border-expense-border`, `text-savings`, `bg-savings-soft`, `border-savings-border`, `text-warning`, `bg-warning-soft`, `border-warning-border`, `bg-sidebar`, `border-sidebar-border`.

3. **Light and Dark Theme Architecture**:
   - Themes are centrally controlled via `:root` (Light Theme) and `.dark` (Dark Theme) in `globals.css`.
   - Dynamic theme toggling MUST use `useTheme()` from `next-themes`.

4. **Recharts Variable References**:
   - Pass CSS custom variables directly to Recharts props: `fill="var(--income)"`, `stroke="var(--expense)"`, `stroke="var(--border-subtle)"`.
