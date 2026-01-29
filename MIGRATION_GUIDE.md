# Migration Guide - v2.0 Update

## Overview
This guide helps you migrate from the v1.0 demo version to the v2.0 production version with real database integration, authentication, and new features.

---

## What's New in v2.0

✓ Real MySQL database integration  
✓ Secure user authentication (sign up/login)  
✓ Password hashing with bcryptjs  
✓ JWT-based session management  
✓ Profit calculation (10% of income)  
✓ Materials management  
✓ Updated financial labels  
✓ Live data from database (no demo data)  

---

## Migration Steps

### 1. Database Setup

#### Step 1A: Backup Existing Data (if any)
```bash
mysqldump -u tertrac2_dbuser -p1Longp@ssword tertrac2_constructionManager > backup.sql
```

#### Step 1B: Create Fresh Database
```sql
DROP DATABASE IF EXISTS tertrac2_constructionManager;
CREATE DATABASE tertrac2_constructionManager;
CREATE USER IF NOT EXISTS 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';
GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

#### Step 1C: Import New Schema
```bash
mysql -u tertrac2_dbuser -p1Longp@ssword tertrac2_constructionManager < db.sql
```

---

### 2. Update Environment Variables

Create or update `.env.local`:
```
# Database
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager

# JWT
JWT_SECRET=your-super-secret-key-here-change-in-production

# Node Environment
NODE_ENV=development
```

---

### 3. Install New Dependencies

```bash
npm install
# This installs: bcryptjs, jsonwebtoken, uuid
```

---

### 4. Update Application

#### 4A: Replace Files
The following files have been updated:
- `/app/login/page.tsx` - Now uses database authentication
- `/lib/db.ts` - Added helper functions
- `/package.json` - Added new dependencies

#### 4B: New Files to Add
- `/app/signup/page.tsx` - Sign up form
- `/app/api/auth/signup/route.ts` - Registration API
- `/app/api/auth/login/route.ts` - Login API
- `/app/api/auth/logout/route.ts` - Logout API
- `/app/api/projects/[id]/route.ts` - Project data API
- `/app/api/materials/route.ts` - Materials API
- `/app/api/materials/[id]/route.ts` - Delete material API
- `/components/materials-section.tsx` - Materials UI
- `/components/profit-overview.tsx` - Profit display
- `/app/login/loading.tsx` - Suspense boundary

---

### 5. Create First User

Option A: Via Sign Up Page
1. Start the app: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Create account
4. Log in

Option B: Via Direct Database
```sql
INSERT INTO users (id, name, email, password, role, company_id) 
VALUES ('user1', 'Your Name', 'you@example.com', '$2a$10$...hashed_password...', 'admin', 'company1');
```

To generate hashed password, run in Node:
```javascript
const bcryptjs = require('bcryptjs');
const hash = bcryptjs.hashSync('your_password', 10);
console.log(hash);
```

---

### 6. Test the Migration

#### 6A: Authentication
- [ ] Sign up at `/signup`
- [ ] Log in at `/login`
- [ ] Access dashboard
- [ ] Log out

#### 6B: Financial Data
- [ ] Create new project
- [ ] Add income in Money In section
- [ ] Add expenses
- [ ] Verify profit shows (10% of income)
- [ ] Check budget remaining

#### 6C: Materials
- [ ] Open project view
- [ ] Add materials
- [ ] View materials list
- [ ] Delete material
- [ ] See materials in report

---

## Rollback (if needed)

If you need to revert to v1.0:

### Step 1: Restore Database
```bash
mysql -u tertrac2_dbuser -p1Longp@ssword tertrac2_constructionManager < backup.sql
```

### Step 2: Remove New Files
Delete these files and revert others from git:
```bash
git checkout app/login/page.tsx
git checkout lib/db.ts
```

---

## Data Migration from Old Version

If you had data in the old demo version:

### Step 1: Export Old Data
```javascript
// From old localStorage
const oldData = localStorage.getItem('constructionManager');
console.log(JSON.parse(oldData));
```

### Step 2: Convert to SQL Inserts
```sql
-- Example:
INSERT INTO projects (id, name, location, description, client_name, client_email, start_date, end_date, total_budget, created_by, status, company_id)
VALUES ('proj1', 'Project Name', 'Location', 'Description', 'Client', 'client@email.com', '2024-01-01', '2024-12-31', 50000, 'user1', 'active', 'company1');

INSERT INTO money_in (id, project_id, amount, description, date, reference)
VALUES ('income1', 'proj1', 25000, 'Initial Payment', '2024-01-15', 'INV001');
```

### Step 3: Verify Data
```sql
SELECT * FROM projects;
SELECT * FROM money_in;
SELECT * FROM expenses;
```

---

## Common Issues & Solutions

### Issue: "Table 'materials' doesn't exist"
**Solution**: Run the full `db.sql` script again to create missing tables.

### Issue: "User already exists"
**Solution**: Email already registered. Use different email for signup.

### Issue: "Invalid credentials"
**Solution**: Verify email and password are correct. Password is case-sensitive.

### Issue: "JWT_SECRET not set"
**Solution**: Add `JWT_SECRET` to `.env.local`

### Issue: "No materials showing"
**Solution**: Ensure materials table exists and you're using correct project_id.

---

## Performance Optimization

### Recommended Indexes
The `db.sql` already includes:
- `idx_projects_company` - Query projects by company
- `idx_money_in_project` - Query income by project
- `idx_expenses_project` - Query expenses by project
- `idx_materials_project` - Query materials by project

### Connection Pooling
The app uses connection pooling with:
- Max 10 connections
- Auto-release after query
- No memory leaks

---

## Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Update database password
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Add CORS policies
- [ ] Rate limiting for auth endpoints
- [ ] Regular database backups
- [ ] Monitor database logs

---

## Documentation

- `COMPLETE_IMPLEMENTATION_GUIDE.md` - Full documentation
- `db.sql` - Database schema
- API routes - Check `/app/api/` directory
- Components - Check `/components/` directory

---

## Support

For issues or questions:
1. Check the documentation files
2. Review database logs
3. Check browser console for errors
4. Verify environment variables are set
5. Ensure MySQL service is running

---

## Next Steps

1. ✓ Database migration complete
2. ✓ User authentication ready
3. Next: Add more users and test workflows
4. Next: Import historical data if needed
5. Next: Configure production environment
