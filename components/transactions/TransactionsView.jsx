"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TransactionViewModal } from '@/components/transactions/TransactionViewModal';
import { Modal } from '@/components/ui/Modal';
import {
  deleteTransactionAction,
  bulkDeleteTransactionsAction,
} from '@/lib/actions/transaction-actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function TransactionsView({
  initialData,
  accounts = [],
  categories = [],
  currentFilters = {},
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from initialData
  const transactions = initialData.data || [];
  const total = initialData.total || 0;
  const page = currentFilters.page || 1;
  const pageSize = currentFilters.limit || 25;

  // Filter Form States
  const [searchQuery, setSearchQuery] = React.useState(currentFilters.search || '');
  const [selectedAccount, setSelectedAccount] = React.useState(currentFilters.accountId || 'ALL');
  const [selectedCategory, setSelectedCategory] = React.useState(currentFilters.categoryId || 'ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(currentFilters.paymentMethod || 'ALL');
  const [startDate, setStartDate] = React.useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = React.useState(currentFilters.endDate || '');
  const [sortOption, setSortOption] = React.useState(currentFilters.sort || 'date_desc');
  const [typeFilter, setTypeFilter] = React.useState(currentFilters.type || 'ALL');

  // Modals & Selection States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState(null);
  const [transactionToView, setTransactionToView] = React.useState(null);
  const [transactionToDeleteId, setTransactionToDeleteId] = React.useState(null);

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  // Sync state with URL params
  const updateURL = (overrides = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    const newPage = overrides.page !== undefined ? overrides.page : 1;
    const newPageSize = overrides.pageSize !== undefined ? overrides.pageSize : pageSize;
    const newSearch = overrides.search !== undefined ? overrides.search : searchQuery;
    const newType = overrides.type !== undefined ? overrides.type : typeFilter;
    const newAcc = overrides.account !== undefined ? overrides.account : selectedAccount;
    const newCat = overrides.category !== undefined ? overrides.category : selectedCategory;
    const newPm = overrides.paymentMethod !== undefined ? overrides.paymentMethod : selectedPaymentMethod;
    const newStart = overrides.startDate !== undefined ? overrides.startDate : startDate;
    const newEnd = overrides.endDate !== undefined ? overrides.endDate : endDate;
    const newSort = overrides.sort !== undefined ? overrides.sort : sortOption;

    params.set('page', String(newPage));
    params.set('pageSize', String(newPageSize));

    if (newSearch) params.set('search', newSearch);
    else params.delete('search');

    if (newType && newType !== 'ALL') params.set('type', newType);
    else params.delete('type');

    if (newAcc && newAcc !== 'ALL') params.set('account', newAcc);
    else params.delete('account');

    if (newCat && newCat !== 'ALL') params.set('category', newCat);
    else params.delete('category');

    if (newPm && newPm !== 'ALL') params.set('paymentMethod', newPm);
    else params.delete('paymentMethod');

    if (newStart) params.set('from', newStart);
    else params.delete('from');

    if (newEnd) params.set('to', newEnd);
    else params.delete('to');

    if (newSort && newSort !== 'date_desc') params.set('sort', newSort);
    else params.delete('sort');

    router.push(`/transactions?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateURL({ page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAccount('ALL');
    setSelectedCategory('ALL');
    setSelectedPaymentMethod('ALL');
    setStartDate('');
    setEndDate('');
    setSortOption('date_desc');
    setTypeFilter('ALL');
    router.push('/transactions');
  };

  // Bulk Selection Handlers
  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllPage = () => {
    const pageIds = transactions.map((t) => t.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!transactionToDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteTransactionAction(transactionToDeleteId);
      if (res.success) {
        setTransactionToDeleteId(null);
        setSelectedIds((prev) => prev.filter((id) => id !== transactionToDeleteId));
        router.refresh();
      }
    } catch (err) {
      console.error('[SINGLE_DELETE_ERROR]:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await bulkDeleteTransactionsAction(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('[BULK_DELETE_ERROR]:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const isAllPageSelected =
    transactions.length > 0 && transactions.every((t) => selectedIds.includes(t.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Transaction Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage high-volume financial transactions.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Primary Search & Quick Filters Bar */}
      <div className="rounded-card border border-border bg-card p-4 space-y-4 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, description, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" className="gap-1 text-xs">
              Search
            </Button>
          </form>

          {/* Type Segmented Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'EXPENSE', 'INCOME'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  updateURL({ type: t, page: 1 });
                }}
                className={cn(
                  'rounded-control px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0',
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-1.5 text-xs shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showAdvancedFilters ? 'Hide Filters' : 'Filter & Sort'}
          </Button>
        </div>

        {/* Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-border-subtle grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <label className="mb-1 block font-semibold text-foreground">Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  updateURL({ account: e.target.value, page: 1 });
                }}
                className="w-full rounded-control border border-input bg-card text-foreground p-2 outline-none"
              >
                <option value="ALL">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-foreground">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateURL({ category: e.target.value, page: 1 });
                }}
                className="w-full rounded-control border border-input bg-card text-foreground p-2 outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-foreground">Payment Method</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  updateURL({ paymentMethod: e.target.value, page: 1 });
                }}
                className="w-full rounded-control border border-input bg-card text-foreground p-2 outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="WALLET">Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-foreground">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  updateURL({ sort: e.target.value, page: 1 });
                }}
                className="w-full rounded-control border border-input bg-card text-foreground p-2 outline-none"
              >
                <option value="date_desc">Date: Newest First</option>
                <option value="date_asc">Date: Oldest First</option>
                <option value="amount_desc">Amount: High → Low</option>
                <option value="amount_asc">Amount: Low → High</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block font-semibold text-foreground">From Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    updateURL({ startDate: e.target.value, page: 1 });
                  }}
                  className="p-1.5 text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block font-semibold text-foreground">To Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    updateURL({ endDate: e.target.value, page: 1 });
                  }}
                  className="p-1.5 text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-end justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-card border border-primary-border bg-primary-soft p-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[11px]">
              {selectedIds.length}
            </span>
            <span>transactions selected on this page</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-8 text-xs"
            >
              Clear Selection
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="h-8 gap-1.5 text-xs bg-expense hover:bg-expense-soft text-expense-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Table Header Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllPageSelected}
            onChange={handleToggleSelectAllPage}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
          />
          <span className="font-semibold text-foreground">Select Page</span>
        </div>

        <span>
          Showing {transactions.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(page * pageSize, total)} of {total.toLocaleString('en-IN')} records
        </span>
      </div>

      {/* Transactions List / Empty State */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">No matching transactions found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Adjust your search terms or filters to locate records, or add a new transaction entry.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={handleResetFilters} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset Filters
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card overflow-hidden">
          {transactions.map((txn) => (
            <TransactionRow
              key={txn.id}
              transaction={txn}
              isSelected={selectedIds.includes(txn.id)}
              onToggleSelect={handleToggleSelectRow}
              onView={(t) => setTransactionToView(t)}
              onEdit={(t) => setTransactionToEdit(t)}
              onDelete={(id) => setTransactionToDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => updateURL({ pageSize: Number(e.target.value), page: 1 })}
            className="rounded-control border border-input bg-card text-foreground px-2 py-1 outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateURL({ page: page - 1 })}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <span className="text-xs font-semibold text-heading">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateURL({ page: page + 1 })}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || transactionToEdit) && (
        <TransactionModal
          isOpen={isAddModalOpen || Boolean(transactionToEdit)}
          onClose={() => {
            setIsAddModalOpen(false);
            setTransactionToEdit(null);
          }}
          accounts={accounts}
          categories={categories}
          transactionToEdit={transactionToEdit}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* View Details Modal */}
      {transactionToView && (
        <TransactionViewModal
          isOpen={Boolean(transactionToView)}
          onClose={() => setTransactionToView(null)}
          transaction={transactionToView}
          onEdit={(t) => setTransactionToEdit(t)}
          onDelete={(id) => setTransactionToDeleteId(id)}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      {transactionToDeleteId && (
        <Modal
          isOpen={Boolean(transactionToDeleteId)}
          onClose={() => setTransactionToDeleteId(null)}
          title="Delete Transaction?"
          description="This action will remove this transaction from your financial records and update related account calculations."
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setTransactionToDeleteId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="bg-expense hover:bg-expense-soft text-expense-foreground"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <Modal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          title={`Delete ${selectedIds.length} Transactions?`}
          description="This action will remove the selected transactions and recalculate account balances."
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              You are about to delete <strong>{selectedIds.length}</strong> selected transactions. This operation is permanent.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="bg-expense hover:bg-expense-soft text-expense-foreground"
              >
                {isDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Entries`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
