import { Resend } from 'resend';
import { welcomeEmailHtml, welcomeEmailText } from './email-templates/welcome';
import { resetPasswordEmailHtml, resetPasswordEmailText } from './email-templates/reset-password';
import { verifyEmailHtml, verifyEmailText } from './email-templates/verify-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'SysDesign <noreply@nxdesign.app>';

export async function sendWelcomeEmail(to: string, name: string | null) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to SysDesign',
    html: welcomeEmailHtml(name),
    text: welcomeEmailText(name),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your SysDesign password',
    html: resetPasswordEmailHtml(resetUrl),
    text: resetPasswordEmailText(resetUrl),
  });
}

export async function sendVerificationEmail(to: string, name: string | null, code: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your SysDesign verification code',
    html: verifyEmailHtml(code, name),
    text: verifyEmailText(code),
  });
}
