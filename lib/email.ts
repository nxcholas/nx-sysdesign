import { Resend } from 'resend';
import { welcomeEmailHtml, welcomeEmailText } from './email-templates/welcome';
import { resetPasswordEmailHtml, resetPasswordEmailText } from './email-templates/reset-password';
import { verifyEmailHtml, verifyEmailText } from './email-templates/verify-email';
import { questionEmailHtml, questionEmailText } from './email-templates/question-email';
import { bugReportEmailHtml, bugReportEmailText } from './email-templates/bug-report-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'NX-Design <noreply@nxdesign.app>';

function feedbackRecipient(): string {
  const to = process.env.FEEDBACK_TO_EMAIL;
  if (!to) {
    throw new Error('FEEDBACK_TO_EMAIL is not configured');
  }
  return to;
}

export async function sendWelcomeEmail(to: string, name: string | null) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to NX-Design',
    html: welcomeEmailHtml(name),
    text: welcomeEmailText(name),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your NX-Design password',
    html: resetPasswordEmailHtml(resetUrl),
    text: resetPasswordEmailText(resetUrl),
  });
}

export async function sendVerificationEmail(to: string, name: string | null, code: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your NX-Design verification code',
    html: verifyEmailHtml(code, name),
    text: verifyEmailText(code),
  });
}

interface SendQuestionEmailInput {
  name: string | null;
  email: string | null;
  message: string;
}

export async function sendQuestionEmail({ name, email, message }: SendQuestionEmailInput) {
  const submittedAt = new Date();
  const subject = name
    ? `New question from ${name}`
    : 'New question from a visitor';

  await resend.emails.send({
    from: FROM,
    to: feedbackRecipient(),
    subject,
    html: questionEmailHtml({ name, email, message, submittedAt }),
    text: questionEmailText({ name, email, message, submittedAt }),
    // If the visitor provided an email, replying from the inbox replies to them.
    ...(email ? { replyTo: email } : {}),
  });
}

interface SendBugReportEmailInput {
  user: { id: string; email: string | null; tier: string | null };
  diagram: { id: string | null; name: string | null };
  description: string;
  stepsToReproduce: string | null;
}

export async function sendBugReportEmail({
  user,
  diagram,
  description,
  stepsToReproduce,
}: SendBugReportEmailInput) {
  const submittedAt = new Date();
  const subject = diagram.name
    ? `Bug report — ${diagram.name}`
    : 'Bug report — NX-Design canvas';

  await resend.emails.send({
    from: FROM,
    to: feedbackRecipient(),
    subject,
    html: bugReportEmailHtml({ user, diagram, description, stepsToReproduce, submittedAt }),
    text: bugReportEmailText({ user, diagram, description, stepsToReproduce, submittedAt }),
    ...(user.email ? { replyTo: user.email } : {}),
  });
}
