// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from '@/lib/auth';
import { createTrialSubscription, canAddUser } from '@/lib/subscription';
import { sendOTPEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'supervisor', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, supervisor, or staff' },
        { status: 400 }
      );
    }

    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const session = await getServerSession();
    let companyId: string;
    let isNewCompany = false;

    if (session?.user && session.user.role === 'admin') {
      companyId = session.user.companyId;

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
      companyId = uuidv4();
      isNewCompany = true;
      console.log(`[SIGNUP] New company signup, company_id: ${companyId}`);
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    await query(
      'INSERT INTO users (id, name, email, password, role, company_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [userId, name, email, hashedPassword, role, companyId]
    );

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await bcryptjs.hash(otp, 10);
    const expiresAt = toMySQLDateTime(new Date(Date.now() + 10 * 60 * 1000));

    await query(
      'INSERT INTO email_verifications (id, user_id, otp_hash, expires_at, attempts) VALUES (?, ?, ?, ?, 0)',
      [uuidv4(), userId, otpHash, expiresAt]
    );

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('[SIGNUP] Failed to send verification email:', emailError);
    }

    if (isNewCompany) {
      try {
        await createTrialSubscription(companyId);
        console.log(`[SIGNUP] 15-day trial created for company ${companyId}`);
      } catch (trialError) {
        console.error('[SIGNUP] Failed to create trial subscription:', trialError);
      }
    }

    return NextResponse.json(
      { message: 'User created successfully. Please verify your email.', userId, needsVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}