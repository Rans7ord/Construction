// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await queryOne<any>(
      'SELECT id, email_verified FROM users WHERE email = ?',
      [email]
    );

    // Generic response to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { message: 'Email already verified', verified: true },
        { status: 200 }
      );
    }

    // Find valid OTP record
    const otpRecord = await queryOne<any>(
      `SELECT id, otp_hash, expires_at, attempts, used_at 
       FROM email_verifications 
       WHERE user_id = ? AND used_at IS NULL 
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if already used
    if (otpRecord.used_at) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code' },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpMatch = await bcrypt.compare(otp, otpRecord.otp_hash);
    
    if (!otpMatch) {
      // Increment attempts
      await query(
        'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );
      
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await query(
      'UPDATE email_verifications SET used_at = NOW() WHERE id = ?',
      [otpRecord.id]
    );

    // Update user email_verified status
    await query(
      'UPDATE users SET email_verified = 1, email_verified_at = NOW() WHERE id = ?',
      [user.id]
    );

    return NextResponse.json(
      { message: 'Email verified successfully', verified: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('[VERIFY-OTP] Error:', error);
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    );
  }
}
