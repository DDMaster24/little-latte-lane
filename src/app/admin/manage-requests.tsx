"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Request {
  id: number;
  staff_id: string;
  item_id: number;
  message: string;
  created_at: string;
}

export default function ManageRequests() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    fetchRequests();
    const requestSub = supabase.channel('requests').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests).subscribe();
    return () => { void requestSub.unsubscribe(); };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const handleApprove = async (id: number, itemId: number) => {
    // Increase stock by 50 as example; adjust as needed
    await supabase.rpc('increment_stock', { item_id: itemId, amount: 50 });
    await supabase.from('requests').delete().eq('id', id);
    fetchRequests();
  };

  const handleReject = async (id: number) => {
    await supabase.from('requests').delete().eq('id', id);
    fetchRequests();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Pending Stock Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Staff ID</TableHead>
            <TableHead>Item ID</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.id}</TableCell>
              <TableCell>{req.staff_id}</TableCell>
              <TableCell>{req.item_id}</TableCell>
              <TableCell>{req.message}</TableCell>
              <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleApprove(req.id, req.item_id)} className="mr-2">Approve (+50 Stock)</Button>
                <Button variant="destructive" onClick={() => handleReject(req.id)}>Reject</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}