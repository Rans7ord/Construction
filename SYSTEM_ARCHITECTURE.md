# BuildManager - System Architecture

## Application Structure

```
BuildManager (Next.js Application)
│
├── Frontend (React Components)
├── State Management (Context API)
├── Data Storage (localStorage)
└── Business Logic (Hooks & Utilities)
```

---

## Directory Structure

```
/app
├── page.tsx                          # Root page (redirect to login)
├── layout.tsx                        # Root layout with providers
├── globals.css                       # Global styles & design tokens
│
├── login/
│   └── page.tsx                     # Login page
│
└── dashboard/
    ├── page.tsx                     # Main dashboard
    ├── app-layout.tsx               # Protected layout with sidebar
    │
    ├── projects/
    │   ├── page.tsx                # All projects list view
    │   ├── create/
    │   │   └── page.tsx            # Create new project
    │   └── [id]/
    │       ├── page.tsx            # Project detail & overview
    │       └── edit/
    │           └── page.tsx        # Edit project
    │
    ├── users/
    │   └── page.tsx                # User management
    │
    └── reports/
        └── page.tsx                # Reports & analytics

/lib
├── store.ts                        # Type definitions & demo data
├── auth-context.tsx                # Authentication context
└── data-context.tsx                # Data management context

/components
├── dashboard-header.tsx            # Header with user menu
├── dashboard-stats.tsx             # Statistics cards component
├── sidebar-nav.tsx                 # Navigation sidebar
├── project-card.tsx                # Project card component
├── budget-overview.tsx             # Budget summary component
│
├── steps-section.tsx               # Project steps management
├── step-modal.tsx                  # Step creation/edit modal
│
├── money-in-section.tsx            # Income management
├── money-in-modal.tsx              # Income creation/edit modal
│
├── expenses-section.tsx            # Expense management
└── expense-modal.tsx               # Expense creation/edit modal

/components/ui/                     # shadcn/ui components
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├��─ label.tsx
├── select.tsx
├── textarea.tsx
└── ...
```

---

## Data Flow Architecture

### Application State Flow

```
AuthContext (Authentication)
│
├─ currentUser: User
├─ isLoading: boolean
├─ login(email, password): void
└─ logout(): void

        ↓

DataContext (Business Logic)
│
├─ state: AppState
│   ├─ currentUser: User
│   ├─ users: User[]
│   ├─ projects: Project[]
│   ├─ steps: ProjectStep[]
│   ├─ moneyIn: MoneyIn[]
│   └─ expenses: Expense[]
│
├─ Project Operations
│   ├─ createProject()
│   ├─ updateProject()
│   └─ deleteProject()
│
├─ User Operations
│   ├─ createUser()
│   ├─ updateUser()
│   └─ deleteUser()
│
├─ Step Operations
│   ├─ createStep()
│   ├─ updateStep()
│   └─ deleteStep()
│
├─ Financial Operations
│   ├─ addMoneyIn()
│   ├─ updateMoneyIn()
│   ├─ deleteMoneyIn()
│   ├─ addExpense()
│   ├─ updateExpense()
│   └─ deleteExpense()
│
└─ Reporting
    └─ exportProjectToExcel()

        ↓

LocalStorage (Persistence)
└─ buildmanager_state (JSON)
```

---

## Component Hierarchy

### Main Application Structure

```
RootLayout
│
├─ Metadata Configuration
├─ Providers
│   ├─ AuthProvider
│   └─ DataProvider
│
└─ Page Content
    ├─ /login
    │   └─ LoginPage
    │
    └─ /dashboard
        └─ ProtectedLayout
            ├─ DashboardHeader
            ├─ SidebarNav
            │   ├─ Dashboard Link
            │   ├─ Projects Link
            │   ├─ Reports Link
            │   └─ Users Link (admin)
            │
            └─ Page Content
                ├─ Dashboard
                │   ├─ DashboardStats
                │   └─ ProjectCard[] (grid)
                │
                ├─ ProjectsList
                │   └─ ProjectCard[] (grid)
                │
                ├─ ProjectDetail
                │   ├─ BudgetOverview
                │   ├─ StepsSection
                │   ├─ MoneyInSection
                │   └─ ExpensesSection
                │
                ├─ ProjectCreate/Edit
                │   └─ ProjectForm
                │
                ├─ UserManagement
                │   └─ UserTable
                │
                └─ Reports
                    └─ ReportAnalytics
```

---

## Data Models

### User Interface (Types)

```typescript
interface User {
  id: string;                    // Unique identifier
  name: string;                  // Full name
  email: string;                 // Email address
  role: 'admin' | 'supervisor' | 'staff';  // User role
  companyId: string;             // Company identifier
}

interface Project {
  id: string;                    // Unique project ID
  name: string;                  // Project name
  location: string;              // Project location
  description: string;           // Project description
  clientName: string;            // Client company name
  clientEmail: string;           // Client contact email
  startDate: string;             // Start date (YYYY-MM-DD)
  endDate: string;               // End date (YYYY-MM-DD)
  totalBudget: number;           // Total project budget
  createdBy: string;             // User who created
  createdAt: string;             // Creation date
  status: 'active' | 'paused' | 'completed';
}

interface ProjectStep {
  id: string;                    // Unique step ID
  projectId: string;             // Parent project
  name: string;                  // Step name (e.g., "Foundation")
  description: string;           // Step description
  estimatedBudget: number;       // Budget for this step
  order: number;                 // Sequence number
  status: 'pending' | 'in-progress' | 'completed';
}

interface MoneyIn {
  id: string;                    // Unique income ID
  projectId: string;             // Parent project
  amount: number;                // Payment amount
  description: string;           // Payment description
  date: string;                  // Payment date
  reference: string;             // Reference number
}

interface Expense {
  id: string;                    // Unique expense ID
  projectId: string;             // Parent project
  stepId: string;                // Associated step
  amount: number;                // Expense amount
  description: string;           // What was purchased/done
  date: string;                  // Transaction date
  category: string;              // Category (Labor, Materials, etc.)
  vendor: string;                // Vendor/supplier name
  receipt: string;               // Receipt/invoice number
  createdBy: string;             // User who created
}

interface AppState {
  currentUser: User | null;      // Currently logged in user
  users: User[];                 // All system users
  projects: Project[];           // All projects
  steps: ProjectStep[];          // All project steps
  moneyIn: MoneyIn[];            // All income entries
  expenses: Expense[];           // All expenses
}
```

---

## User Role Permissions Matrix

```
Feature                 Admin   Supervisor   Staff
────────────────────────────────────────────────
View Dashboard           ✅         ✅         ✅
View Projects            ✅         ✅         ✅
Create Project           ✅         ❌         ❌
Edit Project             ✅         ❌         ❌
Delete Project           ✅         ❌         ❌
View Project Details     ✅         ✅         ✅
Add Steps                ✅         ❌         ❌
Edit Steps               ✅         ❌         ❌
Delete Steps             ✅         ❌         ❌
Add Income               ✅         ❌         ✅
Edit Income              ✅         ❌         ❌
Delete Income            ✅         ❌         ❌
Add Expenses             ✅         ❌         ✅
Edit Expenses            ✅         ❌         ❌
Delete Expenses          ✅         ❌         ❌
View Reports             ✅         ✅         ✅
Export Reports           ✅         ❌         ❌
Manage Users             ✅         ❌         ❌
Create Users             ✅         ❌         ❌
Edit Users               ✅         ❌         ❌
Delete Users             ✅         ❌         ❌
```

---

## Data Persistence Flow

### Create/Update/Delete Cycle

```
1. User Action (Form Submit)
        ↓
2. Component Handler
        ↓
3. Context Function Call
        ↓
4. Data Validation
        ↓
5. State Update
        ↓
6. localStorage Persistence
        ↓
7. Component Re-render
        ↓
8. User Feedback
```

### Example: Creating an Expense

```
ExpenseModal.onSubmit()
    ↓
DataContext.addExpense({...})
    ↓
Generate unique ID
    ↓
Add to state.expenses[]
    ↓
saveState() → localStorage
    ↓
setState() → Re-render
    ↓
Show success message
    ↓
Close modal
```

---

## Authentication Flow

### Login Process

```
LoginPage.onSubmit()
    ↓
AuthContext.login(email, password)
    ↓
Find user in Demo Users
    ↓
Verify credentials
    ↓
Set currentUser in context
    ↓
Redirect to /dashboard
```

### Protected Routes

```
ProtectedLayout
    ↓
Check useAuth() hook
    ↓
If !user && !isLoading
    → Redirect to /login
    ↓
If user
    → Render children
```

---

## Report Generation Flow

### CSV Export Process

```
Reports.exportProjectToExcel(projectId)
    ↓
Find project by ID
    ↓
Get related steps, expenses, income
    ↓
Format as CSV rows:
    - Project info
    - Income entries
    - Expenses by step
    - Summary
    ↓
Create blob URL
    ↓
Trigger download
    ↓
File saved to computer
```

---

## Component Communication

### Props vs Context

#### Context (Global State)
- User authentication
- Project/expense/step data
- User management data
- Functions to modify data

#### Props (Component-Level)
- Project details to detail page
- Expense data to expense section
- User role to header
- Callback functions from modals

---

## Storage Architecture

### localStorage Structure

```json
{
  "buildmanager_state": {
    "currentUser": {...},
    "users": [...],
    "projects": [...],
    "steps": [...],
    "moneyIn": [...],
    "expenses": [...]
  }
}
```

### Data Initialization

```
App Loads
    ↓
RootLayout Renders
    ↓
AuthProvider & DataProvider Initialize
    ↓
getStoredState() Called
    ↓
If localStorage exists → Load it
    ↓
If not → Initialize demo data
    ↓
Context populated with data
    ↓
Components can use hooks
```

---

## State Management Strategy

### Why Context API?

1. **Simplicity**: No external libraries needed
2. **Performance**: Selective context creation
3. **Scalability**: Easy to add new contexts
4. **Persistence**: localStorage integration
5. **Type Safety**: Full TypeScript support

### Custom Hooks

```typescript
useAuth() → AuthContext
    ├─ user: User | null
    ├─ isLoading: boolean
    ├─ login()
    └─ logout()

useData() → DataContext
    ├─ state: AppState
    ├─ Project operations
    ├─ User operations
    ├─ Step operations
    ├─ Financial operations
    └─ Export functions
```

---

## Responsive Design Architecture

### Breakpoints Used

```
Mobile-First Approach:
├─ Base: < 640px (mobile)
├─ sm: ≥ 640px (small)
├─ md: ≥ 768px (medium/tablet)
├─ lg: ≥ 1024px (large/desktop)
└─ xl: ≥ 1280px (extra-large)
```

### Layout Patterns

```
Mobile (< 768px):
├─ Single column
├─ Hamburger menu sidebar
├─ Full-width forms
└─ Stacked cards

Desktop (≥ 768px):
├─ Multi-column grids
├─ Visible sidebar
├─ Side-by-side layouts
└─ Optimized forms
```

---

## Performance Considerations

### Optimizations Implemented

1. **Lazy Loading**: Modals load on demand
2. **Conditional Rendering**: Hide admin features for non-admins
3. **Memoization**: Prevent unnecessary re-renders
4. **Event Delegation**: Use single handlers where possible
5. **Minimal Bundles**: Only necessary components included

### Scalability

- localStorage limit: ~5-10MB (adequate for thousands of records)
- No API calls (all local processing)
- Client-side rendering (no server bottleneck)
- Real-time updates (instant UI feedback)

---

## Security Architecture

### Access Control Implementation

```
Route Protection:
├─ ProtectedLayout checks user
├─ useAuth() validates authentication
├─ Role checks in components
└─ Context functions verify permissions

Data Protection:
├─ localStorage (client-side only)
├─ No password storage (demo)
├─ Role-based API calls (context)
└─ Delete protection (own account)
```

---

## Development Workflow

### Adding New Features

```
1. Update store.ts (add types)
2. Update data-context.tsx (add functions)
3. Create components (UI)
4. Add page/route
5. Update navigation
6. Test all roles
7. Document changes
```

---

## Summary

BuildManager uses a modern, scalable architecture with:
- **React Context** for state management
- **Next.js** for routing and rendering
- **localStorage** for data persistence
- **TailwindCSS** for styling
- **TypeScript** for type safety
- **Component-based** UI structure

This architecture supports unlimited projects, users, and expenses while maintaining excellent performance and user experience.
