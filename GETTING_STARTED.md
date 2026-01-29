# BuildManager - Getting Started Guide

## Welcome to BuildManager!

BuildManager is a professional construction project management system designed to help you track budgets, expenses, and project progress with ease.

---

## First Login

When you first access BuildManager, you'll see the login page with three demo accounts ready to use:

### Demo Accounts

**Option 1: Admin Account** (Full Access)
- Email: `admin@buildmanager.com`
- Password: `password`
- Access: Create/edit/delete projects, manage users, export reports

**Option 2: Supervisor Account** (Read-Only)
- Email: `supervisor@buildmanager.com`
- Password: `password`
- Access: View all projects and reports (cannot modify)

**Option 3: Staff Account** (Limited)
- Email: `staff@buildmanager.com`
- Password: `password`
- Access: View projects, create expenses (limited actions)

---

## Dashboard Overview

After logging in, you'll land on the Dashboard, which shows:

### Key Sections

1. **Statistics Cards** - Real-time overview of:
   - Total Budget (all projects combined)
   - Total Income (all payments received)
   - Total Expenses (all costs incurred)
   - Remaining Budget (budget - expenses)
   - Number of Projects

2. **Recent Projects** - Display of your latest projects with:
   - Project name and location
   - Budget and spending status
   - Progress bar showing budget utilization
   - Quick "View Details" button

3. **Navigation** - Easy access to:
   - Projects (view all projects)
   - Reports (analyze finances)
   - User Management (manage team - admin only)

---

## Creating Your First Project (Admin Only)

### Step 1: Click "New Project"
Click the blue "New Project" button in the top right of the dashboard.

### Step 2: Fill in Project Information

**Basic Information:**
- **Project Name**: e.g., "Downtown Office Complex"
- **Location**: e.g., "123 Main Street, Downtown"
- **Description**: Brief overview of the project

**Client Information:**
- **Client Name**: Your client's company name
- **Client Email**: Contact email for invoicing/updates

**Timeline:**
- **Start Date**: When construction begins
- **End Date**: Expected completion date

**Budget:**
- **Total Budget**: Total project budget amount

### Step 3: Submit
Click "Create Project" to add it to your system.

---

## Managing Your Project

### View Project Details
1. Click on any project card or "View Details" button
2. You'll see the project details page with 4 tabs:

#### Tab 1: Overview
- Project information
- Client contact details
- Timeline
- Budget summary

#### Tab 2: Steps
Create and manage construction phases:
1. Click "Add Step"
2. Enter step name (e.g., "Foundation")
3. Add description
4. Set estimated budget for this phase
5. Set status: Pending, In Progress, or Completed

**Each step can have its own expenses, making it easy to track which phase is costing what.**

#### Tab 3: Budget (Money In)
Track all payments and income:
1. Click "Add Income"
2. Enter payment amount
3. Add description (e.g., "Initial Payment")
4. Enter date
5. Reference number (check number, wire transfer ID, etc.)

**This helps you track when money is coming in and reconcile with expenses.**

#### Tab 4: Expenses (Money Out)
Track all costs:
1. Click "Add Expense"
2. Select which step this expense belongs to
3. Enter expense details:
   - Description (what was purchased/work done)
   - Amount
   - Date
   - Category (Labor, Materials, Equipment, etc.)
   - Vendor name
   - Receipt number for record-keeping

**Organizing expenses by step helps identify which phases are over/under budget.**

---

## Editing a Project (Admin Only)

1. Open the project details
2. Click the "Edit" button in the top right
3. Update any information you need to change
4. Click "Update Project"

---

## Generating Reports

### View Reports
1. Click "Reports" in the sidebar or navigation
2. Select a project from the dropdown, or leave blank to see all projects
3. Review the financial analysis

### Export Report to CSV
1. Open the Reports page
2. Select a specific project OR leave blank for all projects
3. Click "Export to CSV" button
4. A CSV file will download that you can open in Excel

**CSV Report includes:**
- Project summary information
- All income entries
- Complete expense breakdown by step
- Financial summary and percentages

---

## Managing Users (Admin Only)

### Add a New User
1. Click "Users" in the header or sidebar
2. Click "Add User" button
3. Enter user details:
   - Full Name
   - Email
   - Role (Admin, Supervisor, or Staff)
4. Click "Create User"

### Edit a User
1. Go to Users page
2. Click "Edit" button next to user
3. Update information as needed
4. Click "Update User"

### Delete a User
1. Go to Users page
2. Click trash icon next to user (not available for your own account)
3. User is immediately removed

### Understanding Roles

**Admin**
- ✅ Create, edit, delete projects
- ✅ Manage users
- ✅ Create and delete expenses
- ✅ Export reports
- Full system control

**Supervisor**
- 👀 View all projects
- 👀 View all reports
- ❌ Cannot modify anything
- ❌ Cannot delete
- Read-only access for oversight

**Staff**
- 👀 View projects
- ✅ Create expenses
- ❌ Cannot delete
- Limited functionality

---

## Dashboard Features

### Statistics Cards
The top of the dashboard shows your financial overview:
- **Total Budget**: Combined budget of all active projects
- **Total Spent**: Sum of all expenses
- **Total Income**: Sum of all payments received
- **Remaining**: Budget minus expenses

### Progress Tracking
- Each project shows a progress bar indicating budget utilization
- Hover over to see the percentage spent
- Green means on budget, orange means getting close, red means over budget

### Quick Navigation
Use the header or sidebar to navigate between sections:
- **Dashboard**: Overview and project summary
- **Projects**: View all projects
- **Reports**: Detailed financial analysis
- **Users**: Manage team members (admin only)

---

## Best Practices

### Organizing Steps
- Break projects into logical phases (Foundation, Framing, Exterior, Interior, etc.)
- Set realistic budgets for each step
- Update step status as work progresses

### Tracking Expenses
- Log expenses as they happen for accuracy
- Include detailed descriptions for reference
- Always assign to the correct step
- Keep receipt numbers for audit trails

### Managing Budget
- Review reports regularly to monitor spending
- Alert team if a step is approaching budget
- Use CSV reports for financial reviews with stakeholders

### User Access
- Create admin accounts only for senior team members
- Use supervisor accounts for clients who need visibility
- Use staff accounts for project team members
- Change roles as needed, but avoid deleting accounts

---

## Troubleshooting

### Where's my project?
- Check that you're logged in with the correct account
- Projects are only visible to the company they were created in
- Use the "View All Projects" page to see all projects

### Budget not updating?
- Make sure you clicked "Add Expense" and not just filled the form
- Check that the expense is assigned to the correct project
- Refresh the page to see latest calculations

### Report not exporting?
- Make sure you have at least one project
- Check that your browser allows downloads
- Try a different browser if having issues

### Can't see certain features?
- Some features are admin-only
- Check your user role in the top right corner
- Contact your admin if you need access changes

---

## Tips & Tricks

1. **Keyboard shortcuts**: You can press Tab to navigate forms faster
2. **Date selection**: Click the date field to open a calendar picker
3. **Quick export**: Use the CSV export button on any project details page
4. **Print reports**: Open a report and use Ctrl+P to print
5. **Mobile access**: All features work on mobile with a responsive interface

---

## Getting Help

- Check the FEATURES.md file for a complete feature list
- Review project details carefully before creating new entries
- Export reports to review with your accountant
- Contact your system administrator for account issues

---

## Security Notes

- Never share your login credentials
- Logout when done if using a shared computer
- Data is encrypted in transit
- Always review financial reports regularly

---

## Next Steps

1. ✅ Login with a demo account
2. ✅ Create your first project
3. ✅ Add project steps
4. ✅ Log some expenses
5. ✅ Generate a report
6. ✅ Export to CSV for review

Welcome to BuildManager! Let's build something great together! 🏗️
