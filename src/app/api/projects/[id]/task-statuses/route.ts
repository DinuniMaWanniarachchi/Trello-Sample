// src/app/api/projects/[id]/task-statuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/projects/[id]/task-statuses - Get all task statuses for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const taskStatuses = await db.query(`
      SELECT 
        status_id,
        project_id,
        name,
        created_at,
        updated_at
      FROM task_statuses 
      WHERE project_id = $1 
      ORDER BY created_at ASC
    `, [projectId]);

    return NextResponse.json({
      success: true,
      data: taskStatuses.rows
    });
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task statuses' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-statuses - Create new task status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      INSERT INTO task_statuses (project_id, name)
      VALUES ($1, $2)
      RETURNING status_id, project_id, name, created_at, updated_at
    `, [projectId, name]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task status' },
      { status: 500 }
    );
  }
}