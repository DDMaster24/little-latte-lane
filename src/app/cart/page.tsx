'use client';

import { useAuth } from '@/components/AuthProvider';
import { useCartStore } from '@/app/stores/cartStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { user } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    total,
  } = useCartStore();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to proceed with checkout.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsCheckingOut(true);

    // 👇 Replace this with your real checkout API logic
    try {
      // Simulate delay
      await new Promise((res) => setTimeout(res, 1500));
      toast.success('Checkout successful!');
      clearCart();
    } catch (error) {
      toast.error('Checkout failed.');
    }

    setIsCheckingOut(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-6 text-neonText">
      <h1 className="text-3xl font-bold mb-6 text-center bg-neon-gradient bg-clip-text text-transparent animate-pulse">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-400">Your cart is empty.</p>
      ) : (
        <>
          <Table className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>R{item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value))
                      }
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>R{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <label htmlFor="delivery" className="font-semibold">Delivery Type:</label>
              <select
                id="delivery"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                className="bg-gray-800 text-white p-2 rounded"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery (within estate)</option>
              </select>
            </div>
            <div className="text-xl font-bold">Total: R{total().toFixed(2)}</div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout & Pay'}
            </Button>
            <Button variant="secondary" onClick={clearCart} className="w-full">
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
