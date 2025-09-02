import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { CardCreateData, ApiResponse } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

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
    const body: CardCreateData = await request.json();
    const { title, description, color = 'white', position, due_date, assignee } = body;

    // Verify list ownership through board
    const listCheck = await pool.query(
      `SELECT l.id FROM lists l 
       JOIN boards b ON l.board_id = b.id 
       WHERE l.id = $1 AND b.user_id = $2`,
      [listId, decoded.userId]
    );

    if (listCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'List not found' },
        { status: 404 }
      );
    }

    // Get next position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await pool.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM cards WHERE list_id = $1',
        [listId]
      );
      finalPosition = maxPositionResult.rows[0].next_position;
    }

    const cardId = uuidv4();
    const result = await pool.query(
      `INSERT INTO cards (id, title, description, list_id, color, position, due_date, assignee) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [cardId, title, description, listId, color, finalPosition, due_date, assignee]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Card created successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}