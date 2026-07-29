"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addGoalContributionAction } from '@/lib/actions/goal-actions';

export function ContributionModal({ isOpen, onClose, goal, accounts = [], onSuccess }) {
  const [formData, setFormData] = React.useState({
    accountId: '',
    amount: '',
    notes: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevProps, setPrevProps] = React.useState({ isOpen, accounts });

  if (prevProps.isOpen !== isOpen || prevProps.accounts !== accounts) {
    setPrevProps({ isOpen, accounts });
    if (isOpen) {
      setFormData({
        accountId: accounts[0]?.id || '',
        amount: '',
        notes: '',
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

    if (!formData.accountId) {
      setErrorMsg('Please select a source account');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid deposit amount');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        goalId: goal.id,
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      };

      const res = await addGoalContributionAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[CONTRIBUTION_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to record deposit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deposit into ${goal?.title || 'Goal'}`}
      description="Transfer funds from an active account into your savings goal."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Source Account
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
                {acc.name} (Balance: ₹{acc.current_balance})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Deposit Amount (₹)
          </label>
          <Input
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="5000"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Notes (Optional)
          </label>
          <Input
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Monthly allocation from salary"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Deposit Funds'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
