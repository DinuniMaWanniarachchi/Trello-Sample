import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const taskGroups: Array<{ id: string; position: number }> = body?.taskGroups;

    if (!Array.isArray(taskGroups) || taskGroups.length === 0) {
      return NextResponse.json(
        { success: false, error: 'taskGroups array is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const tg of taskGroups) {
        const { id: groupId, position } = tg;
        await client.query(
          `
          SELECT * FROM update_task_group(
            $1::UUID, $2::UUID,
            $3::TEXT, $4::TEXT, $5::INT
          )
        `,
          [groupId, projectId, null, null, position]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Return updated task groups ordered by position
    const { rows } = await pool.query(
      `
        SELECT 
          id,
          name,
          position,
          color,
          project_id,
          created_at,
          updated_at
        FROM task_groups
        WHERE project_id = $1
        ORDER BY position ASC
      `,
      [projectId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reorder task groups' },
      { status: 500 }
    );
  }
}
