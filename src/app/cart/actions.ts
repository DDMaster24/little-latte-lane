"use server";

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: 'Little Latte Lane <no-reply@yourdomain.com>', // Replace with your verified domain
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function performCheckout(userId: string, items: { id: number; quantity: number }[], total: number, deliveryType: string, email: string) {
  try {
    // Create order (existing code)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        delivery_type: deliveryType,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // NEW: Loop through items to check and decrement stock before inserting order_items
    for (const item of items) {
      // Fetch current stock for the menu item
      const { data: menuItem, error: stockError } = await supabase
        .from('menu_items')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (stockError || !menuItem) {
        throw new Error(`Failed to fetch stock for item ${item.id}`);
      }

      // Check if enough stock
      if (menuItem.stock < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.id}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
      }

      // Decrement stock
      const newStock = menuItem.stock - item.quantity;
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (updateError) {
        throw updateError;
      }
    }

    // Create order items (existing code, moved after stock decrement to ensure success first)
    const orderItems = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Send notification email (existing code)
    const emailBody = `<p>Your order #${orderId} has been placed! Total: R${total.toFixed(2)}</p>`;
    await sendEmail(email, 'Order Confirmation', emailBody);

    return { success: true, orderId };
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}