'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Material {
  id: string;
  projectId: string;
  stepId: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  description?: string;
  status: 'pending' | 'ordered' | 'received' | 'used';
  createdAt: string;
}

interface MaterialsSectionProps {
  projectId: string;
  stepId?: string;
  readOnly?: boolean;
}

export default function MaterialsSection({ projectId, stepId, readOnly = false }: MaterialsSectionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: '',
    unit: 'pcs',
    description: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, [projectId, stepId]);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams();
      params.append('projectId', projectId);
      if (stepId) params.append('stepId', stepId);

      const response = await fetch(`/api/materials?${params}`);
      const data = await response.json();
      setMaterials(data || []);
    } catch (error) {
      console.error('[v0] Fetch materials error:', error);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          stepId: stepId || projectId,
          ...formData,
          quantity: parseFloat(formData.quantity),
        }),
      });

      if (response.ok) {
        setFormData({ name: '', type: '', quantity: '', unit: 'pcs', description: '' });
        setIsOpen(false);
        fetchMaterials();
      }
    } catch (error) {
      console.error('[v0] Add material error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        await fetch(`/api/materials/${id}`, { method: 'DELETE' });
        fetchMaterials();
      } catch (error) {
        console.error('[v0] Delete material error:', error);
      }
    }
  };

  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Materials</h2>
        {!readOnly && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Material Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Cement, Steel Rebar"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Concrete, Metal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>pcs</option>
                      <option>kg</option>
                      <option>ton</option>
                      <option>m</option>
                      <option>m2</option>
                      <option>m3</option>
                      <option>liters</option>
                      <option>bags</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Optional details about the material"
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Material'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No materials added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{material.name}</h3>
                  <p className="text-sm text-muted-foreground">{material.type}</p>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{material.quantity} {material.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{material.status}</p>
                </div>
              </div>

              {material.description && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  {material.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
