// app/api/projects/[id]/task-groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  pool  from '@/lib/db';

// GET /api/projects/[id]/task-groups - Get all task groups for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

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
        error: 'Failed to fetch task groups' 
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-groups - Create a new task group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { name, color = '#e2e8f0' } = body;

    if (!name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name is required' 
        },
        { status: 400 }
      );
    }

    // Get the next position
    const positionQuery = `
      SELECT COALESCE(MAX(position), 0) + 1 as next_position 
      FROM task_groups 
      WHERE project_id = $1
    `;
    const positionResult = await pool.query(positionQuery, [projectId]);
    const position = positionResult.rows[0].next_position;

    // Generate unique ID
    const id = `${projectId}-list-${Date.now()}`;

    const insertQuery = `
      INSERT INTO task_groups (id, name, position, color, project_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      id,
      name,
      position,
      color,
      projectId
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task group:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task group' 
      },
      { status: 500 }
    );
  }
}