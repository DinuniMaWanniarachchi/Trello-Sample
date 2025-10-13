// src/app/api/projects/[id]/task-groups/[group_id]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups/[group_id]/tasks/[taskId] - Get specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;

    const result = await pool.query(
      `SELECT * FROM get_task_by_ids($1::UUID, $2::UUID, $3::UUID)`,
      [taskId, taskGroupId, projectId]
    );

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
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const { 
      title, 
      description, 
      priority, 
      due_date,
      labels
    } = body;
    const result = await pool.query(
      `
      SELECT * FROM update_task(
        $1::UUID, $2::UUID, $3::UUID,
        $4::TEXT, $5::TEXT, $6::TEXT, $7::TIMESTAMPTZ
      )
    `,
      [
        taskId, taskGroupId, projectId,
        title ?? null, description ?? null, priority ?? null, due_date ?? null,
      ]
    );

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
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;

    const result = await pool.query(
      `SELECT * FROM delete_task_and_compact($1::UUID, $2::UUID, $3::UUID)`,
      [taskId, taskGroupId, projectId]
    );

    if (result.rows.length === 0 || !result.rows[0]) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

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