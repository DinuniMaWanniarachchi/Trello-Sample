import { NextRequest, NextResponse } from 'next/server';
import  pool  from '@/lib/db';

// GET /api/projects/[id]/task-groups/[group_id]/tasks/[taskId] - Get specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;

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
      WHERE t.id = $1 AND t.task_group_id = $2 AND t.project_id = $3
    `, [taskId, taskGroupId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/task-groups/[group_id]/tasks/[taskId] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;
    const { 
      title, 
      description, 
      priority, 
      due_date, 
      assignee_id, 
      task_status_id 
    } = await request.json();

    const result = await pool.query(`
      UPDATE tasks 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        due_date = COALESCE($4, due_date),
        assignee_id = COALESCE($5, assignee_id),
        task_status_id = COALESCE($6, task_status_id),
        updated_at = now()
      WHERE id = $7 AND task_group_id = $8 AND project_id = $9
      RETURNING *
    `, [
      title, description, priority, due_date, assignee_id, 
      task_status_id, taskId, taskGroupId, projectId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/task-groups/[group_id]/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;

    const result = await pool.query(`
      DELETE FROM tasks 
      WHERE id = $1 AND task_group_id = $2 AND project_id = $3
      RETURNING id, position
    `, [taskId, taskGroupId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update positions of remaining tasks
    await pool.query(`
      UPDATE tasks 
      SET position = position - 1, updated_at = now()
      WHERE task_group_id = $1 AND position > $2
    `, [taskGroupId, result.rows[0].position]);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}