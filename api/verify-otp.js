import { findOtpRecord, normalizeOtp, parseRequestBody } from "./_lib/common.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { email, otp } = parseRequestBody(req);
  const cleanedOtp = normalizeOtp(otp);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!cleanedOtp) {
    return res.status(400).json({ message: "OTP input is invalid." });
  }

  try {
    const record = await findOtpRecord(email);
    if (!record) {
      return res.status(404).json({ message: "Your email is not registered." });
    }

    const sheetOtp = normalizeOtp(record.otp);
    if (!sheetOtp) {
      return res.status(500).json({ message: "OTP value missing for this account." });
    }

    if (sheetOtp !== cleanedOtp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[verify-otp]", error);
    return res.status(500).json({ message: "Unable to verify OTP right now." });
  }
}
