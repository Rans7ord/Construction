// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from '@/lib/auth';
import { createTrialSubscription, canAddUser } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'supervisor', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, supervisor, or staff' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Check if this is an admin creating a team member (authenticated request)
    const session = await getServerSession();
    let companyId: string;
    let isNewCompany = false;

    if (session?.user && session.user.role === 'admin') {
      // ── Admin adding a team member ─────────────────────────────────────────
      companyId = session.user.companyId;

      // Enforce user limit based on current subscription plan
      const allowed = await canAddUser(companyId);
      if (!allowed) {
        return NextResponse.json(
          {
            error: 'User limit reached for your current plan. Please upgrade to add more team members.',
            code: 'USER_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }

      console.log(`[SIGNUP] Admin ${session.user.email} adding user to company ${companyId}`);
    } else {
      // ── Public signup — brand new company ─────────────────────────────────
      companyId   = uuidv4();
      isNewCompany = true;
      console.log(`[SIGNUP] New company signup, company_id: ${companyId}`);
    }

    // Hash password and create user
    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    await query(
      'INSERT INTO users (id, name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role, companyId]
    );

    // ── Create 15-day trial for brand-new companies only ──────────────────────
    if (isNewCompany) {
      try {
        await createTrialSubscription(companyId);
        console.log(`[SIGNUP] 15-day trial created for company ${companyId}`);
      } catch (trialError) {
        // Non-fatal — log but don't block signup
        console.error('[SIGNUP] Failed to create trial subscription:', trialError);
      }
    }

    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}