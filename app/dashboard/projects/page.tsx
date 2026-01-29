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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">All Projects</h2>
              <p className="text-muted-foreground mt-1">
                Manage and view all construction projects
              </p>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => router.push('/dashboard/projects/create')}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            )}
          </div>

          {/* Statistics */}
          {projects.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Projects</p>
                <p className="text-3xl font-bold text-foreground">{projects.length}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {projects.filter((p) => p.status === 'active').length}
                </p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                <p className="text-3xl font-bold text-foreground">
                  ${(projects.reduce((sum, p) => sum + p.totalBudget, 0) / 1000000).toFixed(1)}M
                </p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${(state.expenses.reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)}M
                </p>
              </Card>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="p-12 text-center border-primary/20">
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first construction project.
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => router.push('/dashboard/projects/create')}>
                  Create Project
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
