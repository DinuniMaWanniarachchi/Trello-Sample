// src/app/api/projects/[id]/task-groups/[group_id]/tasks/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PUT /api/projects/[id]/task-groups/[group_id]/tasks/reorder - Reorder tasks (for drag and drop)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string }> }
) {
  try {
    const { id: projectId, group_id: sourceGroupId } = await params;
    const { taskId, destinationGroupId, newPosition } = await request.json();

    if (!taskId || !destinationGroupId || newPosition === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // If moving between different groups
      if (sourceGroupId !== destinationGroupId) {
        // Update positions in source group
        await pool.query(`
          UPDATE tasks 
          SET position = position - 1, updated_at = now()
          WHERE task_group_id = $1 AND position > (
            SELECT position FROM tasks WHERE id = $2
          )
        `, [sourceGroupId, taskId]);

        // Update positions in destination group
        await pool.query(`
          UPDATE tasks 
          SET position = position + 1, updated_at = now()
          WHERE task_group_id = $1 AND position >= $2
        `, [destinationGroupId, newPosition]);

        // Move the task
        await pool.query(`
          UPDATE tasks 
          SET task_group_id = $1, position = $2, updated_at = now()
          WHERE id = $3 AND project_id = $4
        `, [destinationGroupId, newPosition, taskId, projectId]);
      } else {
        // Moving within the same group
        const currentPositionResult = await pool.query(`
          SELECT position FROM tasks WHERE id = $1
        `, [taskId]);

        const currentPosition = currentPositionResult.rows[0].position;

        if (currentPosition < newPosition) {
          // Moving down
          await pool.query(`
            UPDATE tasks 
            SET position = position - 1, updated_at = now()
            WHERE task_group_id = $1 AND position > $2 AND position <= $3
          `, [destinationGroupId, currentPosition, newPosition]);
        } else if (currentPosition > newPosition) {
          // Moving up
          await pool.query(`
            UPDATE tasks 
            SET position = position + 1, updated_at = now()
            WHERE task_group_id = $1 AND position >= $2 AND position < $3
          `, [destinationGroupId, newPosition, currentPosition]);
        }

        // Update the task position
        await pool.query(`
          UPDATE tasks 
          SET position = $1, updated_at = now()
          WHERE id = $2
        `, [newPosition, taskId]);
      }

      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Task reordered successfully'
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error reordering task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder task' },
      { status: 500 }
    );
  }
}
