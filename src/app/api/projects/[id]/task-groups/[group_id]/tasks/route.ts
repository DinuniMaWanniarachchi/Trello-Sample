// src/app/api/projects/[id]/task-groups/[group_id]/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups/[group_id]/tasks - Get all tasks in a task group
export async function GET(
  request: NextRequest,
  context: { params: { id: string; group_id: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId } = context.params;

    console.log('Fetching tasks for group:', { projectId, taskGroupId });

    // Use the stored procedure to get tasks
    const tasks = await pool.query(`
      SELECT * FROM get_tasks_by_group($1::UUID, $2::UUID)
    `, [projectId, taskGroupId]);

    console.log('Tasks found:', tasks.rows.length);

    return NextResponse.json({
      success: true,
      data: tasks.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    console.log('Creating task:', { projectId, taskGroupId, title, priority });

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Use the stored procedure to create task with explicit type casting
    const result = await pool.query(`
      SELECT * FROM create_task(
        $1::TEXT,
        $2::UUID,
        $3::UUID,
        $4::TEXT,
        $5::TEXT,
        $6::TIMESTAMPTZ
      )
    `, [
      title,
      taskGroupId,
      projectId,
      description || null,
      priority,
      due_date || null
    ]);

    console.log('Task created:', result.rows[0]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}