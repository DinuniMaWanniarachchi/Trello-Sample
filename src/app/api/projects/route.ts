import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';
import { CreateProjectData } from '@/types/project';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    
    const token = authHeader?.substring(7) || cookieToken;
    
    if (!token) {
      console.log('No token found');
      return null;
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    console.log('Token payload:', payload); // Debug log
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// GET - Fetch user's projects
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.userId) {
    console.log('Unauthorized GET request - no user or user.userId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fixed: Use user_id (snake_case) to match database schema
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [user.userId]);
    const userProjects = result.rows;
  
    return NextResponse.json({
      projects: userProjects,
      total: userProjects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.userId) {
    console.log('Unauthorized POST request - no user or user.userId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateProjectData = await request.json();
    
    // Generate UUID for project ID
    const projectId = crypto.randomUUID();
    
    // Fixed: Use user_id (snake_case) and proper column names
    const result = await pool.query(
      `INSERT INTO projects (id, name, description, workspace, user_id, background, visibility, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [
        projectId,
        body.name, 
        body.description || '', 
        body.workspace || 'My Workspace', 
        user.userId, 
        body.background || '', 
        body.visibility || 'private'
      ]
    );
    const newProject = result.rows[0];

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.userId) {
    console.log('Unauthorized PUT request - no user or user.userId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Fixed: Use user_id (snake_case)
    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, description = $2, workspace = $3, background = $4, visibility = $5, updated_at = NOW() 
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [body.name, body.description, body.workspace, body.background, body.visibility, projectId, user.userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }
    
    const updatedProject = result.rows[0];
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.userId) {
    console.log('Unauthorized DELETE request - no user or user.userId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Fixed: Use user_id (snake_case)
    const result = await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, user.userId]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}