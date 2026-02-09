'use client';

import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProtectedLayout } from '@/app/app-layout';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatAmount, safeNumber } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

// Use when displaying project details in reports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, FileText, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { state, exportProjectToExcel } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('all');

  const projects = state.projects;
  const selectedProject = selectedProjectId !== 'all' ? projects.find((p) => p.id === selectedProjectId) : null;

  const projectExpenses = selectedProject
    ? state.expenses.filter((e) => e.projectId === selectedProject.id)
    : state.expenses;

  const projectSteps = selectedProject
    ? state.steps.filter((s) => s.projectId === selectedProject.id)
    : state.steps;

  const projectMoneyIn = selectedProject
    ? state.moneyIn.filter((m) => m.projectId === selectedProject.id)
    : state.moneyIn;

  // ✅ FIX: Ensure proper number parsing
  const totalBudget = selectedProject
    ? safeNumber(selectedProject.totalBudget || (selectedProject as any).total_budget)
    : projects.reduce((sum, p) => sum + safeNumber(p.totalBudget || (p as any).total_budget), 0);

  const totalSpent = projectExpenses.reduce((sum, e) => sum + safeNumber(e.amount), 0);
  const totalIncome = projectMoneyIn.reduce((sum, m) => sum + safeNumber(m.amount), 0);
  const remaining = totalBudget - totalSpent;

  const generatePDF = () => {
    let content = 'Logonvoice - Project Report\n';
    content += '================================\n\n';

    if (selectedProject) {
      content += `Project: ${selectedProject.name}\n`;
      content += `Location: ${selectedProject.location}\n`;
      content += `Client: ${selectedProject.clientName}\n`;
      content += `Status: ${selectedProject.status}\n\n`;
    } else {
      content += 'All Projects Report\n\n';
    }

    content += 'BUDGET SUMMARY\n';
    content += `Total Budget: ₵${totalBudget.toLocaleString()}\n`;
    content += `Total Income: ₵${totalIncome.toLocaleString()}\n`;
    content += `Total Expenses: ₵${totalSpent.toLocaleString()}\n`;
    content += `Remaining: ₵${remaining.toLocaleString()}\n`;
    content += `Budget Usage: ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(2) : 0}%\n\n`;

    if (selectedProject) {
      content += 'BREAKDOWN BY STEPS\n';
      projectSteps.forEach((step) => {
        const stepExpenses = projectExpenses.filter((e) => e.stepId === step.id);
        const stepTotal = stepExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const stepBudget = Number(step.estimatedBudget || 0);
        
        content += `\n${step.name}\n`;
        content += `Estimated Budget: ₵${stepBudget.toLocaleString()}\n`;

        content += `Actual Expenses: ₵${stepTotal.toLocaleString()}\n`;
        content += `Status: ${step.status}\n`;

        stepExpenses.forEach((exp) => {
          content += `  - ${exp.description}: ₵${Number(exp.amount || 0).toLocaleString()} (${exp.category})\n`;
        });
      });
    }

    content += '\n\nDETAILED EXPENSE REPORT\n';
    projectExpenses.forEach((expense) => {
      const step = projectSteps.find((s) => s.id === expense.stepId);
      content += `${expense.date} - ${expense.description}\n`;
      content += `  Step: ${step?.name || 'Unknown'}\n`;
      content += `  Amount: ₵${Number(expense.amount || 0).toLocaleString()}\n`;
      content += `  Vendor: ${expense.vendor}\n`;
      content += `  Category: ${expense.category}\n`;
      content += `  Receipt: ${expense.receipt}\n\n`;
    });

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    );
    element.setAttribute(
      'download',
      `report-${selectedProject ? selectedProject.name : 'all-projects'}-${new Date().toISOString().split('T')[0]}.txt`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportCSV = () => {
    if (selectedProjectId !== 'all' && selectedProjectId !== null) {
      exportProjectToExcel(selectedProjectId);
    } else {
      // Export all projects
      state.projects.forEach((project) => {
        exportProjectToExcel(project.id);
      });
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardHeader user={user!} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Reports & Analysis</h1>
              <p className="text-muted-foreground mt-2">Project budgets, expenses, and financial analysis</p>
            </div>
            <Button
              onClick={handleExportCSV}
              className="gap-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Export to CSV
            </Button>
          </div>

          {/* Project Filter */}
          <Card className="p-6 mb-8 border-border/50">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Project
                </label>
                <Select value={selectedProjectId || undefined} onValueChange={(value) => setSelectedProjectId(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProjectId !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => selectedProjectId && exportProjectToExcel(selectedProjectId)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Project
                </Button>
              )}
            </div>
          </Card>

          {/* Report Summary */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                  <p className="text-3xl font-bold">{formatAmount(totalBudget)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatAmount(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatAmount(totalSpent)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Remaining</p>
                  <p
                    className={`text-3xl font-bold ${remaining >= 0 ? 'text-blue-600' : 'text-destructive'}`}
                  >
                    {formatAmount(remaining)}
                  </p>
                </div>
                <DollarSign className={`w-8 h-8 opacity-50 ${remaining >= 0 ? 'text-blue-600' : 'text-destructive'}`} />
              </div>
            </Card>
          </div>

          {/* Budget Usage Chart */}
          <Card className="p-8 mb-8 border-border/50">
            <h3 className="text-lg font-semibold mb-6">Budget Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-semibold">
                    {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-6 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Expense Breakdown */}
          <Card className="p-8 border-border/50">
            <h3 className="text-lg font-semibold mb-6">Expense Breakdown</h3>

            {projectSteps.length === 0 ? (
              <p className="text-muted-foreground">No steps to display</p>
            ) : (
              <div className="space-y-4">
                {projectSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step) => {
                    const stepExpenses = projectExpenses.filter((e) => e.stepId === step.id);
                    const stepTotal = stepExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
                    const stepBudget = Number(step.estimatedBudget || 0);
                    const stepPercentage = stepBudget > 0 ? (stepTotal / stepBudget) * 100 : 0;


                    return (
                      <div key={step.id} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{step.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stepExpenses.length} expense{stepExpenses.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatAmount(stepTotal)} / {formatAmount(stepBudget)}
                            </p>
                            <p className={`text-sm ${stepPercentage <= 100 ? 'text-green-600' : 'text-destructive'}`}>
                              {stepPercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${stepPercentage <= 100 ? 'bg-green-500' : 'bg-destructive'}`}
                            style={{ width: `${Math.min(stepPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>

          {/* Export Report Button */}
          <Button onClick={generatePDF} size="lg" className="gap-2 mt-8">
            <Download className="w-5 h-5" />
            Export Report
          </Button>
        </main>
      </div>
    </ProtectedLayout>
  );
}
