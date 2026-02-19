'use client';

import { ProjectStep } from '@/lib/store';
import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { StepModal } from './step-modal';

interface StepsSectionProps {
  projectId: string;
  steps: ProjectStep[];
}

export function StepsSection({ projectId, steps }: StepsSectionProps) {
  const { user } = useAuth();
  const { deleteStep } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState<ProjectStep | null>(null);

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const canAdd = isAdmin || isSupervisor; // Both admin and supervisor can add
  const canDelete = isAdmin; // Only admin can delete

  const handleEdit = (step: ProjectStep) => {
    setEditingStep(step);
    setShowModal(true);
  };

  const handleDelete = (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      deleteStep(stepId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Steps</h3>
        {canAdd && (
          <Button
            onClick={() => {
              setEditingStep(null);
              setShowModal(true);
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </Button>
        )}
      </div>

      {steps.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <p className="text-muted-foreground">No steps created yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps
            .sort((a, b) => a.order - b.order)
            .map((step, idx) => (
              <Card
                key={step.id}
                className="p-6 hover:shadow-md transition border-border/50 hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </span>
                      <h4 className="text-lg font-semibold">{step.name}</h4>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(step.status)}`}>
                        {step.status.replace('-', ' ').charAt(0).toUpperCase() +
                          step.status.replace('-', ' ').slice(1)}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    )}
                    <p className="text-sm font-medium text-primary">
                      Budget: ₵{(step.estimatedBudget / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(step)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Delete only for admin */}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(step.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      <StepModal
        open={showModal}
        onOpenChange={setShowModal}
        projectId={projectId}
        step={editingStep}
      />
    </div>
  );
}