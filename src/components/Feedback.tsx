import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, type ChangeEvent, type FormEvent } from "react";
import "./Dashboard.css";

/* ✅ UPDATED FIELD IDS FROM THE LATEST SOURCE */
const FIELD_IDS = {
    name: "entry.1464226969",
    email: "entry.1086343957",
    phone: "entry.1081967318",
    rating: "entry.2009760108", // Found: Rating entry ID
    feedback: "entry.1218289864",
};

const Feedback = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        rating: "", // Default rating changed to empty
        feedback: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdWQ96HIwI2fiosDaGibovIJ58AuHjOTpG3MZHTbleHJlV3Sg/formResponse";

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRatingChange = (val: number) => {
        setForm({ ...form, rating: val.toString() });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const params = new URLSearchParams();

        // Map internal state keys to Google Form Entry IDs
        Object.entries(FIELD_IDS).forEach(([key, id]) => {
            params.append(id, form[key as keyof typeof form]);
        });

        // Security tokens
        params.append("fvv", "1");
        params.append("pageHistory", "0");
        params.append("fbzx", "5350634750924670771");

        console.log("Submitting Feedback:", Object.fromEntries(params));

        try {
            await fetch(GOOGLE_FORM_ACTION, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            });

            setSuccess(true);
            setForm({
                name: "",
                email: "",
                phone: "",
                rating: "",
                feedback: "",
            });

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Submission failed", error);
            alert("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dash-header">
                <div className="header-content">
                    <div>
                        <p className="welcome-text">SHARE YOUR THOUGHTS</p>
                        <h1 className="user-name">Feedback / Support</h1>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="action-btn-blue">
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <motion.div
                className="dashboard-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="info-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h2 className="documents-title" style={{ fontSize: "16px", marginBottom: "24px" }}>WE VALUE YOUR FEEDBACK</h2>

                    {success && (
                        <div className="status-badge uploaded" style={{ marginBottom: "24px", padding: "12px", fontSize: "14px", width: "100%", justifyContent: "center" }}>
                            Feedback submitted successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div className="info-grid" style={{ marginBottom: "0" }}>
                            <div className="info-item">
                                <label className="info-label blue">NAME</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="text-input"
                                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                                />
                            </div>

                            <div className="info-item">
                                <label className="info-label blue">EMAIL</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="text-input"
                                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                                />
                            </div>
                        </div>

                        <div className="info-grid" style={{ marginBottom: "0" }}>
                            <div className="info-item">
                                <label className="info-label blue">PHONE NUMBER</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    className="text-input"
                                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                                />
                            </div>

                            <div className="info-item">
                                <label className="info-label blue">RATING</label>
                                <div style={{ display: "flex", gap: "8px", height: "48px", alignItems: "center" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "24px",
                                                color: star <= parseInt(form.rating || "0") ? "#fbbf24" : "#cbd5e1",
                                                transition: "transform 0.1s"
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span style={{ fontSize: "14px", color: "#64748b", marginLeft: "8px" }}>
                                        {form.rating || "0"}/5
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="info-item">
                            <label className="info-label blue">YOUR FEEDBACK</label>
                            <textarea
                                name="feedback"
                                placeholder="Tell us what you think..."
                                rows={6}
                                value={form.feedback}
                                onChange={handleChange}
                                required
                                className="text-input"
                                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", resize: "vertical", minHeight: "150px" }}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="workflow-cta"
                            style={{
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "white",
                                border: "none",
                                width: "100%",
                                marginTop: "12px",
                                fontSize: "16px",
                                padding: "16px"
                            }}
                        >
                            {loading ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Feedback;
