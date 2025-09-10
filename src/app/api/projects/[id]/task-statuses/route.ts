// app/api/projects/[id]/task-statuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-statuses - Get all task statuses for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const query = `
      SELECT 
        status_id,
        project_id,
        name,
        created_at,
        updated_at
      FROM task_statuses 
      WHERE project_id = $1 
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query, [projectId]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching task statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task statuses' 
      },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/task-statuses - Create a new task status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name is required' 
        },
        { status: 400 }
      );
    }

    // Check if status name already exists for this project
    const checkQuery = `
      SELECT status_id FROM task_statuses 
      WHERE project_id = $1 AND LOWER(name) = LOWER($2)
    `;
    const checkResult = await pool.query(checkQuery, [projectId, name]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task status with this name already exists' 
        },
        { status: 409 }
      );
    }

    // Generate unique ID
    const statusId = `status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const insertQuery = `
      INSERT INTO task_statuses (status_id, project_id, name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      statusId,
      projectId,
      name
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task status' 
      },
      { status: 500 }
    );
  }
}