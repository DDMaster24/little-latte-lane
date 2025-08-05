'use server'; // Marks as server actions

import { supabaseServer } from '@/lib/supabaseServer'; // Use server client with service key

export async function checkEmailExists(email: string): Promise<boolean> {
  const trimmedEmail = email.trim().toLowerCase();
  const { data: users, error } = await supabaseServer.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error);
    return false; // Assume not exists on error for security
  }

  return users.users.some((user) => user.email?.toLowerCase() === trimmedEmail);
}