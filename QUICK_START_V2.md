# Construction Manager v2.0 - Quick Start (15 Minutes)

## What You Need
- MySQL installed and running
- Node.js installed
- Terminal/Command line
- Text editor

---

## Setup in 4 Steps

### Step 1: Database Setup (5 min)

Open MySQL and run:
```sql
CREATE DATABASE tertrac2_constructionManager;
CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';
GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

Then import the schema:
```bash
mysql -u tertrac2_dbuser -p1Longp@ssword tertrac2_constructionManager < db.sql
```

Password: `1Longp@ssword`

---

### Step 2: Environment Setup (2 min)

Create `.env.local` file in project root:
```
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager
JWT_SECRET=change-this-in-production
```

---

### Step 3: Install Dependencies (5 min)

```bash
npm install
```

This installs bcryptjs, jsonwebtoken, and other packages.

---

### Step 4: Start Application (3 min)

```bash
npm run dev
```

Application runs at: **http://localhost:3000**

---

## First Use

### Create Account
1. Visit `http://localhost:3000/signup`
2. Enter:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123` (min 6 chars)
   - Confirm: `password123`
3. Click "Sign Up"
4. Redirected to login page

### Login
1. Email: `john@example.com`
2. Password: `password123`
3. Click "Sign In"
4. Welcome to dashboard!

---

## Quick Actions

### Create a Project
1. Dashboard → Click "New Project"
2. Fill details:
   - Name: `House Construction`
   - Location: `Accra, Ghana`
   - Client: `John Smith`
   - Email: `john@example.com`
   - Start: `2024-01-01`
   - End: `2024-12-31`
   - Budget: `50000`
3. Click "Create Project"

### Track Income
1. Click project
2. Scroll to "Money In" section
3. Click "Add Income"
4. Enter amount and date
5. Income appears in "Total Income/Contract"

### Track Expenses
1. Click project
2. Scroll to "Expenses" section
3. Click "Add Expense"
4. Enter amount, category, vendor
5. Expense appears in "Total Spent/Expenditure"

### See Profit
1. Dashboard shows profit card
2. Profit = 10% of Total Income
3. Automatically calculated

### Add Materials
1. Click project
2. Scroll to "Materials" section
3. Click "Add Material"
4. Enter: Name, Type, Quantity, Unit
5. Material appears in list

---

## Key Features

### Dashboard Cards (4 Cards)
```
Total Income/Contract (Green) ← From Money In table
Total Spent/Expenditure (Orange) ← From Expenses
Profit (Blue) ← Auto calculated 10%
Budget Remaining (Green/Red) ← Budget minus spent
```

### All Data Live
- Nothing is hardcoded
- Everything from database
- Refresh page = same data
- No demo data

### Complete Reports
- View all income
- View all expenses
- View all materials
- View profit analysis

---

## Default Credentials

**After signup**, use your own email/password:
- Email: Your email
- Password: Your password

---

## Troubleshooting

### "Database connection error"
```
✓ Check MySQL is running
✓ Check .env.local has correct credentials
✓ Verify database exists: SHOW DATABASES;
```

### "User already exists"
```
✓ Email already registered
✓ Use different email for signup
✓ Or login with existing email
```

### "Cannot connect to port 3000"
```
✓ Kill existing process: lsof -i :3000 | kill -9 <PID>
✓ Or use different port: PORT=3001 npm run dev
```

### "npm install fails"
```
✓ Delete node_modules: rm -rf node_modules
✓ Delete lock file: rm package-lock.json
✓ Run again: npm install
```

---

## Important Files

- **db.sql** - Database schema
- **.env.local** - Environment variables
- **/app/api/auth/** - Authentication APIs
- **/components/** - UI components

---

## What Works Now

✅ User registration  
✅ User login/logout  
✅ Project creation  
✅ Income tracking  
✅ Expense tracking  
✅ Profit calculation  
✅ Materials management  
✅ Complete reports  
✅ Live data from database  
✅ Secure authentication  

---

## Next Steps

1. **Explore dashboard** - Create projects, add data
2. **Read docs** - Check `COMPLETE_IMPLEMENTATION_GUIDE.md`
3. **Test features** - Try all functionality
4. **Create test data** - Multiple projects with income/expenses
5. **View reports** - Check complete project view

---

## Need Help?

- **Setup issues**: Check MySQL connection
- **Feature questions**: Read `COMPLETE_IMPLEMENTATION_GUIDE.md`
- **Technical details**: Check `/app/api/` route files
- **Database schema**: Check `db.sql`

---

## You're Done! 🎉

Your Construction Manager is now running.

Visit **http://localhost:3000** and start managing projects!

---

## Security Reminder

Before production:
- [ ] Change `JWT_SECRET` in `.env.local`
- [ ] Change database password
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Regular backups

Enjoy! 🚀
