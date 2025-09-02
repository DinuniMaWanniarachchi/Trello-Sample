import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string; badgeId: string } }
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

    const { cardId, badgeId } = params;

    const result = await pool.query(
      `DELETE FROM card_status_badges 
       WHERE card_id = $1 AND status_badge_id = $2 AND EXISTS (
         SELECT 1 FROM cards c 
         JOIN lists l ON c.list_id = l.id 
         JOIN boards b ON l.board_id = b.id 
         WHERE c.id = $1 AND b.user_id = $3
       ) 
       RETURNING *`,
      [cardId, badgeId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Card status badge assignment not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Status badge removed from card successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Remove status badge from card error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}