import { useState, useEffect } from "react";
import styles from "./QRSecurityOptions.module.css";

interface QRSecurityOptionsProps {
  security: {
    password: string;
    isPasswordProtected: boolean;
    expiresAt: string;
    maxScans: number;
  };
  onSecurityChange: (security: any) => void;
}

export function QRSecurityOptions({
  security,
  onSecurityChange,
}: QRSecurityOptionsProps) {
  const [hasExpiry, setHasExpiry] = useState(!!security.expiresAt);
  const [hasMaxScans, setHasMaxScans] = useState(!!security.maxScans);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validate password whenever it changes
  useEffect(() => {
    if (security.isPasswordProtected) {
      const trimmedPassword = security.password?.trim() || "";

      if (trimmedPassword === "") {
        setPasswordError("Password cannot be empty");
      } else if (trimmedPassword.length < 4) {
        setPasswordError("Password must be at least 4 characters");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
  }, [security.password, security.isPasswordProtected]);

  const handlePasswordProtectionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isProtected = e.target.checked;
    onSecurityChange({
      ...security,
      isPasswordProtected: isProtected,
      password: isProtected ? security.password : "", // Clear password if protection is disabled
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSecurityChange({
      ...security,
      password: e.target.value,
    });
  };

  const handleExpiryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasExpiry(e.target.checked);
    if (!e.target.checked) {
      onSecurityChange({
        ...security,
        expiresAt: "",
      });
    }
  };
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Make sure it's a valid date
    const dateValue = e.target.value;
    const isValidDate = !isNaN(new Date(dateValue).getTime());

    onSecurityChange({
      ...security,
      expiresAt: isValidDate ? dateValue : "",
    });
  };

  const handleMaxScansToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasMaxScans(e.target.checked);
    if (!e.target.checked) {
      onSecurityChange({
        ...security,
        maxScans: 0,
      });
    }
  };
  const handleMaxScansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onSecurityChange({
        ...security,
        maxScans: value,
      });
    } else {
      // If invalid input, reset to 0
      onSecurityChange({
        ...security,
        maxScans: 0,
      });
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Security Options</h3>

      {/* Password Protection */}
      <div className={styles.section}>
        <div className={styles.optionRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={security.isPasswordProtected}
              onChange={handlePasswordProtectionChange}
              className={styles.checkbox}
            />
            Password Protection
          </label>
        </div>

        {security.isPasswordProtected && (
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={security.password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              className={`${styles.input} ${
                passwordError ? styles.inputError : ""
              }`}
              required={security.isPasswordProtected}
              minLength={4}
              aria-invalid={!!passwordError}
            />
            {passwordError ? (
              <small className={styles.errorHint}>{passwordError}</small>
            ) : (
              <small className={styles.hint}>
                Minimum 4 characters. Users must enter this password before
                viewing the content.
              </small>
            )}
          </div>
        )}
      </div>

      {/* Expiration Date */}
      <div className={styles.section}>
        <div className={styles.optionRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={hasExpiry}
              onChange={handleExpiryToggle}
              className={styles.checkbox}
            />
            Set Expiration Date
          </label>
        </div>

        {hasExpiry && (
          <div className={styles.inputGroup}>
            <input
              type="datetime-local"
              value={security.expiresAt}
              onChange={handleExpiryDateChange}
              className={styles.input}
              min={new Date().toISOString().slice(0, 16)}
              required={hasExpiry}
            />
            <small className={styles.hint}>
              QR code will stop working after this date and time.
            </small>
          </div>
        )}
      </div>

      {/* Maximum Scans */}
      <div className={styles.section}>
        <div className={styles.optionRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={hasMaxScans}
              onChange={handleMaxScansToggle}
              className={styles.checkbox}
            />
            Limit Number of Scans
          </label>
        </div>

        {hasMaxScans && (
          <div className={styles.inputGroup}>
            <input
              type="number"
              value={security.maxScans || ""}
              onChange={handleMaxScansChange}
              placeholder="Maximum scans allowed"
              className={styles.input}
              min="1"
              required={hasMaxScans}
            />
            <small className={styles.hint}>
              QR code will stop working after reaching this number of scans.
            </small>
          </div>
        )}
      </div>

      {(security.isPasswordProtected || hasExpiry || hasMaxScans) && (
        <div className={styles.securitySummary}>
          <h4>Security Features Enabled:</h4>
          <ul>
            {security.isPasswordProtected && <li>Password Protection</li>}
            {hasExpiry && (
              <li>
                Expires on: {new Date(security.expiresAt).toLocaleString()}
              </li>
            )}
            {hasMaxScans && <li>Maximum {security.maxScans} scans allowed</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
