// app/api/projects/[id]/task-groups/[group_id]/tasks/[taskId]/labels/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isValidLabelType } from '@/utils/labelUtils';

// GET - Fetch all labels for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;
    
    // Use stored procedure to fetch labels with scope validation
    const result = await pool.query(
      `SELECT * FROM get_task_labels($1::UUID, $2::UUID, $3::UUID)`,
      [taskId, taskGroupId, projectId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching task labels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task labels' },
      { status: 500 }
    );
  }
}

// POST - Add a label to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const { labelType } = body;

    console.log('Adding label:', { projectId, taskGroupId, taskId, labelType });

    // Validate label type (basic client/server guard; DB also validates scope)
    if (!labelType || !isValidLabelType(labelType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid label type' },
        { status: 400 }
      );
    }

    // Use stored procedure (idempotent add)
    const result = await pool.query(
      `SELECT * FROM add_task_label($1::UUID, $2::UUID, $3::UUID, $4::TEXT)`,
      [taskId, taskGroupId, projectId, labelType]
    );

    console.log('Label added successfully:', result.rows[0]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding task label:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add task label' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a label from a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; group_id: string; taskId: string }> }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = await params;
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const { labelType } = body;

    console.log('Removing label:', { projectId, taskGroupId, taskId, labelType });

    // Validate label type
    if (!labelType || !isValidLabelType(labelType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid label type' },
        { status: 400 }
      );
    }

    // Use stored procedure to remove label with scope validation
    const result = await pool.query(
      `SELECT * FROM remove_task_label($1::UUID, $2::UUID, $3::UUID, $4::TEXT)`,
      [taskId, taskGroupId, projectId, labelType]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Label not found on this task' },
        { status: 404 }
      );
    }

    console.log('Label removed successfully');

    return NextResponse.json({
      success: true,
      message: 'Label removed successfully'
    });

  } catch (error) {
    console.error('Error removing task label:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove task label' },
      { status: 500 }
    );
  }
}