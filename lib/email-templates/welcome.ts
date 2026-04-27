export function welcomeEmailHtml(name: string | null): string {
  const displayName = name ?? 'there';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to NX-Design</title>
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
                    <span style="font-size:15px;font-weight:600;color:#f3f4f6;letter-spacing:-0.01em;">NX-Design</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#f3f4f6;letter-spacing:-0.02em;">
                Welcome, ${displayName}
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9ca3af;">
                Your account is ready. Start building system design diagrams — drag, connect, and visualize your architecture in minutes.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#1f2937;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">What you can do</p>
                    <ul style="margin:8px 0 0;padding-left:16px;font-size:13px;line-height:1.8;color:#d1d5db;">
                      <li>Create and save system design diagrams</li>
                      <li>Place components like servers, databases, queues, and caches</li>
                      <li>Draw connections to model data flow</li>
                      <li>Export and share your architecture</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://nxdesign.app/app"
                       style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Open NX-Design
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">
                You're receiving this because you created an account at
                <a href="https://nxdesign.app" style="color:#3b82f6;text-decoration:none;">nxdesign.app</a>.
                If this wasn't you, you can safely ignore this email.
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

export function welcomeEmailText(name: string | null): string {
  const displayName = name ?? 'there';
  return `Welcome to NX-Design, ${displayName}!

Your account is ready. Start building system design diagrams at https://nxdesign.app/app

If you didn't create this account, you can safely ignore this email.`;
}
