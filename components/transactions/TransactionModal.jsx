"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createTransactionAction, updateTransactionAction } from '@/lib/actions/transaction-actions';
import { cn } from '@/lib/utils/cn';

export function TransactionModal({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  transactionToEdit = null,
  initialData = null,
  onSuccess,
}) {
  const isEditing = Boolean(transactionToEdit);

  const [formData, setFormData] = React.useState({
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    categoryId: '',
    paymentMethod: 'UPI',
    transactionDate: new Date().toISOString().substring(0, 10),
    description: '',
    notes: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevProps, setPrevProps] = React.useState({ isOpen, transactionToEdit, initialData, accounts, categories });

  if (
    prevProps.isOpen !== isOpen ||
    prevProps.transactionToEdit !== transactionToEdit ||
    prevProps.initialData !== initialData ||
    prevProps.accounts !== accounts ||
    prevProps.categories !== categories
  ) {
    setPrevProps({ isOpen, transactionToEdit, initialData, accounts, categories });
    if (isOpen) {
      if (transactionToEdit) {
        setFormData({
          type: transactionToEdit.type || 'EXPENSE',
          amount: String(transactionToEdit.amount || ''),
          accountId: transactionToEdit.account_id || accounts[0]?.id || '',
          categoryId: transactionToEdit.category_id || categories[0]?.id || '',
          paymentMethod: transactionToEdit.payment_method || 'UPI',
          transactionDate: transactionToEdit.transaction_date || new Date().toISOString().substring(0, 10),
          description: transactionToEdit.description || '',
          notes: transactionToEdit.notes || '',
        });
      } else if (initialData) {
        setFormData({
          type: initialData.type || 'EXPENSE',
          amount: String(initialData.amount || ''),
          accountId: accounts[0]?.id || '',
          categoryId: categories.filter((c) => c.type === (initialData.type || 'EXPENSE'))[0]?.id || categories[0]?.id || '',
          paymentMethod: initialData.payment_method || 'UPI',
          transactionDate: initialData.transaction_date || new Date().toISOString().substring(0, 10),
          description: initialData.title || initialData.description || '',
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          type: 'EXPENSE',
          amount: '',
          accountId: accounts[0]?.id || '',
          categoryId: categories.filter((c) => c.type === 'EXPENSE')[0]?.id || categories[0]?.id || '',
          paymentMethod: 'UPI',
          transactionDate: new Date().toISOString().substring(0, 10),
          description: '',
          notes: '',
        });
      }
      setErrorMsg('');
    }
  }

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (newType) => {
    const matchingCats = categories.filter((c) => c.type === newType);
    setFormData({
      ...formData,
      type: newType,
      categoryId: matchingCats[0]?.id || '',
    });
  };

  const handleSetQuickDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setFormData({ ...formData, transactionDate: d.toISOString().substring(0, 10) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid positive amount');
      return;
    }
    if (!formData.accountId) {
      setErrorMsg('Please select an account');
      return;
    }
    if (!formData.categoryId) {
      setErrorMsg('Please select a category');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        accountId: formData.accountId,
        categoryId: formData.categoryId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionDate: formData.transactionDate,
        description: formData.description,
        notes: formData.notes,
      };

      let res;
      if (isEditing) {
        res = await updateTransactionAction(transactionToEdit.id, payload);
      } else {
        res = await createTransactionAction(payload);
      }

      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[TRANSACTION_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record Transaction'}
      description={isEditing ? 'Modify transaction fields and update account balances.' : 'Log an income received or expense paid.'}
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Segmented Toggle */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={cn(
                'rounded-control border p-2.5 text-xs font-bold transition-all cursor-pointer',
                formData.type === 'EXPENSE'
                  ? 'border-expense-border bg-expense-soft text-expense'
                  : 'border-input bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              EXPENSE (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={cn(
                'rounded-control border p-2.5 text-xs font-bold transition-all cursor-pointer',
                formData.type === 'INCOME'
                  ? 'border-income-border bg-income-soft text-income'
                  : 'border-input bg-card text-muted-foreground hover:bg-muted'
              )}
            >
              INCOME (+)
            </button>
          </div>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Amount (₹)
            </label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-foreground">Date</label>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSetQuickDate(0)}
                  className="text-primary hover:underline"
                >
                  Today
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate(1)}
                  className="text-primary hover:underline"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <Input
              name="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Account & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Account
            </label>
            <select
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (₹{Number(acc.current_balance || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="BANK_TRANSFER">Bank NetBanking / Transfer</option>
            <option value="WALLET">Digital Wallet</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Description / Title */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Transaction Title / Description
          </label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Swiggy Lunch, Grocery Store, Monthly Salary"
            disabled={isLoading}
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Notes (Optional)
          </label>
          <Input
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Bill split with friends, Tax deductible expense"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
