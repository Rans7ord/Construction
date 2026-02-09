'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { ProjectCard } from '@/components/project-card';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardStats } from '@/components/dashboard-stats';
import ProfitOverview from '@/components/profit-overview';
import { Plus } from 'lucide-react';
import { safeNumber } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { state } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const projects = state.projects;
  
  const totalBudget = projects.reduce((sum, p) => {
    return sum + safeNumber(p.totalBudget || (p as any).total_budget);
  }, 0);

  const totalSpent = state.expenses.reduce((sum, e) => {
    return sum + safeNumber(e.amount);
  }, 0);

  const totalIncome = state.moneyIn.reduce((sum, m) => {
    return sum + safeNumber(m.amount);
  }, 0);
  
  const remaining = totalBudget - totalSpent;
  const profit = totalIncome * 0.1; // 10% profit

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Statistics Overview */}
          <DashboardStats
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            totalIncome={totalIncome}
            remaining={remaining}
            projectCount={projects.length}
          />

          {/* Profit Overview */}
          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Financial Summary</h2>
            <ProfitOverview
              totalIncome={totalIncome}
              totalSpent={totalSpent}
              profit={profit}
              remaining={remaining}
            />
          </div>

          {/* Projects Section */}
          <div className="mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recent Projects</h2>
                <p className="text-muted-foreground mt-1">
                  Manage and track your construction projects
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {projects.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/projects')}
                    size="sm"
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    View All
                  </Button>
                )}
                {user?.role === 'admin' && (
                  <Button
                    onClick={() => router.push('/dashboard/projects/create')}
                    size="sm"
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                )}
              </div>
            </div>

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
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.slice(0, 6).map((project) => (
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
                {projects.length > 6 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/projects')}
                    >
                      View All {projects.length} Projects
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
