import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { Project, CreateProjectData } from '@/types/project';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
  return new TextEncoder().encode(secret);
};

// In-memory storage for development (replace with database in production)
const projects: Project[] = [];

async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    
    const token = authHeader?.substring(7) || cookieToken;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// GET - Fetch user's projects
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Filter projects by user ID
  const userProjects = projects.filter(project => project.userId === user.id);
  
  return NextResponse.json({
    projects: userProjects,
    total: userProjects.length
  });
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateProjectData = await request.json();
    
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      description: body.description || '',
      workspace: body.workspace || 'My Workspace',
      userId: user.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: false,
      background: body.background || '',
      visibility: body.visibility || 'private'
    };

    projects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const body = await request.json();
    
    const projectIndex = projects.findIndex(
      p => p.id === projectId && p.userId === user.id
    );
    
    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const projectIndex = projects.findIndex(
      p => p.id === projectId && p.userId === user.id
    );
    
    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects.splice(projectIndex, 1);

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}