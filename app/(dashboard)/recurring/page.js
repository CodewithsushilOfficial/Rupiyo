import { getRecurringRulesAction } from '@/lib/actions/recurring-actions';
import { getAccountsAction } from '@/lib/actions/account-actions';
import { getCategoriesAction } from '@/lib/actions/category-actions';
import { RecurringView } from '@/components/recurring/RecurringView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Recurring Transactions — Rupiyo',
  description: 'Automate salaries, rent, EMIs, and utility bill debits with execution engine.',
};

export default async function RecurringPage() {
  const [rulesResult, accountsResult, categoriesResult] = await Promise.all([
    getRecurringRulesAction(),
    getAccountsAction(),
    getCategoriesAction(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <RecurringView
        initialRules={rulesResult.data || []}
        accounts={accountsResult.data || []}
        categories={categoriesResult.data || []}
      />
    </div>
  );
}
