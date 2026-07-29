"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Category type is required' }),
  iconName: z.string().default('Tag'),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code').default('#64748B'),
});

/**
 * Retrieves all accessible categories (system default + user custom categories).
 */
export async function getCategoriesAction(typeFilter = null) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_archived', false)
      .or(`is_system_default.eq.true,user_id.eq.${user.id}`);

    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }

    const { data: categories, error } = await query.order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return { success: true, data: categories || [] };
  } catch (err) {
    console.error('[GET_CATEGORIES_ERROR]:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Creates a user custom category.
 */
export async function createCategoryAction(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Session missing' };
    }

    const validated = categorySchema.parse(formData);

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: validated.name,
        type: validated.type,
        icon_name: validated.iconName,
        color_hex: validated.colorHex,
        is_system_default: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A category with this name already exists' };
      }
      throw error;
    }

    revalidatePath('/categories');
    revalidatePath('/transactions');
    return { success: true, data: category };
  } catch (err) {
    console.error('[CREATE_CATEGORY_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to create category' };
  }
}

/**
 * Archives a user custom category.
 */
export async function archiveCategoryAction(categoryId) {
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
      .from('categories')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .eq('is_system_default', false);

    if (error) {
      throw error;
    }

    revalidatePath('/categories');
    return { success: true };
  } catch (err) {
    console.error('[ARCHIVE_CATEGORY_ERROR]:', err);
    return { success: false, error: err.message || 'Failed to archive category' };
  }
}
