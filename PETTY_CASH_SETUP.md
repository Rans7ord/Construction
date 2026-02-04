# Petty Cash Management Feature

## Overview
The Petty Cash Management system allows accountants to track inflows and outflows of petty cash, calculate running balances, and generate reports. This feature is fully integrated into the Construction Manager dashboard.

## Database Setup

### 1. Run the Migration Script
Execute the migration script to create the `petty_cash` table:

```bash
# The migration script is located at:
# /scripts/petty-cash-migration.sql

# You can run it directly in your Railway database console or use:
mysql -h turntable.proxy.rlwy.net -P 34127 -u root -p railway < scripts/petty-cash-migration.sql
```

### Database Schema
The `petty_cash` table includes:
- **id**: Unique identifier (VARCHAR)
- **amount**: Transaction amount (DECIMAL)
- **description**: Transaction details (VARCHAR)
- **category**: For outflows only (VARCHAR) - Office Supplies, Refreshments, Transport, Postage, Maintenance, Utilities, Other
- **vendor**: Vendor name for outflows (VARCHAR)
- **type**: ENUM('inflow', 'outflow')
- **date**: Transaction date (DATE)
- **added_by**: User ID who added the transaction (Foreign Key to users table)
- **created_at**: Timestamp of creation
- **updated_at**: Timestamp of last update

Indexes are created for efficient filtering by date, type, category, vendor, and added_by.

## Features

### 1. Balance Summary Card
Displays three key metrics:
- **Current Balance**: Total inflows minus total outflows
- **Total Inflow**: Sum of all incoming cash
- **Total Outflow**: Sum of all outgoing cash

### 2. Add Transaction Form
- **Transaction Type**: Choose between Inflow (add cash) or Outflow (use cash)
- **Date**: Select the transaction date
- **Amount**: Enter the transaction amount
- **Category**: (Outflow only) Select from predefined categories
- **Vendor**: (Outflow only) Enter vendor name
- **Description**: Detailed description of the transaction

### 3. Transaction History Table
- **Filtering Options**:
  - Start Date / End Date range
  - Transaction Type (All, Inflow, Outflow)
  - Category (for outflows)
  - Vendor name search

- **Table Display**:
  - Date, Type (with color badges), Description, Category, Vendor, Amount
  - Delete button for each transaction (admin/supervisor only)
  - Color-coded amounts (green for inflow, red for outflow)

### 4. Export Options
- **CSV Export**: Export all visible transactions to a CSV file
- **PDF Export**: Generate a printable PDF report with balance summary and transaction details

## API Endpoints

### GET /api/petty-cash
Fetch petty cash transactions with optional filters.

**Query Parameters:**
- `startDate`: ISO date string (YYYY-MM-DD)
- `endDate`: ISO date string (YYYY-MM-DD)
- `category`: String
- `vendor`: String
- `type`: 'inflow' or 'outflow'

**Response:**
```json
[
  {
    "id": "petty_1234567890",
    "amount": 50.00,
    "description": "Office supplies purchase",
    "category": "Office Supplies",
    "vendor": "Staples",
    "type": "outflow",
    "date": "2024-01-15",
    "added_by": "user123",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### POST /api/petty-cash
Add a new petty cash transaction.

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Office supplies",
  "category": "Office Supplies",
  "vendor": "Staples",
  "type": "outflow",
  "date": "2024-01-15"
}
```

### GET /api/petty-cash/balance
Fetch the current petty cash balance.

**Response:**
```json
{
  "balance": 1500.00,
  "totalInflow": 5000.00,
  "totalOutflow": 3500.00
}
```

### DELETE /api/petty-cash
Delete a petty cash transaction.

**Query Parameters:**
- `id`: Transaction ID to delete

## Access Control

- **Admin**: Full access (view, add, delete transactions)
- **Supervisor**: Full access (view, add, delete transactions)
- **Staff**: No access to Petty Cash feature

## File Structure

```
app/dashboard/petty-cash/
├── page.tsx                    # Main Petty Cash page

components/
├── petty-cash-balance.tsx      # Balance summary cards
├── petty-cash-form.tsx         # Add transaction form
└── petty-cash-table.tsx        # Transaction history table

app/api/petty-cash/
├── route.ts                    # GET/POST/DELETE endpoints
└── balance/route.ts            # Balance calculation endpoint

scripts/
└── petty-cash-migration.sql    # Database migration
```

## Usage

### Accessing the Feature
1. Login to the Dashboard
2. Click "Petty Cash" in the sidebar navigation
3. You'll see the current balance, add transaction form, and transaction history

### Adding a Transaction
1. Click "Add Transaction" button
2. Fill in the transaction details:
   - Select transaction type (Inflow/Outflow)
   - Enter date
   - Enter amount
   - For outflows: select category and vendor
   - Add description
3. Click "Add Transaction"

### Viewing Transactions
- View all transactions in the table below the form
- Use the "Filters" button to filter by date range, type, category, or vendor
- Click the trash icon to delete a transaction

### Generating Reports
- Click "CSV" button to download a CSV file
- Click "PDF" button to print or save as PDF

## Important Notes

1. **Authentication Required**: All endpoints require JWT authentication via httpOnly cookie
2. **Real-time Balance**: Balance is calculated dynamically from the database
3. **Audit Trail**: `added_by` field tracks which user created each transaction
4. **Soft Delete**: Transactions are permanently deleted (no soft delete currently)
5. **Dates**: All dates should be in YYYY-MM-DD format

## Troubleshooting

### Transactions Not Showing
- Verify database migration was executed
- Check if user is authenticated
- Verify user has admin or supervisor role

### Balance Not Calculating
- Check if `/api/petty-cash/balance` endpoint is working
- Verify all transactions have correct `type` values (inflow/outflow)

### Export Not Working
- Verify browser allows downloads
- Check if transactions are loaded in the table

## Future Enhancements
- Soft delete with restore functionality
- Transaction approval workflow
- Monthly reconciliation reports
- Petty cash reconciliation statements
- Budget limits and alerts
