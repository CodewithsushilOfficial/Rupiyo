"use client";

import * as React from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, Download, Plus, Menu } from 'lucide-react';

export function Header({ user = {}, onOpenScan, onOpenDrawer }) {
  const userName = user.full_name || 'User';
  const firstName = userName.split(' ')[0] || 'User';
  const plan = user.plan || 'Free';
  const notifCount = 3;

  return (
    <header className="bg-card border-b border-border text-card-foreground">
      {/* ═══════ MOBILE HEADER (< 768px) ═══════ */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border-subtle">
        {/* Brand Logo & Name */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
            ₹
          </div>
          <span className="text-xl font-bold tracking-tight text-heading">
            Rupiyo
          </span>
        </Link>

        {/* Right: Hamburger Menu Button */}
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-control border border-input bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ═══════ DESKTOP HEADER (>= 768px) ═══════ */}
      <div className="hidden md:block">
        {/* Top Row: Greeting + Search + Profile */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-heading">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-[14px] mt-0.5 text-muted-foreground">
              Here&apos;s what&apos;s happening with your finances today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-10 w-60 rounded-control border border-input bg-card text-foreground pl-9 pr-14 text-[13px] outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground">
                ⌘ K
              </div>
            </div>

            {/* Notification Bell */}
            <Link href="/notifications">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-control border border-input bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold bg-expense text-expense-foreground">
                    {notifCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 rounded-full border border-input bg-card hover:bg-muted pl-1 pr-3 py-1 cursor-pointer transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm bg-primary-soft text-primary">
                {firstName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold leading-tight text-foreground">
                  {userName}
                </p>
                <p className="text-[11px] font-medium leading-tight text-primary">
                  {plan}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-subtle" />
            </div>
          </div>
        </div>

        {/* Action Row: Download + Add Transaction */}
        <div className="flex items-center justify-end gap-3 px-8 pb-5">
          <Link href="/reports">
            <button className="flex items-center gap-2 h-10 px-5 rounded-control text-[13px] font-semibold border border-input bg-card hover:bg-muted text-foreground transition-colors cursor-pointer">
              <Download className="h-4 w-4 text-muted-foreground" />
              Download Report
            </button>
          </Link>

          <button
            onClick={onOpenScan}
            className="flex items-center gap-2 h-10 px-5 rounded-control text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary-btn transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
            <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
}
