'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  status: string;
  total: number;
  delivery_type: string;
  created_at: string;
  order_items: { menu_item_id: number; quantity: number }[];
}

interface Booking {
  id: number;
  type: string;
  date_time: string;
  status: string;
  pre_order_id: number | null;
}

interface ProfileUpdate {
  address: string;
  phone: string;
}

export default function AccountPage() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileUpdate>({
    defaultValues: {
      address: profile?.address || '',
      phone: profile?.phone || '',
    },
  });

  const fetchData = useCallback(async () => {
    if (!session) return;

    const { data: orderData } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setOrders(orderData || []);

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date_time', { ascending: false });

    setBookings(bookingData || []);
  }, [session]);

  useEffect(() => {
    if (!session) {
      router.push('/');
    } else {
      fetchData();
      const orderSub = supabase
        .channel('orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
          fetchData
        )
        .subscribe();
      const bookingSub = supabase
        .channel('bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${session.user.id}` },
          fetchData
        )
        .subscribe();

      return () => {
        void orderSub.unsubscribe();
        void bookingSub.unsubscribe();
      };
    }
  }, [session, router, fetchData]);

  const handleProfileUpdate = async (data: ProfileUpdate) => {
    if (!session) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, address: data.address, phone: data.phone });

    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated!');
    }

    setIsSaving(false);
  };

  if (!session) return <p>Redirecting...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8 text-neonText">My Account</h1>
      <div className="w-full max-w-4xl space-y-10">
        {/* Profile Update */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
            <Input {...form.register('address')} placeholder="Address" />
            <Input {...form.register('phone')} placeholder="Phone" />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </section>

        {/* Orders */}
        {orders.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Order History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>R{order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.delivery_type}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>{order.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {/* Bookings */}
        {bookings.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Booking History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.type}</TableCell>
                    <TableCell>{new Date(b.date_time).toLocaleString()}</TableCell>
                    <TableCell>{b.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </div>
    </main>
  );
}
