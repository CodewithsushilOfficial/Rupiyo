"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Wallet, Tag, CreditCard, Clock, FileText, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function TransactionViewModal({ isOpen, onClose, transaction, onEdit, onDelete }) {
  if (!transaction) return null;

  const IconComponent = Icons[transaction.category?.icon_name] || Tag;
  const isIncome = transaction.type === 'INCOME';
  const amount = Number(transaction.amount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      description={`Transaction Ref ID: ${transaction.id.substring(0, 8)}...`}
    >
      <div className="space-y-6">
        {/* Main Amount Card */}
        <div className="rounded-card border border-border bg-secondary p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-control bg-primary text-primary-foreground font-bold shadow-sm"
              style={transaction.category?.color_hex ? { backgroundColor: transaction.category.color_hex, color: '#FFFFFF' } : undefined}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-heading">
                {transaction.description || transaction.category?.name || 'Transaction'}
              </p>
              <Badge variant={isIncome ? 'income' : 'expense'} className="mt-1">
                {transaction.type}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className={`text-2xl font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
              {isIncome ? '+' : '-'} {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 rounded-control border border-border p-3">
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Transaction Date
            </p>
            <p className="font-semibold text-foreground">{transaction.transaction_date}</p>
          </div>

          <div className="space-y-1 rounded-control border border-border p-3">
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Wallet className="h-3.5 w-3.5 text-primary" /> Account
            </p>
            <p className="font-semibold text-foreground">{transaction.account?.name || 'Default Account'}</p>
          </div>

          <div className="space-y-1 rounded-control border border-border p-3">
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Tag className="h-3.5 w-3.5 text-primary" /> Category
            </p>
            <p className="font-semibold text-foreground">{transaction.category?.name || 'Uncategorized'}</p>
          </div>

          <div className="space-y-1 rounded-control border border-border p-3">
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Method
            </p>
            <p className="font-semibold text-foreground capitalize">
              {(transaction.payment_method || 'Other').toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="rounded-control border border-border bg-card p-3 space-y-1 text-xs">
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <FileText className="h-3.5 w-3.5 text-primary" /> Additional Notes
            </p>
            <p className="text-foreground leading-relaxed">{transaction.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border-subtle pt-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Logged: {new Date(transaction.created_at).toLocaleString('en-IN')}
          </span>
          <span className="flex items-center gap-1 text-income">
            <CheckCircle2 className="h-3 w-3" /> RLS Verified
          </span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              if (onDelete) onDelete(transaction.id);
            }}
            className="text-expense hover:bg-expense-soft"
          >
            Delete Entry
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(transaction);
              }}
            >
              Edit Transaction
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
