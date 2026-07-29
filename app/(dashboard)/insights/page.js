import { getInsightsAction } from '@/lib/actions/insight-actions';
import { InsightsView } from '@/components/insights/InsightsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'NVIDIA NIM AI Insights — Rupiyo',
  description: 'AI-powered financial health score, anomaly warnings, and savings recommendations.',
};

export default async function InsightsPage() {
  const insightsResult = await getInsightsAction();

  return (
    <div className="p-6 lg:p-8">
      <InsightsView initialInsights={insightsResult.data || []} />
    </div>
  );
}
