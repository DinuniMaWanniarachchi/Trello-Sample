import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ListUpdateData, ApiResponse } from '@/types/api';

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

    const listId = params.id;
    const body: ListUpdateData = await request.json();

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

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (body.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(body.title);
    }
    if (body.title_color !== undefined) {
      updateFields.push(`title_color = $${paramCount++}`);
      values.push(body.title_color);
    }
    if (body.position !== undefined) {
      updateFields.push(`position = $${paramCount++}`);
      values.push(body.position);
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

    values.push(listId);
    const result = await pool.query(
      `UPDATE lists SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const response: ApiResponse = {
      success: true,
      message: 'List updated successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update list error:', error);
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
      `DELETE FROM lists 
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM boards WHERE id = lists.board_id AND user_id = $2
       ) 
       RETURNING *`,
      [listId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'List not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'List deleted successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete list error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}