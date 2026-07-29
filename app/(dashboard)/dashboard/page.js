import { getDashboardSummaryAction } from '@/lib/actions/dashboard-actions';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { DashboardError } from '@/components/dashboard/DashboardError';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — Rupiyo',
  description: 'Smart Expense Tracker & Personal Finance Dashboard.',
};

export default async function DashboardPage() {
  const result = await getDashboardSummaryAction();

  let userData = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      userData = {
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
        email: profile?.email || user.email,
      };
    }
  } catch (err) {
    console.error('[DASHBOARD_PAGE_USER_ERR]:', err);
  }

  if (!result.success) {
    return <DashboardError message={result.error} />;
  }

  return <DashboardView dashboardData={result.data || {}} user={userData || {}} />;
}
