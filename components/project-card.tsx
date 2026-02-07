/**
 * WORKING FIX - Based on Petty Cash Pattern
 * 
 * Replace components/project-card.tsx with this version
 * that handles both snake_case and camelCase gracefully
 */

'use client';

import { Project } from '@/lib/store';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { ArrowRight, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { safeNumber, formatAmount } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

interface ProjectCardProps {
  project: Project;
  stats: {
    totalExpenses: number;
    stepCount: number;
  };
}

export function ProjectCard({ project, stats }: ProjectCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { deleteProject } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // ✅ FIX: Extract all values safely (exactly like petty cash does with transaction.date)
  const projectData = project as any;
  
  const totalBudget = safeNumber(projectData.totalBudget ?? projectData.total_budget);
  const totalExpenses = safeNumber(stats.totalExpenses);
  const spentPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  
  // ✅ CRITICAL: Use ?? (nullish coalescing) instead of || to handle falsy values better
  const startDate = projectData.startDate ?? projectData.start_date;
  const endDate = projectData.endDate ?? projectData.end_date;
  const createdAt = projectData.createdAt ?? projectData.created_at;
  const clientName = projectData.clientName ?? projectData.client_name;
  const name = projectData.name;
  const location = projectData.location;
  const description = projectData.description;
  const status = projectData.status;

  const handleDelete = () => {
    deleteProject(project.id);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700';
      case 'paused':
        return 'bg-orange-500/10 text-orange-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition border-border/50 hover:border-primary/30">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        <div className="space-y-3 mb-6 pb-6 border-b border-border/50">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Budget Usage</span>
              <span className="text-sm font-semibold">{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-semibold text-foreground">
                {formatAmount(totalBudget)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-semibold text-foreground">
                {formatAmount(totalExpenses)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Steps</p>
              <p className="font-semibold text-foreground">{stats.stepCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-semibold text-foreground truncate">{clientName}</p>
            </div>
          </div>
          
          {/* ✅ Dates using the extracted values */}
          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border/30">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-semibold text-foreground">{formatDate(startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-semibold text-foreground">{formatDate(endDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            className="flex-1 gap-2"
            variant="default"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Button>
          {user?.role === 'admin' && (
            <>
              <Button
                onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                variant="outline"
                size="icon"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                size="icon"
                className="border-destructive text-destructive hover:bg-destructive/10"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Delete Project?</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete "{name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-destructive hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}