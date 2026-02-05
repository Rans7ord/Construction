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

export interface Material {
  id: string;
  projectId: string;
  stepId?: string;
  materialName: string;
  materialType: string;
  quantity: number;
  unit: string;
  description?: string;
  costPerUnit: number;
  totalCost: number;
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

// Initialize with demo data
const initializeDemoData = (): AppState => {
  const demoState: AppState = {
    currentUser: null,
    users: [],
    projects: [],
    steps: [],
    moneyIn: [],
    expenses: [],
  };

  return demoState;
};

export const getStoredState = (): AppState => {
  if (typeof window === 'undefined') {
    return initializeDemoData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const demoState = initializeDemoData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState));
    return demoState;
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
