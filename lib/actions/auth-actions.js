"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Sign up a new user with email and password via Supabase Auth.
 */
export async function signUpAction(formData) {
  const supabase = await createClient();

  const email = formData.email;
  const password = formData.password;
  const fullName = formData.displayName || formData.fullName;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('[SIGNUP_ERROR]:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

/**
 * Sign in existing user with email and password via Supabase Auth.
 */
export async function signInAction(formData) {
  const supabase = await createClient();

  const email = formData.email;
  const password = formData.password;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[SIGNIN_ERROR]:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

/**
 * Sign out current user session.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Trigger password reset email via Supabase Auth.
 */
export async function resetPasswordAction(email) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error('[RESET_PASSWORD_ERROR]:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
