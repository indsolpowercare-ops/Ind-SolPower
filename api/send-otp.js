import { findOtpRecord, normalizeOtp, parseRequestBody } from "./_lib/common.js";
import { sendOtpMail } from "./_lib/mailer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { email } = parseRequestBody(req);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const record = await findOtpRecord(email);
    if (!record) {
      return res.status(404).json({ message: "Your email is not registered." });
    }

    const otp = normalizeOtp(record.otp);
    if (!otp) {
      return res.status(500).json({ message: "OTP value missing for this account." });
    }

    await sendOtpMail(record.email, otp);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[send-otp]", error);
    return res.status(500).json({ message: "Failed to send OTP. Please retry." });
  }
}
