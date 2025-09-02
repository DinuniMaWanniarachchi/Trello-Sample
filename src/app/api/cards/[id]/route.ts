import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { CardUpdateData, ApiResponse } from '@/types/api';

export async function PUT(
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
    const body: CardUpdateData = await request.json();

    // Verify card ownership through board
    const cardCheck = await pool.query(
      `SELECT c.id FROM cards c 
       JOIN lists l ON c.list_id = l.id 
       JOIN boards b ON l.board_id = b.id 
       WHERE c.id = $1 AND b.user_id = $2`,
      [cardId, decoded.userId]
    );

    if (cardCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Card not found' },
        { status: 404 }
      );
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (body.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(body.description);
    }
    if (body.color !== undefined) {
      updateFields.push(`color = $${paramCount++}`);
      values.push(body.color);
    }
    if (body.position !== undefined) {
      updateFields.push(`position = $${paramCount++}`);
      values.push(body.position);
    }
    if (body.due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      values.push(body.due_date);
    }
    if (body.assignee !== undefined) {
      updateFields.push(`assignee = $${paramCount++}`);
      values.push(body.assignee);
    }
    if (body.list_id !== undefined) {
      updateFields.push(`list_id = $${paramCount++}`);
      values.push(body.list_id);
    }
    if (body.is_archived !== undefined) {
      updateFields.push(`is_archived = $${paramCount++}`);
      values.push(body.is_archived);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(cardId);
    const result = await pool.query(
      `UPDATE cards SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const response: ApiResponse = {
      success: true,
      message: 'Card updated successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update card error:', error);
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

    const cardId = params.id;

    const result = await pool.query(
      `DELETE FROM cards 
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM lists l JOIN boards b ON l.board_id = b.id 
         WHERE l.id = cards.list_id AND b.user_id = $2
       ) 
       RETURNING *`,
      [cardId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Card not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Card deleted successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}