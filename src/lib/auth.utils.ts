// lib/auth.utils.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateToken = (user: { id: number; email: string; name: string }): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

// Extract token from request (App Router)
export const extractTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookieToken = req.cookies.get('token')?.value;
  return cookieToken || null;
};

// Extract token from server components
export const getTokenFromCookies = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    return token?.value || null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
};

// Get user from token
export const getUserFromToken = (token: string): JWTPayload | null => {
  return verifyToken(token);
};
