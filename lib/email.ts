// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_USER || '';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendOTPEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: `Workfield <${FROM_EMAIL}>`,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Error sending OTP email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    await transporter.sendMail({
      from: `Logonvoice <${FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #666; font-size: 16px;">You requested to reset your password. Click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 15 minutes.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Error sending password reset email:', error);
    return { success: false, error };
  }
}

