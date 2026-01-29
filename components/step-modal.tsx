'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { ProjectStep } from '@/lib/store';
import { useData } from '@/lib/data-context';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';

interface StepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  step?: ProjectStep | null;
}

export function StepModal({ open, onOpenChange, projectId, step }: StepModalProps) {
  const { createStep, updateStep, state } = useData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedBudget: '',
    status: 'pending' as const,
    order: 1,
  });

  useEffect(() => {
    if (step) {
      setFormData({
        name: step.name,
        description: step.description,
        estimatedBudget: step.estimatedBudget.toString(),
        status: step.status as any,
        order: step.order,
      });
    } else {
      const existingSteps = state.steps.filter((s) => s.projectId === projectId);
      setFormData((prev) => ({
        ...prev,
        order: existingSteps.length + 1,
        name: '',
        description: '',
        estimatedBudget: '',
      }));
    }
  }, [step, projectId, state.steps, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step) {
      updateStep(step.id, {
        ...formData,
        estimatedBudget: parseFloat(formData.estimatedBudget),
      });
    } else {
      createStep({
        projectId,
        ...formData,
        estimatedBudget: parseFloat(formData.estimatedBudget),
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
            <h2 className="text-2xl font-bold">{step ? 'Edit Step' : 'Create Step'}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Step Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Foundation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-20 resize-none"
                placeholder="Step details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget *</label>
                <input
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estimatedBudget: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as any }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {step ? 'Update' : 'Create'} Step
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
