// netlify.js - Special file for Netlify deployment
// Include this script in the HTML head to override the API_URL before other scripts load

(function () {
  // Check if we're in production (deployed on Netlify)
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // Define a global API_BASE_URL variable that will override any environment variables
    window.API_BASE_URL = "https://qr-generator-advanced.onrender.com/api";

    // Make this property non-configurable to prevent overrides
    Object.defineProperty(window, "API_BASE_URL", {
      value: "https://qr-generator-advanced.onrender.com/api",
      writable: false,
      configurable: false,
    });

    // Also set a standard environment variable format as fallback
    window.__ENV__ = window.__ENV__ || {};
    window.__ENV__.VITE_API_URL =
      "https://qr-generator-advanced.onrender.com/api";

    // Log for debugging
    console.log(
      "Production environment detected - API base URL hardcoded to:",
      window.API_BASE_URL
    );
  }
})();
