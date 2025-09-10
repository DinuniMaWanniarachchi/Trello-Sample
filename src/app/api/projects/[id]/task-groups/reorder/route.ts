// app/api/projects/[id]/task-groups/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PUT /api/projects/[id]/task-groups/reorder - Update positions of multiple task groups
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { taskGroups } = body; // Array of { id, position }

    if (!Array.isArray(taskGroups) || taskGroups.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'taskGroups array is required' 
        },
        { status: 400 }
      );
    }

    // Validate that all task groups belong to the project
    const groupIds = taskGroups.map(tg => tg.id);
    const validateQuery = `
      SELECT id FROM task_groups 
      WHERE id = ANY($1) AND project_id = $2
    `;
    const validateResult = await pool.query(validateQuery, [groupIds, projectId]);

    if (validateResult.rows.length !== groupIds.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Some task groups do not belong to this project' 
        },
        { status: 400 }
      );
    }

    // Begin transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update positions
      for (const taskGroup of taskGroups) {
        await client.query(
          'UPDATE task_groups SET position = $1, updated_at = NOW() WHERE id = $2 AND project_id = $3',
          [taskGroup.position, taskGroup.id, projectId]
        );
      }

      await client.query('COMMIT');

      // Fetch updated task groups
      const fetchQuery = `
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
      `;
      const result = await client.query(fetchQuery, [projectId]);

      return NextResponse.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error reordering task groups:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reorder task groups' 
      },
      { status: 500 }
    );
  }
}