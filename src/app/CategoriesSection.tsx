'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories. Please try again later.');
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  return (
    <section className="bg-darkBg py-8 px-6 shadow-neon rounded-lg m-4">
      <h2 className="text-2xl font-bold text-center mb-8 bg-neon-gradient bg-clip-text text-transparent animate-pulse">
        View Our Categories
      </h2>

      {loading ? (
        <p className="text-center text-neonText animate-pulse">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-neonText">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/menu/${category.id}`}
              className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg shadow-neon flex flex-col items-center"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={200}
                  height={150}
                  className="rounded shadow-neon mb-2"
                  priority={index < 2} // Load top two first
                />
              ) : (
                <div className="h-32 w-full bg-gray-700 rounded flex items-center justify-center text-neonText mb-2">
                  No Image
                </div>
              )}
              <p className="text-white font-semibold text-center truncate w-full">{category.name}</p>
              <Button className="mt-2">View Items</Button>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
