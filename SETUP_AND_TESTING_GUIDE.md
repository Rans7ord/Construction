# Setup and Testing Guide - Construction Manager Enhancements

## Quick Start (5 Minutes)

### Step 1: Database Setup
```bash
# Import the updated schema
mysql -u tertrac2_dbuser -p'1Longp@ssword' tertrac2_constructionManager < db.sql
```

### Step 2: Start the Application
```bash
npm install
npm run dev
```

### Step 3: Login
Navigate to `http://localhost:3000/login` and use demo credentials.

---

## Testing Checklist

### Authentication Tests

#### ✅ Login with Demo Account
1. Go to `/login`
2. Enter email: `admin@buildmanager.com`
3. Enter password: `password`
4. Click "Sign In"
5. Should redirect to `/dashboard`

#### ✅ Sign Up New Account
1. Go to `/login`
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"
5. Should redirect to `/dashboard` with new account

#### ✅ Toggle Password Visibility
1. On login page, click eye icon next to password field
2. Password should show/hide

#### ✅ Form Validation
1. Try to submit form without email - Should show error
2. Try to submit form without password - Should show error
3. Try to sign up with mismatched passwords - Should show error
4. Try to sign up with password < 6 chars - Should show error

---

### Profit Feature Tests

#### ✅ View Profit Summary
1. Login to dashboard
2. Click on any project (e.g., "Downtown Office Complex")
3. Look at top section - should see:
   - Total Income/Contract: ₵1,875K
   - Profit (10%): ₵187.5K
   - Total Spent/Expenditure: ₵252K
   - Net Profit: ₵1,623K

#### ✅ Verify Profit Calculation
1. Project Income: ₵1,875,000
2. Profit (10%): ₵187,500 ✓
3. Expenses: ₵252,000
4. Net Profit: ₵1,623,000 ✓

---

### Materials Section Tests

#### ✅ View Materials
1. On project detail page, click "Materials" tab
2. Should see demo materials:
   - Portland Cement: 500 bags × ₵85 = ₵42,500
   - Steel Rebar: 50,000 kg × ₵1.6 = ₵80,000
   - Steel Beams: 150 pcs × ₵650 = ₵97,500
   - Concrete Bricks: 50,000 pcs × ₵2.5 = ₵125,000

#### ✅ Add New Material
1. Click "Add Material" button
2. Fill in form:
   - Material Name: `Paint`
   - Type: `Finishing`
   - Quantity: `200`
   - Unit: `liters`
   - Cost Per Unit: `₵150`
3. See total cost calculation: ₵30,000
4. Click "Add Material"
5. Material should appear in table

#### ✅ Edit Material
1. Click edit icon (pencil) on a material
2. Change quantity from `200` to `300`
3. Total cost should update to ₵45,000
4. Click "Update Material"
5. Changes should be saved

#### ✅ Delete Material
1. Click delete icon (trash) on a material
2. Material should be removed from table
3. Total materials cost should update

#### ✅ View Total Cost
1. Bottom of materials table shows "Total Materials Cost"
2. Should be sum of all individual material costs

---

### Currency & Field Label Tests

#### ✅ Currency Display
Verify all amounts show ₵ symbol:
- Dashboard stats
- Project cards
- Budget overview
- Money in section
- Expenses section
- Materials section
- Profit summary

#### ✅ Field Labels
Check that terminology is updated:
- "Total Income/Contract" (not "Total Income")
- "Total Spent/Expenditure" (not "Total Expenses")
- "Profit (10%)" (new field)

---

### Export/Report Tests

#### ✅ Export CSV with Profits and Materials
1. Go to project detail page
2. Click "Export CSV" button
3. Open downloaded file in Excel/Numbers
4. Verify sections:
   - Project Info
   - Money In / Income / Contract
   - Profit (10%) calculation
   - Materials section with all items
   - Expenses by Step
   - Summary with profit metrics

#### ✅ CSV Content Verification
Check CSV includes:
```
MONEY IN / INCOME / CONTRACT
...
Profit (10%),,₵,₵187,500

MATERIALS
Material Name,Type,Quantity,Unit,Cost Per Unit,Total Cost
Portland Cement,Cement,500,bags,₵85,₵42,500
...
Total Materials Cost,,,₵,₵345,000

EXPENSES BY STEP
...

SUMMARY
Total Budget,₵2,500,000
Total Income/Contract,₵1,875,000
Profit (10%),₵187,500
Total Spent/Expenditure,₵252,000
Remaining,₵2,248,000
Budget Utilization,10.08%
```

---

### Navigation Tests

#### ✅ Project Detail Tabs
1. On project page, check all tabs work:
   - Overview ✓
   - Steps ✓
   - Budget ✓
   - Expenses ✓
   - Materials ✓ (NEW)

#### ✅ Tab Switching
1. Click each tab
2. Content should update without page reload
3. Tab should show active state (underline)

---

### Admin Controls

#### ✅ Delete Material (Admin Only)
1. Login as admin
2. Go to Materials tab
3. Delete button should be visible and work

#### ✅ Edit Project
1. Click "Edit" button on project
2. Should open edit page
3. Changes should save

#### ✅ Export Data
1. Click "Export CSV" button
2. CSV should download successfully

---

## Test Data Summary

### Demo Project: Downtown Office Complex
- **Budget:** ₵2,500,000
- **Income:** ₵1,875,000
- **Profit (10%):** ₵187,500
- **Expenses:** ₵252,000
- **Net Profit:** ₵1,623,000

### Demo Materials:
1. Portland Cement - 500 bags - ₵42,500
2. Steel Rebar - 50,000 kg - ₵80,000
3. Steel Beams - 150 pcs - ₵97,500
4. Concrete Bricks - 50,000 pcs - ₵125,000
**Total Materials: ₵345,000**

### Demo User Accounts:
- Admin: admin@buildmanager.com / password
- Supervisor: supervisor@buildmanager.com / password
- Staff: staff@buildmanager.com / password

---

## Troubleshooting

### Issue: Database not connecting
**Solution:** Check credentials in db.sql:
- Host: localhost
- User: tertrac2_dbuser
- Password: 1Longp@ssword
- Database: tertrac2_constructionManager

### Issue: Materials not showing
**Solution:** 
1. Check database has materials table
2. Refresh page
3. Try adding new material

### Issue: Profit calculation wrong
**Solution:**
- Profit should be exactly 10% of Total Income
- Formula: Income × 0.10
- Check demo data: ₵1,875,000 × 0.10 = ₵187,500

### Issue: Can't sign up
**Solution:**
- Password must be at least 6 characters
- Email must not already exist
- Check all fields are filled

### Issue: Login not working
**Solution:**
1. Try demo account first
2. Check email is correct
3. Password is case-sensitive
4. Password must be exactly as registered

---

## Performance Notes

- Materials stored per project (optimized queries)
- Profit calculated automatically via GENERATED column in DB
- CSV export includes all data (may be large for big projects)
- No pagination needed for demo data size

---

## Next Steps (Optional Enhancements)

1. **Production Security:**
   - Replace simple hash with bcrypt
   - Implement JWT tokens
   - Add email verification

2. **Advanced Features:**
   - Bulk material import
   - Material templates
   - Profit forecasting
   - Cost analytics dashboard

3. **UI Improvements:**
   - Material filters
   - Profit charts
   - Export to PDF
   - Print-friendly views

---

## Support

For issues or questions:
1. Check this troubleshooting section
2. Review ENHANCEMENTS_COMPLETED.md
3. Check browser console for errors (F12)
4. Clear localStorage if data seems corrupted: `localStorage.clear()`

---

**Last Updated:** January 2026
**Version:** 2.0.0 (Enhanced)
**Status:** Ready for Testing ✅
