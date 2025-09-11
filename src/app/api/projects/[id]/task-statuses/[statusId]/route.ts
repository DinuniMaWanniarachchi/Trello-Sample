// src/app/api/projects/[id]/task-statuses/[statusId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/projects/[id]/task-statuses/[statusId] - Get specific task status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;

    const result = await db.query(`
      SELECT 
        status_id,
        project_id,
        name,
        created_at,
        updated_at
      FROM task_statuses 
      WHERE status_id = $1 AND project_id = $2
    `, [statusId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task status' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/task-statuses/[statusId] - Update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      UPDATE task_statuses 
      SET name = $1, updated_at = now()
      WHERE status_id = $2 AND project_id = $3
      RETURNING status_id, project_id, name, created_at, updated_at
    `, [name, statusId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/task-statuses/[statusId] - Delete task status
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;

    // Check if any tasks are using this status
    const tasksCheck = await db.query(`
      SELECT COUNT(*) as task_count 
      FROM tasks 
      WHERE task_status_id = $1
    `, [statusId]);

    if (parseInt(tasksCheck.rows[0].task_count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete task status that has associated tasks' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      DELETE FROM task_statuses 
      WHERE status_id = $1 AND project_id = $2
      RETURNING status_id
    `, [statusId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task status deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task status' },
      { status: 500 }
    );
  }
}