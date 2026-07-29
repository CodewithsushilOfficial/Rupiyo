"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const goalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be greater than zero'),
  targetDate: z.string().optional(),
});

const contributionSchema = z.object({
  goalId: z.string().uuid('Invalid goal selection'),
  accountId: z.string().uuid('Please select source bank account'),
  amount: z.number().positive('Contribution amount must be greater than zero'),
  notes: z.string().optional(),
});

/**
 * Creates a new savings milestone goal.
 */
export async function createGoalAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const validated = goalSchema.parse(formData);

    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: validated.title,
        description: validated.description || null,
        target_amount: validated.targetAmount,
        current_amount: 0,
        target_date: validated.targetDate || null,
        status: 'IN_PROGRESS',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true, data: goal };
  } catch (err) {
    console.error('[CREATE_GOAL_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to create goal' };
  }
}

/**
 * Retrieves all goals for the authenticated user.
 */
export async function getGoalsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select('*, goal_contributions(*, account:accounts(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data: goals || [] };
  } catch (err) {
    console.error('[GET_GOALS_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Adds a savings deposit contribution to a goal and deducts funds from specified account.
 */
export async function addGoalContributionAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = contributionSchema.parse(formData);

    // 1. Check source account balance
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('id, current_balance')
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .single();

    if (accError || !account) {
      return { success: false, error: 'Source account not found' };
    }

    const accBalance = Number(account.current_balance || 0);
    if (accBalance < validated.amount) {
      return { success: false, error: 'Insufficient account balance for this deposit' };
    }

    // 2. Fetch Goal
    const { data: goal, error: goalErr } = await supabase
      .from('goals')
      .select('*')
      .eq('id', validated.goalId)
      .eq('user_id', user.id)
      .single();

    if (goalErr || !goal) {
      return { success: false, error: 'Target goal not found' };
    }

    // 3. Deduct from source account
    await supabase
      .from('accounts')
      .update({
        current_balance: accBalance - validated.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    // 4. Update Goal current_amount
    const newSaved = Number(goal.current_amount || 0) + validated.amount;
    const targetAmt = Number(goal.target_amount || 0);
    const newStatus = newSaved >= targetAmt ? 'COMPLETED' : 'IN_PROGRESS';

    await supabase
      .from('goals')
      .update({
        current_amount: newSaved,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal.id);

    // 5. Insert Goal Contribution record
    await supabase.from('goal_contributions').insert({
      goal_id: goal.id,
      account_id: account.id,
      amount: validated.amount,
      contribution_date: new Date().toISOString().substring(0, 10),
      notes: validated.notes || null,
    });

    revalidatePath('/goals');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[ADD_GOAL_CONTRIBUTION_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to record deposit' };
  }
}

/**
 * Deletes a goal.
 */
export async function deleteGoalAction(goalId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/goals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[DELETE_GOAL_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to delete goal' };
  }
}
