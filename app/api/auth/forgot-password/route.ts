// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { sendPasswordResetEmail, APP_URL } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
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
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    // Generic response to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent' },
        { status: 200 }
      );
    }

    // Invalidate previous password reset tokens
    await query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    // Generate secure reset token (32+ bytes)
    const resetToken = generateSecureToken();
    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token
    await query(
      'INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, tokenHash, expiresAt]
    );

    // Generate reset link
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetLink);
    
    if (!emailResult.success) {
      console.error('[FORGOT-PASSWORD] Failed to send email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset link sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[FORGOT-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
