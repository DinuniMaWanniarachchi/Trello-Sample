import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { StatusBadgeCreateData, ApiResponse } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

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

    const boardId = params.id;

    // Verify board ownership
    const boardCheck = await pool.query(
      'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, decoded.userId]
    );

    if (boardCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board not found' },
        { status: 404 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM status_badges WHERE board_id = $1 ORDER BY created_at ASC',
      [boardId]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Status badges retrieved successfully',
      data: result.rows,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get status badges error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const boardId = params.id;
    const body: StatusBadgeCreateData = await request.json();
    const { text, color } = body;

    if (!text || !color) {
      return NextResponse.json(
        { success: false, message: 'Text and color are required' },
        { status: 400 }
      );
    }

    // Verify board ownership
    const boardCheck = await pool.query(
      'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, decoded.userId]
    );

    if (boardCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board not found' },
        { status: 404 }
      );
    }

    const badgeId = uuidv4();
    const result = await pool.query(
      `INSERT INTO status_badges (id, text, color, board_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [badgeId, text, color, boardId]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Status badge created successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create status badge error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}