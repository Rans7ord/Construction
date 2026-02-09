'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProjectCard } from '@/components/project-card';
import { Plus, ArrowLeft } from 'lucide-react';
import { safeNumber } from '@/lib/utils';


export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { state } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const projects = state.projects;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 sm:mb-6 gap-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">All Projects</h2>
              <p className="text-muted-foreground mt-1">
                Manage and view all construction projects
              </p>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => router.push('/dashboard/projects/create')}
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>

          {/* Statistics */}
          {projects.length > 0 && (
            <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
              <Card className="p-4 sm:p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Projects</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{projects.length}</p>
              </Card>
              <Card className="p-4 sm:p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Active</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {projects.filter((p) => p.status === 'active').length}
                </p>
              </Card>
              <Card className="p-4 sm:p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground truncate">
                  ₵{(projects.reduce((sum, p) => sum + safeNumber(p.totalBudget), 0) / 1000000).toFixed(1)}M
                </p>
              </Card>
              <Card className="p-4 sm:p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                <p className="text-xl sm:text-3xl font-bold text-orange-600 truncate">
                  ₵{(state.expenses.reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)}M
                </p>
              </Card>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-primary/20">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first construction project.
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => router.push('/dashboard/projects/create')} size="sm">
                  Create Project
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stats={{
                    totalExpenses: state.expenses
                      .filter((e) => e.projectId === project.id)
                      .reduce((sum, e) => sum + e.amount, 0),
                    stepCount: state.steps.filter((s) => s.projectId === project.id).length,
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedLayout>
  );
}
