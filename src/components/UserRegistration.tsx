import { motion } from "framer-motion";
import { useState, type ChangeEvent, type FormEvent } from "react";

/* FIELD IDS (FROM YOUR FORM) */
const FIELD_IDS = {
  name: "entry.713440792",
  address: "entry.1279486825",
  phone: "entry.852697666",
  email: "entry.1230154529",
  location: "entry.340077551",
  aadhar: "entry.394432279",
  pan: "entry.1065144891",
  passbook: "entry.492952978",
  bill: "entry.1348951227",
  aadharNumber: "entry.1740312136",
  panNumber: "entry.1755753555",
  bankAccount: "entry.2123318231",
  finalPrice: "entry.382974909",
  solarCapacity: "entry.1744093605",
  panelWP: "entry.1117649389",
};

export default function SolarSaathiForm() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    location: "",
    aadhar: "",
    pan: "",
    passbook: "",
    bill: "",
    aadharNumber: "",
    panNumber: "",
    bankAccount: "",
    finalPrice: "",
    solarCapacity: "",
    panelWP: "",
  });

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant: "success" | "error";
  }>({ open: false, message: "", variant: "success" });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message: string, variant: "success" | "error") => {
    setToast({ open: true, message, variant });
    window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 3200);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.04 * i, duration: 0.35, ease: "easeOut" },
    }),
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.4, ease: "easeOut" },
    }),
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(FIELD_IDS).forEach(([key, id]) => {
      formData.append(id, form[key as keyof typeof form]);
    });

    try {
      await fetch(
        "https://docs.google.com/forms/d/e/1FAIpQLSf3BSWQ7Qdwmd9AmHfEdqH_XLPkhhqfi88VqlRaTgIlae9hzw/formResponse",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        },
      );

      showToast("Form submitted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="app-shell">
      <motion.div
        className="registration-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="card-header" variants={itemVariants} custom={0}>
          <p className="eyebrow">Join the Revolution</p>
          <h2>Solar Saathi Registration</h2>
          <p className="subcopy">
            Complete your profile to start your journey with solar energy.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-layout">
            <motion.div
              className="form-column"
              variants={columnVariants}
              custom={1}
              initial="hidden"
              animate="visible"
            >
              {/* GRID */}
              <div className="form-grid">
                {/* Name */}
                <motion.div variants={itemVariants} custom={1} initial="hidden" animate="visible">
                  <label className="field-label">
                    Name <span className="required-star">*</span>
                  </label>
                  <motion.input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="text-input"
                    placeholder="Enter full name"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>

                {/* Phone */}
                <motion.div variants={itemVariants} custom={2} initial="hidden" animate="visible">
                  <label className="field-label">
                    Phone <span className="required-star">*</span>
                  </label>
                  <motion.input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="text-input"
                    placeholder="Enter phone number"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
              </div>

              {/* Address */}
              <motion.div variants={itemVariants} custom={3} initial="hidden" animate="visible">
                <label className="field-label">
                  Address <span className="required-star">*</span>
                </label>
                <motion.textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="text-input"
                  placeholder="Enter full address"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants} custom={4} initial="hidden" animate="visible">
                <label className="field-label">
                  Email <span className="required-star">*</span>
                </label>
                <motion.input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter email"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Location */}
              <motion.div variants={itemVariants} custom={5} initial="hidden" animate="visible">
                <label className="field-label">
                  GPS Location (Google Maps Link){" "}
                  <span className="required-star">*</span>
                </label>

                <motion.textarea
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="text-input"
                  placeholder="Paste Google Maps link"
                  whileFocus={{ scale: 1.01 }}
                />

                <p
                  className="subcopy"
                  style={{ fontSize: "0.85rem", marginTop: "6px" }}
                >
                  Open Google Maps → Tap blue dot → Share → Copy link → Paste
                  here
                </p>
              </motion.div>

                {/* Aadhar Card Number */}
                <motion.div variants={itemVariants} custom={6} initial="hidden" animate="visible">
                  <label className="field-label">
                    Aadhar Card Number <span className="required-star">*</span>
                  </label>
                  <motion.input
                    name="aadharNumber"
                    value={form.aadharNumber}
                    onChange={handleChange}
                    required
                    className="text-input"
                    placeholder="Enter Aadhar Card Number"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>

                {/* PAN Card Number */}
                <motion.div variants={itemVariants} custom={7} initial="hidden" animate="visible">
                  <label className="field-label">
                    PAN Card Number <span className="required-star">*</span>
                  </label>
                  <motion.input
                    name="panNumber"
                    value={form.panNumber}
                    onChange={handleChange}
                    required
                    className="text-input"
                    placeholder="Enter PAN Card Number"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>

                {/* Bank Account Number */}
                    <motion.div variants={itemVariants} custom={8} initial="hidden" animate="visible">
                      <label className="field-label">
                        Bank Account Number <span className="required-star">*</span>
                      </label>
                      <motion.input
                        name="bankAccount"
                        value={form.bankAccount}
                        onChange={handleChange}
                        required
                        className="text-input"
                        placeholder="Enter Bank Account Number"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </motion.div>
            </motion.div>

            <motion.div
              className="form-column docs-column"
              variants={columnVariants}
              custom={2}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} custom={1} initial="hidden" animate="visible">
                <label className="field-label">
                  Aadhar Card <span className="required-star">*</span>
                </label>
                <motion.input
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter Aadhar Card Document link"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div variants={itemVariants} custom={2} initial="hidden" animate="visible">
                <label className="field-label">
                  PAN Card <span className="required-star">*</span>
                </label>
                <motion.input
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter PAN Card Document link"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div variants={itemVariants} custom={3} initial="hidden" animate="visible">
                <label className="field-label">
                  Bank Passbook <span className="required-star">*</span>
                </label>
                <motion.input
                  name="passbook"
                  value={form.passbook}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter Bank Passbook Document link"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div variants={itemVariants} custom={4} initial="hidden" animate="visible">
                <label className="field-label">
                  Electric Bill <span className="required-star">*</span>
                </label>
                <motion.input
                  name="bill"
                  value={form.bill}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter Electric Bill Document link"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Final Price */}
              <motion.div variants={itemVariants} custom={5} initial="hidden" animate="visible">
                <label className="field-label">
                  Final Price <span className="required-star">*</span>
                </label>
                <motion.input
                  name="finalPrice"
                  value={form.finalPrice}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter Final Price"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Solar Capacity (Dropdown) */}
              <motion.div variants={itemVariants} custom={6} initial="hidden" animate="visible">
                <label className="field-label">
                  Solar Capacity <span className="required-star">*</span>
                </label>
                <motion.select
                  name="solarCapacity"
                  value={form.solarCapacity}
                  onChange={handleChange}
                  required
                  className="text-input"
                  whileFocus={{ scale: 1.01 }}
                >
                  <option value="" disabled>
                    Select Solar Capacity
                  </option>
                  <option value="2 kwh">2 kwh</option>
                  <option value="3kwh">3kwh</option>
                  <option value="4 kwh">4 kwh</option>
                  <option value="5 kwh">5 kwh</option>
                  <option value="6 kwh">6 kwh</option>
                  <option value="7 kwh">7 kwh</option>
                  <option value="8 kwh">8 kwh</option>
                  <option value="9 kwh">9 kwh</option>
                  <option value="10 kwh">10 kwh</option>
                </motion.select>
              </motion.div>

              {/* Panel WP */}
              <motion.div variants={itemVariants} custom={7} initial="hidden" animate="visible">
                <label className="field-label">
                  Panel WP <span className="required-star">*</span>
                </label>
                <motion.input
                  name="panelWP"
                  value={form.panelWP}
                  onChange={handleChange}
                  required
                  className="text-input"
                  placeholder="Enter Panel WP"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* SUBMIT */}
          <motion.button
            type="submit"
            className="primary-button"
            style={{ marginTop: "8px" }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Submit Registration
          </motion.button>
        </form>
      </motion.div>

      {toast.open && (
        <motion.div
          className={`toast toast--${toast.variant}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          {toast.message}
        </motion.div>
      )}
    </div>
  );
}
