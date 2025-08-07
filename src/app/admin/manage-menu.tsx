'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category_id: number;
}

export default function ManageMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const itemForm = useForm<MenuItem>();
  const categoryForm = useForm<Category>();
  const isEditingItem = Boolean(editingItem);
  const isEditingCategory = Boolean(editingCategory);

  useEffect(() => {
    fetchData();

    const menuChannel = supabase
      .channel('menu')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchData)
      .subscribe();

    return () => {
      void menuChannel.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    const { data: cats } = await supabase.from('categories').select();
    const { data: items } = await supabase.from('menu_items').select();
    setCategories(cats || []);
    setMenuItems(items || []);
  };

  const onSubmitCategory = async (data: Category) => {
    const method = isEditingCategory ? 'update' : 'insert';
    const payload = isEditingItem ? { ...data } : data;

    const { error } = await supabase.from('categories')[method](payload).eq('id', editingCategory?.id);

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Category ${isEditingCategory ? 'updated' : 'created'}!`);
      categoryForm.reset();
      setEditingCategory(null);
    }
  };

  const onSubmitItem = async (data: MenuItem) => {
    if (data.price < 0 || data.stock < 0) {
      toast.error('Price and stock must be positive values.');
      return;
    }

    const method = isEditingItem ? 'update' : 'insert';
    const payload = isEditingItem ? { ...data } : data;

    const { error } = await supabase.from('menu_items')[method](payload).eq('id', editingItem?.id);

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Item ${isEditingItem ? 'updated' : 'created'}!`);
      itemForm.reset();
      setEditingItem(null);
    }
  };

  const deleteCategory = async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Category deleted');
  };

  const deleteItem = async (id: number) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Item deleted');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neonText">Manage Menu</h2>

      {/* Categories */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Categories</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
                className="space-y-4"
              >
                <Input placeholder="Category Name" {...categoryForm.register('name', { required: true })} />
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="flex justify-between bg-gray-800 p-2 rounded">
              <span>{cat.name}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => setEditingCategory(cat)}>Edit</Button>
                <Button size="sm" variant="secondary" onClick={() => deleteCategory(cat.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Menu Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Menu Items</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditingItem ? 'Edit' : 'Add'} Item</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={itemForm.handleSubmit(onSubmitItem)}
                className="space-y-4"
              >
                <Input placeholder="Name" {...itemForm.register('name', { required: true })} />
                <Textarea placeholder="Description" {...itemForm.register('description')} />
                <Input type="number" placeholder="Price" {...itemForm.register('price', { required: true })} />
                <Input type="number" placeholder="Stock" {...itemForm.register('stock', { required: true })} />
                <Input placeholder="Image URL" {...itemForm.register('image_url')} />
                <select {...itemForm.register('category_id')} className="w-full p-2 bg-gray-800 text-white rounded">
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <li key={item.id} className="p-4 border rounded bg-gray-800">
              <h4 className="text-lg font-semibold">{item.name}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} className="mt-2 rounded h-32 object-cover w-full" width={200} height={128} />
              )}
              <p className="mt-1">Price: R{item.price}</p>
              <p>Stock: {item.stock}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setEditingItem(item)}>Edit</Button>
                <Button size="sm" variant="secondary" onClick={() => deleteItem(item.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
