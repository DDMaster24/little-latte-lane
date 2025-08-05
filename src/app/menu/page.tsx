'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import NextImage from 'next/image';

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories. Please try again later.');
      } else {
        setCategories(data || []);
      }
    }
    fetchCategories();
  }, []);

  return (
    <main className="bg-darkBg py-8 px-6">
      <h1 className="text-2xl font-bold text-center mb-8 bg-neon-gradient bg-clip-text text-transparent animate-pulse">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/menu/${category.id}`}
            className="neon-button flex flex-col items-center p-4 rounded-lg shadow-neon bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform"
          >
            {category.image && <NextImage src={category.image} alt={category.name} width={200} height={150} className="mb-2 rounded" />}
            <h3 className="text-lg font-semibold text-neonText">{category.name}</h3>
          </Link>
        ))}
      </div>
    </main>
  );
}