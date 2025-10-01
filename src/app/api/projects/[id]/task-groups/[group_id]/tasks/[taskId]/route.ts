// src/app/api/projects/[id]/task-groups/[group_id]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups/[group_id]/tasks/[taskId] - Get specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;

    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.position,
        t.priority,
        t.due_date,
        t.task_group_id,
        t.project_id,
        t.created_at,
        t.updated_at
      FROM tasks t
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

    await pool.query('BEGIN');

    try {
      const result = await pool.query(`
        UPDATE tasks 
        SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          due_date = COALESCE($4, due_date),
          updated_at = now()
        WHERE id = $5 AND task_group_id = $6 AND project_id = $7
        RETURNING *
      `, [
        title, description, priority, due_date, 
        taskId, taskGroupId, projectId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Task not found');
      }

      if (labels) {
        await pool.query('DELETE FROM task_labels WHERE task_id = $1', [taskId]);
        for (const labelType of labels) {
          const labelId = `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await pool.query('INSERT INTO task_labels (id, task_id, label_type) VALUES ($1, $2, $3)', [labelId, taskId, labelType]);
        }
      }

      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
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