"use server";

import { createClient } from '@/lib/supabase/server';
import { generateAndStoreUserInsight } from '@/lib/services/insight-service';
import { revalidatePath } from 'next/cache';

/**
 * Triggers AI Insight Generation via NVIDIA NIM API.
 */
export async function generateInsightAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized session' };
    }

    const result = await generateAndStoreUserInsight(user.id);

    revalidatePath('/insights');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (err) {
    console.error('[GENERATE_INSIGHT_ACTION_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to generate AI insight' };
  }
}

/**
 * Retrieves historical insights generated for the user.
 */
export async function getInsightsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: insights, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data: insights || [] };
  } catch (err) {
    console.error('[GET_INSIGHTS_ACTION_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}
