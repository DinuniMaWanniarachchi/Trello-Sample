// app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
  return new TextEncoder().encode(secret);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      
      return NextResponse.json({ 
        valid: true, 
        user: payload 
      });
      
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}