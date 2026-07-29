"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Fetches user notifications sorted by timestamp.
 */
export async function getNotificationsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: [], unreadCount: 0 };
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return { success: true, data: notifications || [], unreadCount };
  } catch (err) {
    console.error('[GET_NOTIFICATIONS_ERROR]:', err);
    return { success: false, error: err.message, data: [], unreadCount: 0 };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsReadAction(notificationId) {
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
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    revalidatePath('/notifications');
    return { success: true };
  } catch (err) {
    console.error('[MARK_READ_ERROR]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Marks all notifications for the user as read.
 */
export async function markAllNotificationsAsReadAction() {
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
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    revalidatePath('/notifications');
    return { success: true };
  } catch (err) {
    console.error('[MARK_ALL_READ_ERROR]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Creates a system notification for the current user.
 */
export async function createNotificationAction({ title, message, type = 'INFO', linkUrl = null }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message,
        type,
        is_read: false,
        link_url: linkUrl,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath('/notifications');
    return { success: true, data: notification };
  } catch (err) {
    console.error('[CREATE_NOTIFICATION_ERROR]:', err);
    return { success: false, error: err.message };
  }
}
