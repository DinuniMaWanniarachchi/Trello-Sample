// app/api/projects/[id]/task-statuses/[statusId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-statuses/[statusId] - Get specific task status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;

    const query = `
      SELECT 
        status_id,
        project_id,
        name,
        created_at,
        updated_at
      FROM task_statuses 
      WHERE status_id = $1 AND project_id = $2
    `;

    const result = await pool.query(query, [statusId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task status not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task status' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/task-statuses/[statusId] - Update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;
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

    // Check if another status with this name exists (excluding current one)
    const checkQuery = `
      SELECT status_id FROM task_statuses 
      WHERE project_id = $1 AND LOWER(name) = LOWER($2) AND status_id != $3
    `;
    const checkResult = await pool.query(checkQuery, [projectId, name, statusId]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task status with this name already exists' 
        },
        { status: 409 }
      );
    }

    const updateQuery = `
      UPDATE task_statuses 
      SET name = $1, updated_at = NOW()
      WHERE status_id = $2 AND project_id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [name, statusId, projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task status not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task status' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/task-statuses/[statusId] - Delete task status
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; statusId: string } }
) {
  try {
    const { id: projectId, statusId } = params;

    // Check if task status exists
    const checkQuery = `
      SELECT status_id FROM task_statuses 
      WHERE status_id = $1 AND project_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [statusId, projectId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task status not found' 
        },
        { status: 404 }
      );
    }

    // Delete task status
    const deleteQuery = `
      DELETE FROM task_statuses 
      WHERE status_id = $1 AND project_id = $2
    `;

    await pool.query(deleteQuery, [statusId, projectId]);

    return NextResponse.json({
      success: true,
      message: 'Task status deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete task status' 
      },
      { status: 500 }
    );
  }
}