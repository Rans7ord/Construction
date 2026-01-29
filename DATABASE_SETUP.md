# Database Setup Guide

This guide explains how to set up the MySQL database for the Construction Manager application.

## Database Credentials

```
Host: localhost (or your server address)
Username: tertrac2_dbuser
Password: 1Longp@ssword
Database Name: tertrac2_constructionManager
```

## Setup Instructions

### 1. Create Database and User

If you don't already have the database and user, create them using these commands:

```sql
-- Create database
CREATE DATABASE tertrac2_constructionManager;

-- Create user (if not exists)
CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';

-- Grant privileges
GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Import the Schema

Import the `db.sql` file to create all tables:

```bash
# Using MySQL command line
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < db.sql

# When prompted, enter the password: 1Longp@ssword
```

Or use MySQL Workbench:
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to Server → Data Import
4. Select db.sql file
5. Choose the target schema: tertrac2_constructionManager
6. Click Start Import

### 3. Set Environment Variables

Create a `.env.local` file in the project root with:

```env
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager
```

## Database Tables

The schema creates the following tables:

### users
- Stores user information with roles (admin, supervisor, staff)
- Fields: id, name, email, password, role, company_id, created_at, updated_at

### projects
- Stores project information
- Fields: id, name, location, description, client_name, client_email, start_date, end_date, total_budget, created_by, status, created_at, updated_at, company_id

### project_steps
- Stores individual project steps/phases
- Fields: id, project_id, name, description, estimated_budget, order, status, created_at, updated_at

### money_in
- Tracks income/payments received for projects
- Fields: id, project_id, amount, description, date, reference, created_at, updated_at

### expenses
- Tracks expenses incurred during projects
- Fields: id, project_id, step_id, amount, description, date, category, vendor, receipt, created_by, created_at, updated_at

## Currency

All monetary values are in **Ghanaian Cedi (₵)**.

## Testing the Connection

To verify the database connection is working:

1. Start the development server: `npm run dev`
2. Check the console for any database connection errors
3. The app will use the database credentials from `.env.local`

## Notes

- All tables use InnoDB engine for transaction support
- Foreign key constraints are enabled
- UTC timestamps are used for all date/time fields
- Proper indexes are created for common queries
- Character encoding is UTF-8 for international support

## Backup and Restore

### Backup the database:
```bash
mysqldump -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager > backup.sql
```

### Restore from backup:
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < backup.sql
```
