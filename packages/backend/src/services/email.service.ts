import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    console.warn('SMTP not configured, emails will not be sent');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port || 587,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  return transporter;
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const transport = getTransporter();

  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

  if (!transport) {
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transport.sendMail({
    from: config.smtp.from || 'noreply@spliteasy.app',
    to: email,
    subject: 'Reset your SplitEasy password',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset for your SplitEasy account.</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
