# Construction Manager - Complete Implementation Guide

## Overview
This is a production-ready Construction Project Management System built with Next.js 16, React, MySQL, and secure authentication. All financial data is dynamically queried from the database with no demo/dummy data.

---

## Database Schema Updates

### New Fields & Tables

#### 1. Materials Table
```sql
CREATE TABLE materials (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  step_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  status ENUM('pending', 'ordered', 'received', 'used') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. Profit Calculation
- **Profit = 10% of Total Income/Contract**
- Calculated dynamically from the `money_in` table
- Displayed alongside income and expenses on all pages

#### 3. Updated Field Labels
- `Total Income` → `Total Income/Contract`
- `Total Expenses` → `Total Spent/Expenditure`

---

## Features Implemented

### 1. Secure Authentication
- User registration (Sign Up page)
- User login with email and password
- Password hashing using bcryptjs
- JWT token management
- HTTP-only cookies for session management
- Role-based access control (admin, supervisor, staff)

### 2. Financial Dashboard
- **Total Income/Contract**: Sum of all payments from `money_in` table
- **Total Spent/Expenditure**: Sum of all expenses from `expenses` table
- **Profit**: Automatically calculated as 10% of total income
- **Budget Remaining**: `total_budget - total_spent`

### 3. Materials Management
- Add/view/delete materials for each project step
- Track material name, type, quantity, and unit
- Material status tracking (pending, ordered, received, used)
- Optional material descriptions

### 4. Project Reports
- Complete project overview with all financial data
- Income breakdown by date and reference
- Expense breakdown by category and vendor
- Materials list with quantities and status
- Profit calculation and budget analysis

### 5. Live Data
- All values come directly from database queries
- No localStorage or cached data
- Real-time updates across all pages
- Empty fields display if no data exists

---

## Database Setup Instructions

### Step 1: Create Database and User
```sql
CREATE DATABASE tertrac2_constructionManager;
CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';
GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Import Schema
Copy the entire contents of `db.sql` and run in MySQL:
```bash
mysql -u tertrac2_dbuser -p1Longp@ssword tertrac2_constructionManager < db.sql
```

### Step 3: Environment Variables
Create `.env.local`:
```
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager
JWT_SECRET=your-secret-key-change-this-in-production
```

### Step 4: Install Dependencies
```bash
npm install
npm run dev
```

---

## File Structure

### New Files Created
```
/app/api/auth/
  ├── signup/route.ts       (User registration)
  ├── login/route.ts        (User authentication)
  └── logout/route.ts       (Session cleanup)

/app/api/projects/
  └── [id]/route.ts         (Fetch project with calculations)

/app/api/materials/
  ├── route.ts              (Add/fetch materials)
  └── [id]/route.ts         (Delete material)

/app/signup/page.tsx        (Sign up form)
/app/login/page.tsx         (Updated login form)
/app/login/loading.tsx      (Suspense boundary)

/components/
  ├── materials-section.tsx (Materials management)
  └── profit-overview.tsx   (Profit & income display)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects/[id]` - Fetch project with calculations

### Materials
- `POST /api/materials` - Add material
- `GET /api/materials` - Fetch materials
- `DELETE /api/materials/[id]` - Delete material

---

## User Flow

1. **New User**: Visit `/signup` → Create account → Redirected to login
2. **Existing User**: Visit `/login` → Enter credentials → Redirected to dashboard
3. **Dashboard**: View all projects, income/expenses, and profit
4. **Project View**: See project details, materials, and financial summary
5. **Reports**: Export complete project report with all data

---

## Key Changes from Previous Version

### Before
- Demo data with hardcoded users
- localStorage-based state management
- No user registration
- Dummy financial data

### After
- Real database with MySQL
- Secure user authentication
- User registration and login
- All data from live database queries
- Profit calculation (10% of income)
- Materials tracking
- Updated field labels
- Production-ready code

---

## Testing

### Test Sign Up
1. Go to `/signup`
2. Enter name, email, password
3. Click "Sign Up"
4. Redirected to login page

### Test Login
1. Go to `/login`
2. Enter email and password from signup
3. Click "Sign In"
4. Access dashboard

### Test Financial Data
1. Create a project
2. Add income in "Money In" section
3. Add expenses in "Expenses" section
4. View profit (10% of income) on dashboard
5. Check budget remaining calculation

### Test Materials
1. Open project view
2. Click "Add Material" button
3. Fill in material details
4. Material appears in materials list
5. View on reports page

---

## Troubleshooting

### "Database connection error"
- Verify MySQL service is running
- Check `.env.local` credentials
- Run `npm install` again

### "Invalid credentials"
- Verify user exists in database
- Check password is correct
- Ensure user was created via signup page

### "Materials not showing"
- Refresh the page
- Check project has materials added
- Verify materials were created for correct step

### "No data in dashboard"
- Create a project first
- Add income in Money In section
- Add expenses in Expenses section
- Refresh the page

---

## Security Considerations

1. **Password Hashing**: All passwords hashed with bcryptjs (10 rounds)
2. **JWT Tokens**: Secure token-based authentication
3. **HTTP-Only Cookies**: Tokens stored securely
4. **Input Validation**: All inputs validated before database operations
5. **SQL Injection Protection**: Parameterized queries used throughout

---

## Production Deployment

1. Update `JWT_SECRET` in environment variables
2. Set `NODE_ENV=production`
3. Use environment-specific database
4. Enable HTTPS
5. Configure CORS if needed
6. Set secure cookie flags

---

## Support & Documentation

For more information, refer to:
- `db.sql` - Complete database schema
- `QUICK_DB_REFERENCE.md` - Quick reference guide
- API routes in `/app/api/`
- Component documentation in component files
