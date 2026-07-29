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
  Smartphone,
  LogOut,
  X,
  ChevronRight,
  Share,
} from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth-actions';
import { cn } from '@/lib/utils/cn';
import { ApkDownloadModal } from '@/components/common/ApkDownloadModal';

const emptySubscribe = () => () => {};
const SERVER_PLATFORM_SNAPSHOT = Object.freeze({ isStandalone: false, isIOS: false, isAndroid: false });

let cachedClientSnapshot = null;
let lastUa = null;
let lastStandalone = null;

function getClientPlatformSnapshot() {
  if (typeof window === 'undefined') return SERVER_PLATFORM_SNAPSHOT;

  const ua = navigator.userAgent || '';
  const isStandalone = Boolean(
    window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
  );

  if (
    cachedClientSnapshot &&
    lastUa === ua &&
    lastStandalone === isStandalone
  ) {
    return cachedClientSnapshot;
  }

  lastUa = ua;
  lastStandalone = isStandalone;
  cachedClientSnapshot = Object.freeze({
    isStandalone,
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isAndroid: /Android/i.test(ua),
  });

  return cachedClientSnapshot;
}

function useClientPlatform() {
  return React.useSyncExternalStore(
    emptySubscribe,
    getClientPlatformSnapshot,
    () => SERVER_PLATFORM_SNAPSHOT
  );
}

export function MobileDrawer({ isOpen, onClose, user = {}, onOpenScan }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isApkModalOpen, setIsApkModalOpen] = React.useState(false);
  const { isStandalone, isIOS, isAndroid } = useClientPlatform();

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

  const handlePwaInstall = async () => {
    const promptEvent = window.__rupiyo_pwa_prompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
      window.__rupiyo_pwa_prompt = null;
    } else {
      alert('To install Rupiyo PWA:\n1. Tap your browser menu (⋮ or Share)\n2. Select "Add to Home Screen" or "Install App".');
    }
  };

  return (
    <>
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

          {/* ─── 5. APP Section (PWA Install & APK Download) ─── */}
          <div className="space-y-0.5 border-b border-border pb-4 mb-4">
            <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              App
            </p>

            {/* PWA Install Entry (hidden if already running in installed mode) */}
            {!isStandalone && (
              <button
                type="button"
                onClick={handlePwaInstall}
                className="flex w-full items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-4.5 w-4.5 text-primary" />
                  <span>Install Rupiyo</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                  PWA
                </span>
              </button>
            )}

            {/* Android APK Download Entry */}
            {(!isIOS || isAndroid) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsApkModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4.5 w-4.5 text-primary" />
                  <span>Download Android App</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  APK
                </span>
              </button>
            )}

            {/* iOS Add to Home Screen tip */}
            {isIOS && !isStandalone && (
              <div className="mx-3 mt-1.5 rounded-card border border-border-subtle bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                <Share className="h-4 w-4 text-primary shrink-0" />
                <span>To install on iOS: Tap Share ⎋ → &quot;Add to Home Screen&quot;.</span>
              </div>
            )}
          </div>

          {/* ─── 6. Secondary Navigation ─── */}
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

          {/* ─── 7. Action Buttons ─── */}
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

          {/* ─── 8. Sign Out / Logout ─── */}
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

      {/* APK Confirmation Sheet Modal */}
      <ApkDownloadModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
    </>
  );
}
