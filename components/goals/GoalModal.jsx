"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createGoalAction } from '@/lib/actions/goal-actions';

export function GoalModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = React.useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    description: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormData({
        title: '',
        targetAmount: '',
        targetDate: '',
        description: '',
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

    if (!formData.title.trim()) {
      setErrorMsg('Goal title is required');
      return;
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      setErrorMsg('Please enter a valid target amount');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate || null,
        description: formData.description,
      };

      const res = await createGoalAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[GOAL_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Savings Milestone Goal"
      description="Set a target financial goal for emergency funds, vacations, or down-payments."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Goal Title
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Emergency Fund, Laptop Upgrade, Home Down-Payment"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Target Amount (₹)
            </label>
            <Input
              name="targetAmount"
              type="number"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="100000"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Target Date (Optional)
            </label>
            <Input
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Description (Optional)
          </label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Save 6 months of living expenses"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
