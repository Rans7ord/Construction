import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

export async function getServerSession(): Promise<{ user: AuthUser } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    console.log('Decoded token:', decoded);
    return { user: decoded };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
