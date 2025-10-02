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
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    return payload; // payload should contain userId
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Default task groups to create for new projects
const DEFAULT_TASK_GROUPS = [
  { name: 'To Do', color: '#e2e8f0', position: 1 },
  { name: 'Doing', color: '#3b82f6', position: 2 },
  { name: 'Done', color: '#10b981', position: 3 },
] as const;

// ================= GET =================
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId]
    );
    return NextResponse.json({
      projects: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// ================= POST =================
export async function POST(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateProjectData = await request.json();

    const result = await pool.query(
      `INSERT INTO projects 
        (name, description, workspace, user_id, background, visibility, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        body.name,
        body.description || '',
        body.workspace || 'My Workspace',
        user.userId,
        body.background || '',
        body.visibility || 'private',
      ]
    );

    const newProject = result.rows[0];
    const projectId = newProject.id;

    if (projectId) {
      // Create default task groups for the new project
      const insertPromises = DEFAULT_TASK_GROUPS.map(async (groupData) => {
        const insertQuery = `
          INSERT INTO task_groups (name, position, color, project_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id, name, position, color, project_id, created_at, updated_at
        `;
        return pool.query(insertQuery, [
          groupData.name,
          groupData.position,
          groupData.color,
          projectId
        ]);
      });

      await Promise.all(insertPromises);
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// ================= PUT =================
export async function PUT(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const body = await request.json();

    const result = await pool.query(
      `UPDATE projects
       SET name = $1,
           description = $2,
           workspace = $3,
           background = $4,
           visibility = $5,
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        body.name,
        body.description,
        body.workspace,
        body.background,
        body.visibility,
        projectId,
        user.userId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// ================= DELETE =================
export async function DELETE(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}