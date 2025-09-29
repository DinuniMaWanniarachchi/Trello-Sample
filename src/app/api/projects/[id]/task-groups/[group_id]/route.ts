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
      WHERE id = $1 AND project_id = $2
    `;

    const result = await pool.query(query, [groupId, projectId]);

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

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (color !== undefined) {
      updates.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }

    if (position !== undefined) {
      updates.push(`position = $${paramCount}`);
      values.push(position);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid fields to update' 
        },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(groupId, projectId);

    const query = `
      UPDATE task_groups 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} AND project_id = $${paramCount + 1}
      RETURNING *
    `;

    console.log('SQL Query:', query); // Debug log
    console.log('SQL Values:', values); // Debug log

    const result = await pool.query(query, values);

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
    const { id: projectId, group_id: groupId } = await params; // Added await

    // Check if task group exists
    const checkQuery = `
      SELECT id FROM task_groups 
      WHERE id = $1 AND project_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [groupId, projectId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task group not found' 
        },
        { status: 404 }
      );
    }

    // Delete task group (this will cascade delete related tasks if foreign key is set up)
    const deleteQuery = `
      DELETE FROM task_groups 
      WHERE id = $1 AND project_id = $2
    `;

    const result = await pool.query(deleteQuery, [groupId, projectId]);

    // Check if any row was actually deleted
    if (result.rowCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task group not found or already deleted' 
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