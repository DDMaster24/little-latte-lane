'use client'; // Ensures client-side for hooks like useEffect and useParams

import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation'; // For categoryId from URL
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import NextImage from 'next/image'; // Renamed to avoid type conflict
import { Button } from '@/components/ui/button'; // For buttons
import { useCart } from '@/components/CartContext'; // Added for global cart

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category_id: string;
}

export default function CategoryMenu() {
  const params = useParams(); // Get categoryId from URL
  const categoryId = params.categoryId as string;
  const [categories, setCategories] = useState<Category[]>([]); // All categories for sidebar
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // Items for selected category
  const [selectedCategoryName, setSelectedCategoryName] = useState(''); // For heading
  const { cart, addItem, removeItem, increment, decrement } = useCart(); // Added useCart hook for global cart
  const [deliveryType, setDeliveryType] = useState<'collection' | 'delivery'>('collection'); // Toggle for collection/delivery

  useEffect(() => {
    async function fetchData() {
      // Fetch all categories for sidebar
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) {
        console.error('Error fetching categories:', catError);
        toast.error('Failed to load categories. Please try again later.');
      } else {
        setCategories(catData || []);
      }

      // Fetch menu items for the selected category
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId);

      if (itemError) {
        console.error('Error fetching menu items:', itemError);
        toast.error('Failed to load menu items. Please try again later.');
      } else {
        setMenuItems(itemData || []);
      }

      // Fetch selected category name for heading
      const { data: selectedCat, error: selectedError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (selectedError) {
        console.error('Error fetching category name:', selectedError);
      } else {
        setSelectedCategoryName(selectedCat.name || 'Category');
      }
    }
    fetchData();
  }, [categoryId]);

  const handleCheckout = () => {
    console.log('Cart contents:', cart);
    console.log('Delivery type:', deliveryType);
    toast.success('Checkout initiated (console logged)');
  };

  const calculateSubtotal = (cartItem: { item: MenuItem; quantity: number }) => cartItem.quantity * cartItem.item.price;

  return (
    <main className="bg-darkBg py-8 px-6 flex flex-col md:flex-row gap-6"> {/* 3-column structure: flex for responsive stacking on mobile */}
      {/* Left Sidebar: All categories as buttons */}
      <aside className="w-full md:w-1/4 bg-darkBg p-4 shadow-neon rounded-lg">
        <h2 className="text-xl font-bold mb-4 bg-neon-gradient bg-clip-text text-transparent animate-pulse">Categories</h2>
        <div className="flex flex-col gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu/${category.id}`}
              className={`neon-button flex items-center p-4 rounded-lg shadow-neon bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform ${
                category.id === categoryId ? 'border-neonPink border-2' : '' // Highlight selected
              }`}
            >
              {category.image && <NextImage src={category.image} alt={category.name} width={40} height={40} className="mr-2 rounded" />}
              <span className="text-neonText">{category.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Center: Heading and grid of menu items */}
      <section className="w-full md:w-1/2 bg-darkBg p-4 shadow-neon rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-8 bg-neon-gradient bg-clip-text text-transparent animate-pulse">Menu – {selectedCategoryName}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addItem(item)} // Add to cart on click
              className="neon-button flex flex-col items-center p-4 rounded-lg shadow-neon bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform"
            >
              {item.image && <NextImage src={item.image} alt={item.name} width={200} height={150} className="mb-2 rounded" />}
              <h3 className="text-lg font-semibold text-neonText">{item.name}</h3>
              <p className="text-neonText">R{item.price.toFixed(2)}</p>
            </button>
          ))}
          {menuItems.length === 0 && <p className="text-center text-neonText">No items in this category yet.</p>}
        </div>
      </section>

      {/* Right: Live Cart Sidebar */}
      <aside className="w-full md:w-1/4 bg-darkBg p-4 shadow-neon rounded-lg">
        <h2 className="text-xl font-bold mb-4 bg-neon-gradient bg-clip-text text-transparent animate-pulse">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-center text-neonText">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {cart.map((cartItem) => (
              <div key={cartItem.item.id} className="flex items-center justify-between bg-white/10 backdrop-blur-sm p-2 rounded shadow-neon">
                <span className="text-neonText">{cartItem.item.name}</span>
                <span className="text-neonText">{cartItem.quantity} x R{cartItem.item.price.toFixed(2)} = R{calculateSubtotal(cartItem).toFixed(2)}</span>
                <div className="flex gap-2">
                  <Button onClick={() => decrement(cartItem.item.id)} className="neon-button text-xs">-</Button>
                  <Button onClick={() => increment(cartItem.item.id)} className="neon-button text-xs">+</Button>
                  <Button onClick={() => removeItem(cartItem.item.id)} className="neon-button text-xs bg-neonPink">Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Checkout Section */}
        <div className="mt-4">
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setDeliveryType('collection')}
              className={`neon-button ${deliveryType === 'collection' ? 'bg-neonPink' : ''}`}
            >
              Collection
            </Button>
            <Button
              onClick={() => setDeliveryType('delivery')}
              className={`neon-button ${deliveryType === 'delivery' ? 'bg-neonPink' : ''}`}
            >
              Delivery
            </Button>
          </div>
          <Button onClick={handleCheckout} className="neon-button w-full mt-4">Checkout</Button>
        </div>
      </aside>
    </main>
  );
}