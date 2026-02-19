// FILE LOCATION: app/dashboard/projects/[id]/page.tsx

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Trash2, Download } from 'lucide-react';
import { StepsSection } from '@/components/steps-section';
import { MoneyInSection } from '@/components/money-in-section';
import { ExpensesSection } from '@/components/expenses-section';
import MaterialsSection from '@/components/materials-section';
import RequisitionGeneratorModal from '@/components/requisition-generator-modal';
import { formatAmount, safeNumber } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { state, exportProjectToExcel, deleteProject } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isStaff = user?.role === 'staff';

  // Staff can only see: overview, steps, materials
  // Supervisors and admins can see all tabs
  const availableTabs = isStaff
    ? ['overview', 'steps', 'materials']
    : ['overview', 'steps', 'materials', 'budget', 'expenses'];

  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]);

  const project = state.projects.find((p) => p.id === projectId);
  const projectSteps = state.steps.filter((s) => s.projectId === projectId);
  const projectMoneyIn = state.moneyIn.filter((m) => m.projectId === projectId);
  const projectExpenses = state.expenses.filter((e) => e.projectId === projectId);

  if (!project) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <DashboardHeader user={user!} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Return to Dashboard
              </Button>
            </Card>
          </main>
        </div>
      </ProtectedLayout>
    );
  }

  const totalBudget = safeNumber(project.totalBudget || (project as any).total_budget);
  const totalSpent = projectExpenses.reduce((sum, e) => sum + safeNumber(e.amount), 0);
  const totalIncome = projectMoneyIn.reduce((sum, m) => sum + safeNumber(m.amount), 0);
  const remaining = totalBudget - totalSpent;
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const profit = totalIncome * 0.1;

  const handleDeleteProject = () => {
    deleteProject(projectId);
    router.push('/dashboard');
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{project.name}</h1>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>📍 {project.location || 'No location specified'}</span>
                  <span>👤 {project.clientName || 'No client name'}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Requisition PDF available to admin and supervisor */}
                {(isAdmin || isSupervisor) && (
                  <RequisitionGeneratorModal
                    project={project}
                    expenses={projectExpenses}
                    steps={projectSteps}
                    moneyIn={projectMoneyIn}
                    approvedBy={isSupervisor ? 'Supervisor' : 'Admin'}
                  />
                )}
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportProjectToExcel(projectId)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                    {/* Delete only for admin */}
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </>
                )}
                <span className="px-4 py-2 rounded-lg bg-green-500/10 text-green-700 font-medium">
                  {project.status?.charAt(0)?.toUpperCase() + project.status?.slice(1) || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Summary Cards - hidden from staff */}
          {!isStaff && (
            <div className="grid gap-4 md:grid-cols-5 mb-8">
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                <p className="text-3xl font-bold text-primary">{formatAmount(totalBudget)}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Income/Contract</p>
                <p className="text-3xl font-bold text-green-600">{formatAmount(totalIncome)}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Total Spent/Expenditure</p>
                <p className="text-3xl font-bold text-orange-600">{formatAmount(totalSpent)}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Remaining</p>
                <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                  {formatAmount(Math.abs(remaining))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {remaining >= 0 ? 'Budget surplus' : 'Budget overrun'}
                </p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Profit (10%)</p>
                <p className="text-3xl font-bold text-blue-600">{formatAmount(profit)}</p>
                <p className="text-xs text-muted-foreground mt-1">10% of total income</p>
              </Card>
            </div>
          )}

          {/* Progress Bar - hidden from staff */}
          {!isStaff && (
            <Card className="p-6 mb-8 border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Budget Usage</h3>
                <span className="text-sm font-semibold">{percentageSpent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                ></div>
              </div>
            </Card>
          )}

          {/* Tabs - filtered based on role */}
          <div className="flex gap-4 mb-8 border-b border-border flex-wrap">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition border-b-2 ${
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="p-6 border-border/50">
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground mt-1">{project.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="text-foreground mt-1">
                        {formatDate(project.startDate || (project as any).start_date)} - {formatDate(project.endDate || (project as any).end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client Contact</p>
                      <p className="text-foreground mt-1">{project.clientEmail || 'No email provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-foreground mt-1">
                        {formatDate(project.createdAt || (project as any).created_at)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Budget Summary - hidden from staff */}
                {!isStaff && (
                  <Card className="p-6 border-border/50">
                    <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-2xl font-bold text-primary">{formatAmount(totalBudget)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Approved project budget</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-orange-600">{formatAmount(totalSpent)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Actual expenditure to date</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining Balance</p>
                        <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(Math.abs(remaining))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {remaining >= 0 ? 'Available balance' : 'Budget overrun by'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Budget Utilization</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">{percentageSpent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Project Statistics */}
                <Card className="p-6 border-border/50">
                  <h3 className="text-lg font-semibold mb-4">Project Statistics</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Project Steps</p>
                      <p className="text-2xl font-bold text-foreground">{projectSteps.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total project phases</p>
                    </div>
                    {!isStaff && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Expenses</p>
                          <p className="text-2xl font-bold text-foreground">{projectExpenses.length}</p>
                          <p className="text-xs text-muted-foreground mt-1">Individual expense items</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Income Sources</p>
                          <p className="text-2xl font-bold text-foreground">{projectMoneyIn.length}</p>
                          <p className="text-xs text-muted-foreground mt-1">Payment/revenue entries</p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'steps' && <StepsSection projectId={projectId} steps={projectSteps} />}

            {activeTab === 'materials' && (
              <div className="space-y-6">
                <MaterialsSection projectId={projectId} steps={projectSteps} />
              </div>
            )}

            {/* Budget tab - only for admin and supervisor */}
            {activeTab === 'budget' && !isStaff && (
              <div className="space-y-6">
                <MoneyInSection projectId={projectId} moneyIn={projectMoneyIn} />
              </div>
            )}

            {/* Expenses tab - only for admin and supervisor */}
            {activeTab === 'expenses' && !isStaff && (
              <div className="space-y-6">
                <ExpensesSection
                  projectId={projectId}
                  expenses={projectExpenses}
                  steps={projectSteps}
                />
              </div>
            )}
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-2 text-foreground">Delete Project?</h2>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete "{project.name}"? This action cannot be undone. All project data, steps, and expenses will be permanently removed.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteProject}
                  >
                    Delete Project
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}