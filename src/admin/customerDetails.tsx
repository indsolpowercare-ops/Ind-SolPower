import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../components/Dashboard.css";

interface Customer {
    timestamp: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    location: string;
    aadhar: string;
    aadharNumber: string;
    pan: string;
    panNumber: string;
    passbook: string;
    bankAccountNumber: string;
    bill: string;
    finalPrice: string;
    solarCapacity: string;
    panelWp: string;
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

const CustomerDetails = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
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
                const sheetUrl = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json&gid=1027565842";
                const response = await fetch(sheetUrl);
                const text = await response.text();
                const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const data = JSON.parse(jsonStr);

                const rows: SheetRow[] = data.table.rows;
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
                    return String(cell?.f || cell?.v || fallback);
                };

                const timestampIndex = findColumnIndex("timestamp") ?? 0;
                const nameIndex = findColumnIndex("name") ?? 1;
                const addressIndex = findColumnIndex("address") ?? 2;
                const phoneIndex = findColumnIndex("phone") ?? 3;
                const emailIndex = findColumnIndex("email") ?? 4;
                const locationIndex = findColumnIndex("location") ?? 5;

                const aadharLinkIndex = findColumnIndex("aadhar", "link") ?? 6;
                const panLinkIndex = findColumnIndex("pan", "link") ?? 7;
                const passbookLinkIndex =
                    findColumnIndex("passbook", "link") ?? findColumnIndex("bank", "passbook", "link") ?? 8;
                const billLinkIndex = findColumnIndex("bill", "link") ?? 9;

                const aadharNumberIndex = findColumnIndex("aadhar", "card", "number");
                const panNumberIndex = findColumnIndex("pan", "card", "number");
                const bankAccountNumberIndex = findColumnIndex("bank", "account", "number");
                const finalPriceIndex = findColumnIndex("final", "price");
                const solarCapacityIndex = findColumnIndex("solar", "capacity");
                const panelWpIndex = findColumnIndex("panel", "wp") ?? findColumnIndex("panel", "watt");

                // Filter out header row if present
                const mappedCustomers: Customer[] = rows
                    .filter((row) => {
                        const firstVal = readCell(row.c, nameIndex).toUpperCase();
                        return firstVal !== "NAME" && firstVal !== "CUSTOMER NAME";
                    })
                    .map((row) => {
                        const c = row.c;

                        // Format Google Sheets date string to a readable format
                        const rawDate = readCell(c, timestampIndex, "N/A");
                        let formattedDate = rawDate;
                        if (rawDate !== "N/A") {
                            const date = new Date(rawDate);
                            if (!isNaN(date.getTime())) {
                                formattedDate = date.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            }
                        }

                        return {
                            timestamp: formattedDate,
                            name: readCell(c, nameIndex, "N/A"),
                            address: readCell(c, addressIndex, "N/A"),
                            phone: readCell(c, phoneIndex, "N/A"),
                            email: readCell(c, emailIndex, "N/A"),
                            location: readCell(c, locationIndex, ""),
                            aadhar: readCell(c, aadharLinkIndex, ""),
                            aadharNumber: readCell(c, aadharNumberIndex, ""),
                            pan: readCell(c, panLinkIndex, ""),
                            panNumber: readCell(c, panNumberIndex, ""),
                            passbook: readCell(c, passbookLinkIndex, ""),
                            bankAccountNumber: readCell(c, bankAccountNumberIndex, ""),
                            bill: readCell(c, billLinkIndex, ""),
                            finalPrice: readCell(c, finalPriceIndex, ""),
                            solarCapacity: readCell(c, solarCapacityIndex, ""),
                            panelWp: readCell(c, panelWpIndex, ""),
                        };
                    });

                setCustomers(mappedCustomers);
            } catch (err) {
                console.error("Admin fetch error:", err);
                setError("Failed to load customer list.");
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
                    <p>Loading customer database...</p>
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
                        <h1 className="user-name">Customer Details</h1>
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
                                    <th>Name</th>
                                    <th>Contact Info</th>
                                    <th>Address</th>
                                    <th>Location</th>
                                    <th>Documents</th>
                                    <th>Aadhar Number</th>
                                    <th>PAN Number</th>
                                    <th>Bank Account Number</th>
                                    <th>Final Price</th>
                                    <th>Solar Capacity</th>
                                    <th>Panel Watt Power</th>
                                    <th>Registered On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer, idx) => (
                                    <tr key={idx}>
                                        <td className="font-bold">{customer.name}</td>
                                        <td>
                                            <div className="contact-cell">
                                                <span>{customer.email}</span>
                                                <span className="phone-sub">{customer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="address-cell">{customer.address}</td>
                                        <td>
                                            {customer.location && (
                                                <a href={customer.location} target="_blank" rel="noopener noreferrer" className="table-btn-link">
                                                    Maps 📍
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <div className="doc-links-grid">
                                                {customer.aadhar && <a href={customer.aadhar} target="_blank" rel="noopener noreferrer" title="Aadhar">A</a>}
                                                {customer.pan && <a href={customer.pan} target="_blank" rel="noopener noreferrer" title="PAN">P</a>}
                                                {customer.passbook && <a href={customer.passbook} target="_blank" rel="noopener noreferrer" title="Bank Passbook">B</a>}
                                                {customer.bill && <a href={customer.bill} target="_blank" rel="noopener noreferrer" title="Electricity Bill">E</a>}
                                            </div>
                                        </td>
                                        <td>{customer.aadharNumber || "-"}</td>
                                        <td>{customer.panNumber || "-"}</td>
                                        <td>{customer.bankAccountNumber || "-"}</td>
                                        <td>{customer.finalPrice || "-"}</td>
                                        <td>{customer.solarCapacity || "-"}</td>
                                        <td>{customer.panelWp || "-"}</td>
                                        <td className="timestamp-cell">{customer.timestamp}</td>
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

export default CustomerDetails;
