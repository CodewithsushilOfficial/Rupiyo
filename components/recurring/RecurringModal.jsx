"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createRecurringRuleAction } from '@/lib/actions/recurring-actions';
import { cn } from '@/lib/utils/cn';

export function RecurringModal({ isOpen, onClose, accounts = [], categories = [], onSuccess }) {
  const [formData, setFormData] = React.useState({
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    categoryId: '',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().substring(0, 10),
    paymentMethod: 'UPI',
    description: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevProps, setPrevProps] = React.useState({ isOpen, accounts, categories });

  if (prevProps.isOpen !== isOpen || prevProps.accounts !== accounts || prevProps.categories !== categories) {
    setPrevProps({ isOpen, accounts, categories });
    if (isOpen) {
      setFormData({
        type: 'EXPENSE',
        amount: '',
        accountId: accounts[0]?.id || '',
        categoryId: categories[0]?.id || '',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().substring(0, 10),
        paymentMethod: 'UPI',
        description: '',
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
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
        frequency: formData.frequency,
        startDate: formData.startDate,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
      };

      const res = await createRecurringRuleAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[RECURRING_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to create recurring rule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recurring Rule"
      description="Automate salaries, house rent, Netflix, EMIs, or utility bill processing."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Rule Type
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
              RECURRING EXPENSE (-)
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
              RECURRING INCOME (+)
            </button>
          </div>
        </div>

        {/* Amount & Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Amount (₹)
            </label>
            <Input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="15000"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Frequency
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
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
                  {acc.name}
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

        {/* First Execution Date */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            First Execution Date
          </label>
          <Input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Description
          </label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Apartment Rent, Monthly Salary Credit, Netflix"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Recurring Rule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
