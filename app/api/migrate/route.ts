import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST() {
  try {
    // Remove default value from role column
    await execute('ALTER TABLE users MODIFY COLUMN role ENUM(\'admin\', \'supervisor\', \'staff\') NOT NULL');
    console.log('Migration completed: Removed default role value');

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
