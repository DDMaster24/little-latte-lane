'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookingsSection() {
  return (
    <section className="bg-darkBg py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 bg-neon-gradient bg-clip-text text-transparent animate-pulse">
        Make a Booking
      </h2>
      <p className="text-lg mb-6 text-neonText">
        Book the virtual golf simulator and optionally pre-order food. Choose your time slot and we&apos;ll have everything ready.
      </p>
      <Link href="/bookings" aria-label="Book a golf session">
        <Button className="neon-button px-6 py-3 text-lg hover:shadow-xl">
          Book Now
        </Button>
      </Link>
    </section>
  );
}
