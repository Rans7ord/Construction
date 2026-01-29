'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { MoneyIn } from '@/lib/store';
import { useData } from '@/lib/data-context';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';

interface MoneyInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  moneyIn?: MoneyIn | null;
}

export function MoneyInModal({ open, onOpenChange, projectId, moneyIn }: MoneyInModalProps) {
  const { addMoneyIn, updateMoneyIn } = useData();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '',
    reference: '',
  });

  useEffect(() => {
    if (moneyIn) {
      setFormData({
        amount: moneyIn.amount.toString(),
        description: moneyIn.description,
        date: moneyIn.date,
        reference: moneyIn.reference,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        amount: '',
        description: '',
        date: today,
        reference: '',
      });
    }
  }, [moneyIn, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (moneyIn) {
      updateMoneyIn(moneyIn.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      addMoneyIn({
        projectId,
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{moneyIn ? 'Edit Income' : 'Add Income'}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Initial advance payment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reference *</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Check #1001 or Bank Transfer #2024-01-001"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {moneyIn ? 'Update' : 'Add'} Income
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
