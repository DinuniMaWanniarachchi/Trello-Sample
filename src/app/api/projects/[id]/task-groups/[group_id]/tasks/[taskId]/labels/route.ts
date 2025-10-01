// app/api/projects/[id]/task-groups/[group_id]/tasks/[taskId]/labels/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isValidLabelType } from '@/utils/labelUtils';

// GET - Fetch all labels for a task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;

    // Verify task exists in this project/group
    const taskCheck = await pool.query(
      `SELECT id FROM tasks 
       WHERE id = $1 AND task_group_id = $2 AND project_id = $3`,
      [taskId, taskGroupId, projectId]
    );

    if (taskCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get all labels for this task
    const result = await pool.query(
      `SELECT 
        id,
        task_id,
        label_type as type,
        created_at
       FROM task_labels
       WHERE task_id = $1
       ORDER BY created_at DESC`,
      [taskId]
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
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const { labelType } = body;

    console.log('Adding label:', { projectId, taskGroupId, taskId, labelType });

    // Validate label type
    if (!labelType || !isValidLabelType(labelType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid label type' },
        { status: 400 }
      );
    }

    // Verify task exists in this project/group
    const taskCheck = await pool.query(
      `SELECT id FROM tasks 
       WHERE id = $1 AND task_group_id = $2 AND project_id = $3`,
      [taskId, taskGroupId, projectId]
    );

    if (taskCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if label already exists
    const existingLabel = await pool.query(
      `SELECT id FROM task_labels WHERE task_id = $1 AND label_type = $2`,
      [taskId, labelType]
    );

    if (existingLabel.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Label already exists on this task' },
        { status: 409 }
      );
    }

    // Generate ID and add the label
    const labelId = `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await pool.query(
      `INSERT INTO task_labels (id, task_id, label_type)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, label_type as type, created_at`,
      [labelId, taskId, labelType]
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
  { params }: { params: { id: string; group_id: string; taskId: string } }
) {
  try {
    const { id: projectId, group_id: taskGroupId, taskId } = params;
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

    // Verify task exists in this project/group
    const taskCheck = await pool.query(
      `SELECT id FROM tasks 
       WHERE id = $1 AND task_group_id = $2 AND project_id = $3`,
      [taskId, taskGroupId, projectId]
    );

    if (taskCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the label
    const result = await pool.query(
      `DELETE FROM task_labels 
       WHERE task_id = $1 AND label_type = $2
       RETURNING id`,
      [taskId, labelType]
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