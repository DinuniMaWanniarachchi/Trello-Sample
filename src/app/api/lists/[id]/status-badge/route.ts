import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

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

    const listId = params.id;
    const { status_badge_id } = await request.json();

    if (!status_badge_id) {
      return NextResponse.json(
        { success: false, message: 'Status badge ID is required' },
        { status: 400 }
      );
    }

    // Verify list and badge ownership
    const verifyQuery = await pool.query(
      `SELECT l.id as list_id, sb.id as badge_id 
       FROM lists l 
       JOIN boards b ON l.board_id = b.id 
       JOIN status_badges sb ON sb.board_id = b.id 
       WHERE l.id = $1 AND sb.id = $2 AND b.user_id = $3`,
      [listId, status_badge_id, decoded.userId]
    );

    if (verifyQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'List or status badge not found' },
        { status: 404 }
      );
    }

    // Remove existing status badge for this list (if any)
    await pool.query(
      'DELETE FROM list_status_badges WHERE list_id = $1',
      [listId]
    );

    // Add new status badge
    const result = await pool.query(
      `INSERT INTO list_status_badges (list_id, status_badge_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [listId, status_badge_id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Status badge assigned to list successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Assign status badge to list error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const listId = params.id;

    const result = await pool.query(
      `DELETE FROM list_status_badges 
       WHERE list_id = $1 AND EXISTS (
         SELECT 1 FROM lists l 
         JOIN boards b ON l.board_id = b.id 
         WHERE l.id = $1 AND b.user_id = $2
       ) 
       RETURNING *`,
      [listId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'List status badge assignment not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Status badge removed from list successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Remove status badge from list error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}