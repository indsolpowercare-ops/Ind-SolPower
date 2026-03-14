import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const API_BASE_PATH = "/api";

type ApiResponse = {
  message?: string;
  success?: boolean;
};

type ToastVariant = "info" | "success" | "error";

export default function OtpLoginSheetBased() {


  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{ text: string; type: ToastVariant } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  interface SheetRow {
    c: Array<{ v: string | number | null } | null>;
  }

  const normalizeOtp = (value: string | number | null | undefined) =>
    String(value ?? "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^0-9]/g, "");

  const showToast = (text: string, type: ToastVariant = "info") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ text, type });

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  const postJson = async (path: string, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE_PATH}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let data: ApiResponse | null = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMessage = data?.message || "Request failed. Please try again.";
      throw new Error(errorMessage);
    }

    return data;
  };


  // STEP 1 — Ask server to send OTP email
  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast("Enter your registered email ❌", "error");
      return;
    }

    setMessage("Sending OTP...");

    try {
      await postJson("/send-otp", { email: trimmedEmail });
      setEmail(trimmedEmail);
      setMessage("OTP sent to your email ✔");
      setOtpInput("");
      setStep(2);
    } catch (error) {
      console.error("Failed to verify email", error);
      setMessage("");
      const fallback = error instanceof Error ? error.message : "Unable to send OTP.";
      showToast(fallback, "error");
    }
  };


  // STEP 2 — Verify OTP via server
  const handleVerifyOtp = async () => {
    const cleanedInput = normalizeOtp(otpInput);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast("Enter your registered email ❌", "error");
      setStep(1);
      return;
    }

    if (!cleanedInput) {
      setMessage("Enter the OTP you received ❌");
      return;
    }

    setMessage("Verifying OTP...");

    try {
      await postJson("/verify-otp", { email: trimmedEmail, otp: cleanedInput });
      setMessage("Login successful ✔");
      setOtpInput("");

      // Store user email for Dashboard
      localStorage.setItem("userEmail", trimmedEmail.toLowerCase());

      // Check if email exists in Google Sheet
      try {
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json";
        const response = await fetch(sheetUrl);
        const text = await response.text();

        // Extract JSON from the google visualization response
        const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonStr);

        const rows: SheetRow[] = data.table.rows;
        // Email is in column index 4 (Column E)
        const emailExists = rows.some((row: SheetRow) => {
          const emailCell = row.c[4];
          return emailCell && emailCell.v && String(emailCell.v).toLowerCase().trim() === trimmedEmail.toLowerCase();
        });

        if (emailExists) {
          navigate("/dashboard");
        } else {
          navigate("/register");
        }
      } catch (err) {
        console.error("Error checking sheet data:", err);
        // Fallback to register if check fails
        navigate("/register");
      }

    } catch (error) {
      setMessage("");
      const fallback = error instanceof Error ? error.message : "Unable to verify OTP.";
      showToast(fallback, "error");
    }
  };

  const statusTone: "success" | "error" | "info" = message.includes("✔")
    ? "success"
    : message.includes("❌")
      ? "error"
      : "info";

  const isSendingOtp = message === "Sending OTP...";
  const isVerifyingOtp = message === "Verifying OTP...";

  const cardVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.35, ease: "easeOut" },
    }),
  };

  return (
    <>
      <div className="app-shell login-shell">
        <motion.div
          className="login-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="card-header" variants={itemVariants} custom={0}>
            <p className="eyebrow">Solar Sathi Access</p>
            <h2>Customer Login</h2>
            <p className="subcopy">Receive a secure one-time passcode to unlock your solar profile.</p>
          </motion.div>

          <div className="form-section" role="form" aria-live="polite">
            {step === 1 ? (
              <>
                <motion.label
                  className="field-label"
                  htmlFor="customer-email"
                  variants={itemVariants}
                  custom={1}
                  initial="hidden"
                  animate="visible"
                >
                  Email
                </motion.label>
                <motion.input
                  id="customer-email"
                  className="text-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  variants={itemVariants}
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  whileFocus={{ scale: 1.01 }}
                />

                <motion.button
                  type="button"
                  className="primary-button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  variants={itemVariants}
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  className="pill"
                  aria-live="polite"
                  variants={itemVariants}
                  custom={1}
                  initial="hidden"
                  animate="visible"
                >
                  <span role="img" aria-label="email">📧</span>
                  {email}
                </motion.div>

                <motion.label
                  className="field-label"
                  htmlFor="otp-input"
                  variants={itemVariants}
                  custom={2}
                  initial="hidden"
                  animate="visible"
                >
                  Enter OTP
                </motion.label>
                <motion.input
                  id="otp-input"
                  className="text-input"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  variants={itemVariants}
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  whileFocus={{ scale: 1.01 }}
                />

                <div className="button-row">
                  <motion.button
                    type="button"
                    className="primary-button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    variants={itemVariants}
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify"}
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {message && (
            <motion.p
              className={`status-text status-text--${statusTone}`}
              aria-live="polite"
              variants={itemVariants}
              custom={5}
              initial="hidden"
              animate="visible"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </div>

      {toast && (
        <motion.div
          className={`toast toast--${toast.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          {toast.text}
        </motion.div>
      )}
    </>
  );
}
