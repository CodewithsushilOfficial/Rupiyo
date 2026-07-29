"use client";

import * as React from 'react';
import Link from 'next/link';
import { formatCurrency, formatTransactionDate } from '@/lib/utils/formatters';
import {
  Utensils,
  WalletCards,
  ShoppingBag,
  Zap,
  CarFront,
  HeartPulse,
  GraduationCap,
  Clapperboard,
  Laptop,
  Tag,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ICON_MAP = {
  Utensils, utensils: Utensils,
  WalletCards, walletcards: WalletCards,
  ShoppingBag, 'shopping-bag': ShoppingBag, shoppingbag: ShoppingBag,
  Zap, zap: Zap,
  CarFront, car: CarFront, carfront: CarFront,
  HeartPulse, 'heart-pulse': HeartPulse, heartpulse: HeartPulse,
  GraduationCap, graduationcap: GraduationCap,
  Clapperboard, clapperboard: Clapperboard,
  Laptop, laptop: Laptop,
  Tag, tag: Tag,
  MoreHorizontal, 'more-horizontal': MoreHorizontal,
};

function TransactionRow({ transaction }) {
  const {
    title,
    type,
    category = {},
    amount,
    transaction_date,
  } = transaction;

  const isIncome = type === 'INCOME';
  const IconComponent = ICON_MAP[category.icon_name] || Tag;

  return (
    <div className="flex items-center justify-between py-3 rounded-sm transition-colors">
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary shrink-0"
          style={category.color_hex ? { backgroundColor: category.color_hex, color: '#FFFFFF' } : undefined}
        >
          <IconComponent className="h-4.5 w-4.5" />
        </div>

        <div>
          <p className="text-[14px] font-semibold leading-tight text-heading">
            {title}
          </p>
          <p className="text-[12px] mt-0.5 text-muted-foreground">
            {category.name || 'General'}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn('text-[14px] font-bold leading-tight', isIncome ? 'text-income' : 'text-expense')}>
          {isIncome ? '+ ' : '- '}
          {formatCurrency(amount)}
        </p>
        <p className="text-[12px] mt-0.5 text-muted-foreground">
          {formatTransactionDate(transaction_date)}
        </p>
      </div>
    </div>
  );
}

export function RecentTransactionsCard({ transactions = [] }) {
  return (
    <div className="rounded-card bg-card text-card-foreground border border-border shadow-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h3 className="text-[17px] font-bold text-heading">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Transaction list */}
      <div className="flex-1 px-6 pb-5">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[14px] font-semibold text-foreground">
              No transactions yet
            </p>
            <p className="text-[12px] mt-1 max-w-55 text-muted-foreground">
              Add your first income or expense to start tracking your finances.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {transactions.slice(0, 5).map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
