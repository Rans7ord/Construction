'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  AppState,
  Project,
  ProjectStep,
  MoneyIn,
  Expense,
  User,
  getStoredState,
  saveState,
} from './store';
import { useAuth } from './auth-context';

interface DataContextType {
  state: AppState;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createStep: (step: Omit<ProjectStep, 'id'>) => Promise<void>;
  updateStep: (id: string, updates: Partial<ProjectStep>) => Promise<void>;
  deleteStep: (id: string) => Promise<void>;
  addMoneyIn: (money: Omit<MoneyIn, 'id'>) => Promise<void>;
  updateMoneyIn: (id: string, updates: Partial<MoneyIn>) => Promise<void>;
  deleteMoneyIn: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'companyId'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  exportProjectToExcel: (projectId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(getStoredState());

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load projects
        const projectsResponse = await fetch('/api/projects');
        if (projectsResponse.ok) {
          const projects = await projectsResponse.json();
          setState(prev => ({ ...prev, projects }));
        }

        // Load steps
        const stepsResponse = await fetch('/api/steps');
        if (stepsResponse.ok) {
          const steps = await stepsResponse.json();
          setState(prev => ({ ...prev, steps }));
        }

        // Load expenses
        const expensesResponse = await fetch('/api/expenses');
        if (expensesResponse.ok) {
          const expenses = await expensesResponse.json();
          setState(prev => ({ ...prev, expenses }));
        }

        // Load money-in
        const moneyInResponse = await fetch('/api/money-in');
        if (moneyInResponse.ok) {
          const moneyIn = await moneyInResponse.json();
          setState(prev => ({ ...prev, moneyIn }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user]);

  const saveAndUpdate = (newState: AppState) => {
    setState(newState);
    saveState(newState);
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (response.ok) {
        const newProject = await response.json();
        setState(prev => ({
          ...prev,
          projects: [...prev.projects, newProject],
        }));
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setState(prev => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? updatedProject : p)),
        }));
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
          steps: prev.steps.filter((s) => s.projectId !== id),
          moneyIn: prev.moneyIn.filter((m) => m.projectId !== id),
          expenses: prev.expenses.filter((e) => e.projectId !== id),
        }));
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  };

  const createStep = async (step: Omit<ProjectStep, 'id'>) => {
    try {
      const response = await fetch('/api/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(step),
      });

      if (response.ok) {
        const newStep = await response.json();
        setState(prev => ({
          ...prev,
          steps: [...prev.steps, newStep],
        }));
      } else {
        throw new Error('Failed to create step');
      }
    } catch (error) {
      console.error('Create step error:', error);
      throw error;
    }
  };

  const updateStep = async (id: string, updates: Partial<ProjectStep>) => {
    try {
      const response = await fetch(`/api/steps/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedStep = await response.json();
        setState(prev => ({
          ...prev,
          steps: prev.steps.map((s) => (s.id === id ? updatedStep : s)),
        }));
      } else {
        throw new Error('Failed to update step');
      }
    } catch (error) {
      console.error('Update step error:', error);
      throw error;
    }
  };

  const deleteStep = async (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(`/api/steps/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          steps: prev.steps.filter((s) => s.id !== id),
          expenses: prev.expenses.filter((e) => e.stepId !== id),
        }));
      } else {
        throw new Error('Failed to delete step');
      }
    } catch (error) {
      console.error('Delete step error:', error);
      throw error;
    }
  };

  const addMoneyIn = async (money: Omit<MoneyIn, 'id'>) => {
    try {
      const response = await fetch('/api/money-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(money),
      });

      if (response.ok) {
        const newMoneyIn = await response.json();
        setState(prev => ({
          ...prev,
          moneyIn: [...prev.moneyIn, newMoneyIn],
        }));
      } else {
        throw new Error('Failed to add money-in');
      }
    } catch (error) {
      console.error('Add money-in error:', error);
      throw error;
    }
  };

  const updateMoneyIn = async (id: string, updates: Partial<MoneyIn>) => {
    try {
      const response = await fetch(`/api/money-in/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedMoneyIn = await response.json();
        setState(prev => ({
          ...prev,
          moneyIn: prev.moneyIn.map((m) => (m.id === id ? updatedMoneyIn : m)),
        }));
      } else {
        throw new Error('Failed to update money-in');
      }
    } catch (error) {
      console.error('Update money-in error:', error);
      throw error;
    }
  };

  const deleteMoneyIn = async (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(`/api/money-in/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          moneyIn: prev.moneyIn.filter((m) => m.id !== id),
        }));
      } else {
        throw new Error('Failed to delete money-in');
      }
    } catch (error) {
      console.error('Delete money-in error:', error);
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        const newExpense = await response.json();
        setState(prev => ({
          ...prev,
          expenses: [...prev.expenses, newExpense],
        }));
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      console.error('Add expense error:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (user?.role === 'supervisor') return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.map((e) => (e.id === id ? updatedExpense : e)),
        }));
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('Update expense error:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.filter((e) => e.id !== id),
        }));
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  };

  const createUser = (user: Omit<User, 'id' | 'companyId'>) => {
    if (state.currentUser?.role !== 'admin') return;
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      companyId: state.currentUser.companyId,
    };
    saveAndUpdate({
      ...state,
      users: [...state.users, newUser],
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    if (state.currentUser?.role !== 'admin') return;
    saveAndUpdate({
      ...state,
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    });
  };

  const deleteUser = (id: string) => {
    if (state.currentUser?.role !== 'admin' || id === state.currentUser.id) return;
    saveAndUpdate({
      ...state,
      users: state.users.filter((u) => u.id !== id),
    });
  };

  const exportProjectToExcel = (projectId: string) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;

    const projectSteps = state.steps.filter((s) => s.projectId === projectId);
    const projectExpenses = state.expenses.filter((e) => e.projectId === projectId);
    const projectIncome = state.moneyIn.filter((m) => m.projectId === projectId);

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Project Info
    csvContent += `PROJECT REPORT\n`;
    csvContent += `Project Name,${project.name}\n`;
    csvContent += `Location,${project.location}\n`;
    csvContent += `Client Name,${project.clientName}\n`;
    csvContent += `Client Email,${project.clientEmail}\n`;
    csvContent += `Status,${project.status}\n`;
    csvContent += `Start Date,${project.startDate}\n`;
    csvContent += `End Date,${project.endDate}\n`;
    csvContent += `Total Budget,₵${project.totalBudget.toLocaleString()}\n\n`;

    // Money In
    csvContent += `MONEY IN / INCOME\n`;
    csvContent += `Date,Description,Reference,Amount\n`;
    projectIncome.forEach((income) => {
      csvContent += `${income.date},"${income.description}",${income.reference},₵${income.amount.toLocaleString()}\n`;
    });
    const totalIncome = projectIncome.reduce((sum, m) => sum + m.amount, 0);
    csvContent += `\nTotal Income,,₵,₵${totalIncome.toLocaleString()}\n\n`;

    // Expenses by Step
    csvContent += `EXPENSES BY STEP\n`;
    projectSteps.forEach((step) => {
      const stepExpenses = projectExpenses.filter((e) => e.stepId === step.id);
      csvContent += `\n${step.name}\n`;
      csvContent += `Status,${step.status}\n`;
      csvContent += `Estimated Budget,₵${step.estimatedBudget.toLocaleString()}\n`;
      csvContent += `Description,${step.description}\n\n`;
      csvContent += `Date,Description,Category,Vendor,Receipt,Amount\n`;
      
      stepExpenses.forEach((expense) => {
        csvContent += `${expense.date},"${expense.description}",${expense.category},${expense.vendor},${expense.receipt},₵${expense.amount.toLocaleString()}\n`;
      });
      
      const stepTotal = stepExpenses.reduce((sum, e) => sum + e.amount, 0);
      csvContent += `Total for ${step.name},,₵,₵${stepTotal.toLocaleString()}\n`;
    });

    // Summary
    const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
    csvContent += `\n\nSUMMARY\n`;
    csvContent += `Total Budget,₵${project.totalBudget.toLocaleString()}\n`;
    csvContent += `Total Income,₵${totalIncome.toLocaleString()}\n`;
    csvContent += `Total Expenses,₵${totalExpenses.toLocaleString()}\n`;
    csvContent += `Remaining,₵${(project.totalBudget - totalExpenses).toLocaleString()}\n`;
    csvContent += `Budget Utilization,${((totalExpenses / project.totalBudget) * 100).toFixed(2)}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DataContext.Provider
      value={{
        state,
        createProject,
        updateProject,
        deleteProject,
        createStep,
        updateStep,
        deleteStep,
        addMoneyIn,
        updateMoneyIn,
        deleteMoneyIn,
        addExpense,
        updateExpense,
        deleteExpense,
        createUser,
        updateUser,
        deleteUser,
        exportProjectToExcel,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
