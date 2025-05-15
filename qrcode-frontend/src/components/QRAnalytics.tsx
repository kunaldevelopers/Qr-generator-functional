import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { ApiClient, AUTH_API } from "../config/authConfig";
import styles from "./QRAnalytics.module.css";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QRCodeAnalytics {
  totalQrCodes: number;
  totalScans: number;
  scansByDate: { [key: string]: number };
  scansByDevice: { [key: string]: number };
  scansByLocation: { [key: string]: number };
  mostScanned: {
    id: string;
    text: string;
    scanCount: number;
  } | null;
}

interface SingleQRAnalytics {
  scanCount: number;
  lastScanned: string;
  scanLocations: Array<{ country: string; city: string; timestamp: string }>;
  devices: Array<{ type: string; count: number }>;
}

export function QRAnalytics() {
  const [analytics, setAnalytics] = useState<QRCodeAnalytics | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [qrAnalytics, setQrAnalytics] = useState<SingleQRAnalytics | null>(
    null
  );
  const [userQRCodes, setUserQRCodes] = useState<
    Array<{ _id: string; text: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchUserQRCodes();
  }, []);

  useEffect(() => {
    if (selectedQR) {
      fetchQRAnalytics(selectedQR);
    }
  }, [selectedQR]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get(AUTH_API.ANALYTICS);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQRCodes = async () => {
    try {
      const qrCodes = await ApiClient.get(AUTH_API.QR_CODES);
      setUserQRCodes(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    }
  };

  const fetchQRAnalytics = async (qrId: string) => {
    try {
      setLoading(true);
      const data = await ApiClient.get(`${AUTH_API.ANALYTICS}/${qrId}`);
      setQrAnalytics(data);
    } catch (error) {
      console.error("Error fetching QR analytics:", error);
      toast.error("Failed to load QR code analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Prepare chart data for devices
  const deviceChartData = {
    labels:
      analytics && analytics.scansByDevice
        ? Object.keys(analytics.scansByDevice).map(
            (key) => key.charAt(0).toUpperCase() + key.slice(1)
          )
        : [],
    datasets: [
      {
        label: "Scans by Device",
        data:
          analytics && analytics.scansByDevice
            ? Object.values(analytics.scansByDevice)
            : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for locations
  const locationChartData = {
    labels:
      analytics && analytics.scansByLocation
        ? Object.keys(analytics.scansByLocation)
        : [],
    datasets: [
      {
        label: "Scans by Location",
        data:
          analytics && analytics.scansByLocation
            ? Object.values(analytics.scansByLocation)
            : [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare single QR code chart data
  const qrDeviceChartData = qrAnalytics
    ? {
        labels: qrAnalytics.devices.map(
          (d) => d.type.charAt(0).toUpperCase() + d.type.slice(1)
        ),
        datasets: [
          {
            label: "Device Types",
            data: qrAnalytics.devices.map((d) => d.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className={styles.analyticsContainer}>
      <h2 className={styles.title}>QR Code Analytics</h2>

      {/* Overall statistics */}
      {analytics && (
        <div className={styles.overviewStats}>
          <div className={styles.statCard}>
            <h3>Total QR Codes</h3>
            <div className={styles.statValue}>{analytics.totalQrCodes}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Total Scans</h3>
            <div className={styles.statValue}>{analytics.totalScans}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Most Scanned</h3>
            <div className={styles.statValue}>
              {analytics.mostScanned ? (
                <>
                  <div className={styles.mostScannedText}>
                    {analytics.mostScanned.text}
                  </div>
                  <div className={styles.scanCount}>
                    {analytics.mostScanned.scanCount} scans
                  </div>
                </>
              ) : (
                "No data"
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && analytics.totalScans > 0 && (
        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3>Device Breakdown</h3>
            <div className={styles.pieChartContainer}>
              <Pie data={deviceChartData} options={{ responsive: true }} />
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Location Breakdown</h3>
            <div className={styles.chartContainer}>
              <Bar
                data={locationChartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Individual QR Code Analytics */}
      <div className={styles.qrSpecificAnalytics}>
        <h3>Analyze Specific QR Code</h3>

        <div className={styles.qrSelector}>
          <select
            value={selectedQR || ""}
            onChange={(e) => setSelectedQR(e.target.value)}
            className={styles.qrSelect}
          >
            <option value="">Select a QR Code</option>
            {userQRCodes.map((qr) => (
              <option key={qr._id} value={qr._id}>
                {qr.text.length > 40
                  ? qr.text.substring(0, 40) + "..."
                  : qr.text}
              </option>
            ))}
          </select>
        </div>

        {selectedQR && qrAnalytics && (
          <div className={styles.qrAnalytics}>
            <div className={styles.qrStats}>
              <div className={styles.qrStatItem}>
                <h4>Total Scans</h4>
                <div className={styles.qrStatValue}>
                  {qrAnalytics.scanCount}
                </div>
              </div>

              <div className={styles.qrStatItem}>
                <h4>Last Scanned</h4>
                <div className={styles.qrStatValue}>
                  {qrAnalytics.lastScanned
                    ? format(
                        new Date(qrAnalytics.lastScanned),
                        "MMM dd, yyyy HH:mm"
                      )
                    : "Never"}
                </div>
              </div>
            </div>

            {qrAnalytics.scanCount > 0 && (
              <div className={styles.qrChartsContainer}>
                <div className={styles.qrChartCard}>
                  <h4>Device Types</h4>
                  <div className={styles.pieChartContainer}>
                    {qrDeviceChartData && (
                      <Pie
                        data={qrDeviceChartData}
                        options={{ responsive: true }}
                      />
                    )}
                  </div>
                </div>

                {qrAnalytics.scanLocations.length > 0 && (
                  <div className={styles.qrChartCard}>
                    <h4>Recent Scans</h4>
                    <div className={styles.scansTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qrAnalytics.scanLocations
                            .slice(0, 5)
                            .map((scan, index) => (
                              <tr key={index}>
                                <td>
                                  {format(
                                    new Date(scan.timestamp),
                                    "MMM dd, yyyy HH:mm"
                                  )}
                                </td>
                                <td>
                                  {scan.country}
                                  {scan.city ? `, ${scan.city}` : ""}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedQR && !qrAnalytics?.scanCount && (
          <div className={styles.noDataMessage}>
            This QR code hasn't been scanned yet.
          </div>
        )}
      </div>
    </div>
  );
}
