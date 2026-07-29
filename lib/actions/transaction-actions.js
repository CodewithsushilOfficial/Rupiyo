"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const transactionSchema = z.object({
  accountId: z.string().uuid('Please select a valid account'),
  categoryId: z.string().uuid('Please select a valid category'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Please select transaction type' }),
  amount: z.number().positive('Amount must be a positive number'),
  paymentMethod: z.enum([
    'CASH',
    'UPI',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'WALLET',
    'OTHER',
  ]),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Creates a new financial transaction and updates account balance.
 */
export async function createTransactionAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const validated = transactionSchema.parse(formData);

    // 1. Fetch current account to verify ownership
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('id, current_balance')
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .single();

    if (accError || !account) {
      return { success: false, error: 'Selected account not found or access denied' };
    }

    // 2. Calculate updated account balance
    const currentBal = Number(account.current_balance || 0);
    const newBal =
      validated.type === 'INCOME' ? currentBal + validated.amount : currentBal - validated.amount;

    // 3. Insert Transaction Record
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: validated.accountId,
        category_id: validated.categoryId,
        type: validated.type,
        amount: validated.amount,
        payment_method: validated.paymentMethod,
        transaction_date: validated.transactionDate,
        description: validated.description || null,
        notes: validated.notes || null,
      })
      .select()
      .single();

    if (txnError) {
      throw txnError;
    }

    // 4. Update Account Balance
    await supabase
      .from('accounts')
      .update({
        current_balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.accountId)
      .eq('user_id', user.id);

    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true, data: transaction };
  } catch (err) {
    console.error('[CREATE_TRANSACTION_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to record transaction' };
  }
}

/**
 * Updates an existing transaction and adjusts account balances accordingly.
 */
export async function updateTransactionAction(transactionId, formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = transactionSchema.parse(formData);

    // 1. Fetch old transaction
    const { data: oldTxn, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !oldTxn) {
      return { success: false, error: 'Transaction not found or access denied' };
    }

    // 2. Reverse old transaction impact on account
    const { data: oldAccount } = await supabase
      .from('accounts')
      .select('id, current_balance')
      .eq('id', oldTxn.account_id)
      .eq('user_id', user.id)
      .single();

    if (oldAccount) {
      const reversedBal =
        oldTxn.type === 'INCOME'
          ? Number(oldAccount.current_balance || 0) - Number(oldTxn.amount)
          : Number(oldAccount.current_balance || 0) + Number(oldTxn.amount);

      await supabase
        .from('accounts')
        .update({ current_balance: reversedBal, updated_at: new Date().toISOString() })
        .eq('id', oldAccount.id)
        .eq('user_id', user.id);
    }

    // 3. Apply new transaction impact on target account
    const { data: newAccount } = await supabase
      .from('accounts')
      .select('id, current_balance')
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .single();

    if (!newAccount) {
      return { success: false, error: 'Target account not found' };
    }

    const newBal =
      validated.type === 'INCOME'
        ? Number(newAccount.current_balance || 0) + validated.amount
        : Number(newAccount.current_balance || 0) - validated.amount;

    await supabase
      .from('accounts')
      .update({ current_balance: newBal, updated_at: new Date().toISOString() })
      .eq('id', newAccount.id)
      .eq('user_id', user.id);

    // 4. Update transaction row
    const { data: updatedTxn, error: updateErr } = await supabase
      .from('transactions')
      .update({
        account_id: validated.accountId,
        category_id: validated.categoryId,
        type: validated.type,
        amount: validated.amount,
        payment_method: validated.paymentMethod,
        transaction_date: validated.transactionDate,
        description: validated.description || null,
        notes: validated.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateErr) {
      throw updateErr;
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true, data: updatedTxn };
  } catch (err) {
    console.error('[UPDATE_TRANSACTION_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to update transaction' };
  }
}

/**
 * Retrieves paginated transactions with server-side search, filtering, and sorting.
 */
export async function getTransactionsAction(filters = {}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [], total: 0 };
    }

    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.max(1, parseInt(filters.limit || '25', 10));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select(
        '*, category:categories(id, name, icon_name, color_hex), account:accounts(id, name, type)',
        { count: 'exact' }
      )
      .eq('user_id', user.id);

    // Filter by Type
    if (filters.type && filters.type !== 'ALL') {
      query = query.eq('type', filters.type);
    }
    // Filter by Account
    if (filters.accountId && filters.accountId !== 'ALL') {
      query = query.eq('account_id', filters.accountId);
    }
    // Filter by Category
    if (filters.categoryId && filters.categoryId !== 'ALL') {
      query = query.eq('category_id', filters.categoryId);
    }
    // Filter by Payment Method
    if (filters.paymentMethod && filters.paymentMethod !== 'ALL') {
      query = query.eq('payment_method', filters.paymentMethod);
    }
    // Filter by Date Range
    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    // Search by title/description or notes
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`description.ilike.${term},notes.ilike.${term}`);
    }

    // Sorting options
    const sort = filters.sort || 'date_desc';
    if (sort === 'date_asc') {
      query = query.order('transaction_date', { ascending: true }).order('created_at', { ascending: true });
    } else if (sort === 'amount_desc') {
      query = query.order('amount', { ascending: false });
    } else if (sort === 'amount_asc') {
      query = query.order('amount', { ascending: true });
    } else {
      // date_desc (default)
      query = query.order('transaction_date', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data: transactions, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: transactions || [],
      total: count || 0,
      page,
      limit,
    };
  } catch (err) {
    console.error('[GET_TRANSACTIONS_ERROR]:', err);
    return { success: false, error: err.message, data: [], total: 0 };
  }
}

/**
 * Deletes a single transaction and reverses its balance impact.
 */
export async function deleteTransactionAction(transactionId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Fetch transaction details before deletion
    const { data: txn, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !txn) {
      return { success: false, error: 'Transaction not found or access denied' };
    }

    // 2. Reverse balance impact
    const { data: account } = await supabase
      .from('accounts')
      .select('id, current_balance')
      .eq('id', txn.account_id)
      .eq('user_id', user.id)
      .single();

    if (account) {
      const currentBal = Number(account.current_balance || 0);
      const reversedBal =
        txn.type === 'INCOME' ? currentBal - Number(txn.amount) : currentBal + Number(txn.amount);

      await supabase
        .from('accounts')
        .update({ current_balance: reversedBal, updated_at: new Date().toISOString() })
        .eq('id', account.id)
        .eq('user_id', user.id);
    }

    // 3. Delete transaction record
    const { error: delErr } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (delErr) {
      throw delErr;
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[DELETE_TRANSACTION_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to delete transaction' };
  }
}

/**
 * Bulk deletes multiple transactions belonging to the authenticated user.
 */
export async function bulkDeleteTransactionsAction(transactionIds = []) {
  try {
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return { success: false, error: 'No transaction IDs provided' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch transactions to reverse account balance impacts
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .in('id', transactionIds)
      .eq('user_id', user.id);

    if (txns && txns.length > 0) {
      // Revert account balances in memory per account
      const accountDeltas = {};
      txns.forEach((t) => {
        const amt = Number(t.amount);
        const delta = t.type === 'INCOME' ? -amt : amt;
        accountDeltas[t.account_id] = (accountDeltas[t.account_id] || 0) + delta;
      });

      for (const accountId of Object.keys(accountDeltas)) {
        const { data: acc } = await supabase
          .from('accounts')
          .select('current_balance')
          .eq('id', accountId)
          .eq('user_id', user.id)
          .single();

        if (acc) {
          const newBal = Number(acc.current_balance || 0) + accountDeltas[accountId];
          await supabase
            .from('accounts')
            .update({ current_balance: newBal, updated_at: new Date().toISOString() })
            .eq('id', accountId)
            .eq('user_id', user.id);
        }
      }
    }

    // Perform bulk delete
    const { error: delErr } = await supabase
      .from('transactions')
      .delete()
      .in('id', transactionIds)
      .eq('user_id', user.id);

    if (delErr) {
      throw delErr;
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true, count: txns?.length || 0 };
  } catch (err) {
    console.error('[BULK_DELETE_TRANSACTIONS_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to bulk delete transactions' };
  }
}
