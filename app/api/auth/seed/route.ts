import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Create a test company and admin user
    const companyId = 'company_1';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    await execute(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['user_admin', 'Admin User', 'admin@example.com', hashedPassword, 'admin', companyId]
    );

    // Insert supervisor user
    const supervisorPassword = await bcrypt.hash('supervisor123', 10);
    await execute(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['user_supervisor', 'Supervisor User', 'supervisor@example.com', supervisorPassword, 'supervisor', companyId]
    );

    // Insert staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    await execute(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['user_staff', 'Staff User', 'staff@example.com', staffPassword, 'staff', companyId]
    );

    // Create sample projects
    await execute(
      `INSERT INTO projects (id, name, location, description, client_name, client_email, start_date, end_date, total_budget, created_by, company_id, status) VALUES
      ('proj1', 'Office Building Construction', 'Downtown Accra', 'Construction of a 5-story office building', 'ABC Corporation', 'contact@abc.com', '2024-01-01', '2024-12-31', 5000000.00, 'user_admin', ?, 'active'),
      ('proj2', 'Residential Complex', 'East Legon', 'Construction of 50-unit residential apartments', 'XYZ Developers', 'info@xyz.com', '2024-02-01', '2025-01-31', 8000000.00, 'user_admin', ?, 'active')`,
      [companyId, companyId]
    );

    // Create sample project steps
    await execute(
      `INSERT INTO project_steps (id, project_id, name, description, estimated_budget, \`order\`, status) VALUES
      ('step1', 'proj1', 'Foundation Work', 'Excavation and foundation laying', 500000.00, 1, 'completed'),
      ('step2', 'proj1', 'Structural Work', 'Building frame and structural elements', 2000000.00, 2, 'in-progress'),
      ('step3', 'proj1', 'Finishing Work', 'Interior and exterior finishing', 1500000.00, 3, 'pending'),
      ('step4', 'proj2', 'Site Preparation', 'Land clearing and site preparation', 300000.00, 1, 'completed'),
      ('step5', 'proj2', 'Foundation', 'Foundation and basement work', 800000.00, 2, 'in-progress')`,
      []
    );

    // Create sample expenses
    await execute(
      `INSERT INTO expenses (id, project_id, step_id, amount, description, date, category, vendor, created_by) VALUES
      ('exp1', 'proj1', 'step1', 250000.00, 'Concrete for foundation', '2024-01-15', 'Materials', 'Concrete Suppliers Ltd', 'user_admin'),
      ('exp2', 'proj1', 'step1', 150000.00, 'Steel reinforcement', '2024-01-20', 'Materials', 'Steel Works Inc', 'user_admin'),
      ('exp3', 'proj1', 'step2', 500000.00, 'Structural steel', '2024-02-01', 'Materials', 'Metal Fabricators', 'user_supervisor'),
      ('exp4', 'proj2', 'step4', 200000.00, 'Excavation equipment rental', '2024-02-10', 'Equipment', 'Heavy Machinery Ltd', 'user_admin')`,
      []
    );

    // Create sample money-in entries
    await execute(
      `INSERT INTO money_in (id, project_id, amount, description, date, reference) VALUES
      ('money1', 'proj1', 1000000.00, 'Initial payment from client', '2024-01-01', 'INV-001'),
      ('money2', 'proj1', 1500000.00, 'Second installment', '2024-02-15', 'INV-002'),
      ('money3', 'proj2', 2000000.00, 'Down payment', '2024-02-01', 'INV-003')`,
      []
    );

    // Create sample materials
    await execute(
      `INSERT INTO materials (id, project_id, step_id, name, type, quantity, unit, description, status) VALUES
      ('mat1', 'proj1', 'step2', 'Cement', 'Building Material', 1000.00, 'bags', 'Portland cement for concrete', 'ordered'),
      ('mat2', 'proj1', 'step2', 'Steel Bars', 'Building Material', 5000.00, 'kg', 'Reinforcement steel bars', 'pending'),
      ('mat3', 'proj2', 'step5', 'Bricks', 'Building Material', 50000.00, 'pieces', 'Red clay bricks', 'pending')`,
      []
    );

    // Create sample petty cash entries
    await execute(
      `INSERT INTO petty_cash (id, amount, description, category, vendor, type, date, added_by) VALUES
      ('pc1', 500.00, 'Office supplies', 'Office', 'Stationery Shop', 'outflow', '2024-01-10', 'user_admin'),
      ('pc2', 200.00, 'Fuel for site visit', 'Transportation', 'Fuel Station', 'outflow', '2024-01-15', 'user_supervisor'),
      ('pc3', 1000.00, 'Cash advance for materials', 'Materials', NULL, 'inflow', '2024-01-20', 'user_admin')`,
      []
    );

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      loginCredentials: {
        admin: { email: 'admin@example.com', password: 'admin123' },
        supervisor: { email: 'supervisor@example.com', password: 'supervisor123' },
        staff: { email: 'staff@example.com', password: 'staff123' }
      }
    });
  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json(
      { error: 'Seeding failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
