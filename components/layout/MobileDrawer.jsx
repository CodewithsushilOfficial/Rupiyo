"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowRightLeft,
  WalletCards,
  Grid3X3,
  Wallet,
  Target,
  BarChart3,
  Repeat2,
  Sparkles,
  Bell,
  Settings,
  Search,
  Plus,
  Download,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth-actions';
import { cn } from '@/lib/utils/cn';

export function MobileDrawer({ isOpen, onClose, user = {}, onOpenScan }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const userName = user.full_name || 'User';
  const userEmail = user.email || '';
  const firstName = userName.split(' ')[0] || 'User';
  const plan = user.plan || 'Free';
  const notifCount = 3;

  // Prevent background scroll and support ESC key
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
    { name: 'Accounts', href: '/accounts', icon: WalletCards },
    { name: 'Categories', href: '/categories', icon: Grid3X3 },
    { name: 'Budgets', href: '/budgets', icon: Wallet },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Recurring', href: '/recurring', icon: Repeat2 },
    { name: 'AI Insights', href: '/insights', icon: Sparkles },
  ];

  const secondaryNav = [
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: notifCount },
    { name: 'Settings', href: '/settings/profile', icon: Settings },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start md:hidden">
      {/* Backdrop with Fade-in */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-in Drawer Panel (85-90vw, max-w-sm) */}
      <div className="relative z-10 flex h-full w-[85vw] max-w-sm flex-col bg-card border-r border-border p-5 shadow-2xl overflow-y-auto">
        {/* ─── 1. Brand Header ─── */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              ₹
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-heading leading-tight">
                Rupiyo
              </h2>
              <p className="text-[11px] font-medium text-muted-foreground">
                Personal Finance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-control border border-input bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ─── 2. Authenticated Profile Card ─── */}
        <div className="my-4 flex items-center gap-3 rounded-card border border-border bg-muted/40 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-base bg-primary-soft text-primary">
            {firstName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-heading truncate">{userName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-primary">{plan} Plan</span>
              {userEmail && <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>}
            </div>
          </div>
        </div>

        {/* ─── 3. Search Bar ─── */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-control border border-input bg-card text-foreground pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* ─── 4. Main Navigation ─── */}
        <div className="space-y-0.5 border-b border-border pb-4 mb-4">
          <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary-soft text-primary font-bold shadow-xs'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-subtle" />
              </Link>
            );
          })}
        </div>

        {/* ─── 5. Secondary Navigation ─── */}
        <div className="space-y-0.5 border-b border-border pb-4 mb-4">
          <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Preferences &amp; Alerts
          </p>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary-soft text-primary font-bold shadow-xs'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-expense text-expense-foreground">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-subtle" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ─── 6. Action Buttons ─── */}
        <div className="space-y-2 mb-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenScan) onOpenScan();
            }}
            className="flex w-full items-center justify-center gap-2 h-11 px-4 rounded-control text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary-btn transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Transaction</span>
          </button>

          <Link href="/reports" onClick={onClose} className="block w-full">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 h-10 px-4 rounded-control text-xs font-semibold border border-input bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Download Report</span>
            </button>
          </Link>
        </div>

        {/* ─── 7. Sign Out / Logout ─── */}
        <div className="pt-2 mt-auto border-t border-border">
          <button
            type="button"
            onClick={async () => {
              onClose();
              await signOutAction();
            }}
            className="flex w-full items-center gap-3 rounded-control px-3.5 py-3 text-sm font-semibold text-expense hover:bg-expense-soft transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
