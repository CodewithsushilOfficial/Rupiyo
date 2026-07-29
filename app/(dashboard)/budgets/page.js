import { getBudgetsAction } from '@/lib/actions/budget-actions';
import { getCategoriesAction } from '@/lib/actions/category-actions';
import { BudgetsView } from '@/components/budgets/BudgetsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Budget Management — Rupiyo',
  description: 'Track monthly category expenditure limits and threshold warning alerts.',
};

export default async function BudgetsPage({ searchParams }) {
  const params = await searchParams;
  const currentMonth = params?.month || new Date().toISOString().substring(0, 7);

  const [budgetsResult, categoriesResult] = await Promise.all([
    getBudgetsAction(currentMonth),
    getCategoriesAction(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <BudgetsView
        initialBudgets={budgetsResult.data || []}
        categories={categoriesResult.data || []}
        currentMonth={currentMonth}
      />
    </div>
  );
}
