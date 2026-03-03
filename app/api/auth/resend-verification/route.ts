// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await queryOne<any>(
      'SELECT id, email, email_verified FROM users WHERE email = ?',
      [email]
    );

    // Generic response to prevent email enumeration
    if (!user || user.email_verified) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a verification code has been sent' },
        { status: 200 }
      );
    }

    // Invalidate previous OTPs
    await query(
      'UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await query(
      'INSERT INTO email_verifications (id, user_id, otp_hash, expires_at, attempts) VALUES (?, ?, ?, ?, 0)',
      [uuidv4(), user.id, otpHash, expiresAt]
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      console.error('[RESEND-VERIFICATION] Failed to send email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[RESEND-VERIFICATION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
