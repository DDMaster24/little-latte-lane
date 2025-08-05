"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ManageMenu from './manage-menu';
import ManageOrders from './manage-orders';
import ManageBookings from './manage-bookings';
import StaffPanel from './staff-panel';
import Analytics from './analytics';
import ManageRequests from './manage-requests';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profile?.role !== 'admin') {
      router.push('/'); // Redirect to home if not admin
      // Optional: Add a toast message here later for "Access denied"
    }
  }, [profile, router]);

  if (profile?.role !== 'admin') {
    return <p>Access denied. Redirecting...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Manage Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <ManageMenu />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ManageOrders />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ManageBookings />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Staff Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffPanel />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Analytics />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Manage Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <ManageRequests />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Update site settings, notifications.</p>
            {/* Add forms here later */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}