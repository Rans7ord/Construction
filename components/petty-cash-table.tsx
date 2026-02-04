'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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

interface Filters {
  startDate: string;
  endDate: string;
  category: string;
  vendor: string;
  type: string;
}

interface PettyCashTableProps {
  transactions: PettyCashTransaction[];
  isLoading: boolean;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function PettyCashTable({
  transactions,
  isLoading,
  filters,
  onFiltersChange,
}: PettyCashTableProps) {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/petty-cash?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete transaction');

      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });

      // Trigger page refresh by calling parent's fetch
      window.location.reload();
    } catch (error) {
      console.error('[v0] Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const outflowCategories = [
    'Office Supplies',
    'Refreshments',
    'Transport',
    'Postage',
    'Maintenance',
    'Utilities',
    'Other',
  ];

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Filter Section */}
      <div className="border-b border-border/50">
        <div className="p-4 flex items-center justify-between bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="p-4 bg-muted/20 grid gap-4 md:grid-cols-2 lg:grid-cols-5 border-b border-border/50">
            {/* Start Date Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  onFiltersChange({ ...filters, type: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              >
                <option value="">All</option>
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  onFiltersChange({ ...filters, category: e.target.value })
                }
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              >
                <option value="">All</option>
                {outflowCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Vendor
              </label>
              <input
                type="text"
                value={filters.vendor}
                onChange={(e) =>
                  onFiltersChange({ ...filters, vendor: e.target.value })
                }
                placeholder="Filter by vendor"
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions found. Add one to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Vendor
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'inflow'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {transaction.category || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {transaction.vendor || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-right">
                    <span
                      className={
                        transaction.type === 'inflow'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {transaction.type === 'inflow' ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
