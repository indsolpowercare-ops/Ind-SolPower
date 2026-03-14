import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css"

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
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

interface OverviewBar {
  label: string;
  value: number;
  total: number;
  tone: string;
}

interface OverviewTrendPoint {
  label: string;
  value: number;
}

interface BusinessOverview {
  totalCustomers: number;
  recentRegistrations: number;
  totalProjectValue: number;
  averageProjectValue: number;
  averageCapacity: number;
  fullyDocumentedCustomers: number;
  locationTaggedCustomers: number;
  documentCompletionRate: number;
  capacityMix: OverviewBar[];
  documentStatus: OverviewBar[];
  locationDistribution: OverviewBar[];
  monthlyRegistrations: OverviewTrendPoint[];
}

const parseNumericValue = (value: string) => {
  const normalized = value.replace(/,/g, "");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const parseTimestampValue = (value: string) => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const extractRegionLabel = (address: string, location: string) => {
  const addressParts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const ignoredParts = new Set(["india", "odisha"]);
  const candidates = addressParts.filter((part) => !ignoredParts.has(part.toLowerCase()));

  if (candidates.length >= 2) {
    return candidates[candidates.length - 1];
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (location) {
    try {
      const url = new URL(location);
      return url.hostname.replace("www.", "");
    } catch {
      return "Unmapped";
    }
  }

  return "Unmapped";
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    notation: value >= 100000 ? "compact" : "standard",
  }).format(value);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [overview, setOverview] = useState<BusinessOverview | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = localStorage.getItem("userEmail");
  const adminEmail = "pattanaiksanghamitra2198@gmail.com";
  const installationTeamEmail = "sanghamitra.pattanaik06@gmail.com";
  const installationFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSejSwmX5WpRkGpaSeQ5r_WHP2jRPXUgTrP5offr_P4WW_REIQ/viewform?usp=dialog";
  const isAdmin = userEmail?.toLowerCase() === adminEmail;
  const isInstallationTeam = userEmail?.toLowerCase() === installationTeamEmail;

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    if (isInstallationTeam) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1NhNEGNShTvder3miG2BMC_mGRrke3zr-Sp85kMGK5h8/gviz/tq?tqx=out:json";
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
        const emailIndex = findColumnIndex("email") ?? 4;
        const nameIndex = findColumnIndex("name") ?? 1;
        const addressIndex = findColumnIndex("address") ?? 2;
        const phoneIndex = findColumnIndex("phone") ?? 3;
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

        const mappedUsers = rows
          .filter((row) => {
            const firstVal = readCell(row.c, nameIndex).toUpperCase();
            return firstVal !== "NAME" && firstVal !== "CUSTOMER NAME";
          })
          .map((row) => {
            const c = row.c;
            return {
              timestamp: readCell(c, timestampIndex, ""),
              name: readCell(c, nameIndex, "N/A"),
              email: readCell(c, emailIndex, "N/A"),
              phone: readCell(c, phoneIndex, "N/A"),
              address: readCell(c, addressIndex, "N/A"),
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

        const matchedUser = mappedUsers.find((entry) => {
          return entry.email.toLowerCase().trim() === userEmail.toLowerCase().trim();
        });

        if (isAdmin) {
          const totalCustomers = mappedUsers.length;
          const recentRegistrations = mappedUsers.filter((entry) => {
            const timestamp = parseTimestampValue(entry.timestamp);
            if (!timestamp) {
              return false;
            }

            const daysAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= 30;
          }).length;
          const totalProjectValue = mappedUsers.reduce((sum, entry) => sum + parseNumericValue(entry.finalPrice), 0);
          const totalCapacity = mappedUsers.reduce((sum, entry) => sum + parseNumericValue(entry.solarCapacity), 0);
          const fullyDocumentedCustomers = mappedUsers.filter(
            (entry) => entry.aadhar && entry.pan && entry.passbook && entry.bill,
          ).length;
          const locationTaggedCustomers = mappedUsers.filter((entry) => entry.location).length;

          const uploadedAadhar = mappedUsers.filter((entry) => entry.aadhar).length;
          const uploadedPan = mappedUsers.filter((entry) => entry.pan).length;
          const uploadedPassbook = mappedUsers.filter((entry) => entry.passbook).length;
          const uploadedBill = mappedUsers.filter((entry) => entry.bill).length;
          const totalDocumentSlots = totalCustomers * 4;
          const uploadedDocuments = uploadedAadhar + uploadedPan + uploadedPassbook + uploadedBill;

          const smallCapacity = mappedUsers.filter((entry) => parseNumericValue(entry.solarCapacity) <= 5).length;
          const mediumCapacity = mappedUsers.filter((entry) => {
            const capacity = parseNumericValue(entry.solarCapacity);
            return capacity > 5 && capacity <= 10;
          }).length;
          const largeCapacity = mappedUsers.filter((entry) => parseNumericValue(entry.solarCapacity) > 10).length;

          const locationCounts = mappedUsers.reduce<Record<string, number>>((accumulator, entry) => {
            const label = extractRegionLabel(entry.address, entry.location);
            accumulator[label] = (accumulator[label] || 0) + 1;
            return accumulator;
          }, {});

          const locationDistribution = Object.entries(locationCounts)
            .sort((left, right) => right[1] - left[1])
            .slice(0, 6)
            .map(([label, value], index) => ({
              label,
              value,
              total: totalCustomers,
              tone: ["blue", "green", "orange", "purple", "blue", "green"][index] || "blue",
            }));

          const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" });
          const monthlyCounts = mappedUsers.reduce<Record<string, number>>((accumulator, entry) => {
            const timestamp = parseTimestampValue(entry.timestamp);
            if (!timestamp) {
              return accumulator;
            }

            const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, "0")}`;
            accumulator[monthKey] = (accumulator[monthKey] || 0) + 1;
            return accumulator;
          }, {});

          const monthlyRegistrations = Object.entries(monthlyCounts)
            .sort(([left], [right]) => left.localeCompare(right))
            .slice(-6)
            .map(([monthKey, value]) => {
              const [year, month] = monthKey.split("-");
              const labelDate = new Date(Number(year), Number(month) - 1, 1);
              return {
                label: monthFormatter.format(labelDate),
                value,
              };
            });

          setOverview({
            totalCustomers,
            recentRegistrations,
            totalProjectValue,
            averageProjectValue: totalCustomers ? totalProjectValue / totalCustomers : 0,
            averageCapacity: totalCustomers ? totalCapacity / totalCustomers : 0,
            fullyDocumentedCustomers,
            locationTaggedCustomers,
            documentCompletionRate: totalDocumentSlots ? (uploadedDocuments / totalDocumentSlots) * 100 : 0,
            capacityMix: [
              { label: "Up to 5 kW", value: smallCapacity, total: totalCustomers, tone: "blue" },
              { label: "6 to 10 kW", value: mediumCapacity, total: totalCustomers, tone: "green" },
              { label: "Above 10 kW", value: largeCapacity, total: totalCustomers, tone: "orange" },
            ],
            documentStatus: [
              { label: "Aadhar", value: uploadedAadhar, total: totalCustomers, tone: "blue" },
              { label: "PAN", value: uploadedPan, total: totalCustomers, tone: "purple" },
              { label: "Passbook", value: uploadedPassbook, total: totalCustomers, tone: "green" },
              { label: "Electric Bill", value: uploadedBill, total: totalCustomers, tone: "orange" },
            ],
            locationDistribution,
            monthlyRegistrations,
          });
        }

        if (matchedUser) {
          setUser(matchedUser);
        } else if (!isAdmin) {
          setError("User data not found for " + userEmail);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail, isAdmin, isInstallationTeam, navigate]);

  const handleLogout = () => {
    setIsNavOpen(false);
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const handleNavLinkClick = () => {
    setIsNavOpen(false);
  };

  if (loading) {
    return (
      <div className="dash-overlay-light">
        <div className="loading-spinner">
          <div className="spinner-blue"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-overlay-light">
        <div className="error-card-light">
          <h2>Account Alert</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className="action-btn-blue">Return to Login</button>
        </div>
      </div>
    );
  }

  if (isInstallationTeam) {
    return (
      <div className="dashboard-wrapper">
        <div className="dash-header">
          <div className="header-content">
            <div>
              <p className="welcome-text">INSTALLATION TEAM</p>
              <h1 className="user-name">Upload Installation Photos</h1>
            </div>
            <button onClick={handleLogout} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>

        <motion.div
          className="dashboard-content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="info-card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <h2 className="documents-title" style={{ marginBottom: 18 }}>Google Form</h2>
            <p className="info-value" style={{ marginBottom: 24 }}>
              Click below to upload installation photos.
            </p>
            <a
              href={installationFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="maps-btn"
            >
              Open Upload Form
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const kycDocs = [
    { label: "Aadhar", number: user?.aadharNumber, status: user?.aadhar ? "Uploaded" : "Pending", link: user?.aadhar },
    { label: "PAN", number: user?.panNumber, status: user?.pan ? "Uploaded" : "Pending", link: user?.pan },
    { label: "Bank Passbook", number: user?.bankAccountNumber, status: user?.passbook ? "Uploaded" : "Pending", link: user?.passbook },
    { label: "Electric Bill", number: "", status: user?.bill ? "Uploaded" : "Pending", link: user?.bill },
  ];

  const showCustomerCards = !isAdmin && user;

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="dash-header">
        <div className="header-content">
          <div>
            <p className="welcome-text">{isAdmin ? "ADMIN PANEL" : "WELCOME BACK"}</p>
            <h1 className="user-name">{isAdmin ? "Business Dashboard" : user?.name}</h1>
          </div>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
            aria-controls="dashboard-main-nav"
            onClick={() => setIsNavOpen((prev) => !prev)}
          >
            {isNavOpen ? "Close" : "Menu"}
          </button>
          <div className={`header-actions ${isNavOpen ? "open" : ""}`}>
            <nav className={`dash-nav ${isNavOpen ? "open" : ""}`} id="dashboard-main-nav">
              <ul>
                {userEmail?.toLowerCase() === "pattanaiksanghamitra2198@gmail.com" ? (
                  <>
                    <li><Link to="/admin/customer-details" onClick={handleNavLinkClick}>Customer Details</Link></li>
                    <li><Link to="/admin/customer-documents" onClick={handleNavLinkClick}>Customer Documents</Link></li>
                    <li><Link to="/admin/installation-photos" onClick={handleNavLinkClick}>Installation Photos</Link></li>
                  </>
                ) : userEmail?.toLowerCase() === installationTeamEmail ? (
                  <>
                    <li><Link to={installationFormLink} onClick={handleNavLinkClick}>Upload Photos</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/installation" onClick={handleNavLinkClick}>Installation Details</Link></li>
                    <li><Link to="/documents" onClick={handleNavLinkClick}>My Documents</Link></li>
                    <li><Link to="/feedback" onClick={handleNavLinkClick}>Complaint Raise</Link></li>
                  </>
                )}
              </ul>
            </nav>
            <button onClick={handleLogout} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {isAdmin && overview ? (
          <div className="overview-hub">
            <div className="overview-header">
              <div>
                <p className="overview-eyebrow">Business Overview</p>
                <h2>Current Snapshot</h2>
              </div>
            </div>

            <div className="overview-metrics-grid">
              <div className="overview-metric-card blue">
                <span className="overview-metric-label">Total Customers</span>
                <strong>{overview.totalCustomers}</strong>
                <p>{overview.recentRegistrations} registrations in last 30 days</p>
              </div>
              <div className="overview-metric-card green">
                <span className="overview-metric-label">Total Project Value</span>
                <strong>{formatCurrency(overview.totalProjectValue)}</strong>
                <p>Average {formatCurrency(overview.averageProjectValue)} per project</p>
              </div>
              <div className="overview-metric-card orange">
                <span className="overview-metric-label">Average Capacity</span>
                <strong>{overview.averageCapacity.toFixed(1)} kW</strong>
                <p>Based on submitted solar capacity</p>
              </div>
              <div className="overview-metric-card slate">
                <span className="overview-metric-label">Documentation</span>
                <strong>{overview.documentCompletionRate.toFixed(0)}%</strong>
                <p>{overview.fullyDocumentedCustomers} complete files, {overview.locationTaggedCustomers} map links added</p>
              </div>
            </div>

            <div className="overview-panels-grid">
              <div className="overview-panel">
                <div className="overview-panel-head">
                  <h3>Capacity Distribution</h3>
                  <span>{overview.totalCustomers} accounts</span>
                </div>
                <div className="overview-bars">
                  {overview.capacityMix.map((item) => (
                    <div key={item.label} className="overview-bar-row">
                      <div className="overview-bar-meta">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="overview-bar-track">
                        <div
                          className={`overview-bar-fill ${item.tone}`}
                          style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-panel">
                <div className="overview-panel-head">
                  <h3>Document Upload Status</h3>
                  <span>{overview.documentCompletionRate.toFixed(0)}% completion</span>
                </div>
                <div className="overview-bars">
                  {overview.documentStatus.map((item) => (
                    <div key={item.label} className="overview-bar-row">
                      <div className="overview-bar-meta">
                        <span>{item.label}</span>
                        <strong>{item.value}/{item.total}</strong>
                      </div>
                      <div className="overview-bar-track">
                        <div
                          className={`overview-bar-fill ${item.tone}`}
                          style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-panel">
                <div className="overview-panel-head">
                  <h3>City / District Distribution</h3>
                  <span>Derived from address and map data</span>
                </div>
                <div className="overview-bars">
                  {overview.locationDistribution.map((item) => (
                    <div key={item.label} className="overview-bar-row">
                      <div className="overview-bar-meta">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="overview-bar-track">
                        <div
                          className={`overview-bar-fill ${item.tone}`}
                          style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-panel">
                <div className="overview-panel-head">
                  <h3>Monthly Registration Trend</h3>
                  <span>Last 6 active months</span>
                </div>
                <div className="trend-chart">
                  {overview.monthlyRegistrations.map((item) => {
                    const maxValue = Math.max(...overview.monthlyRegistrations.map((point) => point.value), 1);
                    return (
                      <div key={item.label} className="trend-column">
                        <span className="trend-value">{item.value}</span>
                        <div className="trend-bar-track">
                          <div
                            className="trend-bar-fill"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="trend-label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showCustomerCards ? <div className="cards-container">
          {/* Left Card - User Information */}
          <div className="info-card">
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label blue">FULL NAME</label>
                <p className="info-value">{user?.name}</p>
              </div>
              <div className="info-item">
                <label className="info-label purple">EMAIL ADDRESS</label>
                <p className="info-value">{user?.email}</p>
              </div>
              <div className="info-item">
                <label className="info-label orange">PHONE NUMBER</label>
                <p className="info-value">{user?.phone}</p>
              </div>
              <div className="info-item">
                <label className="info-label green">INSTALLATION ADDRESS</label>
                <p className="info-value">{user?.address}</p>
              </div>
              <div className="info-item">
                <label className="info-label blue">FINAL PRICE</label>
                <p className="info-value">{user?.finalPrice || "N/A"}</p>
              </div>
              <div className="info-item">
                <label className="info-label purple">SOLAR CAPACITY</label>
                <p className="info-value">{user?.solarCapacity || "N/A"}</p>
              </div>
              <div className="info-item">
                <label className="info-label orange">PANEL WATT POWER</label>
                <p className="info-value">{user?.panelWp || "N/A"}</p>
              </div>
            </div>

            {/* GPS Location Section */}
            <div className="location-section">
              <div className="location-info">
                <div className="location-icon">📍</div>
                <div>
                  <label className="info-label red">GPS Location</label>
                  <p className="location-link">{user?.location || "https://www.genglemaps.com"}</p>
                </div>
              </div>
              {user?.location && (
                <a
                  href={user.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-btn"
                >
                  Open in Maps
                </a>
              )}
            </div>
          </div>

          {/* Right Card - Uploaded Documents */}
          <div className="documents-card">
            <h2 className="documents-title">UPLOADED DOCUMENTS</h2>

            <div className="documents-list">
              {kycDocs.map((doc, idx) => (
                <div key={idx} className="document-row">
                  <div className="doc-meta">
                    <span className="doc-name">{doc.label}</span>
                    {doc.number ? <span className="doc-subtext">{doc.number}</span> : null}
                  </div>
                  <div className="doc-actions">
                    <span className={`status-badge ${doc.status.toLowerCase()}`}>
                      {doc.status === "Uploaded" ? "✓ Uploaded" : "Pending"}
                    </span>
                    {doc.link ? (
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View
                      </a>
                    ) : (
                      <span className="view-link disabled">View</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> : null}
      </motion.div>
    </div>
  );
};

export default Dashboard;