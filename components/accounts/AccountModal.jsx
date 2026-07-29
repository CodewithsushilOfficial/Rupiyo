"use client";

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createAccountAction, updateAccountAction } from '@/lib/actions/account-actions';

export function AccountModal({ isOpen, onClose, accountToEdit = null, onSuccess }) {
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'BANK',
    openingBalance: '0',
    description: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [prevProps, setPrevProps] = React.useState({ accountToEdit, isOpen });

  if (prevProps.accountToEdit !== accountToEdit || prevProps.isOpen !== isOpen) {
    setPrevProps({ accountToEdit, isOpen });
    if (isOpen) {
      setFormData(
        accountToEdit
          ? {
              name: accountToEdit.name || '',
              type: accountToEdit.type || 'BANK',
              openingBalance: String(accountToEdit.opening_balance || '0'),
              description: accountToEdit.description || '',
            }
          : {
              name: '',
              type: 'BANK',
              openingBalance: '0',
              description: '',
            }
      );
      setErrorMsg('');
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Account name is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        description: formData.description,
      };

      let res;
      if (accountToEdit) {
        res = await updateAccountAction(accountToEdit.id, payload);
      } else {
        res = await createAccountAction(payload);
      }

      if (!res.success) {
        throw new Error(res.error);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('[ACCOUNT_MODAL_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to save account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account' : 'Add New Account'}
      description="Link a cash wallet, bank account, UPI, or credit card."
    >
      {errorMsg && (
        <div className="mb-4 rounded-control border border-expense-border bg-expense-soft p-3 text-xs font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Account Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. HDFC Salary Account, Cash Wallet"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Account Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="BANK">Bank Account</option>
            <option value="CASH">Cash Wallet</option>
            <option value="UPI">UPI App / ID</option>
            <option value="WALLET">Digital Wallet (Paytm/Amazon)</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="OTHER">Other Financial Account</option>
          </select>
        </div>

        {!accountToEdit && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground">
              Opening Balance (₹)
            </label>
            <Input
              name="openingBalance"
              type="number"
              value={formData.openingBalance}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Description (Optional)
          </label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Main salary deposit account"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : accountToEdit ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
