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
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createStep: (step: Omit<ProjectStep, 'id'>) => void;
  updateStep: (id: string, updates: Partial<ProjectStep>) => void;
  deleteStep: (id: string) => void;
  addMoneyIn: (money: Omit<MoneyIn, 'id'>) => void;
  updateMoneyIn: (id: string, updates: Partial<MoneyIn>) => void;
  deleteMoneyIn: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  createUser: (user: Omit<User, 'id' | 'companyId'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  exportProjectToExcel: (projectId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getStoredState());

  const saveAndUpdate = (newState: AppState) => {
    setState(newState);
    saveState(newState);
  };

  const createProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveAndUpdate({
      ...state,
      projects: [...state.projects, newProject],
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    saveAndUpdate({
      ...state,
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const deleteProject = (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    saveAndUpdate({
      ...state,
      projects: state.projects.filter((p) => p.id !== id),
      steps: state.steps.filter((s) => s.projectId !== id),
      moneyIn: state.moneyIn.filter((m) => m.projectId !== id),
      expenses: state.expenses.filter((e) => e.projectId !== id),
    });
  };

  const createStep = (step: Omit<ProjectStep, 'id'>) => {
    const newStep: ProjectStep = {
      ...step,
      id: `step_${Date.now()}`,
    };
    saveAndUpdate({
      ...state,
      steps: [...state.steps, newStep],
    });
  };

  const updateStep = (id: string, updates: Partial<ProjectStep>) => {
    saveAndUpdate({
      ...state,
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const deleteStep = (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    saveAndUpdate({
      ...state,
      steps: state.steps.filter((s) => s.id !== id),
      expenses: state.expenses.filter((e) => e.stepId !== id),
    });
  };

  const addMoneyIn = (money: Omit<MoneyIn, 'id'>) => {
    const newMoneyIn: MoneyIn = {
      ...money,
      id: `money_${Date.now()}`,
    };
    saveAndUpdate({
      ...state,
      moneyIn: [...state.moneyIn, newMoneyIn],
    });
  };

  const updateMoneyIn = (id: string, updates: Partial<MoneyIn>) => {
    saveAndUpdate({
      ...state,
      moneyIn: state.moneyIn.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const deleteMoneyIn = (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    saveAndUpdate({
      ...state,
      moneyIn: state.moneyIn.filter((m) => m.id !== id),
    });
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
    };
    saveAndUpdate({
      ...state,
      expenses: [...state.expenses, newExpense],
    });
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    if (state.currentUser?.role === 'supervisor') return;
    saveAndUpdate({
      ...state,
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const deleteExpense = (id: string) => {
    if (state.currentUser?.role !== 'admin') return;
    saveAndUpdate({
      ...state,
      expenses: state.expenses.filter((e) => e.id !== id),
    });
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
