import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BoardCreateData, ApiResponse } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT b.*, p.name as project_name 
       FROM boards b 
       JOIN projects p ON b.project_id = p.id 
       WHERE b.project_id = $1 AND b.user_id = $2 AND b.is_archived = false 
       ORDER BY b.created_at DESC`,
      [projectId, decoded.userId]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Boards retrieved successfully',
      data: result.rows,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get boards error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body: BoardCreateData = await request.json();
    const { title, description, project_id, background_color = 'white' } = body;

    if (!title || !project_id) {
      return NextResponse.json(
        { success: false, message: 'Title and project ID are required' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [project_id, decoded.userId]
    );

    if (projectCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    const boardId = uuidv4();
    const result = await pool.query(
      `INSERT INTO boards (id, title, description, project_id, user_id, background_color) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [boardId, title, description, project_id, decoded.userId, background_color]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Board created successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create board error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}