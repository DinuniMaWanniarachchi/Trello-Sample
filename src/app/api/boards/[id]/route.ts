import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BoardUpdateData, ApiResponse } from '@/types/api';

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

    // Get board with lists and cards
    const boardQuery = await pool.query(
      `SELECT b.*, p.name as project_name 
       FROM boards b 
       JOIN projects p ON b.project_id = p.id 
       WHERE b.id = $1 AND b.user_id = $2`,
      [boardId, decoded.userId]
    );

    if (boardQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board not found' },
        { status: 404 }
      );
    }

    const board = boardQuery.rows[0];

    // Get lists for this board
    const listsQuery = await pool.query(
      `SELECT l.*, sb.id as status_badge_id, sb.text as status_badge_text, sb.color as status_badge_color
       FROM lists l
       LEFT JOIN list_status_badges lsb ON l.id = lsb.list_id
       LEFT JOIN status_badges sb ON lsb.status_badge_id = sb.id
       WHERE l.board_id = $1 AND l.is_archived = false
       ORDER BY l.position ASC`,
      [boardId]
    );

    // Get cards for all lists
    const cardsQuery = await pool.query(
      `SELECT c.*, 
              ARRAY_AGG(
                CASE WHEN sb.id IS NOT NULL 
                THEN json_build_object('id', sb.id, 'text', sb.text, 'color', sb.color)
                ELSE NULL END
              ) FILTER (WHERE sb.id IS NOT NULL) as status_badges
       FROM cards c
       LEFT JOIN card_status_badges csb ON c.id = csb.card_id
       LEFT JOIN status_badges sb ON csb.status_badge_id = sb.id
       WHERE c.list_id = ANY(SELECT id FROM lists WHERE board_id = $1) AND c.is_archived = false
       GROUP BY c.id
       ORDER BY c.list_id, c.position ASC`,
      [boardId]
    );

    // Organize data
    const lists = listsQuery.rows.map(row => ({
      id: row.id,
      title: row.title,
      title_color: row.title_color,
      position: row.position,
      status_badge: row.status_badge_id ? {
        id: row.status_badge_id,
        text: row.status_badge_text,
        color: row.status_badge_color
      } : null,
      cards: cardsQuery.rows.filter(card => card.list_id === row.id)
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Board retrieved successfully',
      data: { ...board, lists },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get board error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const boardId = params.id;
    const body: BoardUpdateData = await request.json();

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
    if (body.background_color !== undefined) {
      updateFields.push(`background_color = $${paramCount++}`);
      values.push(body.background_color);
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

    values.push(boardId);
    const result = await pool.query(
      `UPDATE boards SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const response: ApiResponse = {
      success: true,
      message: 'Board updated successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update board error:', error);
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

    const boardId = params.id;

    const result = await pool.query(
      'DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING *',
      [boardId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Board deleted successfully',
      data: result.rows[0],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete board error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}