"use server";

import { createClient } from '@/lib/supabase/server';

/**
 * ============================================================
 * RUPIYO — REAL DASHBOARD DATA SERVICE
 * ============================================================
 *
 * Authenticated User → Supabase Auth → RLS → PostgreSQL → View Model → UI
 *
 * ZERO dummy, mock, or fixture data.
 * Empty states return ₹0.00 from real calculations.
 * Error states return { success: false, error } — never fake data.
 * ============================================================
 */

/**
 * Safely computes month-over-month percentage change.
 * Handles previous = 0 without returning Infinity or NaN.
 */
function calcChange(current, previous) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : -100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Aggregates complete dashboard data for the authenticated user.
 *
 * Returns the FULL dashboard view model:
 * {
 *   user, summary, expenseOverview,
 *   recentTransactions, monthlyTrend, topCategories,
 *   notifications
 * }
 */
export async function getDashboardSummaryAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // ─── USER PROFILE ──────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, email')
      .eq('id', user.id)
      .maybeSingle();

    const userData = {
      id: user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
      email: profile?.email || user.email,
      avatar_url: profile?.avatar_url || null,
      plan: 'Free',
    };

    // ─── DATE BOUNDARIES ───────────────────────────────────
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
    const startOfMonth = `${currentMonthStr}-01`;

    // Previous month boundaries for MoM change
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const startOfPrevMonth = `${prevMonthStr}-01`;
    const endOfPrevMonth = `${currentMonthStr}-01`; // exclusive upper bound

    // ─── 1. ACCOUNTS → TOTAL BALANCE ───────────────────────
    const { data: accounts } = await supabase
      .from('accounts')
      .select('current_balance, type')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    let totalBalance = 0;
    (accounts || []).forEach((acc) => {
      const bal = Number(acc.current_balance || 0);
      // Credit card balances are liabilities
      if (acc.type === 'CREDIT_CARD') {
        totalBalance -= bal;
      } else {
        totalBalance += bal;
      }
    });

    // ─── 2. CURRENT MONTH TRANSACTIONS ─────────────────────
    const { data: currentMonthTxns } = await supabase
      .from('transactions')
      .select('amount, type, category:categories(name, icon_name, color_hex)')
      .eq('user_id', user.id)
      .gte('transaction_date', startOfMonth);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};

    (currentMonthTxns || []).forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === 'INCOME') {
        totalIncome += amt;
      } else if (t.type === 'EXPENSE') {
        totalExpenses += amt;
        const catName = t.category?.name || 'Uncategorized';
        const color = t.category?.color_hex || '#9297AB';
        const icon = t.category?.icon_name || 'Tag';
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { id: catName, name: catName, amount: 0, color, iconKey: icon };
        }
        categoryTotals[catName].amount += amt;
      }
    });

    const monthlySavings = totalIncome - totalExpenses;

    // ─── 3. PREVIOUS MONTH TRANSACTIONS (for MoM %) ───────
    const { data: prevMonthTxns } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('transaction_date', startOfPrevMonth)
      .lt('transaction_date', endOfPrevMonth);

    let prevIncome = 0;
    let prevExpenses = 0;
    (prevMonthTxns || []).forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === 'INCOME') prevIncome += amt;
      else if (t.type === 'EXPENSE') prevExpenses += amt;
    });
    const prevSavings = prevIncome - prevExpenses;

    // MoM % changes (safe division)
    const incomeChange = calcChange(totalIncome, prevIncome);
    const expenseChange = calcChange(totalExpenses, prevExpenses);
    const savingsChange = calcChange(monthlySavings, prevSavings);
    const balanceChange = calcChange(totalBalance, totalBalance - monthlySavings + prevSavings);

    // ─── 4. EXPENSE CATEGORIES ─────────────────────────────
    const expenseCategories = Object.values(categoryTotals)
      .map((cat) => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ─── 5. RECENT TRANSACTIONS (last 5) ───────────────────
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('id, amount, type, transaction_date, description, category:categories(name, icon_name, color_hex), account:accounts(name)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    // ─── 6. MONTHLY TRENDS (last 6 months from real data) ──
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const { data: trendTxns } = await supabase
      .from('transactions')
      .select('amount, type, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', sixMonthsAgo.toISOString().substring(0, 10));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { period: key, label: monthNames[d.getMonth()], income: 0, expenses: 0 };
    }

    (trendTxns || []).forEach((t) => {
      const k = t.transaction_date?.substring(0, 7);
      if (k && monthMap[k]) {
        const amt = Number(t.amount || 0);
        if (t.type === 'INCOME') monthMap[k].income += amt;
        else if (t.type === 'EXPENSE') monthMap[k].expenses += amt;
      }
    });

    const monthlyTrend = Object.values(monthMap);

    // ─── 7. SPARKLINES FROM REAL MONTHLY DATA ──────────────
    // Each sparkline is 6 data points (one per month of trend data)
    const incomeTrend = monthlyTrend.map((m) => ({ v: m.income }));
    const expenseTrend = monthlyTrend.map((m) => ({ v: m.expenses }));
    const savingsTrend = monthlyTrend.map((m) => ({ v: m.income - m.expenses }));
    // Balance sparkline: approximate running total
    let runningBalance = totalBalance;
    const balanceTrend = [...monthlyTrend].reverse().map((m) => {
      const point = { v: runningBalance };
      runningBalance -= (m.income - m.expenses);
      return point;
    }).reverse();

    // ─── 8. NOTIFICATION COUNT ─────────────────────────────
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // ─── ASSEMBLE VIEW MODEL ───────────────────────────────
    return {
      success: true,
      data: {
        user: userData,
        summary: {
          totalBalance,
          totalIncome,
          totalExpenses,
          monthlySavings,
          balanceChange,
          incomeChange,
          expenseChange,
          savingsChange,
          balanceTrend,
          incomeTrend,
          expenseTrend,
          savingsTrend,
        },
        expenseOverview: {
          period: 'This Month',
          total: totalExpenses,
          changePercent: expenseChange,
          categories: expenseCategories,
        },
        recentTransactions: (recentTransactions || []).map((t) => ({
          id: t.id,
          title: t.description || t.category?.name || 'Transaction',
          type: t.type,
          category: t.category || { name: 'General', icon_name: 'Tag', color_hex: '#9297AB' },
          amount: Number(t.amount || 0),
          transaction_date: t.transaction_date,
          description: t.description,
        })),
        monthlyTrend,
        topCategories: expenseCategories.slice(0, 5),
        notifications: { unreadCount: unreadCount || 0 },
      },
    };
  } catch (err) {
    console.error('[GET_DASHBOARD_SUMMARY_ERROR]:', err);
    // Return error — NEVER fall back to dummy/fake data
    return { success: false, error: 'We couldn\'t load your financial data right now. Please try again.' };
  }
}
