import express from "express";
import cors from "cors";
import "./loadEnv.js";
import { sendOtpMail, sendSupportFeedbackMail } from "./mailer.js";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json&gid=0";
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const SUPPORT_SLA_HOURS = Number(process.env.SUPPORT_SLA_HOURS) || 48;

if (typeof fetch !== "function") {
  throw new Error("Global fetch is not available. Please run the server with Node 18+.");
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN?.split(",").map(origin => origin.trim()) ?? true }));
app.use(express.json());

const normalizeOtp = value => String(value ?? "")
  .trim()
  .replace(/\s+/g, "")
  .replace(/[^0-9]/g, "");

const normalizeEmail = value => String(value ?? "").trim().toLowerCase();

async function fetchSheetRows() {
  const response = await fetch(SHEET_URL);
  if (!response.ok) {
    throw new Error(`Sheet request failed (${response.status})`);
  }

  const text = await response.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));

  if (json.status && json.status !== "ok") {
    const sheetError = json.errors?.[0]?.message || "Sheet responded with an error";
    throw new Error(sheetError);
  }

  if (!json.table?.rows) {
    throw new Error("Sheet payload missing rows");
  }

  return json.table.rows.map(row => ({
    email: row.c?.[0]?.v,
    otp: row.c?.[1]?.v
  }));
}

async function findOtpRecord(email) {
  const rows = await fetchSheetRows();
  const target = normalizeEmail(email);
  return rows.find(row => normalizeEmail(row.email) === target);
}

const generateTicketId = () => {
  const base = Date.now().toString(36).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `SUP-${base}-${random}`;
};

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body ?? {};

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
    return res.json({ success: true });
  } catch (error) {
    console.error("[send-otp]", error);
    return res.status(500).json({ message: "Failed to send OTP. Please retry." });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body ?? {};
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

    return res.json({ success: true });
  } catch (error) {
    console.error("[verify-otp]", error);
    return res.status(500).json({ message: "Unable to verify OTP right now." });
  }
});

app.post("/api/support-feedback", async (req, res) => {
  const {
    name,
    email,
    contactNumber,
    issueCategory,
    message,
    rating,
    channel,
  } = req.body ?? {};

  const normalizedEmail = normalizeEmail(email);
  const normalizedMessage = String(message ?? "").trim();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!normalizedMessage) {
    return res.status(400).json({ message: "Feedback message cannot be empty." });
  }

  const sanitizedRating = Number.isFinite(Number(rating)) ? Math.min(Math.max(Number(rating), 1), 5) : 0;
  const ticketId = generateTicketId();

  try {
    await sendSupportFeedbackMail({
      name,
      email: normalizedEmail,
      contactNumber,
      issueCategory,
      message: normalizedMessage,
      rating: sanitizedRating,
      channel,
      ticketId,
      submittedAt: new Date().toISOString(),
      slaHours: SUPPORT_SLA_HOURS,
    });

    return res.json({
      success: true,
      ticketId,
      adminNotified: true,
      resolutionEtaHours: SUPPORT_SLA_HOURS,
    });
  } catch (error) {
    console.error("[support-feedback]", error);
    return res.status(500).json({ message: "Unable to forward feedback right now." });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`OTP API running on http://localhost:${PORT}`);
});

export { app };
