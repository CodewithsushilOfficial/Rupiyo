"use server";

import { createClient } from '@/lib/supabase/server';
import { processDueRecurringTransactions } from '@/lib/services/recurring-engine';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const recurringSchema = z.object({
  accountId: z.string().uuid('Please select an account'),
  categoryId: z.string().uuid('Please select a category'),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be greater than zero'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.string().default('UPI'),
  description: z.string().optional(),
});

/**
 * Creates a new recurring transaction rule.
 */
export async function createRecurringRuleAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized session' };
    }

    const validated = recurringSchema.parse(formData);

    const { data: rule, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        account_id: validated.accountId,
        category_id: validated.categoryId,
        type: validated.type,
        amount: validated.amount,
        frequency: validated.frequency,
        start_date: validated.startDate,
        next_date: validated.startDate,
        status: 'ACTIVE',
        payment_method: validated.paymentMethod,
        description: validated.description || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath('/recurring');
    revalidatePath('/dashboard');
    return { success: true, data: rule };
  } catch (err) {
    console.error('[CREATE_RECURRING_RULE_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to create recurring rule' };
  }
}

/**
 * Retrieves all recurring rules for the authenticated user.
 */
export async function getRecurringRulesAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: rules, error } = await supabase
      .from('recurring_transactions')
      .select('*, account:accounts(name), category:categories(name, icon_name, color_hex)')
      .eq('user_id', user.id)
      .order('next_date', { ascending: true });

    if (error) {
      throw error;
    }

    return { success: true, data: rules || [] };
  } catch (err) {
    console.error('[GET_RECURRING_RULES_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Toggles a recurring rule between ACTIVE and PAUSED status.
 */
export async function toggleRecurringRuleStatusAction(ruleId, currentStatus) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    const { error } = await supabase
      .from('recurring_transactions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ruleId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/recurring');
    return { success: true };
  } catch (err) {
    console.error('[TOGGLE_RECURRING_RULE_ERROR]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Triggers execution engine for due recurring rules.
 */
export async function triggerRecurringExecutionAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await processDueRecurringTransactions(user.id);

    revalidatePath('/recurring');
    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true, processedCount: result.processedCount };
  } catch (err) {
    console.error('[TRIGGER_RECURRING_ERROR]:', err);
    return { success: false, error: err.message };
  }
}
