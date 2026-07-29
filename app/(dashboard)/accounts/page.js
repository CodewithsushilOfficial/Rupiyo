import { getAccountsAction } from '@/lib/actions/account-actions';
import { AccountsView } from '@/components/accounts/AccountsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accounts & Wealth — Rupiyo',
  description: 'Manage your liquid bank deposits, credit cards, UPI wallets, and cash reserves.',
};

export default async function AccountsPage() {
  const result = await getAccountsAction();
  const accounts = result.data || [];

  return (
    <div className="p-6 lg:p-8">
      <AccountsView initialAccounts={accounts} />
    </div>
  );
}
