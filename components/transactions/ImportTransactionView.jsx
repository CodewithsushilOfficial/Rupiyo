"use client";

import * as React from 'react';
import { checkDuplicateTransaction } from '@/lib/services/duplicate-detection-service';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function ImportTransactionView({ draftData, onConfirm, onCancel }) {
  const [duplicateState, setDuplicateState] = React.useState({
    isChecking: true,
    isDuplicate: false,
    existing: null,
  });

  React.useEffect(() => {
    let isMounted = true;
    async function runDuplicateCheck() {
      if (!draftData) return;
      const res = await checkDuplicateTransaction({
        amount: draftData.amount,
        date: draftData.transactionDate,
        title: draftData.title,
      });

      if (isMounted) {
        setDuplicateState({
          isChecking: false,
          isDuplicate: res.isDuplicate,
          existing: res.existingTransaction,
        });
      }
    }

    runDuplicateCheck();
    return () => {
      isMounted = false;
    };
  }, [draftData]);

  if (!draftData) return null;

  const { amount, title, transactionDate, paymentMethod, categorySuggestion, confidence } = draftData;

  return (
    <div className="rounded-card border border-border bg-card p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-heading">Extracted Transaction Review</h3>
            <p className="text-xs text-muted-foreground">
              Verify values parsed from your receipt before saving to Supabase.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-income-soft text-income px-3 py-1 text-xs font-bold border border-income-border">
          {draftData.source}
        </span>
      </div>

      {/* Duplicate Warning Alert */}
      {!duplicateState.isChecking && duplicateState.isDuplicate && (
        <div className="rounded-control border border-warning-border bg-warning-soft p-4 text-xs font-semibold text-warning space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4" /> Possible Duplicate Transaction Detected
          </div>
          <p>
            An existing transaction of {formatCurrency(duplicateState.existing.amount)} titled &quot;
            {duplicateState.existing.title}&quot; exists on {duplicateState.existing.transaction_date}.
          </p>
        </div>
      )}

      {/* Extracted Fields Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-control border border-border bg-muted/40 p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Amount
          </span>
          <p className="text-lg font-bold text-heading mt-0.5">
            {amount ? formatCurrency(amount) : 'Not detected'}
          </p>
          <span className="text-[10px] font-medium text-muted-foreground">
            Confidence: {confidence?.amount || 'MEDIUM'}
          </span>
        </div>

        <div className="rounded-control border border-border bg-muted/40 p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Merchant / Payee
          </span>
          <p className="text-sm font-bold text-heading mt-0.5 truncate">{title || 'Unknown'}</p>
          <span className="text-[10px] font-medium text-muted-foreground">
            Confidence: {confidence?.title || 'MEDIUM'}
          </span>
        </div>

        <div className="rounded-control border border-border bg-muted/40 p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Date
          </span>
          <p className="text-sm font-bold text-heading mt-0.5">{transactionDate || 'Today'}</p>
          <span className="text-[10px] font-medium text-muted-foreground">
            Confidence: {confidence?.date || 'MEDIUM'}
          </span>
        </div>

        <div className="rounded-control border border-border bg-muted/40 p-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Payment Method
          </span>
          <p className="text-sm font-bold text-heading mt-0.5">{paymentMethod || 'UPI'}</p>
        </div>

        <div className="rounded-control border border-border bg-muted/40 p-3 col-span-2 sm:col-span-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Suggested Category
          </span>
          <p className="text-sm font-bold text-primary mt-0.5">{categorySuggestion}</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card-hover p-2.5 rounded-control border border-border">
        <ShieldCheck className="h-4 w-4 text-income shrink-0" />
        <span>Receipt image has been processed locally in memory and destroyed. No image files are saved.</span>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Discard
        </Button>
        <Button onClick={() => onConfirm(draftData)} className="gap-2">
          <CheckCircle2 className="h-4 w-4" /> Edit &amp; Confirm Save
        </Button>
      </div>
    </div>
  );
}
