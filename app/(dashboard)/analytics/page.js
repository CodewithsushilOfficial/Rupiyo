import { getAnalyticsDataAction } from '@/lib/actions/analytics-actions';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Financial Analytics — Rupiyo',
  description: 'Recharts visual analytics, cash flow trends, and expense distribution.',
};

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const monthsCount = parseInt(params?.months || '6', 10);

  const analyticsResult = await getAnalyticsDataAction(monthsCount);

  return (
    <div className="p-6 lg:p-8">
      <AnalyticsView
        analyticsData={analyticsResult.data || {}}
        currentMonths={monthsCount}
      />
    </div>
  );
}
