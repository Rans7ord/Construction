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

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    vendor: '',
    type: 'outflow' as 'inflow' | 'outflow',
    date: new Date().toISOString().split('T')[0],
  });

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    vendor: '',
    type: '',
  });

  const fetchPettyCash = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.vendor) params.append('vendor', filters.vendor);
      if (filters.type) params.append('type', filters.type);

      const response = await fetch(`/api/petty-cash?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch petty cash data');
      }
    } catch (error) {
      console.error('Error fetching petty cash:', error);
      toast.error('Error fetching petty cash data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPettyCash();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        toast.success('Transaction added successfully');
        setFormData({
          amount: '',
          description: '',
          category: '',
          vendor: '',
          type: 'outflow',
          date: new Date().toISOString().split('T')[0],
        });
        fetchPettyCash();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Error adding transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Category', 'Vendor', 'Amount', 'Added By'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map(t => [
        t.date,
        t.type,
        `"${t.description}"`,
        t.category || '',
        t.vendor || '',
        t.amount,
        `"${t.added_by_name}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petty-cash-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple text-based PDF export for now
    const content = `Petty Cash Report - ${new Date().toLocaleDateString()}\n\n`;
    const summary = `Balance: $${data.balance.toFixed(2)}\nInflows: $${data.inflows.toFixed(2)}\nOutflows: $${data.outflows.toFixed(2)}\n\n`;
    const transactions = data.transactions.map(t =>
      `${t.date} - ${t.type.toUpperCase()} - ${t.description} - $${t.amount.toFixed(2)} - ${t.added_by_name}`
    ).join('\n');

    const fullContent = content + summary + 'Transactions:\n' + transactions;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petty-cash-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading petty cash data...</p>
          </div>
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

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Petty Cash Management</h1>
              <p className="text-muted-foreground mt-2">Track inflows, outflows, and maintain petty cash balance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                  <p className={`text-3xl font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    ${data.balance.toFixed(2)}
                  </p>
                </div>
                <Wallet className={`w-8 h-8 opacity-50 ${data.balance >= 0 ? 'text-green-600' : 'text-destructive'}`} />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Inflows</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${data.inflows.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Outflows</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${data.outflows.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Add Transaction Form */}
          <Card className="p-6 mb-8 border-border/50">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Transaction
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: 'inflow' | 'outflow') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Inflow</SelectItem>
                    <SelectItem value="outflow">Outflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Office Supplies"
                />
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  placeholder="e.g., Office Depot"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Adding...' : 'Add Transaction'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Filters */}
          <Card className="p-6 mb-8 border-border/50">
            <h3 className="text-lg font-semibold mb-6">Filters</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="filterCategory">Category</Label>
                <Input
                  id="filterCategory"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  placeholder="Filter by category"
                />
              </div>

              <div>
                <Label htmlFor="filterVendor">Vendor</Label>
                <Input
                  id="filterVendor"
                  value={filters.vendor}
                  onChange={(e) => setFilters({...filters, vendor: e.target.value})}
                  placeholder="Filter by vendor"
                />
              </div>

              <div>
                <Label htmlFor="filterType">Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
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
              <p className="text-muted-foreground text-center py-8">No transactions found</p>
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
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'inflow'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category || '-'}</TableCell>
                        <TableCell>{transaction.vendor || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'inflow' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          ${transaction.amount.toFixed(2)}
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
