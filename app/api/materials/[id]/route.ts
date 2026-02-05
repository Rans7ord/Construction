
// app/api/materials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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
      return NextResponse.json(
        { error: 'Materials table does not exist' },
        { status: 404 }
      );
    }

    // Verify the material belongs to user's company
    const material = await query(
      `SELECT m.*, p.company_id 
       FROM materials m 
       JOIN projects p ON m.project_id = p.id 
       WHERE m.id = ? AND p.company_id = ?`,
      [id, session.user.companyId]
    );

    if (!material || material.length === 0) {
      return NextResponse.json(
        { error: 'Material not found or unauthorized' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM materials WHERE id = ?', [id]);

    return NextResponse.json(
      { message: 'Material deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Delete material error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}