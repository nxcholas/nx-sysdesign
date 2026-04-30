interface BugReportEmailInput {
  user: { id: string; email: string | null; tier: string | null };
  diagram: { id: string | null; name: string | null };
  description: string;
  stepsToReproduce: string | null;
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

function fallback(value: string | null | undefined): string {
  return value && value.trim().length > 0
    ? escapeHtml(value)
    : '<span style="color:#6b7280;">—</span>';
}

export function bugReportEmailHtml({
  user,
  diagram,
  description,
  stepsToReproduce,
  submittedAt,
}: BugReportEmailInput): string {
  const safeDescription = escapeHtml(description).replace(/\n/g, '<br />');
  const safeSteps = stepsToReproduce
    ? escapeHtml(stepsToReproduce).replace(/\n/g, '<br />')
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bug report — NX-Design</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;font-weight:500;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;">NX-Design — Bug report</p>
              <h1 style="margin:6px 0 0;font-size:18px;font-weight:600;color:#f3f4f6;letter-spacing:-0.01em;">Canvas bug submitted</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#d1d5db;">
                <tr>
                  <td style="padding:6px 0;color:#6b7280;width:120px;">User</td>
                  <td style="padding:6px 0;">${fallback(user.email)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">User ID</td>
                  <td style="padding:6px 0;font-family:ui-monospace,Menlo,monospace;font-size:12px;">${fallback(user.id)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Tier</td>
                  <td style="padding:6px 0;">${fallback(user.tier)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Diagram</td>
                  <td style="padding:6px 0;">${fallback(diagram.name)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Diagram ID</td>
                  <td style="padding:6px 0;font-family:ui-monospace,Menlo,monospace;font-size:12px;">${fallback(diagram.id)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;">Submitted</td>
                  <td style="padding:6px 0;">${escapeHtml(submittedAt.toISOString())}</td>
                </tr>
              </table>

              <p style="margin:20px 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Description</p>
              <div style="padding:16px 18px;background-color:#1f2937;border-radius:8px;font-size:14px;line-height:1.6;color:#e5e7eb;white-space:pre-wrap;">
${safeDescription}
              </div>

              ${
                safeSteps
                  ? `<p style="margin:20px 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Steps to reproduce</p>
              <div style="padding:16px 18px;background-color:#1f2937;border-radius:8px;font-size:14px;line-height:1.6;color:#e5e7eb;white-space:pre-wrap;">
${safeSteps}
              </div>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;color:#4b5563;">Sent from the Report-a-bug widget on nxdesign.app/canvas.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function bugReportEmailText({
  user,
  diagram,
  description,
  stepsToReproduce,
  submittedAt,
}: BugReportEmailInput): string {
  const lines = [
    'Bug report — NX-Design',
    '',
    `User: ${user.email ?? '—'}`,
    `User ID: ${user.id}`,
    `Tier: ${user.tier ?? '—'}`,
    `Diagram: ${diagram.name ?? '—'}`,
    `Diagram ID: ${diagram.id ?? '—'}`,
    `Submitted: ${submittedAt.toISOString()}`,
    '',
    'Description:',
    description,
  ];
  if (stepsToReproduce && stepsToReproduce.trim().length > 0) {
    lines.push('', 'Steps to reproduce:', stepsToReproduce);
  }
  return lines.join('\n');
}
