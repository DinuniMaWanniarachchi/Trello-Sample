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

    const taskStatuses = await pool.query(
      `SELECT * FROM get_task_statuses_by_project($1::UUID)`,
      [projectId]
    );

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

// POST /api/projects/[id]/task-statuses - Create a new task status
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

    // Use the stored procedure
    const result = await pool.query(`
      SELECT * FROM create_task_status($1, $2, $3, $4)
    `, [projectId, name, color, position ?? null]);

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