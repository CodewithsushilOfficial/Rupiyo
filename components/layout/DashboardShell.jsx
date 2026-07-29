"use client";

import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ReceiptScannerModal } from '@/components/scanner/ReceiptScannerModal';
import { ImportTransactionView } from '@/components/transactions/ImportTransactionView';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { useRouter } from 'next/navigation';

export function DashboardShell({ user, accounts = [], categories = [], children }) {
  const router = useRouter();
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = React.useState(false);
  const [importedDraft, setImportedDraft] = React.useState(null);
  const [initialTxData, setInitialTxData] = React.useState(null);

  const handleScanComplete = (extractedData) => {
    setImportedDraft(extractedData);
  };

  const handleConfirmImport = (draft) => {
    setInitialTxData({
      amount: draft.amount || '',
      title: draft.title || '',
      type: draft.type || 'EXPENSE',
      transaction_date: draft.transactionDate || new Date().toISOString().substring(0, 10),
      notes: draft.notes || '',
      payment_method: draft.paymentMethod || 'UPI',
    });
    setImportedDraft(null);
    setIsTxModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 md:pb-0">
        <Header
          user={user}
          onOpenScan={() => setIsTxModalOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />

        {/* PWA Install Banner */}
        <PwaInstallPrompt />

        {/* OCR Extracted Import Review Banner */}
        {importedDraft && (
          <div className="p-4 max-w-4xl mx-auto w-full">
            <ImportTransactionView
              draftData={importedDraft}
              onConfirm={handleConfirmImport}
              onCancel={() => setImportedDraft(null)}
            />
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenScan={() => setIsScannerOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Mobile Slide-over Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onOpenScan={() => setIsTxModalOpen(true)}
      />

      {/* Camera & File OCR Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Transaction Form Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setInitialTxData(null);
        }}
        accounts={accounts}
        categories={categories}
        initialData={initialTxData}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
