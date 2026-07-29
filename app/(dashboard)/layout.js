import { DashboardShell } from '@/components/layout/DashboardShell';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }) {
  let userData = null;
  let accounts = [];
  let categories = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', user.id)
        .maybeSingle();

      userData = {
        id: user.id,
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
        email: profile?.email || user.email,
        avatar_url: profile?.avatar_url || null,
        plan: 'Free',
      };

      const [{ data: accs }, { data: cats }] = await Promise.all([
        supabase.from('accounts').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      accounts = accs || [];
      categories = cats || [];
    }
  } catch (err) {
    console.error('[DASHBOARD_LAYOUT_AUTH_ERROR]:', err);
  }

  return (
    <DashboardShell user={userData || {}} accounts={accounts} categories={categories}>
      {children}
    </DashboardShell>
  );
}
