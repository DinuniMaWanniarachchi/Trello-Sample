// lib/auth.db.ts
import { getDbPool } from './db';
import { User, JWTPayload } from './auth.utils';
import { extractTokenFromRequest, getUserFromToken, getTokenFromCookies } from './auth.utils';
import { NextRequest } from 'next/server';

// Get current user from request (for API routes)
export const getCurrentUser = async (req: NextRequest): Promise<User | null> => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) return null;

    const decoded = getUserFromToken(token);
    if (!decoded) return null;

    const pool = await getDbPool();
    const userQuery = 'SELECT id, email, name FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    return userResult.rows.length > 0 ? userResult.rows[0] : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Get current user from cookies (for server components)
export const getCurrentUserFromCookies = async (): Promise<User | null> => {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const decoded = getUserFromToken(token);
    if (!decoded) return null;

    const pool = await getDbPool();
    const userQuery = 'SELECT id, email, name FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    return userResult.rows.length > 0 ? userResult.rows[0] : null;
  } catch (error) {
    console.error('Get current user from cookies error:', error);
    return null;
  }
};
