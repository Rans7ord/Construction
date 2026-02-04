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

// Initialize with demo data
const initializeDemoData = (): AppState => {
  const demoState: AppState = {
    currentUser: {
      id: 'user1',
      name: 'John Admin',
      email: 'admin@buildmanager.com',
      role: 'admin',
      companyId: 'company1',
    },
    users: [
      {
        id: 'user1',
        name: 'John Admin',
        email: 'admin@buildmanager.com',
        role: 'admin',
        companyId: 'company1',
      },
      {
        id: 'user2',
        name: 'Sarah Supervisor',
        email: 'supervisor@buildmanager.com',
        role: 'supervisor',
        companyId: 'company1',
      },
      {
        id: 'user3',
        name: 'Mike Staff',
        email: 'staff@buildmanager.com',
        role: 'staff',
        companyId: 'company1',
      },
    ],
    projects: [
      {
        id: 'proj1',
        name: 'Downtown Office Complex',
        location: '123 Main Street, Downtown',
        description: 'New 5-story office building with modern amenities',
        clientName: 'Tech Corp Inc.',
        clientEmail: 'contact@techcorp.com',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        totalBudget: 2500000,
        createdBy: 'user1',
        createdAt: '2024-01-10',
        status: 'active',
      },
    ],
    steps: [
      {
        id: 'step1',
        projectId: 'proj1',
        name: 'Foundation',
        description: 'Site excavation and foundation work',
        estimatedBudget: 250000,
        order: 1,
        status: 'completed',
      },
      {
        id: 'step2',
        projectId: 'proj1',
        name: 'Structural Framing',
        description: 'Steel and concrete structural work',
        estimatedBudget: 750000,
        order: 2,
        status: 'in-progress',
      },
      {
        id: 'step3',
        projectId: 'proj1',
        name: 'Exterior',
        description: 'Exterior walls, roofing, and windows',
        estimatedBudget: 450000,
        order: 3,
        status: 'pending',
      },
    ],
    moneyIn: [
      {
        id: 'money1',
        projectId: 'proj1',
        amount: 1250000,
        description: 'Initial advance payment',
        date: '2024-01-10',
        reference: 'Check #1001',
      },
      {
        id: 'money2',
        projectId: 'proj1',
        amount: 625000,
        description: 'Second milestone payment',
        date: '2024-04-15',
        reference: 'Bank Transfer #2024-04-001',
      },
    ],
    expenses: [
      {
        id: 'exp1',
        projectId: 'proj1',
        stepId: 'step1',
        amount: 45000,
        description: 'Excavation services',
        date: '2024-02-01',
        category: 'Labor',
        vendor: 'Dig Pro Excavation',
        receipt: 'INV-001',
        createdBy: 'user1',
      },
      {
        id: 'exp2',
        projectId: 'proj1',
        stepId: 'step1',
        amount: 82000,
        description: 'Concrete and materials',
        date: '2024-02-15',
        category: 'Materials',
        vendor: 'BuildRight Concrete',
        receipt: 'INV-002',
        createdBy: 'user1',
      },
      {
        id: 'exp3',
        projectId: 'proj1',
        stepId: 'step2',
        amount: 125000,
        description: 'Steel frame delivery and installation',
        date: '2024-04-01',
        category: 'Materials',
        vendor: 'Steel Structures Ltd',
        receipt: 'INV-003',
        createdBy: 'user1',
      },
    ],
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
