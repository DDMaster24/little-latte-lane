'use client';

import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function WelcomingSection() {
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email || '';

  return (
    <section className="bg-darkBg py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-neon-gradient bg-clip-text text-transparent animate-pulse">
        Welcome {username ? `${username}` : 'to Little Latte Lane'}
      </h1>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="flex flex-col items-center">
          <Image
            src="/images/food-drinks-neon-wp.png"
            alt="Food & Drinks"
            width={300}
            height={200}
            className="rounded shadow-neon"
            priority
          />
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/images/golf-coming-soon-wp.png"
            alt="Virtual Golf Coming Soon"
            width={300}
            height={200}
            className="rounded shadow-neon"
            priority
          />
        </div>
      </div>
    </section>
  );
}
