"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters').max(100),
  type: z.enum(['CASH', 'BANK', 'UPI', 'WALLET', 'CREDIT_CARD', 'OTHER'], {
    required_error: 'Please select an account type',
  }),
  openingBalance: z.number().default(0),
  currency: z.string().default('INR'),
  description: z.string().max(255).optional(),
});

/**
 * Creates a new financial account for the authenticated user.
 */
export async function createAccountAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const validated = accountSchema.parse(formData);

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: validated.name,
        type: validated.type,
        opening_balance: validated.openingBalance,
        current_balance: validated.openingBalance,
        currency: validated.currency,
        description: validated.description || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'An account with this name already exists' };
      }
      throw error;
    }

    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true, data: account };
  } catch (err) {
    console.error('[CREATE_ACCOUNT_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to create account' };
  }
}

/**
 * Retrieves all active accounts for the authenticated user.
 */
export async function getAccountsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data: accounts || [] };
  } catch (err) {
    console.error('[GET_ACCOUNTS_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Updates an existing account's details.
 */
export async function updateAccountAction(accountId, formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = accountSchema.partial().parse(formData);

    const { error } = await supabase
      .from('accounts')
      .update({
        ...(validated.name && { name: validated.name }),
        ...(validated.type && { type: validated.type }),
        ...(validated.description !== undefined && { description: validated.description }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[UPDATE_ACCOUNT_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to update account' };
  }
}

/**
 * Soft archives an account.
 */
export async function archiveAccountAction(accountId) {
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
      .from('accounts')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/accounts');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[ARCHIVE_ACCOUNT_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to archive account' };
  }
}
