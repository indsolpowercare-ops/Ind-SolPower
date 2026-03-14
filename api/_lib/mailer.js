import nodemailer from "nodemailer";

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
    pass: gmailPass,
  },
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
  });
}
