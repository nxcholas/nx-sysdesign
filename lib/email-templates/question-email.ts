interface QuestionEmailInput {
  name: string | null;
  email: string | null;
  message: string;
  submittedAt: Date;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function questionEmailHtml({ name, email, message, submittedAt }: QuestionEmailInput): string {
  const safeName = name ? escapeHtml(name) : '<span style="color:#6b7280;">Anonymous</span>';
  const safeEmail = email
    ? `<a href="mailto:${escapeHtml(email)}" style="color:#3b82f6;text-decoration:none;">${escapeHtml(email)}</a>`
    : '<span style="color:#6b7280;">Not provided</span>';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New question — NX-Design</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">NX-Design — Inbound</p>
              <h1 style="margin:6px 0 0;font-size:18px;font-weight:600;color:#f3f4f6;letter-spacing:-0.01em;">New question</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#d1d5db;">
                <tr>
                  <td style="padding:6px 0;color:#6b7280;width:90px;">From</td>
                  <td style="padding:6px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Email</td>
                  <td style="padding:6px 0;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Submitted</td>
                  <td style="padding:6px 0;">${escapeHtml(submittedAt.toISOString())}</td>
                </tr>
              </table>
              <div style="margin-top:18px;padding:16px 18px;background-color:#1f2937;border-radius:8px;font-size:14px;line-height:1.6;color:#e5e7eb;white-space:pre-wrap;">
${safeMessage}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;color:#4b5563;">Sent from the Questions widget on nxdesign.app.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function questionEmailText({ name, email, message, submittedAt }: QuestionEmailInput): string {
  return [
    'New question — NX-Design',
    '',
    `From: ${name ?? 'Anonymous'}`,
    `Email: ${email ?? 'Not provided'}`,
    `Submitted: ${submittedAt.toISOString()}`,
    '',
    'Message:',
    message,
  ].join('\n');
}
