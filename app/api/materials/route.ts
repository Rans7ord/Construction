//app/api/materials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { snakeToCamel } from '@/lib/transform';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, stepId, name, type, quantity, unit, description } = body;

    if (!projectId || !stepId || !name || !type || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate that the step exists
    const stepExists = await query(
      'SELECT id FROM project_steps WHERE id = ? AND project_id = ?',
      [stepId, projectId]
    );
    if (stepExists.length === 0) {
      return NextResponse.json(
        { error: 'Invalid step_id: step does not exist or does not belong to the project' },
        { status: 400 }
      );
    }

    // Check if materials table exists, create it if it doesn't
    try {
      await execute(
        `INSERT INTO materials (id, project_id, step_id, name, type, quantity, unit, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [id, projectId, stepId, name, type, quantity, unit, description || null]
      );
    } catch (tableError: any) {
      // If table doesn't exist, create it and retry
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        console.log('Materials table not found, creating it...');
        
        // Create materials table
        await execute(`
          CREATE TABLE IF NOT EXISTS materials (
            id VARCHAR(50) PRIMARY KEY,
            project_id VARCHAR(50) NOT NULL,
            step_id VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            unit VARCHAR(50) NOT NULL,
            description TEXT,
            status ENUM('pending', 'ordered', 'received', 'used') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (step_id) REFERENCES project_steps(id) ON DELETE CASCADE,
            INDEX idx_materials_project (project_id),
            INDEX idx_materials_step (step_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Now try the insert again
        await execute(
          `INSERT INTO materials (id, project_id, step_id, name, type, quantity, unit, description, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [id, projectId, stepId, name, type, quantity, unit, description || null]
        );
      } else {
        throw tableError;
      }
    }

    return NextResponse.json(
      { 
        message: 'Material added successfully', 
        id,
        material: {
          id,
          projectId,
          stepId,
          name,
          type,
          quantity,
          unit,
          description: description || null,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Add material error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get('projectId');
    const stepId = request.nextUrl.searchParams.get('stepId');

    // Check if materials table exists
    let tableExists = true;
    try {
      await query('SELECT 1 FROM materials LIMIT 1');
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        tableExists = false;
      } else {
        throw error;
      }
    }

    if (!tableExists) {
      // Table doesn't exist, return empty array
      return NextResponse.json([]);
    }

    let sql = `
      SELECT m.*, p.company_id 
      FROM materials m 
      JOIN projects p ON m.project_id = p.id 
      WHERE p.company_id = ?
    `;
    const params: any[] = [session.user.companyId];

    if (projectId) {
      sql += ' AND m.project_id = ?';
      params.push(projectId);
    }

    if (stepId) {
      sql += ' AND m.step_id = ?';
      params.push(stepId);
    }

    sql += ' ORDER BY m.created_at DESC';

    const materials = await query(sql, params);

    return NextResponse.json(snakeToCamel(materials));
  } catch (error: any) {
    console.error('Get materials error:', error);
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}