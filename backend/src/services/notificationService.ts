const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

// Brand constants 
const SITE_NAME = 'DocQueue';
const SITE_TAGLINE = 'Smart Appointment & Queue Booking';
const SITE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SITE_ADDRESS = '123 Healthcare Avenue, MedCity, India — 700001';
const SITE_SUPPORT = 'support@docqueue.health';
const BRAND_COLOR = '#2563eb';

function WrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} – ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,#4f46e5 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🏥 ${SITE_NAME}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;font-weight:500;letter-spacing:.5px;">${SITE_TAGLINE}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;font-weight:600;">${SITE_NAME}</p>
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">${SITE_ADDRESS}</p>
            <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;">
              Support: <a href="mailto:${SITE_SUPPORT}" style="color:${BRAND_COLOR};text-decoration:none;">${SITE_SUPPORT}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">
              You received this email because you have an account with ${SITE_NAME}.<br/>
              &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}


const SendEmail = async (to: string, subject: string, text: string, html?: string): Promise<void> => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!apiKey) {
    console.warn('[Email Mock] No SENDGRID_API_KEY set. Would have sent to:', to, '|', subject);
    return;
  }
  if (!fromEmail) {
    console.warn('[Email Mock] No SENDGRID_FROM_EMAIL set. Would have sent to:', to, '|', subject);
    return;
  }
  const emailMsg = {
    to,
    from: { email: fromEmail, name: SITE_NAME },
    subject: `${subject} | ${SITE_NAME}`,
    text,
    html: html || WrapEmail(subject, `<p style="color:#475569;line-height:1.7;">${text}</p>`),
  };
  try {
    await sgMail.send(emailMsg);
    console.log(`✅ Email sent → ${to} [${subject}]`);
  } catch (error: unknown) {
    const err = error as { response?: { status: number; body: { errors: unknown[] } }; message?: string };
    console.error('❌ SendGrid Error →', to);
    if (err.response) {
      console.error('   Status :', err.response.status);
      console.error('   Errors :', JSON.stringify(err.response.body?.errors, null, 2));
    } else {
      console.error('   Message:', err.message);
    }
  }
};

const SendWelcomeEmail = async (to: string, firstName: string): Promise<void> => {
  const html = WrapEmail('Welcome to DocQueue', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Welcome to ${SITE_NAME}, ${firstName}! 👋</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.7;">We're thrilled to have you on board. Your account has been created successfully and you can now book appointments, track your queue in real time, and check in with your personal QR code — all in one place.</p>
      <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">Ready to get started?</p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${SITE_URL}/doctors" style="display:inline-block;padding:14px 36px;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none;letter-spacing:.3px;box-shadow:0 4px 14px rgba(37,99,235,.35);">Browse Doctors →</a>
      </div>
      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">If you did not create this account, please ignore this email.</p>
    `);
  await SendEmail(to, `Welcome to ${SITE_NAME}`, `Hi ${firstName}, welcome to ${SITE_NAME}! Your account has been created successfully.`, html);
};

const SendLoginNotificationEmail = async (to: string, firstName: string): Promise<void> => {
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const html = WrapEmail('Login Notification', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">New Sign-In Detected 🔐</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${firstName}</strong>, a successful login was just recorded on your <strong>${SITE_NAME}</strong> account.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 24px;border-left:4px solid ${BRAND_COLOR};">
        <p style="margin:0;font-size:14px;color:#334155;">🕐 <strong>Time:</strong> ${now} (IST)</p>
      </div>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">If this was <strong>not you</strong>, please contact our support team immediately and change your password.</p>
      <div style="text-align:center;margin-bottom:8px;">
        <a href="mailto:${SITE_SUPPORT}" style="display:inline-block;padding:12px 32px;background:#ef4444;color:#fff;font-weight:700;font-size:14px;border-radius:50px;text-decoration:none;">Report Suspicious Activity</a>
      </div>
    `);
  await SendEmail(to, 'Login Notification', `Hi ${firstName}, a successful login was detected on your ${SITE_NAME} account.`, html);
};

const SendAppointmentConfirmationEmail = async (
  to: string,
  firstName: string,
  doctorName: string,
  date: string,
  time: string,
  tokenNumber: string
): Promise<void> => {
  const html = WrapEmail('Appointment Confirmed', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Your Appointment is Confirmed ✅</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${firstName}</strong>, great news! Your appointment has been successfully booked. Here are your details:</p>
      <div style="background:#f0f9ff;border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid #bae6fd;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;width:40%;">👨‍⚕️ Doctor</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${doctorName}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;">📅 Date</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${date}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;">🕐 Time</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${time}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;">🔢 Token</td><td style="padding:8px 0;font-size:14px;font-weight:800;color:${BRAND_COLOR};">${tokenNumber}</td></tr>
        </table>
      </div>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.7;">📍 Please arrive <strong>10 minutes early</strong> and keep your token number handy for the QR check-in at reception.</p>
      <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.7;">You can track your live queue position anytime from your dashboard.</p>
      <div style="text-align:center;">
        <a href="${SITE_URL}/dashboard" style="display:inline-block;padding:14px 36px;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,.35);">View Dashboard →</a>
      </div>
    `);
  await SendEmail(to, 'Appointment Confirmed', `Hi ${firstName}, your appointment with ${doctorName} on ${date} at ${time} is confirmed. Token: ${tokenNumber}`, html);
};

const SendAppointmentCancellationEmail = async (
  to: string,
  firstName: string,
  doctorName: string,
  date: string,
  time: string
): Promise<void> => {
  const html = WrapEmail('Appointment Cancelled', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Appointment Cancelled ❌</h2>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${firstName}</strong>, your appointment has been cancelled. Here are the details of the cancelled booking:</p>
      <div style="background:#fff5f5;border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid #fecaca;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;width:40%;">👨‍⚕️ Doctor</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${doctorName}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;">📅 Date</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${date}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#64748b;font-weight:600;">🕐 Time</td><td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${time}</td></tr>
        </table>
      </div>
      <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.7;">If you'd like to reschedule, you can book a new slot from the doctors page anytime.</p>
      <div style="text-align:center;">
        <a href="${SITE_URL}/doctors" style="display:inline-block;padding:14px 36px;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,.35);">Book New Appointment →</a>
      </div>
    `);
  await SendEmail(to, 'Appointment Cancelled', `Hi ${firstName}, your appointment with ${doctorName} on ${date} at ${time} has been cancelled.`, html);
};

const SendAdminBookingNotification = async (opts: {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  tokenNumber: string;
}): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[Email Mock] ADMIN_EMAIL not set — skipping admin booking notification.');
    return;
  }
  const { patientName, patientEmail, patientPhone, doctorName, date, time, tokenNumber } = opts;
  const bookedAt = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const html = WrapEmail('New Booking Alert', `
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0f172a;">📋 New Appointment Booked</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">Booked at ${bookedAt} (IST)</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:0 0 16px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;">Patient Information</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;width:40%;">👤 Name</td><td style="padding:7px 0;font-size:14px;color:#0f172a;font-weight:700;">${patientName}</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;">📧 Email</td><td style="padding:7px 0;font-size:14px;color:#0f172a;"><a href="mailto:${patientEmail}" style="color:${BRAND_COLOR};text-decoration:none;">${patientEmail}</a></td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;">📱 Phone</td><td style="padding:7px 0;font-size:14px;color:#0f172a;font-weight:700;">${patientPhone || '<span style="color:#94a3b8;font-weight:400;">Not provided</span>'}</td></tr>
        </table>
      </div>
      <div style="background:#eff6ff;border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid #bfdbfe;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;">Appointment Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;width:40%;">👨‍⚕️ Doctor</td><td style="padding:7px 0;font-size:14px;color:#0f172a;font-weight:700;">${doctorName}</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;">📅 Date</td><td style="padding:7px 0;font-size:14px;color:#0f172a;font-weight:700;">${date}</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;">🕐 Time</td><td style="padding:7px 0;font-size:14px;color:#0f172a;font-weight:700;">${time}</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:#64748b;font-weight:600;">🔢 Token</td><td style="padding:7px 0;font-size:14px;font-weight:800;color:${BRAND_COLOR};">${tokenNumber}</td></tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="${SITE_URL}/admin/appointments" style="display:inline-block;padding:14px 36px;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,.35);">View in Admin Panel →</a>
      </div>
    `);
  await SendEmail(adminEmail, `New Booking: ${patientName} → ${doctorName}`, `New appointment: ${patientName} (${patientPhone}) booked with ${doctorName} on ${date} at ${time}. Token: ${tokenNumber}`, html);
};

const SendSMS = async (to: string, message: string): Promise<void> => {
  console.log(`[SMS MOCK] Would send to ${to}: ${message}`);
};

module.exports = { SendEmail, SendWelcomeEmail, SendLoginNotificationEmail, SendAppointmentConfirmationEmail, SendAppointmentCancellationEmail, SendAdminBookingNotification, SendSMS };
