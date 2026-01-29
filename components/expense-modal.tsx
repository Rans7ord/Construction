'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Expense, ProjectStep } from '@/lib/store';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  steps: ProjectStep[];
  expense?: Expense | null;
}

export function ExpenseModal({
  open,
  onOpenChange,
  projectId,
  steps,
  expense,
}: ExpenseModalProps) {
  const { addExpense, updateExpense } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '',
    category: '',
    vendor: '',
    receipt: '',
    stepId: '',
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        date: expense.date,
        category: expense.category,
        vendor: expense.vendor,
        receipt: expense.receipt,
        stepId: expense.stepId,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        amount: '',
        description: '',
        date: today,
        category: 'Materials',
        vendor: '',
        receipt: '',
        stepId: steps[0]?.id || '',
      });
    }
  }, [expense, steps, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (expense) {
      updateExpense(expense.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      addExpense({
        projectId,
        ...formData,
        amount: parseFloat(formData.amount),
        createdBy: user!.id,
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
            <h2 className="text-2xl font-bold">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Step *</label>
              <select
                value={formData.stepId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stepId: e.target.value }))
                }
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a step</option>
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </select>
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
                placeholder="e.g., Concrete delivery"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    required
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Materials">Materials</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Permits">Permits</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vendor *</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Vendor name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Receipt Number *</label>
              <input
                type="text"
                value={formData.receipt}
                onChange={(e) => setFormData((prev) => ({ ...prev, receipt: e.target.value }))}
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., INV-001"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {expense ? 'Update' : 'Add'} Expense
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
