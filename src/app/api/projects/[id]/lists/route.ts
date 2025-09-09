import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ListCreateData, ApiResponse } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

// GET function to fetch lists for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Verify project ownership
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, decoded.userId]
    );

    if (projectCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch lists for the project, ordered by position
    const listsResult = await pool.query(
      'SELECT * FROM lists WHERE project_id = $1 ORDER BY position ASC',
      [projectId]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Lists fetched successfully',
      data: listsResult.rows,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Fetch lists error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST function to create a new list
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const projectId = params.id;
    const body: ListCreateData = await request.json();
    const { title, title_color = 'gray', position } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, decoded.userId]
    );

    if (projectCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Get next position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await pool.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM lists WHERE project_id = $1',
        [projectId]
      );
      finalPosition = maxPositionResult.rows[0].next_position;
    }

    const listId = uuidv4();
    const result = await pool.query(
      `INSERT INTO lists (id, title, project_id, title_color, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [listId, title, projectId, title_color, finalPosition]
    );

    const response: ApiResponse = {
      success: true,
      message: 'List created successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
