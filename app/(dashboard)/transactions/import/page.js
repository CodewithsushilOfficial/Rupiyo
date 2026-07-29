"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImportTransactionView } from '@/components/transactions/ImportTransactionView';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ReceiptScannerModal } from '@/components/scanner/ReceiptScannerModal';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Upload, ArrowLeft, RefreshCw } from 'lucide-react';
import {
  getPendingImportPayload,
  consumePendingImportPayload,
  subscribeToShareEvents,
} from '@/lib/utils/share-payload-handler';

export const dynamic = 'force-dynamic';

function ImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftData, setDraftData] = React.useState(null);
  const [isProcessingPayload, setIsProcessingPayload] = React.useState(false);
  const [processingStage, setProcessingStage] = React.useState('');
  const [accounts, setAccounts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [initialTxData, setInitialTxData] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState('');

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

  // Process a raw incoming payload (Android Share or Web Share)
  const processRawPayload = React.useCallback(async (payload) => {
    if (!payload) return;
    setIsProcessingPayload(true);
    setErrorMsg('');
    setProcessingStage('Reading shared payload...');

    try {
      if (payload.kind === 'text') {
        setProcessingStage('Parsing shared text snippet...');
        const res = await fetch('/api/ocr/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payload.text, source: 'ANDROID_SHARE_TEXT' }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setDraftData(json.data);
          consumePendingImportPayload();
        } else {
          throw new Error(json.error || 'Unable to parse text payload');
        }
      } else if (payload.base64) {
        setProcessingStage('Running OCR on shared document...');
        const res = await fetch('/api/ocr/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: payload.base64,
            mimeType: payload.mimeType || 'image/jpeg',
            source: 'ANDROID_SHARE_IMAGE',
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setDraftData(json.data);
          consumePendingImportPayload();
        } else {
          throw new Error(json.error || 'Unable to extract text from shared receipt');
        }
      }
    } catch (err) {
      console.error('[IMPORT_PAYLOAD_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to process shared document.');
    } finally {
      setIsProcessingPayload(false);
      setProcessingStage('');
    }
  }, []);

  // Check pending payload on mount + handle searchParams + live warm-start events
  React.useEffect(() => {
    const pending = getPendingImportPayload();
    if (pending) {
      setTimeout(() => processRawPayload(pending), 0);
    } else {
      const textParam = searchParams.get('text');
      const titleParam = searchParams.get('title');
      if (textParam || titleParam) {
        setTimeout(() => {
          processRawPayload({
            kind: 'text',
            text: `${titleParam || ''} ${textParam || ''}`.trim(),
          });
        }, 0);
      }
    }

    const unsubscribe = subscribeToShareEvents((livePayload) => {
      processRawPayload(livePayload);
    });

    return () => {
      unsubscribe();
    };
  }, [processRawPayload, searchParams]);

  const handleConfirmImport = (draft) => {
    // Map draft category to category_id if available
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === (draft.categorySuggestion || '').toLowerCase()
    );

    setInitialTxData({
      amount: draft.amount || '',
      title: draft.title || '',
      type: draft.type || 'EXPENSE',
      transaction_date: draft.transactionDate || new Date().toISOString().substring(0, 10),
      notes: draft.notes || '',
      payment_method: draft.paymentMethod || 'UPI',
      category_id: matchedCategory?.id || categories[0]?.id || null,
      account_id: accounts[0]?.id || null,
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

      {errorMsg && (
        <div className="rounded-control border border-expense-border bg-expense-soft p-4 text-xs font-semibold text-expense flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="font-bold text-expense">
            ✕
          </button>
        </div>
      )}

      {isProcessingPayload ? (
        <div className="rounded-card border border-border bg-card p-12 text-center flex flex-col items-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <h3 className="text-base font-bold text-heading">{processingStage}</h3>
          <p className="text-xs text-muted-foreground">
            Extracting transaction details securely...
          </p>
        </div>
      ) : draftData ? (
        <ImportTransactionView
          draftData={draftData}
          onConfirm={handleConfirmImport}
          onCancel={() => {
            consumePendingImportPayload();
            setDraftData(null);
          }}
        />
      ) : (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-heading">No active import payload</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Upload a receipt image, PDF, or paste payment text to extract transaction details.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => setIsScannerOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" /> Scan Bill / Upload File
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(parsed) => setDraftData(parsed)}
      />

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialTxData(null);
        }}
        accounts={accounts}
        categories={categories}
        initialData={initialTxData}
        onSuccess={() => {
          consumePendingImportPayload();
          router.push('/transactions');
        }}
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
