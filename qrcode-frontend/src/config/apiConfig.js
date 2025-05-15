// Hard-coded API configuration for production builds
// This ensures the URLs work even if env variables aren't loaded correctly

const isProduction = window.location.hostname !== "localhost";

export const API_URLS = {
  production: {
    API_BASE: "https://qr-generator-advanced.onrender.com/api",
  },
  development: {
    API_BASE: "http://localhost:5000/api",
  },
};

export const getApiUrl = () => {
  return isProduction
    ? API_URLS.production.API_BASE
    : API_URLS.development.API_BASE;
};
