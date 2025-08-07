'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore'; // Updated to use Zustand cart store

const supabase = createClientComponentClient<Database>();

export default function MenuCategory() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [items, setItems] = useState<Database['public']['Tables']['menu_items']['Row'][]>([]);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId);

      setItems(data || []);
    };

    fetchItems();
  }, [categoryId]);

  const handleAddToCart = (item: Database['public']['Tables']['menu_items']['Row']) => {
    addToCart({ 
      id: item.id, 
      name: item.name, 
      price: item.price, 
      quantity: 1 
    });
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="bg-black/50 backdrop-blur-md border-neon-green/50">
          <CardHeader>
            <CardTitle className="text-neon-green">{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neon-blue">R{item.price}</p>
            <Button onClick={() => handleAddToCart(item)} className="mt-2 bg-neon-green text-black hover:bg-neon-green/80">Add to Cart</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}