import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { StatusBadgeUpdateData, ApiResponse } from '@/types/api';

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

    const badgeId = params.id;
    const body: StatusBadgeUpdateData = await request.json();

    // Verify badge ownership through board
    const badgeCheck = await pool.query(
      `SELECT sb.id FROM status_badges sb 
       JOIN boards b ON sb.board_id = b.id 
       WHERE sb.id = $1 AND b.user_id = $2`,
      [badgeId, decoded.userId]
    );

    if (badgeCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Status badge not found' },
        { status: 404 }
      );
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (body.text !== undefined) {
      updateFields.push(`text = ${paramCount++}`);
      values.push(body.text);
    }
    if (body.color !== undefined) {
      updateFields.push(`color = ${paramCount++}`);
      values.push(body.color);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(badgeId);
    const result = await pool.query(
      `UPDATE status_badges SET ${updateFields.join(', ')} WHERE id = ${paramCount} RETURNING *`,
      values
    );

    const response: ApiResponse = {
      success: true,
      message: 'Status badge updated successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update status badge error:', error);
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

    const badgeId = params.id;

    const result = await pool.query(
      `DELETE FROM status_badges 
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM boards WHERE id = status_badges.board_id AND user_id = $2
       ) 
       RETURNING *`,
      [badgeId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Status badge not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Status badge deleted successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete status badge error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}