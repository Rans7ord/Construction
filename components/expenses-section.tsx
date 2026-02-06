//comp

'use client';

import { Expense, ProjectStep } from '@/lib/store';
import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { ExpenseModal } from './expense-modal';
import { formatDate } from '@/lib/date-utils';

// Use when displaying expense dates

interface ExpensesSectionProps {
  projectId: string;
  expenses: Expense[];
  steps: ProjectStep[];
}

export function ExpensesSection({ projectId, expenses, steps }: ExpensesSectionProps) {
  const { user } = useAuth();
  const { deleteExpense } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterStep, setFilterStep] = useState<string | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
    }
  };

  const filteredExpenses = filterStep
    ? expenses.filter((e) => e.stepId === filterStep)
    : expenses;

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by step
  const expensesByStep = steps.map((step) => ({
    step,
    expenses: expenses.filter((e) => e.stepId === step.id),
    total: expenses
      .filter((e) => e.stepId === step.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold">Expenses by Step</h3>
        {user?.role === 'admin' && (
          <Button
            onClick={() => {
              setEditingExpense(null);
              setShowModal(true);
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <p className="text-muted-foreground">No expenses recorded yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {expensesByStep.map(({ step, expenses: stepExpenses, total: stepTotal }) => (
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
                        {stepExpenses.length} transaction{stepExpenses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ₵{(stepTotal / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Budget: ₵{(step.estimatedBudget / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                {stepExpenses.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {stepExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="p-3 bg-background rounded border border-border/50 flex items-center justify-between group hover:border-primary/30 transition"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{expense.description}</h5>
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              <span>📅 {formatDate(expense.date)}</span>
                              <span>🏢 {expense.vendor}</span>
                              <span>📂 {expense.category}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-foreground">
                              ₵{(expense.amount / 1000).toFixed(1)}K
                            </p>
                          </div>
                          {user?.role === 'admin' && (
                            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(expense.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      <ExpenseModal
        open={showModal}
        onOpenChange={setShowModal}
        projectId={projectId}
        steps={steps}
        expense={editingExpense}
      />
    </div>
  );
}
