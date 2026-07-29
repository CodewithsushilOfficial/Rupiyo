# Rupiyo Mobile Architecture

## Overview
Rupiyo is built as a single responsive codebase using Next.js App Router, React 19, and Tailwind CSS v4, supporting:
1. **Desktop Web** (1024px - 1440px+)
2. **Tablet Web** (768px - 1023px)
3. **Mobile Web & PWA** (320px - 767px)
4. **Android Native App** via Capacitor (`com.rupiyo.app`)

---

## 1. Header & Navigation Architecture By Viewport

### Mobile Header (< 768px)
- **Top Bar**: Clean compact layout: `[₹ Logo] Rupiyo` on left, Hamburger Menu Button (`Menu` icon, `aria-label="Open navigation"`) on right.
- **Removed Crowded Desktop Elements**: Heavy search, greeting text, user profile pill, and duplicate buttons are hidden from the horizontal navbar on mobile to prevent clutter.
- **Welcome Greeting**: Relocated to **Dashboard Page Content** (`DashboardView.jsx`), displaying `Welcome back, {firstName}! 👋 Here's what's happening with your finances today.` with compact responsive typography.

### Desktop Header (>= 768px)
- Preserves full desktop experience: Greeting, Search input with `⌘ K` shortcut, Notification Bell with live count badge, User Profile Pill (Avatar, Name, Plan), `Download Report` button, and `+ Add Transaction` button.

### Desktop Sidebar (>= 1024px)
- Rendered via `Sidebar.jsx` (`hidden md:flex`). Automatically hidden on mobile screens to prevent layout duplication.

---

## 2. Hamburger Navigation Drawer (`MobileDrawer.jsx`)
Clicking the hamburger menu button `☰` opens a premium slide-over drawer (width: `85vw`, `max-w-sm`):
- **Brand Header**: `[₹ Logo] Rupiyo — Personal Finance` + `Close X` button (`aria-label="Close navigation"`).
- **Authenticated User Profile Card**: Displays real user profile data (`user.full_name`, `user.email`, `user.plan` / `Free`, Avatar initial) dynamically fetched from Supabase Auth/Profiles.
- **Search Bar**: `[ 🔍 Search anything... ]` with form submit redirecting to `/transactions?search=...`.
- **Main Navigation Menu**:
  - Dashboard (`LayoutDashboard`) -> `/dashboard`
  - Transactions (`ArrowRightLeft`) -> `/transactions`
  - Accounts (`WalletCards`) -> `/accounts`
  - Categories (`Grid3X3`) -> `/categories`
  - Budgets (`Wallet`) -> `/budgets`
  - Goals (`Target`) -> `/goals`
  - Reports (`BarChart3`) -> `/reports`
  - Recurring (`Repeat2`) -> `/recurring`
  - AI Insights (`Sparkles`) -> `/insights`
- **Secondary Preferences**:
  - Notifications (`Bell`) with dynamic unread count badge -> `/notifications`
  - Settings (`Settings`) -> `/settings/profile`
- **Actions**:
  - `+ Add Transaction` -> opens `TransactionModal` / `ReceiptScannerModal`.
  - `Download Report` -> navigates to `/reports`.
- **Account Action**:
  - `Logout` (`LogOut` icon) -> triggers `signOutAction()` to revoke session.

### Interaction Rules & Accessibility
- **Active Route Highlighting**: Active route is styled using semantic tokens (`bg-primary-soft text-primary font-bold shadow-xs`).
- **Auto-Closing**: Tapping any navigation link automatically closes the drawer.
- **Backdrop & Keyboard Dismissal**: Clicking the backdrop, tapping `X`, or pressing `ESC` closes the drawer.
- **Body Scroll Locking**: Prevents background scrolling (`document.body.style.overflow = 'hidden'`) while drawer is open.

---

## 3. Fixed Bottom Navigation Bar (`BottomNav.jsx`)
- Visible on mobile viewports (`md:hidden`).
- Includes 5 destinations:
  1. **Home**: `/dashboard` (`House` icon)
  2. **Transactions**: `/transactions` (`ArrowLeftRight` icon)
  3. **Scan**: Prominently styled electric indigo circle button triggering `ReceiptScannerModal`
  4. **Budgets**: `/budgets` (`ChartPie` icon)
  5. **More**: Triggers `MobileDrawer` (`Menu` icon)
- Safe Area padding: Includes `pb-[env(safe-area-inset-bottom)]` to prevent collision with Android gesture navigation bars.
