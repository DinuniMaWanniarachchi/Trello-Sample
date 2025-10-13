// app/api/projects/[id]/task-groups/[groupId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[id]/task-groups/[groupId] - Get specific task group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string }> }
) {
  try {
    const { id: projectId, group_id: groupId } = await params; // Added await

    const result = await pool.query(
      `SELECT * FROM get_task_group_by_ids($1::UUID, $2::UUID)`,
      [groupId, projectId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task group not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching task group:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task group' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/task-groups/[groupId] - Update task group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string }> }
) {
  try {
    const { id: projectId, group_id: groupId } = await params; // Added await
    const body = await request.json();
    const { name, color, position } = body;

    console.log('Updating task group:', { projectId, groupId, body }); // Debug log

    const result = await pool.query(
      `
      SELECT * FROM update_task_group(
        $1::UUID, $2::UUID,
        $3::TEXT, $4::TEXT, $5::INT
      )
    `,
      [groupId, projectId, name ?? null, color ?? null, position ?? null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task group not found' 
        },
        { status: 404 }
      );
    }

    console.log('Update successful:', result.rows[0]); // Debug log

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating task group:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task group' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/task-groups/[groupId] - Delete task group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string }> }
) {
  try {
    const { id: projectId, group_id: groupId } = await params;
    console.log('DELETE request received for groupId:', groupId, 'projectId:', projectId);

    const result = await pool.query(
      `SELECT * FROM delete_task_group_and_compact($1::UUID, $2::UUID)`,
      [groupId, projectId]
    );

    if (result.rows.length === 0 || !result.rows[0]) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task group not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task group deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task group:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete task group' 
      },
      { status: 500 }
    );
  }
}