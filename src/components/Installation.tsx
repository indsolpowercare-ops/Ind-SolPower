import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Dashboard.css";

interface InstallationData {
    emailId: string;
    customerName: string;
    panelSerialNumber: string;
    solarPlatePhoto: string;
    inverterPhoto: string;
    earthingPhoto: string;
    laPhoto: string;
}

interface GoogleSheetRow {
    c: Array<{ v?: string | null }>;
}

const Installation = () => {
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
                const url = "https://docs.google.com/spreadsheets/d/1vH6trsqLWdPAW6XNJK54-3hfDdyk8xVVjdjX4_zU2Ns/gviz/tq?tqx=out:json&sheet=Sheet1";
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
                        emailId: c[0]?.v || "",
                        customerName: c[1]?.v || "",
                        panelSerialNumber: c[2]?.v || "",
                        solarPlatePhoto: c[3]?.v || "",
                        inverterPhoto: c[4]?.v || "",
                        earthingPhoto: c[5]?.v || "",
                        laPhoto: c[6]?.v || ""
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
        { label: "Panel Serial Number", link: data?.panelSerialNumber },
        { label: "Solar Plate Photo", link: data?.solarPlatePhoto },
        { label: "Inverter Photo", link: data?.inverterPhoto },
        { label: "Earthing Photo", link: data?.earthingPhoto },
        { label: "Lightning Arrester Photo", link: data?.laPhoto },
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dash-header">
                <div className="header-content">
                    <div>
                        <p className="welcome-text">PROJECT DETAILS</p>
                        <h1 className="user-name">Installation Status</h1>
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
                        <h2 className="documents-title">INSTALLATION PHOTOS</h2>
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

export default Installation;
