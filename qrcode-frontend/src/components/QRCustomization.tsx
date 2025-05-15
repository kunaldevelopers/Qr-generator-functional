import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "react-hot-toast";
import styles from "./QRCustomization.module.css";

interface QRCustomizationProps {
  customization: {
    color: string;
    backgroundColor: string;
    logo: string | null;
    margin: number;
  };
  onCustomizationChange: (customization: any) => void;
}

export function QRCustomization({
  customization,
  onCustomizationChange,
}: QRCustomizationProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleColorChange = (color: string) => {
    onCustomizationChange({ ...customization, color });
  };

  const handleBgColorChange = (backgroundColor: string) => {
    onCustomizationChange({ ...customization, backgroundColor });
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomizationChange({ ...customization, margin: Number(e.target.value) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File size validation (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo image must be less than 2MB");
        return;
      }

      setSelectedFile(file);
      // Preview the logo immediately
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && loadEvent.target.result) {
          // Convert to data URL
          const logoDataUrl = loadEvent.target.result as string;
          onCustomizationChange({
            ...customization,
            logo: logoDataUrl,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!selectedFile) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", selectedFile);

      // In a real implementation, you would upload to your backend
      // For now, we'll just simulate the upload
      setTimeout(() => {
        toast.success("Logo uploaded successfully");
        setUploadingLogo(false);
      }, 1000);

      // If you have a real API for logo upload, use fetch or ApiClient here
      // const response = await fetch('/api/upload-logo', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // onCustomizationChange({ ...customization, logo: data.logoPath });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setSelectedFile(null);
    onCustomizationChange({ ...customization, logo: null });
  };

  return (
    <div className={styles.customizationContainer}>
      <h3 className={styles.sectionTitle}>Customize Your QR Code</h3>

      <div className={styles.customizationGrid}>
        {/* QR Color */}
        <div className={styles.colorOption}>
          <label>QR Code Color:</label>
          <div className={styles.colorPickerContainer}>
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: customization.color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            ></div>
            {showColorPicker && (
              <div className={styles.colorPickerPopover}>
                <div
                  className={styles.colorPickerCover}
                  onClick={() => setShowColorPicker(false)}
                />
                <HexColorPicker
                  color={customization.color}
                  onChange={handleColorChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Background Color */}
        <div className={styles.colorOption}>
          <label>Background Color:</label>
          <div className={styles.colorPickerContainer}>
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: customization.backgroundColor }}
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            ></div>
            {showBgColorPicker && (
              <div className={styles.colorPickerPopover}>
                <div
                  className={styles.colorPickerCover}
                  onClick={() => setShowBgColorPicker(false)}
                />
                <HexColorPicker
                  color={customization.backgroundColor}
                  onChange={handleBgColorChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Margin */}
        <div className={styles.marginOption}>
          <label>QR Margin:</label>
          <input
            type="range"
            min="0"
            max="10"
            value={customization.margin}
            onChange={handleMarginChange}
            className={styles.marginSlider}
          />
          <span>{customization.margin}</span>
        </div>

        {/* Logo Upload */}
        <div className={styles.logoOption}>
          <label>Logo (optional):</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/svg+xml"
            className={styles.fileInput}
          />

          {customization.logo && (
            <div className={styles.logoPreview}>
              <img src={customization.logo} alt="Logo Preview" />
              <button
                onClick={removeLogo}
                className={styles.removeLogoButton}
                type="button"
              >
                Remove Logo
              </button>
            </div>
          )}

          {selectedFile && !customization.logo && (
            <button
              onClick={uploadLogo}
              disabled={uploadingLogo}
              className={styles.uploadButton}
              type="button"
            >
              {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
