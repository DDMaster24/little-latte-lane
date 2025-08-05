import WelcomingSection from './WelcomingSection'; // Your welcome component
import CategoriesSection from './CategoriesSection'; // Your categories component
import BookingsSection from './BookingsSection'; // Your bookings component (assumed to be "Book Now" button)
import { Suspense } from 'react'; // Added for loading state on dynamic fetches

export default function Home() {
  return (
    <main className="flex flex-col p-4"> {/* Removed min-h-screen (handled in layout), added p-4 for consistent padding/margins */}
      <WelcomingSection /> {/* Welcome section */}
      <Suspense fallback={<div className="text-center text-neonText py-4">Loading categories...</div>}>
        <CategoriesSection /> {/* Categories section with loading fallback */}
      </Suspense>
      <BookingsSection /> {/* Bookings section ("Book Now" button) */}
      {/* Footer is in layout.tsx, so no need here */}
    </main>
  );
}