'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Material } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Material, 'id'> | Partial<Material>) => void;
  projectId: string;
  stepId?: string;
  initialData?: Material;
}

export default function MaterialModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  stepId,
  initialData,
}: MaterialModalProps) {
  const [formData, setFormData] = useState({
    materialName: '',
    materialType: '',
    quantity: 0,
    unit: 'pcs',
    description: '',
    costPerUnit: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        materialName: initialData.materialName,
        materialType: initialData.materialType,
        quantity: initialData.quantity,
        unit: initialData.unit,
        description: initialData.description || '',
        costPerUnit: initialData.costPerUnit || 0,
      });
    } else {
      setFormData({
        materialName: '',
        materialType: '',
        quantity: 0,
        unit: 'pcs',
        description: '',
        costPerUnit: 0,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.materialName || !formData.materialType) {
      alert('Please fill in all required fields');
      return;
    }

    const totalCost = formData.quantity * formData.costPerUnit;

    const data = {
      projectId,
      stepId,
      ...formData,
      totalCost,
    };

    onSubmit(data as Omit<Material, 'id'>);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Material' : 'Add Material'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material Name*</label>
            <input
              type="text"
              value={formData.materialName}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Portland Cement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type*</label>
            <input
              type="text"
              value={formData.materialType}
              onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Cement"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity*</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit*</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="pcs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cost Per Unit (₵)</label>
            <input
              type="number"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {formData.quantity > 0 && formData.costPerUnit > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Cost:</p>
              <p className="text-lg font-bold text-primary">
                ₵{(formData.quantity * formData.costPerUnit).toLocaleString()}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Update' : 'Add'} Material</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
