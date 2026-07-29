"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ArrowLeftRight, ScanLine, ChartPie, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function BottomNav({ onOpenScan, onOpenDrawer }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: House },
    { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Scan', isScan: true, icon: ScanLine },
    { label: 'Budgets', href: '/budgets', icon: ChartPie },
    { label: 'More', isMore: true, icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-dropdown md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item, idx) => {
          const IconComponent = item.icon;

          if (item.isScan) {
            return (
              <button
                key="scan-btn"
                type="button"
                onClick={onOpenScan}
                className="relative -top-5 flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-primary-btn hover:bg-primary-hover transition-transform group-active:scale-95">
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold text-primary mt-1">Scan</span>
              </button>
            );
          }

          if (item.isMore) {
            return (
              <button
                key="more-btn"
                type="button"
                onClick={onOpenDrawer}
                className="flex flex-col items-center justify-center py-1.5 px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1">More</span>
              </button>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href || idx}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-3 transition-colors',
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
