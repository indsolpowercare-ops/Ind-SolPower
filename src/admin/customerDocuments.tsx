import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../components/Dashboard.css";

interface DocumentData {
    email: string;
    customerName: string;
    gstBill: string;
    dcrCertificate: string;
    netMeterAgreement: string;
    warrantyCard: string;
}

const CustomerDocuments = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail?.toLowerCase() !== "pattanaiksanghamitra2198@gmail.com") {
            navigate("/dashboard");
            return;
        }

        const fetchData = async () => {
            try {
                const sheetUrl = "https://docs.google.com/spreadsheets/d/1__-kmD0lWenC8KXdt7LdkFPLiOTMerLSuGVhlwdBLik/gviz/tq?tqx=out:json&gid=0";
                const response = await fetch(sheetUrl);
                const text = await response.text();
                const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const data = JSON.parse(jsonStr);

                const rows = data.table.rows;
                // Filter out header row if present
                const mappedDocs: DocumentData[] = rows
                    .filter((row: any) => {
                        const firstVal = String(row.c[0]?.v || "").toUpperCase();
                        const secondVal = String(row.c[1]?.v || "").toUpperCase();
                        return firstVal !== "EMAIL" && secondVal !== "CUSTOMER NAME";
                    })
                    .map((row: any) => {
                        const c = row.c;
                        return {
                            email: c[0]?.v || "N/A",
                            customerName: c[1]?.v || "N/A",
                            gstBill: c[2]?.v || "",
                            dcrCertificate: c[3]?.v || "",
                            netMeterAgreement: c[4]?.v || "",
                            warrantyCard: c[5]?.v || "",
                        };
                    });

                setDocs(mappedDocs);
            } catch (err) {
                console.error("Admin docs fetch error:", err);
                setError("Failed to load project documents.");
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
                    <p>Loading project documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dash-header">
                <div className="header-content">
                    <div>
                        <p className="welcome-text">ADMIN PANEL</p>
                        <h1 className="user-name">Customer Documents</h1>
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
                {error ? (
                    <div className="error-card-light" style={{ margin: "0 auto" }}>
                        <h2>Error</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="action-btn-blue">Retry</button>
                    </div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Email ID</th>
                                    <th>GST Bill</th>
                                    <th>DCR Certificate</th>
                                    <th>Agreement</th>
                                    <th>Warranty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((doc, idx) => (
                                    <tr key={idx}>
                                        <td className="font-bold">{doc.customerName}</td>
                                        <td>{doc.email}</td>
                                        <td>
                                            {doc.gstBill ? (
                                                <a href={doc.gstBill} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Bill
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {doc.dcrCertificate ? (
                                                <a href={doc.dcrCertificate} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View DCR
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {doc.netMeterAgreement ? (
                                                <a href={doc.netMeterAgreement} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Agreement
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {doc.warrantyCard ? (
                                                <a href={doc.warrantyCard} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Warranty
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CustomerDocuments;
