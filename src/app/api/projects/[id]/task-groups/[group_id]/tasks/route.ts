// src/app/api/projects/[id]/task-groups/[group_id]/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups/[group_id]/tasks - Get all tasks in a task group
export async function GET(
  request: NextRequest,
  context: { params: { id: string; group_id: string } }
) {
  try {
    await request.text(); // Ensure request is processed
    const { id: projectId, group_id: taskGroupId } = context.params;

    const tasks = await pool.query(`
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
      WHERE t.task_group_id = $1 AND t.project_id = $2
      ORDER BY t.position ASC
    `, [taskGroupId, projectId]);

    return NextResponse.json({
      success: true,
      data: tasks.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-groups/[group_id]/tasks - Create new task
export async function POST(
  request: NextRequest,
  context: { params: { id: string; group_id: string } }
) {
  try {
    const body = await request.json();
    const { id: projectId, group_id: taskGroupId } = context.params;
    const { 
      title,
      description,
      priority = 'MEDIUM',
      due_date
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the next position
    const positionResult = await pool.query(`
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM tasks 
      WHERE task_group_id = $1
    `, [taskGroupId]);

    const position = positionResult.rows[0].next_position;

    // Generate UUID for task id
    const taskId = crypto.randomUUID();

    const result = await pool.query(`
      INSERT INTO tasks (
        id, title, description, position, priority, 
        due_date, task_group_id, project_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      taskId, title, description, position, priority,
      due_date, taskGroupId, projectId
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}