"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  ArrowRightLeft,
  WalletCards,
  Grid3X3,
  Wallet,
  Target,
  BarChart3,
  Repeat2,
  TrendingUp,
  Bell,
  Settings,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return React.useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Accounts', href: '/accounts', icon: WalletCards },
  { name: 'Categories', href: '/categories', icon: Grid3X3 },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Recurring', href: '/recurring', icon: Repeat2 },
  { name: 'Investments', href: '/analytics', icon: TrendingUp },
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
  { name: 'Settings', href: '/settings/profile', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  return (
    <aside className="hidden md:flex w-65 flex-col sticky top-0 h-screen shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* ─── Brand ─────────────────────────────── */}
      <div className="flex h-18 items-center gap-3 px-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
          ₹
        </div>
        <span className="text-[22px] font-bold tracking-tight text-heading">
          Rupiyo
        </span>
      </div>

      {/* ─── Navigation ────────────────────────── */}
      <nav className="flex-1 space-y-0.5 px-4 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-control px-3.5 py-2.25 text-[14px] font-medium transition-all relative',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4.5 w-4.5',
                  isActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground'
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span>{item.name}</span>

              {/* Badge */}
              {item.badge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─── Upgrade Card ──────────────────────── */}
      <div className="px-4 pb-3">
        <div className="rounded-card p-4 relative overflow-hidden bg-linear-to-br from-primary to-primary-hover text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
            <p className="text-[13px] font-bold">Upgrade to Pro</p>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed mb-3">
            Unlock advanced analytics,{'\n'}custom reports and more.
          </p>
          <button className="w-full rounded-sm py-1.75 text-[12px] font-bold bg-card text-primary hover:bg-card-hover transition-colors cursor-pointer">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* ─── Theme Toggle ──────────────────────── */}
      <div className="px-5 pb-5 pt-2 space-y-1 border-t border-sidebar-border">
        <button
          onClick={() => setTheme('light')}
          className={cn(
            'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer',
            isMounted && theme === 'light'
              ? 'bg-primary-soft text-primary font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Sun className="h-4 w-4" />
          Light Mode
          {isMounted && theme === 'light' && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer',
            isMounted && theme === 'dark'
              ? 'bg-primary-soft text-primary font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Moon className="h-4 w-4" />
          Dark Mode
          {isMounted && theme === 'dark' && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
        </button>
      </div>
    </aside>
  );
}
