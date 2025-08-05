'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  user_id: string;
  status: string;
  total: number;
  delivery_type: string;
  created_at: string;
  order_items: { menu_item_id: number; quantity: number }[];
}

interface MenuItem {
  id: number;
  name: string;
}

interface StockRequest {
  item_id: number;
  message: string;
}

export default function KitchenDashboard() {
  const { profile } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const requestForm = useForm<StockRequest>();

  useEffect(() => {
    if (profile?.role !== 'staff') {
      router.push('/');
      return;
    }

    fetchOrders();
    fetchMenuItems();

    const orderSub = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => {
      void orderSub.unsubscribe();
    };
  }, [profile]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true });
    setOrders(data || []);
  };

  const fetchMenuItems = async () => {
    const { data } = await supabase.from('menu_items').select('*');
    setMenuItems(data || []);
  };

  const getItemName = (id: number) => {
    const item = menuItems.find((i) => i.id === id);
    return item?.name || 'Unknown Item';
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order status updated');
      fetchOrders();
    }
  };

  const handleStockRequest = async (data: StockRequest) => {
    if (!data.item_id || !data.message.trim()) {
      toast.error('Please fill out all fields');
      return;
    }

    const { error } = await supabase
      .from('requests')
      .insert({ ...data, staff_id: profile!.id }); // profile.id is now safely available

    if (error) {
      toast.error('Request failed');
    } else {
      toast.success('Request sent');
      requestForm.reset();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neonText">Kitchen Dashboard</h2>

      {/* Orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Orders</h3>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatTime(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <ul className="text-sm list-disc list-inside">
                      {order.order_items.map((item, idx) => (
                        <li key={idx}>
                          {getItemName(item.menu_item_id)} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => handleUpdateStatus(order.id, value)}
                      defaultValue={order.status}
                    >
                      <SelectTrigger className="text-xs text-white bg-gray-800">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stock Request */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Request Stock</h3>
        <form
          onSubmit={requestForm.handleSubmit(handleStockRequest)}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            type="number"
            placeholder="Item ID"
            {...requestForm.register('item_id', { valueAsNumber: true })}
          />
          <Input
            placeholder="Message"
            {...requestForm.register('message')}
          />
          <Button type="submit">Request</Button>
        </form>
      </div>
    </div>
  );
}
