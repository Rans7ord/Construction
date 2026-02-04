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

interface DataContextType {
  state: AppState;
  isLoading: boolean;
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
  createUser: (user: Omit<User, 'id' | 'companyId'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  exportProjectToExcel: (projectId: string) => void;
  fetchProjects: () => Promise<void>;
  fetchUsers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getStoredState());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch projects from database
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        setState((prev) => ({ ...prev, projects: [] }));
        return;
      }
      const projects = await response.json();
      setState((prev) => ({ ...prev, projects: projects || [] }));
    } catch (error) {
      setState((prev) => ({ ...prev, projects: [] }));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        setState((prev) => ({ ...prev, users: [] }));
        return;
      }
      const users = await response.json();
      setState((prev) => ({ ...prev, users: users || [] }));
    } catch (error) {
      setState((prev) => ({ ...prev, users: [] }));
    } finally {
      setIsLoading(false);
    }
  }

  const saveAndUpdate = (newState: AppState) => {
    setState(newState);
    saveState(newState);
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(project),
      });
      if (!response.ok) throw new Error('Failed to create project');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Create project error:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update project');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Update project error:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Delete project error:', error);
      throw error;
    }
  };

  const createStep = async (step: Omit<ProjectStep, 'id'>) => {
    try {
      const response = await fetch('/api/project-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(step),
      });
      if (!response.ok) throw new Error('Failed to create step');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Create step error:', error);
      throw error;
    }
  };

  const updateStep = async (id: string, updates: Partial<ProjectStep>) => {
    try {
      const response = await fetch(`/api/project-steps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update step');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Update step error:', error);
      throw error;
    }
  };

  const deleteStep = async (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch(`/api/project-steps/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete step');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Delete step error:', error);
      throw error;
    }
  };

  const addMoneyIn = async (money: Omit<MoneyIn, 'id'>) => {
    try {
      const response = await fetch('/api/money-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(money),
      });
      if (!response.ok) throw new Error('Failed to add money in');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Add money in error:', error);
      throw error;
    }
  };

  const updateMoneyIn = async (id: string, updates: Partial<MoneyIn>) => {
    try {
      const response = await fetch(`/api/money-in/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update money in');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Update money in error:', error);
      throw error;
    }
  };

  const deleteMoneyIn = async (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch(`/api/money-in/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete money in');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Delete money in error:', error);
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(expense),
      });
      if (!response.ok) throw new Error('Failed to add expense');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Add expense error:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (state.currentUser?.role === 'supervisor') return;
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Update expense error:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      await fetchProjects();
    } catch (error) {
      console.error('[v0] Delete expense error:', error);
      throw error;
    }
  };

  const createUser = async (user: Omit<User, 'id' | 'companyId'>) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error('Failed to create user');
      await fetchUsers();
    } catch (error) {
      console.error('[v0] Create user error:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (state.currentUser?.role !== 'admin') return;
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: id, ...updates }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      await fetchUsers();
    } catch (error) {
      console.error('[v0] Update user error:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    if (state.currentUser?.role !== 'admin' || id === state.currentUser.id) return;
    try {
      const response = await fetch(`/api/users?userId=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      await fetchUsers();
    } catch (error) {
      console.error('[v0] Delete user error:', error);
      throw error;
    }
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
        isLoading,
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
        fetchProjects,
        fetchUsers,
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
