"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const budgetSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  amount: z.number().positive('Budget cap must be greater than zero'),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
});

/**
 * Upserts a monthly category or overall budget configuration.
 */
export async function upsertBudgetAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const validated = budgetSchema.parse(formData);

    const { data: budget, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          category_id: validated.categoryId || null,
          amount: validated.amount,
          month_year: validated.monthYear,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, category_id, month_year' }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true, data: budget };
  } catch (err) {
    console.error('[UPSERT_BUDGET_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to save budget cap' };
  }
}

/**
 * Retrieves budgets for a specified month along with calculated spent amounts.
 */
export async function getBudgetsAction(monthYear = null) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const targetMonth = monthYear || new Date().toISOString().substring(0, 7);
    const startDate = `${targetMonth}-01`;

    // Calculate last day of target month
    const [year, month] = targetMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;

    // 1. Query Budgets for month
    const { data: budgets, error: budError } = await supabase
      .from('budgets')
      .select('*, category:categories(id, name, icon_name, color_hex)')
      .eq('user_id', user.id)
      .eq('month_year', targetMonth);

    if (budError) {
      throw budError;
    }

    // 2. Query Expense Transactions in month
    const { data: expenses, error: expError } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'EXPENSE')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (expError) {
      throw expError;
    }

    // 3. Map spending by category ID
    const spentByCategory = {};
    let totalSpentInMonth = 0;

    (expenses || []).forEach((exp) => {
      const amt = Number(exp.amount || 0);
      totalSpentInMonth += amt;
      spentByCategory[exp.category_id] = (spentByCategory[exp.category_id] || 0) + amt;
    });

    // 4. Enrich budgets with calculated spent and status percentages
    const enrichedBudgets = (budgets || []).map((b) => {
      const spent = b.category_id ? spentByCategory[b.category_id] || 0 : totalSpentInMonth;
      const budgetAmount = Number(b.amount || 0);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      let status = 'HEALTHY'; // < 50%
      if (percentage >= 100) status = 'OVER_BUDGET';
      else if (percentage >= 80) status = 'WARNING';
      else if (percentage >= 50) status = 'MODERATE';

      return {
        ...b,
        spent,
        remaining: Math.max(0, budgetAmount - spent),
        percentage: Math.round(percentage * 10) / 10,
        status,
      };
    });

    return { success: true, data: enrichedBudgets, monthYear: targetMonth };
  } catch (err) {
    console.error('[GET_BUDGETS_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Deletes a budget configuration.
 */
export async function deleteBudgetAction(budgetId) {
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
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[DELETE_BUDGET_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to delete budget' };
  }
}
