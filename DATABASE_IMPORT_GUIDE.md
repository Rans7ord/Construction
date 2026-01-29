# Database Import Guide - Step by Step

## Option 1: Command Line (Recommended)

### Prerequisites
- MySQL installed and running
- Terminal/Command prompt open

### Steps

#### 1. Create Database and User

Copy and paste this in your terminal:

```bash
mysql -u root -p
```

Then enter your root password.

Once in MySQL, paste these commands:

```sql
CREATE DATABASE tertrac2_constructionManager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';

GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

#### 2. Import Schema

From your project directory, run:

```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < db.sql
```

When prompted, enter password: `1Longp@ssword`

#### 3. Verify Installation

```bash
mysql -h localhost -u tertrac2_dbuser -p
```

Then in MySQL:

```sql
USE tertrac2_constructionManager;
SHOW TABLES;
```

You should see 5 tables:
- expenses
- money_in
- project_steps
- projects
- users

Type `EXIT;` to quit.

---

## Option 2: MySQL Workbench

### Prerequisites
- MySQL Workbench installed
- MySQL Server running

### Steps

#### 1. Open MySQL Workbench
- Launch MySQL Workbench
- Click on your local MySQL connection

#### 2. Create Database

Go to **Server** menu → **Data Import**

Or use the Query tab and paste:

```sql
CREATE DATABASE tertrac2_constructionManager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';

GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';

FLUSH PRIVILEGES;
```

Press **Ctrl+Enter** to execute.

#### 3. Import Schema

Go to **Server** → **Data Import**

1. Select "Import from Self-Contained File"
2. Browse and select `db.sql`
3. Choose target schema: `tertrac2_constructionManager`
4. Click **Start Import**

#### 4. Verify

Execute:
```sql
USE tertrac2_constructionManager;
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='tertrac2_constructionManager';
```

---

## Option 3: phpmyadmin

### Prerequisites
- phpmyadmin installed and accessible
- Apache/Web server running

### Steps

#### 1. Create Database

1. Login to phpmyadmin
2. Click on "New" in left sidebar
3. Database name: `tertrac2_constructionManager`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

#### 2. Create User

1. Go to "User accounts"
2. Click "Add user account"
3. Username: `tertrac2_dbuser`
4. Host: `localhost`
5. Password: `1Longp@ssword`
6. Click "Go"

#### 3. Grant Privileges

1. Find user `tertrac2_dbuser@localhost`
2. Click "Edit privileges"
3. Go to "Database" tab
4. Select database: `tertrac2_constructionManager`
5. Check "All" in privileges
6. Click "Go"

#### 4. Import Schema

1. Select database `tertrac2_constructionManager`
2. Click "Import" tab
3. Choose file: `db.sql`
4. Click "Import"

---

## Credentials Reference

```
Host:     localhost
User:     tertrac2_dbuser
Password: 1Longp@ssword
Database: tertrac2_constructionManager
```

---

## Environment Configuration

Create `.env.local` file in project root:

```env
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager
```

---

## Verification Commands

### Check Database Created
```bash
mysql -u root -p
mysql> SHOW DATABASES;
mysql> EXIT;
```

### Check User Created
```bash
mysql -u root -p
mysql> SELECT User, Host FROM mysql.user WHERE User='tertrac2_dbuser';
mysql> EXIT;
```

### Check Tables
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager
mysql> SHOW TABLES;
mysql> EXIT;
```

### Check Table Structure
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager
mysql> DESCRIBE users;
mysql> DESCRIBE projects;
mysql> DESCRIBE project_steps;
mysql> DESCRIBE money_in;
mysql> DESCRIBE expenses;
mysql> EXIT;
```

### Count Records
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager
mysql> SELECT COUNT(*) FROM users;
mysql> SELECT COUNT(*) FROM projects;
mysql> EXIT;
```

---

## Troubleshooting

### "Access Denied"
- Verify username: `tertrac2_dbuser`
- Verify password: `1Longp@ssword`
- Run: `FLUSH PRIVILEGES;`

### "Database doesn't exist"
- Check spelling: `tertrac2_constructionManager`
- Run: `SHOW DATABASES;`
- Verify you created it in step 1

### "File not found"
- Ensure `db.sql` is in project root
- Use full path: `/full/path/to/db.sql`

### "Connection refused"
- Ensure MySQL is running
- Check if localhost is correct (try `127.0.0.1`)
- Check MySQL port (default: 3306)

### "Cannot drop database"
- Ensure no active connections
- Close all MySQL Workbench windows
- Try again

---

## Backup Commands

### Create Backup
```bash
mysqldump -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < backup_20240127.sql
```

---

## Final Steps

1. ✅ Database created
2. ✅ User created with privileges
3. ✅ Schema imported (5 tables)
4. ✅ .env.local configured
5. ✅ Ready to use!

Run `npm run dev` and enjoy! 🚀

---

## Need Help?

- Check **DATABASE_SETUP.md** for detailed information
- Check **QUICK_DB_REFERENCE.md** for quick reference
- Review **IMPLEMENTATION_SUMMARY.md** for complete overview
