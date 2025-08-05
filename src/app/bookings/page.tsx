'use client';

import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BookingsPage() {
  const { user } = useAuth();

  const [golfDate, setGolfDate] = useState<Date | null>(new Date());
  const [golfPeople, setGolfPeople] = useState(1);
  const [golfPreOrder, setGolfPreOrder] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  async function handleFinalizeBook() {
    if (!user) {
      toast.error('Please log in to book.');
      return;
    }
    if (!golfDate) {
      toast.error('Please select a date and time.');
      return;
    }

    setIsBooking(true);

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      type: 'golf',
      date_time: golfDate,
      number_of_people: golfPeople,
      pre_order: golfPreOrder,
    });

    if (error) {
      toast.error('Booking failed: ' + error.message);
    } else {
      toast.success('Golf booking created!');
      setGolfDate(new Date());
      setGolfPeople(1);
      setGolfPreOrder(false);
    }

    setIsBooking(false);
  }

  async function handleCheckout() {
    if (!golfPreOrder) {
      toast.error('Please select pre-order to proceed to checkout.');
      return;
    }

    setIsPaying(true);

    // Placeholder logic for Payfast integration
    toast.success('Redirecting to Payfast...');

    // TODO: Replace this with actual redirect URL from Payfast SDK when available
    setTimeout(() => {
      toast('Payment simulation complete!');
      setIsPaying(false);
    }, 2000);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 text-neonText">
      <h1 className="text-3xl font-bold mb-6 text-center bg-neon-gradient bg-clip-text text-transparent animate-pulse">
        Book Virtual Golf
      </h1>

      <div className="space-y-6 bg-darkBg p-6 rounded-lg shadow-neon border border-neonCyan">
        {/* Date Picker */}
        <div>
          <label className="block font-semibold mb-1">Select Date and Time:</label>
          <DatePicker
            selected={golfDate}
            onChange={(date) => setGolfDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* Number of People */}
        <div>
          <label className="block font-semibold mb-1">Number of People:</label>
          <Input
            type="number"
            min={1}
            value={golfPeople}
            onChange={(e) => setGolfPeople(Number(e.target.value))}
          />
        </div>

        {/* Pre-order Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="preorder"
            checked={golfPreOrder}
            onChange={(e) => setGolfPreOrder(e.target.checked)}
          />
          <label htmlFor="preorder">Would you like to pre-order food with your booking?</label>
        </div>

        {/* Finalize Booking */}
        <Button
          onClick={handleFinalizeBook}
          disabled={isBooking}
          className="w-full text-lg"
        >
          {isBooking ? 'Booking...' : 'Finalize Booking'}
        </Button>

        {/* Pay Now (if pre-order selected) */}
        {golfPreOrder && (
          <Button
            onClick={handleCheckout}
            disabled={isPaying}
            variant="secondary"
            className="w-full text-lg mt-2"
          >
            {isPaying ? 'Processing Payment...' : 'Checkout & Pay'}
          </Button>
        )}
      </div>
    </main>
  );
}
