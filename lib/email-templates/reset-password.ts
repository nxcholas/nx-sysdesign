export function resetPasswordEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your SysDesign password</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1f2937;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="#2563eb"/>
                      <path d="M7 8h10M7 12h6M7 16h8" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:15px;font-weight:600;color:#f3f4f6;letter-spacing:-0.01em;">SysDesign</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#f3f4f6;letter-spacing:-0.02em;">
                Reset your password
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9ca3af;">
                We received a request to reset your SysDesign password. Click the button below to choose a new one. This link expires in <strong style="color:#d1d5db;">1 hour</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
                <tr>
                  <td style="background-color:#1f2937;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Or copy this link</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;font-family:monospace;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#1c1917;border:1px solid #292524;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#78716c;">
                      <strong style="color:#a8a29e;">Didn't request this?</strong>
                      Your password has not been changed. You can safely ignore this email. If you're concerned about your account security, sign in and update your password immediately.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">
                SysDesign · <a href="https://nxdesign.app" style="color:#3b82f6;text-decoration:none;">nxdesign.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function resetPasswordEmailText(resetUrl: string): string {
  return `Reset your SysDesign password

We received a request to reset your password. Visit the link below to choose a new one (expires in 1 hour):

${resetUrl}

If you didn't request this, you can safely ignore this email.`;
}
