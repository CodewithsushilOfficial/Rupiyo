"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImportTransactionView } from '@/components/transactions/ImportTransactionView';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Upload, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftData, setDraftData] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [initialTxData, setInitialTxData] = React.useState(null);

  React.useEffect(() => {
    async function loadMetadata() {
      const supabase = createClient();
      const [{ data: accs }, { data: cats }] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);
      setAccounts(accs || []);
      setCategories(cats || []);
    }
    loadMetadata();
  }, []);

  const handleConfirmImport = (draft) => {
    setInitialTxData({
      amount: draft.amount || '',
      title: draft.title || '',
      type: draft.type || 'EXPENSE',
      transaction_date: draft.transactionDate || new Date().toISOString().substring(0, 10),
      notes: draft.notes || '',
      payment_method: draft.paymentMethod || 'UPI',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Import &amp; Review Transaction
          </h1>
          <p className="text-sm text-muted-foreground">
            Verify transaction parsed from receipt scan or Android Share.
          </p>
        </div>
      </div>

      {draftData ? (
        <ImportTransactionView
          draftData={draftData}
          onConfirm={handleConfirmImport}
          onCancel={() => setDraftData(null)}
        />
      ) : (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-heading">No active import payload</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Scan a bill or share a receipt image from another app to pre-fill your transaction.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            Go to Dashboard
          </Button>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialTxData(null);
        }}
        accounts={accounts}
        categories={categories}
        initialData={initialTxData}
        onSuccess={() => router.push('/transactions')}
      />
    </div>
  );
}

export default function ImportPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading import manager...</div>}>
      <ImportContent />
    </React.Suspense>
  );
}
