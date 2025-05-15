import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";
import { saveAs } from "file-saver";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AUTH_API, ApiClient } from "../config/authConfig";
import { QRCustomization } from "./QRCustomization";
import { QRTypeSelector } from "./QRTypeSelector";
import { QRSecurityOptions } from "./QRSecurityOptions";
import { QRBulkGenerator } from "./QRBulkGenerator";
import { QRAnalytics } from "./QRAnalytics";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateQRWithLogo } from "../utils/qrGenerator";

interface QRCodeHistory {
  _id: string;
  text: string;
  qrImage: string;
  createdAt: string;
  qrType?: string;
  customization?: {
    color: string;
    backgroundColor: string;
    logo: string | null;
    margin: number;
  };
  analytics?: {
    scanCount: number;
    lastScanned?: string;
  };
}

export function QRGenerator() {
  const [text, setText] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [history, setHistory] = useState<QRCodeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  // New state variables for enhanced features
  const [activeTab, setActiveTab] = useState("generate");
  const [qrType, setQrType] = useState("url");
  const [qrData, setQrData] = useState<any>({ url: "" });
  // Removed unused showBulkGenerator state
  const qrRef = useRef<HTMLDivElement>(null);
  const [customization, setCustomization] = useState({
    color: "#000000",
    backgroundColor: "#ffffff",
    logo: null as string | null,
    margin: 4,
  });
  const [security, setSecurity] = useState({
    password: "",
    isPasswordProtected: false,
    expiresAt: "",
    maxScans: 0,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      if (user?.userId) {
        try {
          setIsFetching(true);
          const data = await ApiClient.get(AUTH_API.QR_CODES);
          setHistory(data);
        } catch (error) {
          toast.error("Failed to load QR code history");
          console.error(error);
        } finally {
          setIsFetching(false);
        }
      }
    }
    fetchHistory();
  }, [user]);
  const generateQR = async () => {
    try {
      let qrContent = "";

      // Format content based on QR type
      switch (qrType) {
        case "url":
          qrContent = qrData.url || "";
          break;
        case "text":
          qrContent = qrData.text || "";
          break;
        case "vcard":
        case "wifi":
        case "email":
        case "sms":
        case "geo":
        case "event":
        case "phone":
          // For complex types, use the formatted content from backend
          try {
            const response = await ApiClient.post(AUTH_API.FORMAT_QR, {
              qrType,
              data: qrData,
            });
            qrContent = response.formattedContent;
          } catch (error) {
            console.error("Error formatting QR content:", error);
            // Fallback: concatenate all values as a string
            qrContent = Object.values(qrData).filter(Boolean).join(", ");
          }
          break;
        default:
          qrContent = text;
      }

      if (!qrContent) {
        return toast.error("Please enter valid content for your QR code");
      }

      setIsLoading(true);

      // Generate QR code with customization
      let url = "";
      if (customization.logo) {
        try {
          // Use our custom utility for QR code with logo
          url = await generateQRWithLogo(qrContent, {
            color: customization.color,
            backgroundColor: customization.backgroundColor,
            margin: customization.margin,
            logo: customization.logo,
          });
        } catch (logoError) {
          console.error("Error adding logo to QR code:", logoError);
          // Fallback to regular QR code
          url = await QRCode.toDataURL(qrContent, {
            margin: customization.margin,
            color: {
              dark: customization.color,
              light: customization.backgroundColor,
            },
          });
        }
      } else {
        // Use our custom utility for QR code without logo for consistent handling
        url = await generateQRWithLogo(qrContent, {
          color: customization.color,
          backgroundColor: customization.backgroundColor,
          margin: customization.margin,
          logo: null,
        });
      }

      setQrImage(url);
      setText(qrContent); // Set text for backward compatibility

      // Save to backend
      if (user?.userId) {
        await ApiClient.post(AUTH_API.QR_CODES, {
          text: qrContent,
          qrImage: url,
          qrType,
          customization,
          security,
        });

        // Refresh history
        const data = await ApiClient.get(AUTH_API.QR_CODES);
        setHistory(data);
      }

      toast.success("QR Code generated successfully!");
    } catch (err) {
      console.error("Error generating QR code:", err);
      toast.error("Error generating QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = (format: "png" | "pdf" | "svg" = "png") => {
    if (!qrImage) {
      return toast.error("Generate a QR code first");
    }

    const fileName = `qr-code-${new Date().getTime()}`;

    try {
      if (format === "png") {
        // Download as PNG
        const link = document.createElement("a");
        link.href = qrImage;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // Download as PDF
        if (!qrRef.current) return;

        html2canvas(qrRef.current).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });
          // Calculate positions to center the QR code
          const imgWidth = 80;
          const imgHeight = 80;
          const pageWidth = pdf.internal.pageSize.getWidth();
          // pageHeight not needed for centering calculation
          const x = (pageWidth - imgWidth) / 2;
          const y = 20;

          pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

          // Add QR content below the image
          const textLines = text.split("\n");
          let textY = y + imgHeight + 10;

          pdf.setFontSize(12);
          textLines.forEach((line) => {
            pdf.text(line, pageWidth / 2, textY, { align: "center" });
            textY += 7;
          });

          pdf.save(`${fileName}.pdf`);
        });
      } else if (format === "svg") {
        // Create SVG from QR code data
        QRCode.toString(
          text,
          {
            type: "svg",
            margin: customization.margin,
            color: {
              dark: customization.color,
              light: customization.backgroundColor,
            },
          },
          (err, svg) => {
            if (err) throw err;

            const blob = new Blob([svg], { type: "image/svg+xml" });
            saveAs(blob, `${fileName}.svg`);
          }
        );
      }

      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error downloading QR code as ${format}:`, error);
      toast.error(`Failed to download QR code as ${format}`);
    }
  };

  const handleQrTypeChange = (type: string) => {
    setQrType(type);
  };

  const handleQrDataChange = (data: any) => {
    setQrData(data);
  };

  const handleCustomizationChange = (customizationData: any) => {
    setCustomization(customizationData);
  };

  const handleSecurityChange = (securityData: any) => {
    setSecurity(securityData);
  };

  const resetForm = () => {
    setText("");
    setQrImage("");
    setQrType("url");
    setQrData({ url: "" });
    setCustomization({
      color: "#000000",
      backgroundColor: "#ffffff",
      logo: null,
      margin: 4,
    });
    setSecurity({
      password: "",
      isPasswordProtected: false,
      expiresAt: "",
      maxScans: 0,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };
  const handleBulkGeneratorComplete = () => {
    // Switch to history tab after bulk generation is complete
    setActiveTab("history");
    // Refresh history after bulk generation
    ApiClient.get(AUTH_API.QR_CODES).then((data) => setHistory(data));
  };

  return (
    <div className="container main-container">
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col">
              <h2 className="card-title">QR Code Generator</h2>
            </div>
            <div className="col-auto">
              <div className="user-info">
                <span className="me-2">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "generate" ? "active" : ""
                }`}
                onClick={() => setActiveTab("generate")}
              >
                Generate
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "analytics" ? "active" : ""
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "bulk" ? "active" : ""}`}
                onClick={() => setActiveTab("bulk")}
              >
                Bulk Generator
              </button>
            </li>
          </ul>

          {/* Generate Tab */}
          {activeTab === "generate" && (
            <>
              {/* QR Type Selector */}
              <QRTypeSelector
                selectedType={qrType}
                onTypeChange={handleQrTypeChange}
                onDataChange={handleQrDataChange}
              />

              {/* QR Customization */}
              <QRCustomization
                customization={customization}
                onCustomizationChange={handleCustomizationChange}
              />

              {/* QR Security Options */}
              <QRSecurityOptions
                security={security}
                onSecurityChange={handleSecurityChange}
              />

              {/* Generate Button */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
                <button
                  onClick={resetForm}
                  className="btn btn-outline-secondary"
                >
                  Reset
                </button>
                <button
                  onClick={generateQR}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </button>
              </div>

              {/* QR Code Display */}
              {qrImage && (
                <div className="qr-container text-center p-4 border rounded bg-light mb-4">
                  <div ref={qrRef} className="mb-3">
                    <img
                      src={qrImage}
                      alt="Generated QR Code"
                      className="qr-image img-fluid"
                      style={{ maxWidth: "300px" }}
                    />
                  </div>
                  <div className="mb-3">
                    <p>
                      <strong>Content:</strong> {text}
                    </p>
                  </div>
                  <div className="btn-group">
                    <button
                      onClick={() => downloadQR("png")}
                      className="btn btn-secondary"
                    >
                      Download PNG
                    </button>
                    <button
                      onClick={() => downloadQR("pdf")}
                      className="btn btn-secondary"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => downloadQR("svg")}
                      className="btn btn-secondary"
                    >
                      Download SVG
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div>
              <h3 className="mb-3">QR Code History</h3>

              {isFetching ? (
                <div className="text-center text-muted mt-4">
                  Loading history...
                </div>
              ) : history.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {history.map((item) => (
                    <div key={item._id} className="col">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4 text-center">
                              <img
                                src={item.qrImage}
                                alt="Historical QR Code"
                                className="img-fluid"
                              />
                            </div>
                            <div className="col-md-8">
                              <p className="mb-2">{item.text}</p>
                              <p className="text-muted small mb-2">
                                Created:{" "}
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                              {item.analytics && (
                                <p className="text-muted small mb-2">
                                  Scans: {item.analytics.scanCount || 0}
                                </p>
                              )}
                              <div className="d-flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    // Copy to new QR
                                    setText(item.text);
                                    setQrImage(item.qrImage);
                                    setQrType(item.qrType || "url");
                                    if (item.customization) {
                                      setCustomization(item.customization);
                                    }
                                    setActiveTab("generate");
                                  }}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    // Download the historical QR
                                    const link = document.createElement("a");
                                    link.href = item.qrImage;
                                    link.download = `qr-${item._id}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-5 bg-light rounded">
                  <p className="mb-3">
                    You haven't generated any QR codes yet.
                  </p>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="btn btn-primary"
                  >
                    Create Your First QR Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <QRAnalytics />
            </div>
          )}

          {/* Bulk Generator Tab */}
          {activeTab === "bulk" && (
            <div>
              <QRBulkGenerator onComplete={handleBulkGeneratorComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
