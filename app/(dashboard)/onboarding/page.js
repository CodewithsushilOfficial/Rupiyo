import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Setup Workspace — Rupiyo',
  description: 'Complete your initial profile, default accounts, and currency settings.',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if profile is already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarded')
    .eq('id', user.id)
    .single();

  if (profile?.is_onboarded) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xl">
          ₹
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">Rupiyo</span>
      </div>

      <OnboardingWizard initialUser={user} />
    </div>
  );
}
