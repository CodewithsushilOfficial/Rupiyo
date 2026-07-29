import { createClient } from '@/lib/supabase/client';

/**
 * Check if an incoming transaction draft matches any existing transaction in database
 */
export async function checkDuplicateTransaction({ amount, date, title, accountId }) {
  if (!amount || !date) return { isDuplicate: false, existingTransaction: null };

  try {
    const supabase = createClient();
    
    // Convert date string to range +/- 3 days
    const targetDate = new Date(date);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 3);

    const { data: matches } = await supabase
      .from('transactions')
      .select('id, title, amount, transaction_date, category_id, account_id')
      .eq('amount', parseFloat(amount))
      .gte('transaction_date', startDate.toISOString().substring(0, 10))
      .lte('transaction_date', endDate.toISOString().substring(0, 10))
      .limit(5);

    if (matches && matches.length > 0) {
      // Find closest title match or return first amount match
      const exactTitleMatch = matches.find((m) =>
        m.title.toLowerCase().includes((title || '').toLowerCase().substring(0, 5))
      );

      return {
        isDuplicate: true,
        existingTransaction: exactTitleMatch || matches[0],
      };
    }

    return { isDuplicate: false, existingTransaction: null };
  } catch (err) {
    console.error('[DUPLICATE_CHECK_ERROR]:', err);
    return { isDuplicate: false, existingTransaction: null };
  }
}
