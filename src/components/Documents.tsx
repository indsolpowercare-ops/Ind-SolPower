import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Dashboard.css";

interface InstallationData {
    emailId: string;
    customerName: string;
    gstBill: string;
    dcrCertificate: string;
    netMeterAgreement: string;
    warrantyCard: string;
}

interface GoogleSheetCell {
    v?: string | number;
}

interface GoogleSheetRow {
    c: GoogleSheetCell[];
}

const Documents = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<InstallationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            navigate("/");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch from the specific installation sheet
                const url = "https://docs.google.com/spreadsheets/d/1__-kmD0lWenC8KXdt7LdkFPLiOTMerLSuGVhlwdBLik/gviz/tq?tqx=out:json&sheet=Sheet1";
                const response = await fetch(url);
                const text = await response.text();
                // Extract JSON from Google's wrapper
                const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const json = JSON.parse(jsonStr);

                const rows: GoogleSheetRow[] = json.table.rows;
                // Find row matching user email (case insensitive)
                const matchedRow = rows.find((row: GoogleSheetRow) => {
                    const emailCell = row.c[0];
                    return emailCell && emailCell.v && String(emailCell.v).toLowerCase().trim() === userEmail.toLowerCase().trim();
                });

                if (matchedRow) {
                    const c = matchedRow.c;
                    setData({
                        emailId: String(c[0]?.v || ""),
                        customerName: String(c[1]?.v || ""),
                        gstBill: String(c[2]?.v || ""),
                        dcrCertificate: String(c[3]?.v || ""),
                        netMeterAgreement: String(c[4]?.v || ""),
                        warrantyCard: String(c[5]?.v || "")
                    });
                } else {
                    setError("No installation details found for your account.");
                }
            } catch (err) {
                console.error("Installation fetch error:", err);
                setError("Failed to load installation details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="dash-overlay-light">
                <div className="loading-spinner">
                    <div className="spinner-blue"></div>
                    <p>Loading installation details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-overlay-light">
                <div className="error-card-light">
                    <h2>Notice</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/dashboard")} className="action-btn-blue">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const photos = [
        { label: "GST Bill", link: data?.gstBill },
        { label: "DCR Certificate", link: data?.dcrCertificate },
        { label: "Net Meter Agreement", link: data?.netMeterAgreement },
        { label: "Warranty Card", link: data?.warrantyCard },
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dash-header">
                <div className="header-content">
                    <div>
                        <p className="welcome-text">PROJECT DETAILS</p>
                        <h1 className="user-name">Documents</h1>
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
                <div className="cards-container" style={{ gridTemplateColumns: "1fr" }}>

                    {/* Photos Card */}
                    <div className="documents-card">
                        <h2 className="documents-title">PRODUCT DOCUMENTS</h2>
                        <div className="documents-list installation-grid">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="document-row">
                                    <span className="doc-name">{photo.label}</span>
                                    <div className="doc-actions">
                                        {photo.link ? (
                                            <a href={photo.link} target="_blank" rel="noopener noreferrer" className="view-link">
                                                View Photo
                                            </a>
                                        ) : (
                                            <span className="status-badge pending">Pending</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Documents;
