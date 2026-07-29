"use server";

import { createClient } from '@/lib/supabase/server';

/**
 * Retrieves aggregated financial analytics for charts and reporting.
 */
export async function getAnalyticsDataAction(monthsCount = 6) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Calculate Start Date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsCount - 1));
    startDate.setDate(1);

    const startDateStr = startDate.toISOString().substring(0, 10);

    // 2. Fetch all transactions in period
    const { data: transactions, error: txnErr } = await supabase
      .from('transactions')
      .select('amount, type, transaction_date, category:categories(id, name, color_hex)')
      .eq('user_id', user.id)
      .gte('transaction_date', startDateStr)
      .order('transaction_date', { ascending: true });

    if (txnErr) {
      throw txnErr;
    }

    // 3. Aggregate Monthly Cash Flow (Income vs Expense)
    const monthlyMap = {};
    const categoryExpenseMap = {};

    // Initialize month slots
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { month: key, income: 0, expense: 0, net: 0 };
    }

    let totalIncome = 0;
    let totalExpense = 0;

    (transactions || []).forEach((t) => {
      const amt = Number(t.amount || 0);
      const dateObj = new Date(t.transaction_date);
      const monthKey = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (t.type === 'INCOME') {
        totalIncome += amt;
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].income += amt;
          monthlyMap[monthKey].net += amt;
        }
      } else if (t.type === 'EXPENSE') {
        totalExpense += amt;
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].expense += amt;
          monthlyMap[monthKey].net -= amt;
        }

        // Category breakdown
        const catName = t.category?.name || 'Uncategorized';
        const catColor = t.category?.color_hex || '#64748B';
        if (!categoryExpenseMap[catName]) {
          categoryExpenseMap[catName] = { name: catName, value: 0, color: catColor };
        }
        categoryExpenseMap[catName].value += amt;
      }
    });

    const monthlyTrends = Object.values(monthlyMap);
    const categoryBreakdown = Object.values(categoryExpenseMap).sort(
      (a, b) => b.value - a.value
    );

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    return {
      success: true,
      data: {
        monthlyTrends,
        categoryBreakdown,
        summary: {
          totalIncome,
          totalExpense,
          netSavings,
          savingsRate: Math.max(0, savingsRate),
          monthsCount,
        },
      },
    };
  } catch (err) {
    console.error('[GET_ANALYTICS_ERROR]:', err);
    return { success: false, error: err.message };
  }
}
