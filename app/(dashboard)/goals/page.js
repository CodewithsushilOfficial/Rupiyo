import { getGoalsAction } from '@/lib/actions/goal-actions';
import { getAccountsAction } from '@/lib/actions/account-actions';
import { GoalsView } from '@/components/goals/GoalsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Savings Goals — Rupiyo',
  description: 'Track milestones, target dates, and dedicated savings deposit history.',
};

export default async function GoalsPage() {
  const [goalsResult, accountsResult] = await Promise.all([
    getGoalsAction(),
    getAccountsAction(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <GoalsView
        initialGoals={goalsResult.data || []}
        accounts={accountsResult.data || []}
      />
    </div>
  );
}
