import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../components/Dashboard.css";

interface InstallationPhotoData {
    panelSerialNumberPhoto: string;
    solarPlatePhoto: string;
    inverterPhoto: string;
    earthingPhoto: string;
    laPhoto: string;
    teamSelfie: string;
    emailId: string;
    installationComplete: string;
    installationIncompleteReason: string;
    customerName: string;
    phoneNumber: string;
}

interface SheetCell {
    v?: string | number;
    f?: string;
}

interface SheetRow {
    c: SheetCell[];
}

interface SheetColumn {
    label?: string;
}

const InstallationPhotos = () => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<InstallationPhotoData[]>([]);
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
                const sheetUrl = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json&gid=959439899";
                const response = await fetch(sheetUrl);
                const text = await response.text();
                const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const data = JSON.parse(jsonStr);

                const rows: SheetRow[] = data.table.rows || [];
                const cols: SheetColumn[] = data.table.cols || [];

                const findColumnIndex = (...keywords: string[]) => {
                    const index = cols.findIndex((col) => {
                        const normalized = (col.label || "").toLowerCase().trim();
                        return keywords.every((keyword) => normalized.includes(keyword));
                    });

                    return index >= 0 ? index : undefined;
                };

                const readCell = (cells: SheetCell[], index?: number, fallback = "") => {
                    if (index === undefined) {
                        return fallback;
                    }

                    const cell = cells[index];
                    return String(cell?.f || cell?.v || fallback).trim();
                };

                const panelSerialNumberPhotoIndex = findColumnIndex("panel", "serial", "photo") ?? 0;
                const solarPlatePhotoIndex = findColumnIndex("solar", "plate", "photo") ?? 1;
                const inverterPhotoIndex = findColumnIndex("inverter", "photo") ?? 2;
                const earthingPhotoIndex = findColumnIndex("earthing", "photo") ?? 3;
                const laPhotoIndex = findColumnIndex("la", "photo") ?? 4;
                const teamSelfieIndex = findColumnIndex("team", "selfie") ?? 5;
                const emailIndex = findColumnIndex("email") ?? 6;
                const installationCompleteIndex = findColumnIndex("installation", "complete") ?? 7;
                const installationIncompleteReasonIndex = findColumnIndex("if no", "reason") ?? 8;
                const nameIndex = findColumnIndex("name") ?? 9;
                const phoneNumberIndex = findColumnIndex("phone", "number") ?? 10;

                const mappedPhotos: InstallationPhotoData[] = rows
                    .filter((row) => {
                        const email = readCell(row.c, emailIndex).toUpperCase();
                        const name = readCell(row.c, nameIndex).toUpperCase();
                        return email !== "EMAIL" && email !== "EMAIL ID" && name !== "NAME";
                    })
                    .map((row) => {
                        const c = row.c;
                        return {
                            panelSerialNumberPhoto: readCell(c, panelSerialNumberPhotoIndex, ""),
                            solarPlatePhoto: readCell(c, solarPlatePhotoIndex, ""),
                            inverterPhoto: readCell(c, inverterPhotoIndex, ""),
                            earthingPhoto: readCell(c, earthingPhotoIndex, ""),
                            laPhoto: readCell(c, laPhotoIndex, ""),
                            teamSelfie: readCell(c, teamSelfieIndex, ""),
                            emailId: readCell(c, emailIndex, "N/A"),
                            installationComplete: readCell(c, installationCompleteIndex, "Pending"),
                            installationIncompleteReason: readCell(c, installationIncompleteReasonIndex, ""),
                            customerName: readCell(c, nameIndex, "N/A"),
                            phoneNumber: readCell(c, phoneNumberIndex, ""),
                        };
                    });

                setPhotos(mappedPhotos);
            } catch (err) {
                console.error("Admin photos fetch error:", err);
                setError("Failed to load installation photos.");
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
                    <p>Loading installation gallery...</p>
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
                        <h1 className="user-name">Installation Photos</h1>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="action-btn-blue">
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <motion.div
                className="dashboard-content installation-photos-content"
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
                                    <th>Panel Serial Number</th>
                                    <th>Solar Plate</th>
                                    <th>Inverter</th>
                                    <th>Earthing</th>
                                    <th>LA Photo</th>
                                    <th>Team Selfie</th>
                                    <th>Installation Complete</th>
                                    <th>If No, Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {photos.map((photo, idx) => (
                                    <tr key={idx}>
                                        <td className="font-bold">
                                            <div>{photo.customerName}</div>
                                            <div className="phone-sub">{photo.emailId}</div>
                                            {photo.phoneNumber ? <div className="phone-sub">{photo.phoneNumber}</div> : null}
                                        </td>
                                        <td>
                                            {photo.panelSerialNumberPhoto ? (
                                                <a href={photo.panelSerialNumberPhoto} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Panel Serial
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {photo.solarPlatePhoto ? (
                                                <a href={photo.solarPlatePhoto} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Plate
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {photo.inverterPhoto ? (
                                                <a href={photo.inverterPhoto} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Inverter
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {photo.earthingPhoto ? (
                                                <a href={photo.earthingPhoto} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Earthing
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {photo.laPhoto ? (
                                                <a href={photo.laPhoto} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View LA
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            {photo.teamSelfie ? (
                                                <a href={photo.teamSelfie} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    View Selfie
                                                </a>
                                            ) : <span className="status-badge pending">Pending</span>}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${photo.installationComplete.toLowerCase() === "yes" ? "uploaded" : "pending"}`}>
                                                {photo.installationComplete || "Pending"}
                                            </span>
                                        </td>
                                        <td>
                                            {photo.installationIncompleteReason || <span className="phone-sub">-</span>}
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

export default InstallationPhotos;
