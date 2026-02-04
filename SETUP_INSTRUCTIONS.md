# Construction Manager - Setup Instructions

## Database Setup

### 1. Execute the Petty Cash Migration
Run this command to create the petty_cash table:

```bash
mysql -h turntable.proxy.rlwy.net -P 34127 -u root -pYourPassword railway < scripts/petty-cash-migration.sql
```

Or execute the SQL directly in your database:

```sql
CREATE TABLE IF NOT EXISTS petty_cash (
  id VARCHAR(50) PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  vendor VARCHAR(255),
  type ENUM('inflow', 'outflow') NOT NULL,
  date DATE NOT NULL,
  added_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_vendor (vendor),
  INDEX idx_added_by (added_by)
);
```

### 2. Create Initial Users (if not already done)

```sql
-- Create a company
INSERT INTO companies (id, name) VALUES ('company1', 'Default Company');

-- Create an admin user
INSERT INTO users (id, name, email, password, role, company_id) 
VALUES (
  'user1', 
  'Admin User', 
  'admin@example.com', 
  -- Use bcrypt hash of password 'password'
  '$2a$10$salt...hash', 
  'admin', 
  'company1'
);
```

## Environment Variables

Ensure these variables are set in your Vercel project (or .env file locally):

```
DB_HOST=turntable.proxy.rlwy.net
DB_PORT=34127
DB_USER=root
DB_PASS=sEFolfUJSNCFNLmmQQzhhwcgzzUHYYBz
DB_NAME=railway
JWT_SECRET=your-secret-key-change-in-production
```

## API Endpoints

### Authentication
- **POST /api/auth/login** - Login with email/password
- **POST /api/auth/signup** - Create new account
- **POST /api/auth/logout** - Logout (clears httpOnly cookie)
- **GET /api/auth/me** - Check current authentication status

### Petty Cash
- **GET /api/petty-cash** - Get all transactions (with filters)
- **POST /api/petty-cash** - Add new transaction
- **GET /api/petty-cash/balance** - Get balance summary
- **DELETE /api/petty-cash?id=xxx** - Delete transaction

### Projects
- **GET /api/projects** - Get all projects
- **POST /api/projects** - Create project
- **PUT /api/projects/[id]** - Update project
- **DELETE /api/projects/[id]** - Delete project

### Users
- **GET /api/users** - Get all users (admin only)
- **POST /api/users** - Create user (admin only)
- **PUT /api/users** - Update user (admin only)
- **DELETE /api/users** - Delete user (admin only)

## Pages

### Dashboard Pages
- `/dashboard` - Main dashboard
- `/dashboard/projects` - Project management
- `/dashboard/petty-cash` - Petty cash management (NEW)
- `/dashboard/users` - User management (admin only)
- `/dashboard/reports` - Reports

### Auth Pages
- `/login` - Login page
- `/signup` - Sign up page

## Features Implemented

### Petty Cash Management
✓ Add inflows and outflows with descriptions  
✓ Categorize outflows (e.g., Office Supplies, Travel, Meals, etc.)  
✓ Track vendor information  
✓ Automatic balance calculation  
✓ Transaction history with filtering  
✓ Export to CSV/PDF  
✓ Role-based access (Admin/Supervisor)  

### Authentication
✓ User registration with email/password  
✓ Secure JWT authentication with httpOnly cookies  
✓ Company-based data isolation  
✓ Role-based access control (admin, supervisor, staff)  

### Data Management
✓ Real database integration (no demo data)  
✓ Automatic project/user data fetching  
✓ Error handling and loading states  

## Fixed Issues

1. **API Fetch Errors** - The data-context now gracefully handles 401 unauthenticated errors by setting empty arrays instead of throwing exceptions.

2. **Authentication Check** - Added automatic authentication verification before fetching data, preventing unnecessary API errors.

3. **Error Logging** - Improved error logging to show exact HTTP status codes for debugging.

## Testing the Application

1. **Sign up** at `/signup` with test credentials
2. **Login** at `/login`
3. Navigate to **Petty Cash** in the sidebar
4. **Add transactions** (inflows and outflows)
5. View the **balance summary**
6. **Filter** transactions by date, type, category
7. **Export** to CSV or PDF
8. **Delete** transactions if needed

## Troubleshooting

### "Failed to fetch projects/users" Error
- Check that you're logged in (visit `/login`)
- Verify JWT_SECRET environment variable is set
- Check browser console for detailed error messages

### Database Connection Error
- Verify all DB_* environment variables are set correctly
- Test connection with: `mysql -h turntable.proxy.rlwy.net -P 34127 -u root -p railway`
- Check firewall/network access to turntable.proxy.rlwy.net

### Petty Cash page not appearing
- Ensure you're logged in as Admin or Supervisor
- Execute the petty-cash-migration.sql to create the table
- Clear browser cache and reload

## Support

For more details, refer to the project files:
- Main app: `/app`
- Components: `/components`
- API routes: `/app/api`
- Utilities: `/lib`
