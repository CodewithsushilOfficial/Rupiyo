"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Smartphone, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { env } from '@/lib/config/env';

export function ApkDownloadModal({ isOpen, onClose }) {
  const downloadUrl = env.NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL || '/downloads/rupiyo-release.apk';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'rupiyo-release.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Rupiyo for Android" maxWidth="max-w-md">
      <div className="space-y-4 text-foreground">
        {/* Header Badge */}
        <div className="flex items-center gap-3.5 rounded-card border border-border bg-muted/40 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
            ₹
          </div>
          <div>
            <h3 className="text-base font-bold text-heading">Rupiyo Android App</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">v1.0.0</span>
              <span>•</span>
              <span>Official Signed Release APK</span>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2 text-xs">
          <p className="font-semibold text-heading">App Features Included:</p>
          <div className="grid grid-cols-1 gap-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-income shrink-0" />
              <span>Camera Receipt &amp; Bill Scanner</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-income shrink-0" />
              <span>Offline OCR &amp; PDF Invoice Text Extraction</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-income shrink-0" />
              <span>Android Share Target Receiver (Google Pay, Paytm)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-income shrink-0" />
              <span>Zero-storage Privacy Protection</span>
            </div>
          </div>
        </div>

        {/* Simple 3-step Instructions */}
        <div className="rounded-control border border-border-subtle bg-card p-3 text-[11px] space-y-1 text-muted-foreground">
          <p className="font-bold text-foreground">Installation Steps:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Tap <strong className="text-foreground">Download APK</strong> below.</li>
            <li>Open the downloaded <code className="text-primary font-mono text-[10px]">rupiyo-release.apk</code> file.</li>
            <li>Confirm package installation when prompted by Android.</li>
          </ol>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-income shrink-0" />
          <span>Verified official release package signed with Rupiyo Release Key.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-2 font-bold cursor-pointer">
            <Download className="h-4 w-4" /> Download APK
          </Button>
        </div>
      </div>
    </Modal>
  );
}
