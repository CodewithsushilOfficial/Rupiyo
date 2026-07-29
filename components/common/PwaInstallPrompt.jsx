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

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary-soft border-b border-primary/20 px-4 py-2.5 text-xs font-medium text-foreground flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Smartphone className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-heading">Install Rupiyo App</p>
          <p className="text-[11px] text-muted-foreground">
            Add Rupiyo to your home screen for receipt scanning &amp; offline tracking.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleInstallClick} className="gap-1.5 text-xs px-3 py-1">
          <Download className="h-3.5 w-3.5" /> Install
        </Button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
