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

    const cardId = params.id;
    const { status_badge_id } = await request.json();

    if (!status_badge_id) {
      return NextResponse.json(
        { success: false, message: 'Status badge ID is required' },
        { status: 400 }
      );
    }

    // Verify card and badge ownership
    const verifyQuery = await pool.query(
      `SELECT c.id as card_id, sb.id as badge_id 
       FROM cards c 
       JOIN lists l ON c.list_id = l.id 
       JOIN boards b ON l.board_id = b.id 
       JOIN status_badges sb ON sb.board_id = b.id 
       WHERE c.id = $1 AND sb.id = $2 AND b.user_id = $3`,
      [cardId, status_badge_id, decoded.userId]
    );

    if (verifyQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Card or status badge not found' },
        { status: 404 }
      );
    }

    // Check if already exists
    const existingQuery = await pool.query(
      'SELECT id FROM card_status_badges WHERE card_id = $1 AND status_badge_id = $2',
      [cardId, status_badge_id]
    );

    if (existingQuery.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Status badge already assigned to card' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `INSERT INTO card_status_badges (card_id, status_badge_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [cardId, status_badge_id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Status badge assigned to card successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Assign status badge to card error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}