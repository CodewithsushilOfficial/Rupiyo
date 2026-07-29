import { getAccountsAction } from '@/lib/actions/account-actions';
import { ReportsView } from '@/components/reports/ReportsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reports & Export — Rupiyo',
  description: 'Download CSV spreadsheets and JSON data dumps of your transaction ledger.',
};

export default async function ReportsPage() {
  const accountsResult = await getAccountsAction();

  return (
    <div className="p-6 lg:p-8">
      <ReportsView accounts={accountsResult.data || []} />
    </div>
  );
}
