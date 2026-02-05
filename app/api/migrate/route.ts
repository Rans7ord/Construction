import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Drop existing tables in correct order (reverse dependency order)
    const dropStatements = [
      'DROP TABLE IF EXISTS materials',
      'DROP TABLE IF EXISTS expenses',
      'DROP TABLE IF EXISTS money_in',
      'DROP TABLE IF EXISTS project_steps',
      'DROP TABLE IF EXISTS projects',
      'DROP TABLE IF EXISTS petty_cash',
      'DROP TABLE IF EXISTS users'
    ];

    for (const statement of dropStatements) {
      try {
        await execute(statement);
      } catch (error) {
        // Ignore errors for tables that don't exist
        console.log(`Note: ${statement} failed (table may not exist):`, (error as Error).message);
      }
    }

    // Read the database schema file
    const schemaPath = path.join(process.cwd(), 'db.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Raw schema length:', schema.length);
    console.log('First 200 chars:', schema.substring(0, 200));

    // Split the schema into individual statements, handling multi-line statements
    const statements = [];
    let currentStatement = '';
    const lines = schema.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('--') || trimmedLine === '') continue;

      currentStatement += line + '\n';

      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    console.log('Parsed statements:', statements.length);
    console.log('First statement:', statements[0]?.substring(0, 100) + '...');

    // Execute each statement (excluding DROP TABLE statements)
    for (const statement of statements) {
      if (statement.trim() && !statement.toUpperCase().includes('DROP TABLE')) {
        console.log('Executing:', statement.substring(0, 50).replace('\n', ' ') + '...');
        await execute(statement);
      }
    }

    console.log('Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    });
  } catch (error) {
    console.error('Database setup failed:', error);
    return NextResponse.json(
      { error: 'Database setup failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
