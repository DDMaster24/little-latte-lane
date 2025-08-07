'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type MenuItem = Database['public']['Tables']['menu_items']['Row'] & { stock: number };

type TopSellersQueryItem = {
  menu_item_id: number;
  quantity: number;
  menu_items: { name: string }[];
};

type TopItem = { name: string; quantity: number };

export default function Analytics() {
  const supabase = createClientComponentClient<Database>();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<MenuItem[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total');

      if (revenueError) throw revenueError;
      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;
      setTotalRevenue(totalRevenue);

      // Fetch total orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) throw ordersError;
      setTotalOrders(ordersCount || 0);

      // Fetch today's orders count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (todayError) throw todayError;
      setTodayOrders(todayCount || 0);

      // Fetch low stock items (assuming stock exists; if not, add to table/types)
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('menu_items')
        .select('*')
        .lt('stock', 10);

      if (lowStockError) throw lowStockError;
      setLowStockItems(lowStockData || []);

      // Fetch order items with menu_items join for top sellers
      const { data: orderItemsData, error: topError } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          menu_items (name)
        `);

      if (topError) throw topError;

      // Aggregate top sellers client-side
      const counts = new Map<number, { name: string; quantity: number }>();
      orderItemsData?.forEach((item: TopSellersQueryItem) => {
        const key = item.menu_item_id;
        const menuItem = item.menu_items[0];
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
  }, [supabase]);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(orderItemsSub);
      supabase.removeChannel(menuItemSub);
    };
  }, [authLoading, profile, router, supabase, fetchAnalytics]);

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
            <p className="text-3xl font-bold text-green-400">{currency.format(totalRevenue)}</p>
            <p className="text-sm text-gray-400 mt-1">Completed Orders Only</p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-400">{totalOrders}</p>
            <p className="text-sm text-gray-400 mt-1">All time orders</p>
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