'use strict'

const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL || 'Knewler <no-reply@knewler.com>'

async function sendInvitationEmail({ to, first_name, institution_name, role, invite_url }) {
  const roleLabel = role === 'teacher' ? 'Teacher' : 'Student'

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You have been invited to join ${institution_name} on Knewler`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:26px;font-weight:700;letter-spacing:-0.02em;">
                <span style="color:#1a1a2e;">knew</span><span style="color:#0EA5E9;">ler</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #E2E8F0;border-radius:12px;padding:40px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">
                You&rsquo;re invited! 🎉
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                ${first_name ? `Hi ${first_name},<br><br>` : ''}
                <strong style="color:#1a1a2e;">${institution_name}</strong> has invited you to join
                their learning environment on Knewler as a <strong style="color:#0369A1;">${roleLabel}</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#0369A1;border-radius:8px;">
                    <a href="${invite_url}"
                       style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#94A3B8;">
                This link expires in 7 days. If you weren&rsquo;t expecting this invitation, you can safely ignore this email.
              </p>

              <p style="margin:16px 0 0;font-size:13px;color:#CBD5E1;word-break:break-all;">
                ${invite_url}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                &copy; ${new Date().getFullYear()} Knewler &mdash; From knowing to mastering
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

async function sendWelcomeEmail({ to, first_name, institution_name }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to Knewler — ${institution_name} is ready`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:26px;font-weight:700;letter-spacing:-0.02em;">
                <span style="color:#1a1a2e;">knew</span><span style="color:#0EA5E9;">ler</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #E2E8F0;border-radius:12px;padding:40px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">
                Welcome${first_name ? `, ${first_name}` : ''}! 👋
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                Your Knewler environment for <strong style="color:#1a1a2e;">${institution_name}</strong> is live.
                Start by adding courses, enrolling students, and scheduling sessions.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#0369A1;border-radius:8px;">
                    <a href="${process.env.FRONTEND_URL || 'https://knewler.com'}/dashboard"
                       style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Go to dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
                Need help? Reply to this email or visit
                <a href="https://knewler.com" style="color:#0369A1;">knewler.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                &copy; ${new Date().getFullYear()} Knewler &mdash; From knowing to mastering
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

module.exports = { sendInvitationEmail, sendWelcomeEmail }
