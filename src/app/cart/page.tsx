'use client';

import { useCartStore } from '@/stores/cartStore'; // Correct import for Zustand cart store
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { performCheckout } from './actions';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function Cart() {
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { profile } = useAuth();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const total = useCartStore((state) => state.total());

  const handleCheckout = async () => {
    if (!profile) {
      toast.error('Please log in to checkout');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
      await performCheckout(profile.id, items, total, deliveryType, profile.username || '');
      
      clearCart();
      toast.success('Order placed successfully');
      router.push('/account');
    } catch (error) {
      toast.error('Error placing order: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-4">
      <Card className="bg-black/50 backdrop-blur-md border-neon-green/50">
        <CardHeader>
          <CardTitle className="text-neon-green">Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between mb-2 items-center">
              <span>{item.name} x {item.quantity}</span>
              <span>R{item.price * item.quantity}</span>
              <Button variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="ml-2 border-neon-blue/50 text-neon-blue">+</Button>
              <Button variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="ml-2 border-neon-blue/50 text-neon-blue">-</Button>
              <Button variant="destructive" onClick={() => removeItem(item.id)} className="ml-2 bg-red-500/20 text-red-300">Remove</Button>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4">
            <span>Total</span>
            <span>R{total}</span>
          </div>
          <Select value={deliveryType} onValueChange={(value) => setDeliveryType(value as 'delivery' | 'pickup')}>
            <SelectTrigger className="mt-4 bg-black/70 border-neon-blue/50 text-neon-blue">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-neon-blue/50">
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
          {deliveryType === 'delivery' && (
            <div className="mt-4">
              <Label htmlFor="address" className="text-neon-green">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-black/70 border-neon-blue/50 text-neon-blue" />
            </div>
          )}
          <div className="mt-4">
            <Label htmlFor="phone" className="text-neon-green">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/70 border-neon-blue/50 text-neon-blue" />
          </div>
          <Button onClick={handleCheckout} className="mt-4 w-full bg-neon-green text-black hover:bg-neon-green/80">Checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}