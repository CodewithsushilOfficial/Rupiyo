"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Updates user profile details in public.profiles table.
 */
export async function updateProfileAction(data) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        avatar_url: data.avatarUrl || null,
        is_onboarded: data.isOnboarded ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[UPDATE_PROFILE_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

/**
 * Updates user preferences in public.user_preferences table.
 */
export async function updatePreferencesAction(data) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        base_currency: data.baseCurrency || 'INR',
        currency_symbol: data.currencySymbol || '₹',
        timezone: data.timezone || 'Asia/Kolkata',
        theme: data.theme || 'light',
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('[UPDATE_PREFERENCES_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to update preferences' };
  }
}

/**
 * Completes the 4-step onboarding wizard by provisioning default accounts, preferences, and setting is_onboarded = true.
 */
export async function completeOnboardingAction(payload) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized session' };
    }

    // 1. Update Profile
    await supabase
      .from('profiles')
      .update({
        full_name: payload.fullName,
        is_onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 2. Update Preferences
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        base_currency: payload.baseCurrency || 'INR',
        currency_symbol: payload.currencySymbol || '₹',
        timezone: payload.timezone || 'Asia/Kolkata',
      });

    // 3. Create Primary Bank Account
    if (payload.bankAccountName) {
      await supabase.from('accounts').insert({
        user_id: user.id,
        name: payload.bankAccountName,
        type: 'BANK',
        opening_balance: payload.bankBalance || 0,
        current_balance: payload.bankBalance || 0,
        currency: payload.baseCurrency || 'INR',
      });
    }

    // 4. Create Cash Wallet Account
    if (payload.cashBalance > 0) {
      await supabase.from('accounts').insert({
        user_id: user.id,
        name: 'Cash Wallet',
        type: 'CASH',
        opening_balance: payload.cashBalance,
        current_balance: payload.cashBalance,
        currency: payload.baseCurrency || 'INR',
      });
    }

    // 5. Create Monthly Overall Budget if specified
    if (payload.monthlyBudget > 0) {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      await supabase.from('budgets').insert({
        user_id: user.id,
        category_id: null,
        amount: payload.monthlyBudget,
        month_year: currentMonth,
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[COMPLETE_ONBOARDING_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to complete onboarding' };
  }
}
