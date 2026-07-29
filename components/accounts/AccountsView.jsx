"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AccountsHeader } from '@/components/accounts/AccountsHeader';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountModal } from '@/components/accounts/AccountModal';
import { archiveAccountAction } from '@/lib/actions/account-actions';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AccountsView({ initialAccounts = [] }) {
  const router = useRouter();
  const [archivedIds, setArchivedIds] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [accountToEdit, setAccountToEdit] = React.useState(null);

  const accounts = initialAccounts.filter((a) => !archivedIds.includes(a.id));

  const handleAddAccount = () => {
    setAccountToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleArchiveAccount = async (accountId) => {
    if (confirm('Are you sure you want to archive this account? Historical transactions will be preserved.')) {
      const res = await archiveAccountAction(accountId);
      if (res.success) {
        setArchivedIds((prev) => [...prev, accountId]);
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-8">
      <AccountsHeader accounts={accounts} onAddAccount={handleAddAccount} />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">No active accounts</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Get started by adding your cash wallet, bank account, or credit card.
          </p>
          <Button onClick={handleAddAccount} className="mt-6">
            Add First Account
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEditAccount}
              onArchive={handleArchiveAccount}
            />
          ))}
        </div>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountToEdit={accountToEdit}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
