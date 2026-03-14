import nodemailer from "nodemailer";
import "./loadEnv.js";

const gmailUser = process.env.GMAIL_USER || "indsolpowercare@gmail.com";
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const defaultFrom = process.env.MAIL_FROM || `IndSol PowerCare <${gmailUser}>`;

if (!gmailPass) {
  console.warn("[mailer] Missing GMAIL_APP_PASSWORD. Email delivery will fail until it is set.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

export async function sendOtpMail(to, otp) {
  if (!gmailPass) {
    throw new Error("Gmail app password is not configured.");
  }

  await transporter.sendMail({
    from: defaultFrom,
    to,
    subject: "One-Time Password (OTP) for Secure Login",
    text: `Dear Customer,\n\nYour One-Time Password (OTP) for accessing your account is:\n\nOTP: ${otp}\n\nThis OTP is valid for a single use only.\nPlease do not share this code with anyone.\n\nIf you did not request this login, please ignore this email.\n\nWarm regards,\nIndSol PowerCare Support\nEmail: indsolpowercare@gmail.com`,
    html: `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
      </head>
      <body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;padding:32px 0;">
          <tr>
            <td align="center" valign="top">
              <table role="presentation" width="400" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,0.08);text-align:center;">
                <tr>
                  <td style="font-size:18px;color:#1f2933;font-weight:bold;">IndSol PowerCare</td>
                </tr>
                <tr>
                  <td style="padding:16px 0;color:#4b5563;font-size:15px;">Your One-Time Password (OTP) for secure login</td>
                </tr>
                <tr>
                  <td style="padding:24px 0;">
                    <div style="display:inline-block;padding:16px 32px;border-radius:999px;background:#f97316;color:#ffffff;font-size:32px;font-weight:bold;letter-spacing:4px;">${otp}</div>
                  </td>
                </tr>
                <tr>
                  <td style="color:#4b5563;font-size:14px;line-height:1.6;">
                    This code is valid for a single use only. Please do not share it with anyone.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;color:#9ca3af;font-size:12px;line-height:1.4;">
                    If you did not request this login, please ignore this email.<br />
                    Warm regards,<br />
                    IndSol PowerCare Support<br />
                    indsolpowercare@gmail.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`
  });
}

export async function sendSupportFeedbackMail(feedback) {
  if (!gmailPass) {
    throw new Error("Gmail app password is not configured.");
  }

  const {
    name,
    email,
    rating,
    issueCategory,
    message,
    contactNumber,
    channel,
    ticketId,
    submittedAt,
    slaHours,
  } = feedback ?? {};

  if (!email || !message) {
    throw new Error("Feedback payload missing mandatory fields.");
  }

  const resolvedName = name || "Solar Sathi User";
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const safeMessage = (message ?? "").trim() || "No additional comments.";
  const safeSubmittedAt = submittedAt || new Date().toISOString();
  const safeSla = slaHours || 48;
  const adminRecipients = (process.env.SUPPORT_ADMIN_EMAIL || gmailUser)
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  const subject = `[Solar Sathi] Feedback ${ticketId || ""}`.trim() + ` (${safeRating}★)`;
  const summaryLine = issueCategory ? `${issueCategory} · ${channel || "Portal"}` : channel || "Portal";

  const plainText = `A new customer feedback has been submitted.\n\nTicket: ${ticketId || "Pending"}\nName: ${resolvedName}\nEmail: ${email}\nContact: ${contactNumber || "N/A"}\nChannel: ${channel || "Portal"}\nCategory: ${issueCategory || "General"}\nRating: ${safeRating} / 5\nSLA Window: ${safeSla} hours\nSubmitted: ${safeSubmittedAt}\n\nMessage:\n${safeMessage}\n`;

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>Support Feedback</title>
    </head>
    <body style="margin:0;padding:24px;background:#0f172a;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 20px 45px rgba(15,23,42,0.2);">
              <tr>
                <td style="font-size:18px;font-weight:700;color:#0f172a;padding-bottom:16px;">New Customer Feedback</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#475569;padding-bottom:12px;">Ticket <strong>${ticketId || "Pending"}</strong> · ${summaryLine}</td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0f172a;color:#f8fafc;font-weight:600;letter-spacing:0.08em;">${safeRating} ★</div>
                </td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#0f172a;line-height:1.6;padding-bottom:12px;">
                  <strong>${resolvedName}</strong><br />
                  ${email}<br />
                  ${contactNumber || "Contact unavailable"}
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#475569;line-height:1.6;padding-bottom:16px;">
                  Channel: <strong>${channel || "Portal"}</strong><br />
                  Category: <strong>${issueCategory || "General"}</strong><br />
                  SLA target: <strong>${safeSla} hrs</strong><br />
                  Submitted: <strong>${safeSubmittedAt}</strong>
                </td>
              </tr>
              <tr>
                <td style="font-size:15px;color:#0f172a;line-height:1.7;padding:20px;border-radius:16px;background:#f5f7fb;">
                  ${safeMessage.replace(/\n/g, "<br />")}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  await transporter.sendMail({
    from: defaultFrom,
    to: adminRecipients,
    replyTo: email,
    subject,
    text: plainText,
    html,
  });
}
