import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PUT /api/projects/[id]/task-groups/[group_id]/tasks/[taskId]/[statusId] - Update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string; statusId: string } }
) {
  console.log('🔥 STATUS UPDATE ROUTE HIT!', params);
  
  try {
    const { id: projectId, group_id: taskGroupId, taskId, statusId } = params;
    const body = await request.json().catch(() => ({})); // Handle empty body

    console.log('Request data:', { projectId, taskGroupId, taskId, statusId, body });

    // Validate that task exists
    const taskExists = await pool.query(`
      SELECT id FROM tasks 
      WHERE id = $1 AND task_group_id = $2 AND project_id = $3
    `, [taskId, taskGroupId, projectId]);

    if (taskExists.rows.length === 0) {
      console.log('❌ Task not found');
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task status
    const result = await pool.query(`
      UPDATE tasks
      SET
        task_status_id = $1,
        updated_at = NOW()
      WHERE id = $2 AND task_group_id = $3 AND project_id = $4
      RETURNING 
        id,
        title,
        description,
        position,
        priority,
        due_date,
        assignee_id,
        task_group_id,
        project_id,
        task_status_id,
        created_at,
        updated_at
    `, [statusId, taskId, taskGroupId, projectId]);

    console.log('Database update result:', { 
      rowCount: result.rowCount, 
      updatedTask: result.rows[0] 
    });

    if (result.rows.length === 0) {
      console.log('❌ Update failed - no rows affected');
      return NextResponse.json(
        { success: false, error: 'Failed to update task status' },
        { status: 500 }
      );
    }

    console.log('✅ Task status updated successfully');

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Task status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH method for compatibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string; statusId: string } }
) {
  console.log('🔥 PATCH method called, redirecting to PUT logic');
  return PUT(request, { params });
}

// GET method to retrieve task with specific status (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string; statusId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId, statusId } = params;

    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.position,
        t.priority,
        t.due_date,
        t.assignee_id,
        t.task_group_id,
        t.project_id,
        t.task_status_id,
        t.created_at,
        t.updated_at,
        ts.name as status_name
      FROM tasks t
      LEFT JOIN task_statuses ts ON t.task_status_id = ts.status_id
      WHERE t.id = $1 AND t.task_group_id = $2 AND t.project_id = $3 AND t.task_status_id = $4
    `, [taskId, taskGroupId, projectId, statusId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found with specified status' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task with status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}