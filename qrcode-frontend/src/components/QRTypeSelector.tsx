import { useState } from "react";
import styles from "./QRTypeSelector.module.css";

interface QRTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  onDataChange: (data: any) => void;
}

export function QRTypeSelector({
  selectedType,
  onTypeChange,
  onDataChange,
}: QRTypeSelectorProps) {
  const [vCardData, setVCardData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    title: "",
    url: "",
    address: "",
  });

  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });

  const [emailData, setEmailData] = useState({
    email: "",
    subject: "",
    body: "",
  });

  const [smsData, setSmsData] = useState({
    phone: "",
    message: "",
  });

  const [geoData, setGeoData] = useState({
    lat: "",
    lng: "",
  });

  const [eventData, setEventData] = useState({
    summary: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [textData, setTextData] = useState({ text: "" });
  const [urlData, setUrlData] = useState({ url: "" });

  const qrTypes = [
    { value: "url", label: "URL" },
    { value: "text", label: "Text" },
    { value: "vcard", label: "Contact (vCard)" },
    { value: "wifi", label: "WiFi Network" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "geo", label: "Location" },
    { value: "event", label: "Calendar Event" },
    { value: "phone", label: "Phone Number" },
  ];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    onTypeChange(newType);

    // Send initial data for the selected type
    switch (newType) {
      case "vcard":
        onDataChange(vCardData);
        break;
      case "wifi":
        onDataChange(wifiData);
        break;
      case "email":
        onDataChange(emailData);
        break;
      case "sms":
        onDataChange(smsData);
        break;
      case "geo":
        onDataChange(geoData);
        break;
      case "event":
        onDataChange(eventData);
        break;
      case "text":
        onDataChange(textData);
        break;
      case "url":
        onDataChange(urlData);
        break;
      case "phone":
        onDataChange({ phone: "" });
        break;
    }
  };

  const handleVCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...vCardData, [name]: value };
    setVCardData(newData);
    onDataChange(newData);
  };

  const handleWifiChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    const newData = { ...wifiData, [name]: newValue };
    setWifiData(newData);
    onDataChange(newData);
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newData = { ...emailData, [name]: value };
    setEmailData(newData);
    onDataChange(newData);
  };

  const handleSmsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newData = { ...smsData, [name]: value };
    setSmsData(newData);
    onDataChange(newData);
  };

  const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...geoData, [name]: value };
    setGeoData(newData);
    onDataChange(newData);
  };

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newData = { ...eventData, [name]: value };
    setEventData(newData);
    onDataChange(newData);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextData({ text: value });
    onDataChange({ text: value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlData({ url: value });
    onDataChange({ url: value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ phone: e.target.value });
  };

  return (
    <div className={styles.typeSelectorContainer}>
      <h3 className={styles.sectionTitle}>QR Code Type</h3>

      <div className={styles.selectContainer}>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className={styles.typeSelect}
        >
          {qrTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.dataInputContainer}>
        {selectedType === "url" && (
          <div className={styles.formGroup}>
            <label>Website URL:</label>
            <input
              type="url"
              placeholder="https://example.com"
              className={styles.formControl}
              value={urlData.url}
              onChange={handleUrlChange}
            />
          </div>
        )}

        {selectedType === "text" && (
          <div className={styles.formGroup}>
            <label>Text Content:</label>
            <textarea
              placeholder="Enter your text here..."
              className={styles.formControl}
              value={textData.text}
              onChange={handleTextChange}
              rows={4}
            ></textarea>
          </div>
        )}

        {selectedType === "vcard" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                className={styles.formControl}
                value={vCardData.firstName}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                className={styles.formControl}
                value={vCardData.lastName}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 123-456-7890"
                className={styles.formControl}
                value={vCardData.phone}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                placeholder="john.doe@example.com"
                className={styles.formControl}
                value={vCardData.email}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Organization:</label>
              <input
                type="text"
                name="organization"
                placeholder="ACME Inc."
                className={styles.formControl}
                value={vCardData.organization}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Job Title:</label>
              <input
                type="text"
                name="title"
                placeholder="Software Engineer"
                className={styles.formControl}
                value={vCardData.title}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Website:</label>
              <input
                type="url"
                name="url"
                placeholder="https://example.com"
                className={styles.formControl}
                value={vCardData.url}
                onChange={handleVCardChange}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Address:</label>
              <input
                type="text"
                name="address"
                placeholder="123 Main St, New York, NY"
                className={styles.formControl}
                value={vCardData.address}
                onChange={handleVCardChange}
              />
            </div>
          </div>
        )}

        {selectedType === "wifi" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Network Name (SSID):</label>
              <input
                type="text"
                name="ssid"
                placeholder="WiFi Network Name"
                className={styles.formControl}
                value={wifiData.ssid}
                onChange={handleWifiChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Password:</label>
              <input
                type="text"
                name="password"
                placeholder="WiFi Password"
                className={styles.formControl}
                value={wifiData.password}
                onChange={handleWifiChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Encryption Type:</label>
              <select
                name="encryption"
                className={styles.formControl}
                value={wifiData.encryption}
                onChange={handleWifiChange}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="hidden"
                  checked={wifiData.hidden}
                  onChange={handleWifiChange}
                />
                Hidden Network
              </label>
            </div>
          </div>
        )}

        {selectedType === "email" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Email Address:</label>
              <input
                type="email"
                name="email"
                placeholder="recipient@example.com"
                className={styles.formControl}
                value={emailData.email}
                onChange={handleEmailChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                placeholder="Email Subject"
                className={styles.formControl}
                value={emailData.subject}
                onChange={handleEmailChange}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Body:</label>
              <textarea
                name="body"
                placeholder="Email body text..."
                className={styles.formControl}
                value={emailData.body}
                onChange={handleEmailChange}
                rows={4}
              ></textarea>
            </div>
          </div>
        )}

        {selectedType === "sms" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 123-456-7890"
                className={styles.formControl}
                value={smsData.phone}
                onChange={handleSmsChange}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Message:</label>
              <textarea
                name="message"
                placeholder="Message text..."
                className={styles.formControl}
                value={smsData.message}
                onChange={handleSmsChange}
                rows={4}
              ></textarea>
            </div>
          </div>
        )}

        {selectedType === "geo" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Latitude:</label>
              <input
                type="text"
                name="lat"
                placeholder="40.7128"
                className={styles.formControl}
                value={geoData.lat}
                onChange={handleGeoChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Longitude:</label>
              <input
                type="text"
                name="lng"
                placeholder="-74.0060"
                className={styles.formControl}
                value={geoData.lng}
                onChange={handleGeoChange}
              />
            </div>
          </div>
        )}

        {selectedType === "event" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Event Title:</label>
              <input
                type="text"
                name="summary"
                placeholder="Meeting with Team"
                className={styles.formControl}
                value={eventData.summary}
                onChange={handleEventChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Location:</label>
              <input
                type="text"
                name="location"
                placeholder="Conference Room A"
                className={styles.formControl}
                value={eventData.location}
                onChange={handleEventChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Start Date & Time:</label>
              <input
                type="datetime-local"
                name="startDate"
                className={styles.formControl}
                value={eventData.startDate}
                onChange={handleEventChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date & Time:</label>
              <input
                type="datetime-local"
                name="endDate"
                className={styles.formControl}
                value={eventData.endDate}
                onChange={handleEventChange}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Event description..."
                className={styles.formControl}
                value={eventData.description}
                onChange={handleEventChange}
                rows={3}
              ></textarea>
            </div>
          </div>
        )}

        {selectedType === "phone" && (
          <div className={styles.formGroup}>
            <label>Phone Number:</label>
            <input
              type="tel"
              placeholder="+1 123-456-7890"
              className={styles.formControl}
              onChange={handlePhoneChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
