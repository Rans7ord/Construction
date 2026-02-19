// components/materials-section.tsx

'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';

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
  steps?: any[];
}

export default function MaterialsSection({ projectId, stepId, readOnly = false, steps = [] }: MaterialsSectionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stepId: stepId || '',
    name: '',
    type: '',
    quantity: '',
    unit: 'pcs',
    description: '',
  });
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isStaff = user?.role === 'staff';

  // Staff can add requisitions; admin and supervisor can manage
  const canAdd = isAdmin || isSupervisor || isStaff;
  const canDelete = isAdmin; // Only admin can delete
  const canApprove = isAdmin || isSupervisor; // Supervisors and admins can approve

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
      }
    } catch (error) {
      console.error('[v0] Fetch materials error:', error);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStepId = stepId || formData.stepId;
    if (!selectedStepId || !formData.name || !formData.type || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    
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
          stepId: selectedStepId,
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

      setFormData({ stepId: stepId || '', name: '', type: '', quantity: '', unit: 'pcs', description: '' });
      setIsOpen(false);
      await fetchMaterials();
      alert(isStaff ? 'Requisition submitted successfully. Awaiting approval.' : 'Material added successfully');
    } catch (error) {
      console.error('[v0] Add material error:', error);
      alert(error instanceof Error ? error.message : 'Failed to add material. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ordered' }),
      });
      if (response.ok) {
        await fetchMaterials();
        alert('Material requisition approved');
      }
    } catch (error) {
      console.error('[v0] Approve material error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        const response = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchMaterials();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending Approval</span>;
      case 'ordered':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">✅ Approved / Ordered</span>;
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">📦 Received</span>;
      case 'used':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">🔧 Used</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Materials</h2>
          {isStaff && (
            <p className="text-sm text-muted-foreground mt-1">Submit material requisitions for supervisor approval</p>
          )}
        </div>
        {!readOnly && canAdd && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                {isStaff ? 'Request Material' : 'Add Material'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isStaff ? 'Submit Material Requisition' : 'Add New Material'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                {!stepId && steps.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Step *</label>
                    <select
                      value={formData.stepId}
                      onChange={(e) => setFormData({ ...formData, stepId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select a step</option>
                      {steps.map((step) => (
                        <option key={step.id} value={step.id}>
                          {step.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : (isStaff ? 'Submit Requisition' : 'Add Material')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {materials.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <p className="text-muted-foreground">No materials added yet</p>
          {isStaff && <p className="text-sm text-muted-foreground mt-1">Click "Request Material" to submit a requisition</p>}
        </Card>
      ) : (
        <div className="space-y-4">
          {steps.map((step) => {
            const stepMaterials = materials.filter((m) => m.stepId === step.id);
            if (stepMaterials.length === 0) return null;

            return (
              <div key={step.id}>
                <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {stepMaterials.length} material{stepMaterials.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {stepMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="p-3 bg-background rounded border border-border/50 flex items-center justify-between group hover:border-primary/30 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-medium text-sm">{material.name}</h5>
                            {getStatusBadge(material.status)}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span>📦 {material.type}</span>
                            <span>📊 {material.quantity} {material.unit}</span>
                          </div>
                          {material.description && (
                            <p className="text-xs text-muted-foreground mt-1">{material.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {/* Approve button for supervisors and admins when material is pending */}
                          {canApprove && material.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(material.id)}
                              className="text-green-600 hover:bg-green-50 border-green-300 gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </Button>
                          )}
                          {/* Delete only for admin */}
                          {canDelete && !readOnly && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                              className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}