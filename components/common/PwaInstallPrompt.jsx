"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X, Smartphone } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('[SW_REGISTER_ERROR]:', err);
      });
    }

    // Check if already running in standalone mode or dismissed recently
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    const dismissedTime = localStorage.getItem('rupiyo_pwa_dismissed_at');
    const isRecentlyDismissed =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000; // 7 days

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__rupiyo_pwa_prompt = e; // Store globally for MobileDrawer access

      if (!isStandalone && !isRecentlyDismissed) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      window.__rupiyo_pwa_prompt = null;
      console.log('🎉 Rupiyo PWA was installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__rupiyo_pwa_prompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
    window.__rupiyo_pwa_prompt = null;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('rupiyo_pwa_dismissed_at', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary-soft border-b border-primary/20 px-4 py-2.5 text-xs font-medium text-foreground flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shrink-0">
          <Smartphone className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="font-bold text-heading">Install Rupiyo App</p>
          <p className="text-[11px] text-muted-foreground">
            Faster access, camera scanner, and offline tracking.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={handleInstallClick} className="gap-1.5 text-xs px-3 py-1.5 font-bold cursor-pointer">
          <Download className="h-3.5 w-3.5" /> Install
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
