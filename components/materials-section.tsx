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
      if (response.ok) {
        const data = await response.json();
        setMaterials(data || []);
      } else {
        console.error('[v0] Failed to fetch materials');
      }
    } catch (error) {
      console.error('[v0] Fetch materials error:', error);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.type || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate quantity
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          stepId: stepId || projectId, // Fallback to projectId if no stepId
          name: formData.name,
          type: formData.type,
          quantity: quantity,
          unit: formData.unit,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add material');
      }

      // Success - clear form and close dialog
      setFormData({ name: '', type: '', quantity: '', unit: 'pcs', description: '' });
      setIsOpen(false);
      
      // Refetch materials
      await fetchMaterials();
      
      // Show success message
      alert('Material added successfully');
    } catch (error) {
      console.error('[v0] Add material error:', error);
      alert(error instanceof Error ? error.message : 'Failed to add material. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        const response = await fetch(`/api/materials/${id}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          await fetchMaterials();
          alert('Material deleted successfully');
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete material');
        }
      } catch (error) {
        console.error('[v0] Delete material error:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete material');
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
                  <label className="block text-sm font-medium mb-2">Material Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Cement, Steel Rebar"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Concrete, Metal"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0.00"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      disabled={isLoading}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="m">m</option>
                      <option value="m2">m²</option>
                      <option value="m3">m³</option>
                      <option value="liters">liters</option>
                      <option value="bags">bags</option>
                      <option value="sheets">sheets</option>
                      <option value="rolls">rolls</option>
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
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Material'}
                  </Button>
                </div>
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
                    disabled={isLoading}
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