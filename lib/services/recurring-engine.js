import { createClient } from '@/lib/supabase/server';

/**
 * Calculates the next execution date based on frequency.
 */
export function calculateNextDate(currentDateStr, frequency) {
  const date = new Date(currentDateStr);
  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().substring(0, 10);
}

/**
 * Idempotent Recurring Execution Engine.
 * Evaluates active recurring rules due on or before today and logs transaction entries.
 */
export async function processDueRecurringTransactions(userId) {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().substring(0, 10);

  // 1. Fetch active rules due on or before today
  let query = supabase
    .from('recurring_transactions')
    .select('*')
    .eq('status', 'ACTIVE')
    .lte('next_date', todayStr);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: dueRules, error: fetchErr } = await query;
  if (fetchErr || !dueRules || dueRules.length === 0) {
    return { processedCount: 0, executedRules: [] };
  }

  const executedRules = [];

  for (const rule of dueRules) {
    // Idempotency Check: Skip if already executed today or next_date is in the future
    if (rule.last_executed_date === todayStr) {
      continue;
    }

    try {
      // 1. Insert transaction into ledger
      const { data: txn, error: txnErr } = await supabase
        .from('transactions')
        .insert({
          user_id: rule.user_id,
          account_id: rule.account_id,
          category_id: rule.category_id,
          type: rule.type,
          amount: rule.amount,
          payment_method: rule.payment_method,
          transaction_date: rule.next_date,
          description: rule.description || `Automated ${rule.frequency.toLowerCase()} ${rule.type.toLowerCase()}`,
          recurring_rule_id: rule.id,
        })
        .select()
        .single();

      if (txnErr) {
        console.error(`❌ Failed to insert transaction for rule ${rule.id}:`, txnErr.message);
        continue;
      }

      // 2. Fetch Account & Update Balance
      const { data: account } = await supabase
        .from('accounts')
        .select('current_balance')
        .eq('id', rule.account_id)
        .single();

      if (account) {
        const curBal = Number(account.current_balance || 0);
        const ruleAmt = Number(rule.amount || 0);
        const newBal = rule.type === 'INCOME' ? curBal + ruleAmt : curBal - ruleAmt;

        await supabase
          .from('accounts')
          .update({ current_balance: newBal, updated_at: new Date().toISOString() })
          .eq('id', rule.account_id);
      }

      // 3. Advance rule next_date and set last_executed_date
      const nextDateStr = calculateNextDate(rule.next_date, rule.frequency);
      await supabase
        .from('recurring_transactions')
        .update({
          next_date: nextDateStr,
          last_executed_date: todayStr,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rule.id);

      executedRules.push(rule.id);
    } catch (err) {
      console.error(`❌ Error processing recurring rule ${rule.id}:`, err);
    }
  }

  return { processedCount: executedRules.length, executedRules };
}
