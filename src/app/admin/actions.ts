'use server';

import { supabase } from '@/lib/supabaseClient';

/**
 * Update the status of an order by ID
 * @param id Order ID
 * @param status New status string (e.g. 'pending', 'done', 'cancelled')
 * @returns { success: boolean, message?: string }
 */
export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

// Future actions can be added below, like:
// export async function updateMenuItem(...) { ... }
// export async function deleteBooking(...) { ... }
/**
 * Update the status of a booking by ID
 * @param id Booking ID
 * @param status New status string ('pending', 'confirmed', 'cancelled')
 * @returns { success: boolean, message?: string }
 */
export async function updateBookingStatus(id: number, status: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
