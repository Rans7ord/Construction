# Project Management Guide

## Creating a New Project

### Step 1: Navigate to Project Creation
- Click the **"New Project"** button on the Dashboard
- Or go to **Dashboard > Projects > New Project**

### Step 2: Fill in Project Details
The Create Project form requires the following information:

#### Required Fields (marked with *)
1. **Project Name** - Give your project a clear, descriptive name
   - Example: "Downtown Office Complex"
   - Example: "Highway Bridge Renovation"

2. **Location** - Specify the physical location of the project
   - Example: "123 Main Street, Downtown"
   - Example: "Highway 101, Mile Marker 45"

3. **Client Name** - Name of the company or client
   - Example: "ABC Construction Corp"

4. **Client Email** - Contact email for the client
   - Example: "contact@abcconstruction.com"

5. **Start Date** - When the project begins
   - Use the date picker to select a date

6. **End Date** - When the project is expected to complete
   - Must be after the Start Date

7. **Total Budget** - The total allocated budget for the project
   - Enter the full amount in dollars
   - Example: 2500000 for $2.5 Million

#### Optional Fields
1. **Description** - Detailed description of the project
   - Add project scope, objectives, or special notes
   - This is optional but recommended

### Step 3: Submit the Form
- Click the **"Create Project"** button
- You'll be redirected to the Dashboard
- Your new project will appear in the Recent Projects section

---

## Viewing Projects

### View All Projects
1. Click **"View All Projects"** button on Dashboard
2. Or navigate to **Dashboard > Projects**
3. See all your projects in a grid layout with key statistics

### View Project Details
1. Click **"View Details"** on any project card
2. Or click the project name from the list
3. See full project information:
   - Budget overview and spending analysis
   - Project steps and phases
   - Income (Money In)
   - Expenses (Money Out)
   - Budget usage percentage

### Project Tabs
Once viewing a project, you can navigate between:
- **Overview** - Project information and client details
- **Steps** - Construction phases and their budgets
- **Budget** - Money In (income/payments)
- **Expenses** - All expenses broken down by step

---

## Editing Projects

### Edit Project Information
1. Go to the project details page
2. Click the **"Edit"** button in the top right
3. Modify any project details:
   - Project name
   - Location
   - Description
   - Client information
   - Dates
   - Budget
4. Click **"Update Project"** to save changes

### Note
- Only **Admin** users can edit projects
- Supervisors can view but not edit
- Staff have limited viewing access

---

## Deleting Projects

### Delete a Project

#### Method 1: From Project Details Page
1. Navigate to the project you want to delete
2. Click the **"Delete"** button in the top right corner
3. A confirmation dialog will appear
4. Click **"Delete Project"** to confirm
5. The project will be permanently removed

#### Method 2: From Project Card
1. Go to **Dashboard** or **Projects** page
2. Find the project card you want to delete
3. Click the **red trash icon** (🗑️) on the project card
4. Confirm the deletion in the dialog
5. Project is deleted immediately

### Important: Deletion is Permanent
When you delete a project, the following are also deleted:
- ✗ All project information
- ✗ All project steps/phases
- ✗ All income entries
- ✗ All expenses
- ✗ All reports and history

**There is no way to recover deleted projects**, so make sure you really want to delete it.

### Who Can Delete?
- **Admin** - Can delete any project
- **Supervisor** - Cannot delete projects
- **Staff** - Cannot delete projects

---

## Project Workflow Example

### Scenario: Creating and Managing a New Construction Project

**Step 1: Create the Project**
- Click "New Project" button
- Fill in: "Smith Office Building"
- Location: "456 Oak Avenue, Downtown"
- Client: "Smith Development Corp"
- Email: "info@smithdev.com"
- Start: January 1, 2024
- End: December 31, 2024
- Budget: $3,500,000

**Step 2: Create Project Steps**
- Go to project details
- Click "Phases" or "Steps" tab
- Create steps like:
  - Foundation (Budget: $500,000)
  - Framing (Budget: $800,000)
  - Exterior (Budget: $600,000)
  - Interior (Budget: $900,000)
  - Finishing (Budget: $700,000)

**Step 3: Add Income**
- Go to Budget tab
- Click "Add Income"
- Record payments as they come in from the client

**Step 4: Track Expenses**
- Go to Expenses tab
- Add expenses as they occur
- Assign each expense to the relevant step
- Track costs against the budget

**Step 5: Monitor Progress**
- View the budget usage percentage
- See remaining budget
- Compare actual vs. planned expenses

**Step 6: Generate Reports**
- Go to Reports page
- Select your project
- Export to CSV for analysis and client reporting

---

## Tips for Project Management

### Best Practices

1. **Be Descriptive**
   - Use clear project names that identify the location
   - Add detailed descriptions for reference

2. **Set Realistic Budgets**
   - Include contingency buffer in total budget
   - Break down budgets by step for better tracking

3. **Regular Updates**
   - Add expenses promptly as costs are incurred
   - Record income when payments are received

4. **Monitor Progress**
   - Check budget usage regularly
   - Alert if costs exceed estimates

5. **Backup Important Data**
   - Export reports periodically
   - Keep CSV exports for records

### Naming Conventions

For easy identification, use:
```
[Client Name] - [Project Type] - [Location] - [Year]

Examples:
- ABC Corp - Office Complex - Downtown - 2024
- Smith Dev - Residential Tower - North District - 2024
- City Council - Road Renovation - Highway 101 - 2024
```

### Budget Allocation Example

For a $2,000,000 project:
```
Foundation      15%  = $300,000
Framing         20%  = $400,000
Exterior        20%  = $400,000
Interior        30%  = $600,000
Finishing       10%  = $200,000
Contingency      5%  = $100,000
Total          100%  = $2,000,000
```

---

## Troubleshooting

### Q: I can't see the "Edit" or "Delete" buttons
**A:** You must be an Admin user. Only admins can edit/delete projects.

### Q: Can I recover a deleted project?
**A:** No, deletion is permanent. Make sure to export reports before deleting.

### Q: How do I change the project budget?
**A:** Click the "Edit" button on the project details page and update the total budget.

### Q: Can multiple users work on the same project?
**A:** Yes! All team members can view and work with shared projects based on their role permissions.

### Q: How do I track expenses by step?
**A:** When adding an expense, select the project step it belongs to. This automatically organizes expenses by construction phase.

---

## Security Notes

- Only Admins can create, edit, and delete projects
- Supervisors have read-only access
- Staff have limited read-only access
- All changes are logged with timestamps
- Data is stored locally in your browser

For more information, see the complete system documentation.
