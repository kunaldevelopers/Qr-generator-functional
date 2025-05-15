import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { QRGenerator } from "./components/QRGenerator";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/generate" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <PrivateRoute>
                <QRGenerator defaultTab="generate" />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <QRGenerator defaultTab="history" />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <QRGenerator defaultTab="analytics" />
              </PrivateRoute>
            }
          />
          <Route
            path="/bulk"
            element={
              <PrivateRoute>
                <QRGenerator defaultTab="bulk" />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/generate" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
