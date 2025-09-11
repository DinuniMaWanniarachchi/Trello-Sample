import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// PUT /api/projects/[id]/tasks/bulk-update - Bulk update tasks
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const { taskUpdates } = await request.json();

    if (!Array.isArray(taskUpdates) || taskUpdates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task updates array is required' },
        { status: 400 }
      );
    }

    await db.query('BEGIN');

    try {
      const updatedTasks = [];

      for (const update of taskUpdates) {
        const { taskId, ...updateFields } = update;
        
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateFields)) {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }

        if (setClauses.length > 0) {
          setClauses.push(`updated_at = now()`);
          values.push(taskId, projectId);

          const result = await db.query(`
            UPDATE tasks 
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex} AND project_id = $${paramIndex + 1}
            RETURNING *
          `, values);

          if (result.rows.length > 0) {
            updatedTasks.push(result.rows[0]);
          }
        }
      }

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: updatedTasks
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update tasks' },
      { status: 500 }
    );
  }
}