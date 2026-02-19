// FILE LOCATION: app/dashboard/petty-cash/page.tsx

'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/date-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface PettyCashTransaction {
  id: string;
  amount: number;
  description: string;
  category?: string;
  vendor?: string;
  type: 'inflow' | 'outflow';
  date: string;
  added_by: string;
  added_by_name: string;
  created_at: string;
}

interface PettyCashData {
  transactions: PettyCashTransaction[];
  balance: number;
  inflows: number;
  outflows: number;
}

export default function PettyCashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PettyCashData>({ transactions: [], balance: 0, inflows: 0, outflows: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect staff — they have no access to petty cash
  useEffect(() => {
    if (user && user.role === 'staff') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    vendor: '',
    type: 'outflow' as 'inflow' | 'outflow',
    date: new Date().toISOString().split('T')[0],
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    vendor: '',
    type: 'all',
  });

  const fetchPettyCash = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.vendor) params.append('vendor', filters.vendor);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);

      const response = await fetch(`/api/petty-cash?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch petty cash data');
      }
    } catch (error) {
      toast.error('Error fetching petty cash data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'staff') {
      fetchPettyCash();
    }
  }, [filters, user]);

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const canAdd = isAdmin || isSupervisor; // Both admin and supervisor can add
  const canDelete = isAdmin; // Only admin can delete

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.type || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a number greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: formData.description.trim(),
          category: formData.category.trim() || null,
          vendor: formData.vendor.trim() || null,
          type: formData.type,
          date: formData.date,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add transaction');
      }
      toast.success('Transaction added successfully');
      setFormData({ amount: '', description: '', category: '', vendor: '', type: 'outflow', date: new Date().toISOString().split('T')[0] });
      await fetchPettyCash();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error adding transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (data.transactions.length === 0) { toast.error('No transactions to export'); return; }
    const headers = ['Date', 'Type', 'Description', 'Category', 'Vendor', 'Amount', 'Added By'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map(t => [
        t.date, t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category ? `"${t.category.replace(/"/g, '""')}"` : '',
        t.vendor ? `"${t.vendor.replace(/"/g, '""')}"` : '',
        Number(t.amount).toFixed(2),
        `"${t.added_by_name.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petty-cash-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', category: '', vendor: '', type: 'all' });
  };

  // Don't render anything for staff (redirect in progress)
  if (user?.role === 'staff') return null;

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Petty Cash Management</h1>
              <p className="text-muted-foreground mt-2">Track inflows, outflows, and maintain petty cash balance</p>
            </div>
            <Button variant="outline" onClick={exportToCSV} className="gap-2" disabled={data.transactions.length === 0}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Balance Summary */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                  <p className={`text-3xl font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    ₵{Number(data.balance).toFixed(2)}
                  </p>
                </div>
                <Wallet className={`w-8 h-8 opacity-50 ${data.balance >= 0 ? 'text-green-600' : 'text-destructive'}`} />
              </div>
            </Card>
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Inflows</p>
                  <p className="text-3xl font-bold text-green-600">₵{Number(data.inflows).toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Outflows</p>
                  <p className="text-3xl font-bold text-orange-600">₵{Number(data.outflows).toFixed(2)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Add Transaction Form - for admin and supervisor */}
          {canAdd && (
            <Card className="p-6 mb-8 border-border/50">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Transaction
              </h3>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(v: 'inflow' | 'outflow') => setFormData({...formData, type: v})} disabled={submitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflow">Inflow</SelectItem>
                      <SelectItem value="outflow">Outflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required max={new Date().toISOString().split('T')[0]} disabled={submitting} />
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Enter transaction description" required disabled={submitting} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Office Supplies" disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} placeholder="e.g., Office Depot" disabled={submitting} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Adding...' : 'Add Transaction'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Filters */}
          <Card className="p-6 mb-8 border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} min={filters.startDate} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} placeholder="Filter by category" />
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={filters.vendor} onChange={(e) => setFilters({...filters, vendor: e.target.value})} placeholder="Filter by vendor" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inflow">Inflow</SelectItem>
                    <SelectItem value="outflow">Outflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Transaction History */}
          <Card className="p-6 border-border/50">
            <h3 className="text-lg font-semibold mb-6">Transaction History</h3>
            {data.transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Added By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'inflow' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {transaction.type === 'inflow' ? 'Inflow' : 'Outflow'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell>{transaction.category || '-'}</TableCell>
                        <TableCell>{transaction.vendor || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${transaction.type === 'inflow' ? 'text-green-600' : 'text-orange-600'}`}>
                          {transaction.type === 'inflow' ? '+' : '-'}₵{Number(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{transaction.added_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </ProtectedLayout>
  );
}