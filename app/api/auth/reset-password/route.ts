// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    // Validate input
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, token, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password minimum length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate token format (64 hex characters = 32 bytes)
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await queryOne<any>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    // Generic response to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find valid password reset token
    const resetRecord = await queryOne<any>(
      `SELECT id, token_hash, expires_at, used_at 
       FROM password_resets 
       WHERE user_id = ? AND used_at IS NULL 
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetRecord.used_at) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenMatch = await bcrypt.compare(token, resetRecord.token_hash);
    
    if (!tokenMatch) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mark token as used
    await query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [resetRecord.id]
    );

    // Update user password
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [passwordHash, user.id]
    );

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[RESET-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
