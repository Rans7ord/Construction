// FILE LOCATION: app/dashboard/projects/page.tsx

'use client';

import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useRouter } from 'next/navigation';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project-card';
import { ArrowLeft, Plus } from 'lucide-react';
import { safeNumber } from '@/lib/utils';

export default function AllProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { state } = useData();

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  const projects = state.projects;

  const totalBudget = projects.reduce(
    (sum, p) => sum + safeNumber(p.totalBudget || (p as any).total_budget),
    0
  );
  const totalSpent = state.expenses.reduce(
    (sum, e) => sum + safeNumber(e.amount),
    0
  );
  const activeCount = projects.filter((p) => p.status === 'active').length;

  function fmtShort(n: number) {
    if (n >= 1_000_000) return `GHC ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `GHC ${(n / 1_000).toFixed(1)}K`;
    return `GHC ${n.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">All Projects</h1>
              <p className="text-muted-foreground mt-1">Manage and view all construction projects</p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => router.push('/dashboard/projects/create')}
                className="gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>

          {/* Summary cards — Total Budget & Total Spent hidden from staff */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-8">
            <Card className="p-5 border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-foreground">{projects.length}</p>
            </Card>

            <Card className="p-5 border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            </Card>

            {/* Hidden from staff */}
            {!isStaff && (
              <>
                <Card className="p-5 border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-primary">{fmtShort(totalBudget)}</p>
                </Card>

                <Card className="p-5 border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-orange-600">{fmtShort(totalSpent)}</p>
                </Card>
              </>
            )}
          </div>

          {/* Projects grid */}
          {projects.length === 0 ? (
            <Card className="p-12 text-center border-primary/20">
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">
                {isAdmin
                  ? 'Get started by creating your first construction project.'
                  : 'No projects are available yet.'}
              </p>
              {isAdmin && (
                <Button onClick={() => router.push('/dashboard/projects/create')}>
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
                      .reduce((sum, e) => sum + Number(e.amount || 0), 0),
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