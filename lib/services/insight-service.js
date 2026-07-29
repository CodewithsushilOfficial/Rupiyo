import { createClient } from '@/lib/supabase/server';
import { generateNvidiaNimInsight } from '@/lib/ai/nvidia-adapter';

/**
 * Aggregates user financial metrics and invokes NVIDIA NIM AI to generate & store insights.
 */
export async function generateAndStoreUserInsight(userId) {
  const supabase = await createClient();

  // 1. Fetch current month's transactions
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, category:categories(name)')
    .eq('user_id', userId)
    .gte('transaction_date', startOfMonth);

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  (transactions || []).forEach((t) => {
    const amt = Number(t.amount || 0);
    if (t.type === 'INCOME') {
      totalIncome += amt;
    } else if (t.type === 'EXPENSE') {
      totalExpense += amt;
      const catName = t.category?.name || 'General';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + amt;
    }
  });

  // Find top category
  let topCategory = 'General';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // 2. Fetch over-budget categories
  const currentMonthStr = now.toISOString().substring(0, 7);
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_id, amount, category:categories(name)')
    .eq('user_id', userId)
    .eq('month_year', currentMonthStr);

  const overBudgetCategories = [];
  (budgets || []).forEach((b) => {
    if (b.category_id && b.category?.name) {
      const spent = categoryTotals[b.category.name] || 0;
      if (spent >= Number(b.amount || 0)) {
        overBudgetCategories.push(b.category.name);
      }
    }
  });

  // 3. Assemble telemetry
  const telemetry = {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    topCategory,
    topCategoryAmount,
    overBudgetCategories,
  };

  // 4. Call NVIDIA NIM AI Adapter
  const aiResult = await generateNvidiaNimInsight(telemetry);

  // 5. Store Insight into Supabase PostgreSQL
  const { data: insightRecord, error } = await supabase
    .from('insights')
    .insert({
      user_id: userId,
      title: aiResult.title,
      summary: aiResult.summary,
      type: aiResult.type,
      score: aiResult.score,
      recommendations: aiResult.recommendations,
      generated_by: aiResult.generatedBy,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to store insight record:', error);
  }

  return aiResult;
}
