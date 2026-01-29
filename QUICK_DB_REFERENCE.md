# Quick Database Reference

## Setup in 5 Minutes

### 1. Create Database
```bash
# Login to MySQL
mysql -u root -p

# Run these commands
CREATE DATABASE tertrac2_constructionManager;
CREATE USER 'tertrac2_dbuser'@'localhost' IDENTIFIED BY '1Longp@ssword';
GRANT ALL PRIVILEGES ON tertrac2_constructionManager.* TO 'tertrac2_dbuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Import Schema
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < db.sql
# Password: 1Longp@ssword
```

### 3. Add Environment Variables
Create `.env.local` file in project root:
```env
DB_HOST=localhost
DB_USER=tertrac2_dbuser
DB_PASS=1Longp@ssword
DB_NAME=tertrac2_constructionManager
```

### 4. Done! 🎉

---

## Database Credentials

| Setting | Value |
|---------|-------|
| Host | localhost |
| User | tertrac2_dbuser |
| Password | 1Longp@ssword |
| Database | tertrac2_constructionManager |

---

## Currency Symbol

All amounts display with **₵** (Ghanaian Cedi)

Examples:
- ₵2,500K (Budget)
- ₵125K (Income)
- ₵45K (Expenses)

---

## Files You Need

1. **db.sql** - Database schema (import this first)
2. **.env.local** - Environment variables (create this file)
3. **DATABASE_SETUP.md** - Full setup guide
4. **lib/db.ts** - Already included (database utilities)

---

## Common SQL Commands

### Check if database exists
```sql
SHOW DATABASES;
```

### Check tables
```sql
USE tertrac2_constructionManager;
SHOW TABLES;
```

### Verify data
```sql
SELECT * FROM users LIMIT 1;
SELECT * FROM projects LIMIT 1;
SELECT * FROM expenses LIMIT 1;
```

### Backup
```bash
mysqldump -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager > backup.sql
```

### Restore
```bash
mysql -h localhost -u tertrac2_dbuser -p tertrac2_constructionManager < backup.sql
```

---

## Tables Overview

| Table | Purpose |
|-------|---------|
| users | User accounts and roles |
| projects | Project information |
| project_steps | Project phases/stages |
| money_in | Income tracking |
| expenses | Expense tracking |

---

## Troubleshooting

### "Access Denied" Error
- Check username and password
- Verify user was created with GRANT PRIVILEGES
- Run `FLUSH PRIVILEGES;` after creating user

### "Database doesn't exist" Error
- Verify you ran CREATE DATABASE command
- Check spelling of database name

### Connection Timeout
- Ensure MySQL server is running
- Check if localhost is correct (might be 127.0.0.1)
- Verify network connectivity

---

## Next Steps

1. Import db.sql
2. Add .env.local
3. Run `npm run dev`
4. App will automatically connect to database
5. Enjoy! 🚀
