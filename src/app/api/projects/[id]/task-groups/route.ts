// app/api/projects/[id]/task-groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups - Get all task groups for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const query = `
      SELECT 
        id,
        name,
        position,
        color,
        project_id,
        created_at,
        updated_at
      FROM task_groups 
      WHERE project_id = $1 
      ORDER BY position ASC
    `;

    const result = await pool.query(query, [projectId]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching task groups:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-groups - Create a new task group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { name, color = 'gray' } = body;

    console.log('Creating task group:', { name, color, projectId });

    if (!name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name is required' 
        },
        { status: 400 }
      );
    }

    // Call the PostgreSQL function
    const result = await pool.query(
      `SELECT * FROM create_task_group($1, $2, $3)`,
      [name, color, projectId]
    );

    console.log('Task group created:', result.rows[0]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task group - Full error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}