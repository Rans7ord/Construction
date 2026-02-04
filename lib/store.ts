export type UserRole = 'admin' | 'supervisor' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  clientName: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface ProjectStep {
  id: string;
  projectId: string;
  name: string;
  description: string;
  estimatedBudget: number;
  order: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface MoneyIn {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  reference: string;
}

export interface Expense {
  id: string;
  projectId: string;
  stepId: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  vendor: string;
  receipt: string;
  createdBy: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  steps: ProjectStep[];
  moneyIn: MoneyIn[];
  expenses: Expense[];
}

const STORAGE_KEY = 'buildmanager_state';

// Initialize with empty state
const initializeEmptyState = (): AppState => {
  const emptyState: AppState = {
    currentUser: null,
    users: [],
    projects: [],
    steps: [],
    moneyIn: [],
    expenses: [],
  };

  return emptyState;
};

export const getStoredState = (): AppState => {
  if (typeof window === 'undefined') {
    return initializeEmptyState();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const emptyState = initializeEmptyState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
    return emptyState;
  }

  return JSON.parse(stored);
};

export const saveState = (state: AppState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const clearState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};
