export const SHEET_URL = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json&gid=0";

export const normalizeOtp = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^0-9]/g, "");

export const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

export const parseRequestBody = (req) => {
  if (!req?.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
};

export async function fetchSheetRows() {
  const response = await fetch(SHEET_URL);
  if (!response.ok) {
    throw new Error(`Sheet request failed (${response.status})`);
  }

  const text = await response.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  if (json.status && json.status !== "ok") {
    const sheetError = json.errors?.[0]?.message || "Sheet responded with an error";
    throw new Error(sheetError);
  }

  if (!json.table?.rows) {
    throw new Error("Sheet payload missing rows");
  }

  return json.table.rows.map((row) => ({
    email: row.c?.[0]?.v,
    otp: row.c?.[1]?.v,
  }));
}

export async function findOtpRecord(email) {
  const rows = await fetchSheetRows();
  const target = normalizeEmail(email);
  return rows.find((row) => normalizeEmail(row.email) === target);
}
