'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { PettyCashForm } from '@/components/petty-cash-form';
import { PettyCashTable } from '@/components/petty-cash-table';
import { PettyCashBalance } from '@/components/petty-cash-balance';

interface PettyCashTransaction {
  id: string;
  amount: number;
  description: string;
  category?: string;
  vendor?: string;
  type: 'inflow' | 'outflow';
  date: string;
  added_by: string;
  created_at: string;
}

export default function PettyCashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [balance, setBalance] = useState({ balance: 0, totalInflow: 0, totalOutflow: 0 });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    vendor: '',
    type: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTransactions();
      fetchBalance();
    }
  }, [mounted, filters]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.vendor) params.append('vendor', filters.vendor);
      if (filters.type) params.append('type', filters.type);

      const response = await fetch(`/api/petty-cash?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data || []);
    } catch (error) {
      console.error('[v0] Fetch petty cash error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/petty-cash/balance', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      setBalance(data);
    } catch (error) {
      console.error('[v0] Fetch balance error:', error);
    }
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
    fetchTransactions();
    fetchBalance();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Description', 'Category', 'Vendor', 'Amount'];
    const rows = transactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      t.description,
      t.category || '',
      t.vendor || '',
      t.amount,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petty-cash-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) return;

    const doc = document.createElement('div');
    doc.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        .summary { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
      <h1>Petty Cash Report</h1>
      <div class="summary">
        <p><strong>Balance:</strong> $${balance.balance.toFixed(2)}</p>
        <p><strong>Total Inflow:</strong> $${balance.totalInflow.toFixed(2)}</p>
        <p><strong>Total Outflow:</strong> $${balance.totalOutflow.toFixed(2)}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Category</th>
            <th>Vendor</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${t.date}</td>
              <td>${t.type.toUpperCase()}</td>
              <td>${t.description}</td>
              <td>${t.category || ''}</td>
              <td>${t.vendor || ''}</td>
              <td>$${t.amount.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '', 'width=900,height=600');
    if (printWindow) {
      printWindow.document.write(doc.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!mounted) return null;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Petty Cash Management</h2>
              <p className="text-muted-foreground mt-1">
                Track and manage petty cash inflows and outflows
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExportCSV}
                  disabled={transactions.length === 0}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExportPDF}
                  disabled={transactions.length === 0}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Transaction
                </Button>
              </div>
            )}
          </div>

          {/* Balance Summary */}
          <PettyCashBalance balance={balance} />

          {/* Add Transaction Form */}
          {showForm && (
            <Card className="p-6 mb-8 border-border/50">
              <PettyCashForm onSuccess={handleTransactionAdded} />
            </Card>
          )}

          {/* Transactions Table */}
          <PettyCashTable
            transactions={transactions}
            isLoading={isLoading}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </main>
      </div>
    </ProtectedLayout>
  );
}
