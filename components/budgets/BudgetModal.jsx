"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { upsertBudgetAction } from '@/lib/actions/budget-actions';

export function BudgetModal({ isOpen, onClose, categories = [], currentMonth, onSuccess }) {
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const [formData, setFormData] = React.useState({
    categoryId: 'OVERALL',
    amount: '',
    monthYear: currentMonth || new Date().toISOString().substring(0, 7),
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevProps, setPrevProps] = React.useState({ isOpen, currentMonth });

  if (prevProps.isOpen !== isOpen || prevProps.currentMonth !== currentMonth) {
    setPrevProps({ isOpen, currentMonth });
    if (isOpen) {
      setFormData({
        categoryId: 'OVERALL',
        amount: '',
        monthYear: currentMonth || new Date().toISOString().substring(0, 7),
      });
      setErrorMsg('');
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid positive budget amount');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        categoryId: formData.categoryId === 'OVERALL' ? null : formData.categoryId,
        amount: parseFloat(formData.amount),
        monthYear: formData.monthYear,
      };

      const res = await upsertBudgetAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[BUDGET_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Budget Limit"
      description="Define spending caps for categories or set an overall monthly budget."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Target Month
          </label>
          <Input
            name="monthYear"
            type="month"
            value={formData.monthYear}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Budget Scope
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="OVERALL">Overall Monthly Budget (All Expenses)</option>
            <optgroup label="Expense Categories">
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Budget Cap (₹)
          </label>
          <Input
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 15000"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Set Budget Cap'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
