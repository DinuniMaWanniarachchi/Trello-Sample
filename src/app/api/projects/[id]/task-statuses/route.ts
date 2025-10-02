// src/app/api/projects/[id]/task-statuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-statuses - Get all task statuses for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    console.log('Fetching task statuses for project:', projectId);

    const taskStatuses = await pool.query(`
      SELECT 
        id as status_id,
        project_id,
        name,
        color,
        position,
        created_at,
        updated_at
      FROM task_statuses
      WHERE project_id = $1 
      ORDER BY position ASC, created_at ASC
    `, [projectId]);

    console.log('Task statuses found:', taskStatuses.rows.length);

    return NextResponse.json({
      success: true,
      data: taskStatuses.rows
    });
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task statuses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-statuses - Create new task status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { name, color = '#3b82f6', position } = await request.json();

    console.log('Creating task status:', { projectId, name, color, position });

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get the next position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await pool.query(`
        SELECT COALESCE(MAX(position), -1) + 1 as next_position
        FROM task_statuses
        WHERE project_id = $1
      `, [projectId]);
      finalPosition = maxPositionResult.rows[0].next_position;
    }

    const result = await pool.query(`
      INSERT INTO task_statuses (id, project_id, name, color, position)
      VALUES (gen_random_uuid(), $1, $2, $3, $4)
      RETURNING id as status_id, project_id, name, color, position, created_at, updated_at
    `, [projectId, name, color, finalPosition]);

    console.log('Task status created:', result.rows[0]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}