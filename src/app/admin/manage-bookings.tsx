'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  profiles: { username: string };
};

const statusOptions = ['pending', 'confirmed', 'cancelled'] as const;

export default function ManageBookings() {
  const supabase = createClientComponentClient<Database>();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile || profile.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch all bookings with joins
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (username)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        setError(`Error fetching bookings: ${bookingsError.message}`);
        setIsLoading(false);
        return;
      }

      setBookings(bookingsData || []);
      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription for bookings
    const bookingsSubscription = supabase
      .channel('bookings-channel')
      .on<Database['public']['Tables']['bookings']['Row']>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['bookings']['Row']>) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new booking with joins
            supabase
              .from('bookings')
              .select(`
                *,
                profiles (username)
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) setBookings((prev) => [data, ...prev]);
              });
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((booking) => (booking.id === payload.new.id ? { ...booking, ...payload.new } : booking))
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((booking) => booking.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, [authLoading, profile, router, supabase]);

  const filteredBookings = filterStatus === 'all' ? bookings : bookings.filter((booking) => booking.status === filterStatus);

  const handleUpdateStatus = async (id: string, newStatus: typeof statusOptions[number]) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) {
      setError(`Error updating status: ${error.message}`);
      toast.error('Failed to update status');
    } else {
      toast.success('Booking status updated');
    }
    // Real-time will handle state update
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-neonText">
          <Skeleton className="h-8 w-48 bg-neon-green/20" />
        </h2>
        <Skeleton className="h-64 w-full bg-neon-green/20" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/50 border-red-500">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neonText">Manage Bookings</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-black/70 border-neon-blue/50 text-neon-blue">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-neon-blue/50">
            <SelectItem value="all">All</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-neon-green/20">
            <TableHead className="text-neon-green">ID</TableHead>
            <TableHead className="text-neon-green">User</TableHead>
            <TableHead className="text-neon-green">Type</TableHead>
            <TableHead className="text-neon-green">Date</TableHead>
            <TableHead className="text-neon-green">Time Slot</TableHead>
            <TableHead className="text-neon-green">Status</TableHead>
            <TableHead className="text-neon-green">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400">
                No bookings found.
              </TableCell>
            </TableRow>
          ) : (
            filteredBookings.map((booking) => (
              <TableRow key={booking.id} className="border-b border-neon-green/10 hover:bg-neon-green/5">
                <TableCell>{booking.id.slice(0, 8)}...</TableCell>
                <TableCell>{booking.profiles.username}</TableCell>
                <TableCell>{booking.type}</TableCell>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.time_slot}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      booking.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : booking.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisVerticalIcon className="h-4 w-4 text-neon-green" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 border-neon-green/50">
                      <DropdownMenuItem className="p-0">
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleUpdateStatus(booking.id, value as typeof statusOptions[number])}
                        >
                          <SelectTrigger className="w-full bg-transparent border-none text-neon-blue focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-neon-blue/50">
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                Set to {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}