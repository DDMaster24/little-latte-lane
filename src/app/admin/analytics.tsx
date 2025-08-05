'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type MenuItem = Database['public']['Tables']['menu_item']['Row'] & { stock: number };

type TopSellersQueryItem = {
  menu_item_id: string;
  quantity: number;
  menu_item: { name: string }[];
};

type TopItem = { name: string; quantity: number };

export default function Analytics() {
  const supabase = createClientComponentClient<Database>();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [totalSales, setTotalSales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<MenuItem[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile || profile.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchAnalytics();

    // Real-time subscriptions for relevant tables
    const ordersSub = supabase
      .channel('orders-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAnalytics)
      .subscribe();

    const orderItemsSub = supabase
      .channel('order-items-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchAnalytics)
      .subscribe();

    const menuItemSub = supabase
      .channel('menu-item-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_item' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(orderItemsSub);
      supabase.removeChannel(menuItemSub);
    };
  }, [authLoading, profile, router, supabase]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch done orders for total sales
      const { data: doneOrders, error: salesError } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'done');

      if (salesError) throw salesError;
      setTotalSales(doneOrders?.reduce((sum, order: { total: number }) => sum + (order.total || 0), 0) || 0);

      // Fetch total orders today
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const startOfDay = `${today}T00:00:00Z`;
      const endOfDay = `${today}T23:59:59Z`;
      const { count: todayCount, error: todayError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (todayError) throw todayError;
      setTodayOrders(todayCount || 0);

      // Fetch low stock items (assuming stock exists; if not, add to table/types)
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('menu_item')
        .select('*')
        .lt('stock', 10);

      if (lowStockError) throw lowStockError;
      setLowStockItems(lowStockData || []);

      // Fetch order items with menu_item join for top sellers
      const { data: orderItemsData, error: topError } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          menu_item (name)
        `);

      if (topError) throw topError;

      // Aggregate top sellers client-side
      const counts = new Map<string, { name: string; quantity: number }>();
      orderItemsData?.forEach((item: TopSellersQueryItem) => {
        const key = item.menu_item_id;
        const menuItem = item.menu_item[0];
        const name = menuItem ? menuItem.name : 'Unknown';
        const current = counts.get(key) || { name, quantity: 0 };
        current.quantity += item.quantity;
        counts.set(key, current);
      });

      const sortedTop = Array.from(counts.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopItems(sortedTop);
    } catch (err) {
      setError(`Error fetching analytics: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currency = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/50 border-red-500">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neonText">
          <Skeleton className="h-8 w-48 bg-neon-green/20" />
        </h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-neon-green/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24 bg-neon-green/20" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-neon-green/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24 bg-neon-green/20" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-neon-green/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full bg-neon-green/20" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-neon-green/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full bg-neon-green/20" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neonText">Admin Analytics</h2>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{currency.format(totalSales)}</p>
            <p className="text-sm text-gray-400 mt-1">Completed Orders Only</p>
          </CardContent>
        </Card>

        {/* Orders Today */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">{todayOrders}</p>
            <p className="text-sm text-gray-400 mt-1">All orders placed today</p>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted">All items well-stocked</p>
            ) : (
              lowStockItems.map((item) => (
                <p key={item.id} className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {item.name} ({item.stock})
                </p>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sellers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {topItems.length === 0 ? (
              <p className="text-sm text-muted">No sales yet</p>
            ) : (
              topItems.map((item, index) => (
                <p key={index} className="text-blue-400 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {item.name} – {item.quantity} sold
                </p>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}